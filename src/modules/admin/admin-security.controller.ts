import type { Request, Response } from "express";
import { withTransaction } from "../../shared/infrastructure/persistence/postgres.js";
import { readAuthCookie } from "../../shared/utils/cookies.js";
import { sendJson } from "../../shared/utils/responses.js";
import { sessionService } from "../sessions/index.js";
import { userService } from "../users/index.js";
import { auditService } from "../audit/index.js";

function getClientIp(request: Request) {
  const forwarded = request.header("x-forwarded-for");
  if (forwarded) {
    return String(forwarded.split(",")[0] || "").replace(/^::ffff:/, "").trim();
  }

  return String(request.ip || request.socket.remoteAddress || "").replace(/^::ffff:/, "").trim();
}

async function requireAdminSession(request: Request) {
  const sessionId = readAuthCookie(request);
  if (!sessionId) {
    return null;
  }

  const session = await sessionService.getAuthenticatedSession(sessionId);
  if (!session || !session.user.roles.includes("SYSTEM_ADMIN")) {
    return null;
  }

  return session;
}

export class AdminSecurityController {
  listUsers = async (request: Request, response: Response) => {
    const session = await requireAdminSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ADMIN_REQUIRED",
        message: "관리자 권한이 필요합니다.",
      });
      return;
    }

    const users = await userService.listSecurityOverview();
    sendJson(response, 200, {
      success: true,
      data: users,
    });
  };

  unlockUser = async (request: Request, response: Response) => {
    const adminSession = await requireAdminSession(request);
    if (!adminSession) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ADMIN_REQUIRED",
        message: "관리자 권한이 필요합니다.",
      });
      return;
    }

    const targetUser = await userService.getById(String(request.params.userId || ""));
    if (!targetUser) {
      sendJson(response, 404, {
        success: false,
        errorCode: "ACCOUNT_NOT_FOUND",
        message: "사용자를 찾을 수 없습니다.",
      });
      return;
    }

    await withTransaction(async (client) => {
      await userService.unlockAccount(targetUser.id, client);
      await auditService.recordAuthEvent({
        userId: targetUser.id,
        usernameSnapshot: targetUser.username,
        eventType: "ADMIN_ACCOUNT_UNLOCKED",
        accessScope: adminSession.context.accessScope,
        deviceId: adminSession.context.deviceId,
        clientIp: getClientIp(request),
        certificateFingerprint: adminSession.context.certificateFingerprint,
        success: true,
        reasonCode: `ADMIN:${adminSession.user.username}`,
        client,
      });
    });

    sendJson(response, 200, {
      success: true,
    });
  };

  resetUserMfa = async (request: Request, response: Response) => {
    const adminSession = await requireAdminSession(request);
    if (!adminSession) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ADMIN_REQUIRED",
        message: "관리자 권한이 필요합니다.",
      });
      return;
    }

    const targetUser = await userService.getById(String(request.params.userId || ""));
    if (!targetUser) {
      sendJson(response, 404, {
        success: false,
        errorCode: "ACCOUNT_NOT_FOUND",
        message: "사용자를 찾을 수 없습니다.",
      });
      return;
    }

    await withTransaction(async (client) => {
      await userService.revokeAllMfaSecrets(targetUser.id, client);
      await auditService.recordAuthEvent({
        userId: targetUser.id,
        usernameSnapshot: targetUser.username,
        eventType: "ADMIN_MFA_RESET",
        accessScope: adminSession.context.accessScope,
        deviceId: adminSession.context.deviceId,
        clientIp: getClientIp(request),
        certificateFingerprint: adminSession.context.certificateFingerprint,
        success: true,
        reasonCode: `ADMIN:${adminSession.user.username}`,
        client,
      });
    });

    sendJson(response, 200, {
      success: true,
    });
  };
}

export const adminSecurityController = new AdminSecurityController();
