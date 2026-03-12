import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { clearAuthCookie, readAuthCookie, writeAuthCookie } from "../../shared/utils/cookies.js";
import { sendJson } from "../../shared/utils/responses.js";
import { sessionService } from "../sessions/index.js";

function buildSessionContext(request: Request) {
  return {
    mtlsVerified: request.header("x-demo-mtls-verified") === "true",
    certificateFingerprint: request.header("x-demo-certificate-fingerprint") || "DEMO-CERT-001",
    accessScope: request.path.startsWith("/admin") ? ("LOCAL_ADMIN" as const) : ("EXTERNAL" as const),
    deviceId: String(request.body.device_id || "device-win-001"),
  };
}

export class AuthController {
  login = (request: Request, response: Response) => {
    const result = authService.login(
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

    writeAuthCookie(response, result.data.pendingSessionId);
    sendJson(response, 200, result);
  };

  verifyMfa = (request: Request, response: Response) => {
    const sessionId = readAuthCookie(request);
    const result = authService.verifyMfa(sessionId, String(request.body.otp_code || ""));

    if (!result.success) {
      sendJson(response, 401, result);
      return;
    }

    writeAuthCookie(response, result.data.sessionId);
    sendJson(response, 200, {
      success: true,
      data: {
        session_id: result.data.sessionId,
        expires_at: result.data.expiresAt,
        idle_expires_at: result.data.idleExpiresAt,
        user: {
          id: result.data.user.id,
          name: result.data.user.name,
          roles: result.data.user.roles,
        },
        session_context: {
          mtls_verified: result.data.context.mtlsVerified,
          certificate_fingerprint: result.data.context.certificateFingerprint,
          device_id: result.data.context.deviceId,
          mfa_verified: true,
          access_scope: result.data.context.accessScope,
        },
      },
    });
  };

  getCurrentSession = (request: Request, response: Response) => {
    const sessionId = readAuthCookie(request);
    const session = sessionId ? sessionService.getAuthenticatedSession(sessionId) : null;

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
        },
        roles: session.user.roles,
        account_status: session.user.status,
        access_scope: session.context.accessScope,
        mfa_verified: true,
        issued_at: session.issuedAt,
        expires_at: session.expiresAt,
      },
    });
  };

  logout = (request: Request, response: Response) => {
    authService.logout(readAuthCookie(request));
    clearAuthCookie(response);
    sendJson(response, 200, { success: true });
  };
}

export const authController = new AuthController();
