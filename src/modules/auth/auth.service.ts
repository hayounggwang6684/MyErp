import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { auditService } from "../audit/index.js";
import { withTransaction } from "../../shared/infrastructure/persistence/postgres.js";
import type { LoginInput, SessionContext } from "./auth.types.js";
import { sessionService } from "../sessions/index.js";
import { userService } from "../users/index.js";

const PASSWORD_LOCK_THRESHOLD = 5;
const PASSWORD_MIN_LENGTH = 8;
const OTP_WINDOW = 1;
const OTP_ISSUER = "Sunjin ERP";

authenticator.options = {
  window: OTP_WINDOW,
};

function buildSessionPayload(session: Awaited<ReturnType<typeof sessionService.createAuthenticatedSession>>) {
  return {
    sessionId: session.sessionId,
    expiresAt: session.expiresAt,
    idleExpiresAt: session.idleExpiresAt,
    user: session.user,
    context: session.context,
  };
}

export class AuthService {
  async changePassword(userId: string, currentPassword: string, nextPassword: string) {
    if (!currentPassword || !nextPassword) {
      return {
        success: false as const,
        errorCode: "PASSWORD_REQUIRED",
        message: "현재 비밀번호와 새 비밀번호를 입력하세요.",
      };
    }

    if (nextPassword.length < PASSWORD_MIN_LENGTH) {
      return {
        success: false as const,
        errorCode: "PASSWORD_POLICY_VIOLATION",
        message: "새 비밀번호는 최소 8자 이상이어야 합니다.",
      };
    }

    return withTransaction(async (client) => {
      const user = await userService.getById(userId, client);
      if (!user || user.status !== "ACTIVE") {
        return {
          success: false as const,
          errorCode: "ACCOUNT_UNAVAILABLE",
          message: "현재 계정을 사용할 수 없습니다.",
        };
      }

      const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordMatches) {
        return {
          success: false as const,
          errorCode: "CURRENT_PASSWORD_INVALID",
          message: "현재 비밀번호가 맞지 않습니다.",
        };
      }

      const nextPasswordHash = await bcrypt.hash(nextPassword, 10);
      await userService.updatePasswordHash(user.id, nextPasswordHash, client);
      return {
        success: true as const,
        data: { ok: true },
      };
    });
  }

  async login(input: LoginInput, context: SessionContext) {
    return withTransaction(async (client) => {
      const user = await userService.findByUsername(input.username, client);

      if (!user) {
        await auditService.recordAuthEvent({
          usernameSnapshot: input.username,
          eventType: "LOGIN_FAILED",
          accessScope: context.accessScope,
          deviceId: context.deviceId,
          clientIp: context.clientIp,
          certificateFingerprint: context.certificateFingerprint,
          success: false,
          reasonCode: "INVALID_CREDENTIALS",
          client,
        });

        return {
          success: false as const,
          errorCode: "UNAUTHENTICATED",
          message: "로그인 정보를 다시 확인해 주세요.",
        };
      }

      if (user.status === "LOCKED" || (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now())) {
        await auditService.recordAuthEvent({
          userId: user.id,
          usernameSnapshot: user.username,
          eventType: "ACCOUNT_LOCKED",
          accessScope: context.accessScope,
          deviceId: context.deviceId,
          clientIp: context.clientIp,
          certificateFingerprint: context.certificateFingerprint,
          success: false,
          reasonCode: "ACCOUNT_LOCKED",
          client,
        });

        return {
          success: false as const,
          errorCode: "ACCOUNT_LOCKED",
          message: "계정이 잠겨 있습니다. 관리자에게 문의해 주세요.",
        };
      }

      if (user.status !== "ACTIVE") {
        return {
          success: false as const,
          errorCode: `ACCOUNT_${user.status}`,
          message: "이 계정은 현재 사용할 수 없습니다.",
        };
      }

      const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
      if (!passwordMatches) {
        const nextCount = user.failedPasswordAttempts + 1;
        const shouldLock = nextCount >= PASSWORD_LOCK_THRESHOLD;
        await userService.registerPasswordFailure(user.id, nextCount, shouldLock, client);

        await auditService.recordAuthEvent({
          userId: user.id,
          usernameSnapshot: user.username,
          eventType: shouldLock ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
          accessScope: context.accessScope,
          deviceId: context.deviceId,
          clientIp: context.clientIp,
          certificateFingerprint: context.certificateFingerprint,
          success: false,
          reasonCode: shouldLock ? "PASSWORD_LOCK_THRESHOLD" : "INVALID_CREDENTIALS",
          client,
        });

        return {
          success: false as const,
          errorCode: shouldLock ? "ACCOUNT_LOCKED" : "UNAUTHENTICATED",
          message: shouldLock
            ? "비밀번호 입력 실패 횟수를 초과해 계정이 잠겼습니다."
            : "로그인 정보를 다시 확인해 주세요.",
        };
      }

      await userService.resetPasswordFailures(user.id, client);

      if (context.accessScope === "EXTERNAL") {
        const activeSecret = await userService.getActiveMfaSecret(user.id, client);
        const challengeKind = activeSecret ? "LOGIN_MFA" : "MFA_ENROLLMENT";
        const challenge = await sessionService.createPendingChallenge({
          userId: user.id,
          context,
          userAgent: input.userAgent,
          challengeKind,
          client,
        });

        await auditService.recordAuthEvent({
          userId: user.id,
          usernameSnapshot: user.username,
          eventType: activeSecret ? "MFA_CHALLENGE_CREATED" : "MFA_ENROLLMENT_STARTED",
          accessScope: context.accessScope,
          deviceId: context.deviceId,
          clientIp: context.clientIp,
          certificateFingerprint: context.certificateFingerprint,
          success: true,
          reasonCode: activeSecret ? "MFA_REQUIRED" : "MFA_ENROLLMENT_REQUIRED",
          client,
        });

        return {
          success: true as const,
          data: {
            loginStatus: activeSecret ? ("MFA_REQUIRED" as const) : ("MFA_ENROLLMENT_REQUIRED" as const),
            mfaChallengeId: challenge.challengeId,
            accountStatus: user.status,
            accessScope: context.accessScope,
            pendingSessionId: challenge.sessionId,
          },
        };
      }

      const session = await sessionService.createAuthenticatedSession({
        user,
        context,
        userAgent: input.userAgent,
        client,
      });

      await auditService.recordAuthEvent({
        userId: user.id,
        usernameSnapshot: user.username,
        eventType: "LOGIN_SUCCEEDED",
        accessScope: context.accessScope,
        deviceId: context.deviceId,
        clientIp: context.clientIp,
        certificateFingerprint: context.certificateFingerprint,
        success: true,
        reasonCode: "DIRECT_AUTHENTICATED",
        client,
      });

      return {
        success: true as const,
        data: {
          loginStatus: "AUTHENTICATED" as const,
          accountStatus: user.status,
          accessScope: context.accessScope,
          session: buildSessionPayload(session),
        },
      };
    });
  }

  async verifyMfa(sessionId: string | null, otpCode: string) {
    if (!sessionId) {
      return {
        success: false as const,
        errorCode: "MFA_CHALLENGE_REQUIRED",
        message: "로그인부터 다시 진행해 주세요.",
      };
    }

    return withTransaction(async (client) => {
      const challenge = await sessionService.getPendingChallenge(sessionId, client);
      if (!challenge || challenge.challengeKind !== "LOGIN_MFA") {
        return {
          success: false as const,
          errorCode: "MFA_CHALLENGE_EXPIRED",
          message: "인증 세션이 만료되었습니다. 다시 로그인해 주세요.",
        };
      }

      const user = await userService.getById(challenge.userId, client);
      const activeSecret = await userService.getActiveMfaSecret(challenge.userId, client);
      if (!user || !activeSecret) {
        return {
          success: false as const,
          errorCode: "MFA_ENROLLMENT_REQUIRED",
          message: "MFA 등록이 필요합니다.",
        };
      }

      const verified = authenticator.check(otpCode, activeSecret.secretBase32);
      if (!verified) {
        await auditService.recordAuthEvent({
          userId: user.id,
          usernameSnapshot: user.username,
          eventType: "LOGIN_FAILED",
          accessScope: challenge.context.accessScope,
          deviceId: challenge.context.deviceId,
          clientIp: challenge.context.clientIp,
          certificateFingerprint: challenge.context.certificateFingerprint,
          success: false,
          reasonCode: "MFA_INVALID",
          client,
        });

        return {
          success: false as const,
          errorCode: "MFA_INVALID",
          message: "인증 코드가 올바르지 않습니다.",
        };
      }

      await userService.touchActiveMfaSecret(activeSecret.id, client);
      await sessionService.markChallengeVerified(sessionId, client);
      const session = await sessionService.createAuthenticatedSession({
        sessionId,
        user,
        context: challenge.context,
        userAgent: challenge.userAgent,
        client,
      });

      await auditService.recordAuthEvent({
        userId: user.id,
        usernameSnapshot: user.username,
        eventType: "MFA_VERIFIED",
        accessScope: challenge.context.accessScope,
        deviceId: challenge.context.deviceId,
        clientIp: challenge.context.clientIp,
        certificateFingerprint: challenge.context.certificateFingerprint,
        success: true,
        reasonCode: "TOTP_VERIFIED",
        client,
      });

      await auditService.recordAuthEvent({
        userId: user.id,
        usernameSnapshot: user.username,
        eventType: "LOGIN_SUCCEEDED",
        accessScope: challenge.context.accessScope,
        deviceId: challenge.context.deviceId,
        clientIp: challenge.context.clientIp,
        certificateFingerprint: challenge.context.certificateFingerprint,
        success: true,
        reasonCode: "MFA_AUTHENTICATED",
        client,
      });

      return {
        success: true as const,
        data: buildSessionPayload(session),
      };
    });
  }

  async startMfaEnrollment(sessionId: string | null) {
    if (!sessionId) {
      return {
        success: false as const,
        errorCode: "MFA_ENROLLMENT_REQUIRED",
        message: "등록을 시작하려면 다시 로그인해 주세요.",
      };
    }

    return withTransaction(async (client) => {
      const challenge = await sessionService.getPendingChallenge(sessionId, client);
      if (!challenge || challenge.challengeKind !== "MFA_ENROLLMENT") {
        return {
          success: false as const,
          errorCode: "MFA_ENROLLMENT_REQUIRED",
          message: "MFA 등록 세션이 없습니다.",
        };
      }

      const user = await userService.getById(challenge.userId, client);
      if (!user) {
        return {
          success: false as const,
          errorCode: "ACCOUNT_NOT_FOUND",
          message: "사용자 정보를 찾을 수 없습니다.",
        };
      }

      const existingPending = await userService.getPendingMfaSecret(user.id, client);
      const secretBase32 = existingPending?.secretBase32 || authenticator.generateSecret();
      const secretId = existingPending?.id || crypto.randomUUID();
      if (!existingPending) {
        await userService.replacePendingMfaSecret(user.id, secretId, secretBase32, client);
      }

      const otpAuthUri = authenticator.keyuri(user.username, OTP_ISSUER, secretBase32);
      const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUri);

      await auditService.recordAuthEvent({
        userId: user.id,
        usernameSnapshot: user.username,
        eventType: "MFA_ENROLLMENT_STARTED",
        accessScope: challenge.context.accessScope,
        deviceId: challenge.context.deviceId,
        clientIp: challenge.context.clientIp,
        certificateFingerprint: challenge.context.certificateFingerprint,
        success: true,
        reasonCode: "SELF_SERVICE_ENROLLMENT",
        client,
      });

      return {
        success: true as const,
        data: {
          username: user.username,
          secret_id: secretId,
          secret_base32: secretBase32,
          otp_auth_uri: otpAuthUri,
          qr_code_data_url: qrCodeDataUrl,
        },
      };
    });
  }

  async getMfaEnrollmentStatus(sessionId: string | null) {
    if (!sessionId) {
      return {
        success: false as const,
        errorCode: "MFA_ENROLLMENT_REQUIRED",
        message: "등록 세션이 없습니다.",
      };
    }

    const challenge = await sessionService.getPendingChallenge(sessionId);
    if (!challenge || challenge.challengeKind !== "MFA_ENROLLMENT") {
      return {
        success: false as const,
        errorCode: "MFA_ENROLLMENT_REQUIRED",
        message: "등록 세션이 없습니다.",
      };
    }

    const activeSecret = await userService.getActiveMfaSecret(challenge.userId);
    return {
      success: true as const,
      data: {
        status: activeSecret ? "ACTIVE" : "PENDING",
      },
    };
  }

  async verifyMfaEnrollment(sessionId: string | null, otpCode: string) {
    if (!sessionId) {
      return {
        success: false as const,
        errorCode: "MFA_ENROLLMENT_REQUIRED",
        message: "등록 세션이 없습니다.",
      };
    }

    return withTransaction(async (client) => {
      const challenge = await sessionService.getPendingChallenge(sessionId, client);
      if (!challenge || challenge.challengeKind !== "MFA_ENROLLMENT") {
        return {
          success: false as const,
          errorCode: "MFA_ENROLLMENT_REQUIRED",
          message: "등록 세션이 만료되었습니다.",
        };
      }

      const user = await userService.getById(challenge.userId, client);
      const pendingSecret = await userService.getPendingMfaSecret(challenge.userId, client);
      if (!user || !pendingSecret) {
        return {
          success: false as const,
          errorCode: "MFA_ENROLLMENT_REQUIRED",
          message: "등록할 MFA 정보가 없습니다.",
        };
      }

      const verified = authenticator.check(otpCode, pendingSecret.secretBase32);
      if (!verified) {
        await auditService.recordAuthEvent({
          userId: user.id,
          usernameSnapshot: user.username,
          eventType: "LOGIN_FAILED",
          accessScope: challenge.context.accessScope,
          deviceId: challenge.context.deviceId,
          clientIp: challenge.context.clientIp,
          certificateFingerprint: challenge.context.certificateFingerprint,
          success: false,
          reasonCode: "MFA_ENROLLMENT_INVALID",
          client,
        });

        return {
          success: false as const,
          errorCode: "MFA_INVALID",
          message: "인증 코드가 올바르지 않습니다.",
        };
      }

      await userService.activateMfaSecret(user.id, pendingSecret.id, client);
      await userService.touchActiveMfaSecret(pendingSecret.id, client);
      await sessionService.markChallengeVerified(sessionId, client);
      const session = await sessionService.createAuthenticatedSession({
        sessionId,
        user,
        context: challenge.context,
        userAgent: challenge.userAgent,
        client,
      });

      await auditService.recordAuthEvent({
        userId: user.id,
        usernameSnapshot: user.username,
        eventType: "MFA_ENROLLMENT_VERIFIED",
        accessScope: challenge.context.accessScope,
        deviceId: challenge.context.deviceId,
        clientIp: challenge.context.clientIp,
        certificateFingerprint: challenge.context.certificateFingerprint,
        success: true,
        reasonCode: "SELF_SERVICE_ENROLLMENT_VERIFIED",
        client,
      });

      await auditService.recordAuthEvent({
        userId: user.id,
        usernameSnapshot: user.username,
        eventType: "LOGIN_SUCCEEDED",
        accessScope: challenge.context.accessScope,
        deviceId: challenge.context.deviceId,
        clientIp: challenge.context.clientIp,
        certificateFingerprint: challenge.context.certificateFingerprint,
        success: true,
        reasonCode: "ENROLLMENT_AUTHENTICATED",
        client,
      });

      return {
        success: true as const,
        data: buildSessionPayload(session),
      };
    });
  }

  async logout(sessionId: string | null) {
    if (!sessionId) {
      return { success: true as const };
    }

    const session = await sessionService.getAuthenticatedSession(sessionId);
    await sessionService.revokeSession(sessionId);

    if (session) {
      await auditService.recordAuthEvent({
        userId: session.user.id,
        usernameSnapshot: session.user.username,
        eventType: "LOGOUT",
        accessScope: session.context.accessScope,
        deviceId: session.context.deviceId,
        clientIp: session.context.clientIp,
        certificateFingerprint: session.context.certificateFingerprint,
        success: true,
        reasonCode: "USER_LOGOUT",
      });
    }

    return {
      success: true as const,
    };
  }
}

export const authService = new AuthService();
