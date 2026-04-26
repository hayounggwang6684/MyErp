import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import {
  clearAuthCookie,
  clearPendingAuthCookie,
  readAuthCookie,
  readPendingAuthCookie,
  writeAuthCookie,
  writePendingAuthCookie,
} from "../../shared/utils/cookies.js";
import { sendJson } from "../../shared/utils/responses.js";
import { sessionService } from "../sessions/index.js";
import type { AppUser } from "../users/user.types.js";
import type { SessionContext } from "./auth.types.js";
import { getRequestIp, getRequestTlsContext, resolveRequestAccessScope } from "../../shared/utils/request-security.js";

function buildSessionContext(request: Request) {
  const clientIp = getRequestIp(request);
  const tlsContext = getRequestTlsContext(request);

  return {
    mtlsVerified: tlsContext.mtlsVerified,
    certificateFingerprint: tlsContext.certificateFingerprint,
    accessScope: resolveRequestAccessScope(request),
    deviceId: String(request.body.device_id || "device-win-001"),
    clientIp,
  };
}

function resolveAuthSessionId(request: Request) {
  return readPendingAuthCookie(request);
}

type SessionPayload = {
  sessionId: string;
  expiresAt: string;
  idleExpiresAt: string;
  user: AppUser;
  context: SessionContext;
};

function sendSessionResponse(response: Response, session: SessionPayload, loginStatus?: "AUTHENTICATED") {
  sendJson(response, 200, {
    success: true,
    data: {
      ...(loginStatus ? { login_status: loginStatus } : {}),
      session_id: session.sessionId,
      expires_at: session.expiresAt,
      idle_expires_at: session.idleExpiresAt,
      user: {
        id: session.user.id,
        name: session.user.name,
        department: session.user.department,
        roles: session.user.roles,
      },
      session_context: {
        mtls_verified: session.context.mtlsVerified,
        certificate_fingerprint: session.context.certificateFingerprint,
        device_id: session.context.deviceId,
        mfa_verified: true,
        access_scope: session.context.accessScope,
      },
    },
  });
}

export class AuthController {
  getAccessScope = async (request: Request, response: Response) => {
    const context = buildSessionContext(request);
    sendJson(response, 200, {
      success: true,
      data: {
        access_scope: context.accessScope,
      },
    });
  };

  login = async (request: Request, response: Response) => {
    const result = await authService.login(
      {
        username: String(request.body.username || ""),
        password: String(request.body.password || ""),
        deviceId: String(request.body.device_id || "device-win-001"),
        userAgent: request.get("user-agent") || "unknown",
      },
      buildSessionContext(request),
    );

    if (!result.success) {
      sendJson(response, 401, result);
      return;
    }

    if (result.data.loginStatus === "AUTHENTICATED") {
      clearPendingAuthCookie(request, response);
      writeAuthCookie(request, response, result.data.session.sessionId);
      sendSessionResponse(response, result.data.session, "AUTHENTICATED");
      return;
    }

    clearAuthCookie(request, response);
    writePendingAuthCookie(request, response, result.data.pendingSessionId);
    sendJson(response, 200, {
      success: true,
      data: {
        login_status: result.data.loginStatus,
        mfa_challenge_id: result.data.mfaChallengeId,
        account_status: result.data.accountStatus,
        access_scope: result.data.accessScope,
      },
    });
  };

  changePassword = async (request: Request, response: Response) => {
    const sessionId = readAuthCookie(request);
    const session = sessionId ? await sessionService.getAuthenticatedSession(sessionId) : null;

    if (!session) {
      sendJson(response, 401, {
        success: false,
        errorCode: "AUTHENTICATION_REQUIRED",
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const result = await authService.changePassword(
      session.user.id,
      String(request.body.currentPassword || ""),
      String(request.body.nextPassword || ""),
    );

    if (!result.success) {
      sendJson(response, result.errorCode === "CURRENT_PASSWORD_INVALID" ? 401 : 400, result);
      return;
    }

    sendJson(response, 200, {
      success: true,
      data: { ok: true },
    });
  };

  verifyMfa = async (request: Request, response: Response) => {
    const sessionId = resolveAuthSessionId(request);
    const result = await authService.verifyMfa(sessionId, String(request.body.otp_code || ""));

    if (!result.success) {
      sendJson(response, 401, result);
      return;
    }

    clearPendingAuthCookie(request, response);
    writeAuthCookie(request, response, result.data.sessionId);
    sendSessionResponse(response, result.data);
  };

  startMfaEnrollment = async (request: Request, response: Response) => {
    const result = await authService.startMfaEnrollment(resolveAuthSessionId(request));
    if (!result.success) {
      sendJson(response, 401, result);
      return;
    }

    sendJson(response, 200, result);
  };

  getMfaEnrollmentStatus = async (request: Request, response: Response) => {
    const result = await authService.getMfaEnrollmentStatus(resolveAuthSessionId(request));
    if (!result.success) {
      sendJson(response, 401, result);
      return;
    }

    sendJson(response, 200, result);
  };

  verifyMfaEnrollment = async (request: Request, response: Response) => {
    const result = await authService.verifyMfaEnrollment(
      resolveAuthSessionId(request),
      String(request.body.otp_code || ""),
    );
    if (!result.success) {
      sendJson(response, 401, result);
      return;
    }

    clearPendingAuthCookie(request, response);
    writeAuthCookie(request, response, result.data.sessionId);
    sendSessionResponse(response, result.data);
  };

  getCurrentSession = async (request: Request, response: Response) => {
    const sessionId = readAuthCookie(request);
    const session = sessionId ? await sessionService.getAuthenticatedSession(sessionId) : null;

    if (!session) {
      sendJson(response, 401, {
        success: false,
        errorCode: "SESSION_NOT_FOUND",
        message: "세션이 없습니다.",
      });
      return;
    }

    sendJson(response, 200, {
      success: true,
      data: {
        session_id: session.sessionId,
        user: {
          id: session.user.id,
          name: session.user.name,
          department: session.user.department,
        },
        roles: session.user.roles,
        account_status: session.user.status,
        access_scope: session.context.accessScope,
        mfa_verified: session.context.accessScope !== "INTERNAL",
        issued_at: session.issuedAt,
        expires_at: session.expiresAt,
      },
    });
  };

  logout = async (request: Request, response: Response) => {
    await authService.logout(readAuthCookie(request));
    clearAuthCookie(request, response);
    clearPendingAuthCookie(request, response);
    sendJson(response, 200, { success: true });
  };
}

export const authController = new AuthController();
