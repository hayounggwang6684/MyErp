import type { LoginInput, SessionContext } from "./auth.types.js";
import { sessionService } from "../sessions/index.js";
import { userService } from "../users/index.js";

const demoOtpCode = "123456";

export class AuthService {
  login(input: LoginInput, context: SessionContext) {
    const user = userService.findByUsername(input.username);

    if (!user || user.password !== input.password) {
      return {
        success: false as const,
        errorCode: "UNAUTHENTICATED",
        message: "로그인 정보를 다시 확인해 주세요.",
      };
    }

    if (user.status !== "ACTIVE") {
      return {
        success: false as const,
        errorCode: `ACCOUNT_${user.status}`,
        message: "이 계정은 현재 사용할 수 없습니다.",
      };
    }

    const challenge = sessionService.createPendingChallenge({
      user,
      context,
      userAgent: input.userAgent,
    });

    return {
      success: true as const,
      data: {
        loginStatus: "MFA_REQUIRED" as const,
        mfaChallengeId: challenge.challengeId,
        accountStatus: user.status,
        accessScope: context.accessScope,
        pendingSessionId: challenge.sessionId,
      },
    };
  }

  verifyMfa(sessionId: string | null, otpCode: string) {
    if (!sessionId) {
      return {
        success: false as const,
        errorCode: "MFA_CHALLENGE_REQUIRED",
        message: "로그인부터 다시 진행해 주세요.",
      };
    }

    const challenge = sessionService.getPendingChallenge(sessionId);
    if (!challenge) {
      return {
        success: false as const,
        errorCode: "MFA_CHALLENGE_EXPIRED",
        message: "인증 세션이 만료되었습니다. 다시 로그인해 주세요.",
      };
    }

    if (otpCode !== demoOtpCode) {
      return {
        success: false as const,
        errorCode: "MFA_INVALID",
        message: "인증 코드가 올바르지 않습니다.",
      };
    }

    const session = sessionService.promotePendingChallenge(sessionId);
    if (!session) {
      return {
        success: false as const,
        errorCode: "MFA_CHALLENGE_EXPIRED",
        message: "인증 세션이 만료되었습니다. 다시 로그인해 주세요.",
      };
    }

    return {
      success: true as const,
      data: session,
    };
  }

  logout(sessionId: string | null) {
    if (sessionId) {
      sessionService.revokeSession(sessionId);
    }

    return {
      success: true as const,
    };
  }
}

export const authService = new AuthService();
