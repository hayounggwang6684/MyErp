import type { Request, Response } from "express";
import { readAuthCookie } from "../../shared/utils/cookies.js";
import { sendJson } from "../../shared/utils/responses.js";
import { sessionService } from "../sessions/index.js";
import { userPreferenceService } from "./user-preference.service.js";
import { isLocalRequest } from "../../shared/utils/request-security.js";

async function requirePreferenceSession(request: Request) {
  const sessionId = readAuthCookie(request);
  if (!sessionId) {
    return null;
  }

  const session = await sessionService.getAuthenticatedSession(sessionId);
  if (!session) {
    return null;
  }

  if (request.path.startsWith("/admin") && (!isLocalRequest(request) || !session.user.roles.includes("SYSTEM_ADMIN"))) {
    return null;
  }

  return session;
}

export class UserPreferenceController {
  getCurrent = async (request: Request, response: Response) => {
    const session = await requirePreferenceSession(request);
    if (!session) {
      sendJson(response, 401, {
        success: false,
        errorCode: "AUTHENTICATION_REQUIRED",
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const preference = await userPreferenceService.getOrCreate(session.user.id);
    sendJson(response, 200, {
      success: true,
      data: preference,
    });
  };

  updateCurrent = async (request: Request, response: Response) => {
    const session = await requirePreferenceSession(request);
    if (!session) {
      sendJson(response, 401, {
        success: false,
        errorCode: "AUTHENTICATION_REQUIRED",
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const current = await userPreferenceService.getOrCreate(session.user.id);
    const preference = await userPreferenceService.update(session.user.id, {
      defaultDashboardTab: request.body.defaultDashboardTab ?? current.defaultDashboardTab,
      dashboardDensity: request.body.dashboardDensity ?? current.dashboardDensity,
      showRememberedUsername: request.body.showRememberedUsername ?? current.showRememberedUsername,
      testAccessScope: request.body.testAccessScope ?? current.testAccessScope,
      assetPhysicalColumnWidths: request.body.assetPhysicalColumnWidths ?? current.assetPhysicalColumnWidths,
    });

    sendJson(response, 200, {
      success: true,
      data: preference,
    });
  };
}

export const userPreferenceController = new UserPreferenceController();
