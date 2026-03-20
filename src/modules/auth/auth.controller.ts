import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { clearAuthCookie, readAuthCookie, writeAuthCookie } from "../../shared/utils/cookies.js";
import { sendJson } from "../../shared/utils/responses.js";
import { sessionService } from "../sessions/index.js";
import type { AppUser } from "../users/user.types.js";
import type { SessionContext } from "./auth.types.js";

function normalizeIp(value: string | undefined) {
  return String(value || "")
    .replace(/^::ffff:/, "")
    .trim();
}

function isPrivateIpv4(ip: string) {
  return ip === "127.0.0.1" || ip === "localhost" || ip.startsWith("10.") || ip.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);
}

function resolveClientIp(request: Request) {
  const forwarded = request.header("x-forwarded-for");
  if (forwarded) {
    return normalizeIp(forwarded.split(",")[0]);
  }

  return normalizeIp(request.ip || request.socket.remoteAddress);
}

function buildSessionContext(request: Request) {
  const clientIp = resolveClientIp(request);
  const isAdminRoute = request.path.startsWith("/admin");
  const forcedAccessScope = request.header("x-demo-force-access-scope");
  const resolvedAccessScope = isAdminRoute
    ? ("LOCAL_ADMIN" as const)
    : isPrivateIpv4(clientIp)
      ? ("INTERNAL" as const)
      : ("EXTERNAL" as const);
  const accessScope =
    forcedAccessScope === "INTERNAL" || forcedAccessScope === "EXTERNAL"
      ? forcedAccessScope
      : resolvedAccessScope;

  return {
    mtlsVerified: request.header("x-demo-mtls-verified") === "true",
    certificateFingerprint: request.header("x-demo-certificate-fingerprint") || "DEMO-CERT-001",
    accessScope,
    deviceId: String(request.body.device_id || "device-win-001"),
    clientIp,
  };
}

type SessionPayload = {
  sessionId: string;
  expiresAt: string;
  idleExpiresAt: string;
  user: AppUser;
  context: SessionContext;
};

function sendSessionResponse(response: Response, session: SessionPayload) {
  sendJson(response, 200, {
    success: true,
    data: {
      session_id: session.sessionId,
      expires_at: session.expiresAt,
      idle_expires_at: session.idleExpiresAt,
      user: {
        id: session.user.id,
        name: session.user.name,
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
      writeAuthCookie(response, result.data.session.sessionId);
      sendSessionResponse(response, result.data.session);
      return;
    }

    writeAuthCookie(response, result.data.pendingSessionId);
    sendJson(response, 200, {
      success: true,
      data: {
        login_status: result.data.loginStatus,
        mfa_challenge_id: result.data.mfaChallengeId,
        account_status: result.data.accountStatus,
        access_scope: result.data.accessScope,
        pending_session_id: result.data.pendingSessionId,
      },
    });
  };

  verifyMfa = async (request: Request, response: Response) => {
    const sessionId = readAuthCookie(request);
    const result = await authService.verifyMfa(sessionId, String(request.body.otp_code || ""));

    if (!result.success) {
      sendJson(response, 401, result);
      return;
    }

    writeAuthCookie(response, result.data.sessionId);
    sendSessionResponse(response, result.data);
  };

  startMfaEnrollment = async (request: Request, response: Response) => {
    const result = await authService.startMfaEnrollment(readAuthCookie(request));
    if (!result.success) {
      sendJson(response, 401, result);
      return;
    }

    sendJson(response, 200, result);
  };

  getMfaEnrollmentStatus = async (request: Request, response: Response) => {
    const result = await authService.getMfaEnrollmentStatus(readAuthCookie(request));
    if (!result.success) {
      sendJson(response, 401, result);
      return;
    }

    sendJson(response, 200, result);
  };

  verifyMfaEnrollment = async (request: Request, response: Response) => {
    const result = await authService.verifyMfaEnrollment(readAuthCookie(request), String(request.body.otp_code || ""));
    if (!result.success) {
      sendJson(response, 401, result);
      return;
    }

    writeAuthCookie(response, result.data.sessionId);
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
    clearAuthCookie(response);
    sendJson(response, 200, { success: true });
  };
}

export const authController = new AuthController();
