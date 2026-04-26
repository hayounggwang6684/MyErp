import type { Request, Response } from "express";
import { readAuthCookie } from "../../shared/utils/cookies.js";
import { sendJson } from "../../shared/utils/responses.js";
import { sessionService } from "../sessions/index.js";
import { assetService } from "./asset.service.js";

async function requireAssetSession(request: Request) {
  const sessionId = readAuthCookie(request);
  if (!sessionId) {
    return null;
  }
  const session = await sessionService.getAuthenticatedSession(sessionId);
  if (!session) {
    return null;
  }
  if (!(session.user.roles.includes("CUSTOMER_MANAGE") || session.user.roles.includes("INVENTORY_VIEW") || session.user.roles.includes("SYSTEM_ADMIN"))) {
    return null;
  }
  return session;
}

function sendAssetError(response: Response, error: unknown) {
  sendJson(response, 500, {
    success: false,
    errorCode: error instanceof Error ? error.message : "ASSET_OPERATION_FAILED",
    message: "자산관리 처리 중 오류가 발생했습니다.",
  });
}

export class AssetController {
  getWorkspace = async (request: Request, response: Response) => {
    const session = await requireAssetSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ASSET_MANAGE_REQUIRED",
        message: "자산관리 권한이 필요합니다.",
      });
      return;
    }
    try {
      sendJson(response, 200, { success: true, data: await assetService.getWorkspace() });
    } catch (error) {
      sendAssetError(response, error);
    }
  };

  savePhysicalAsset = async (request: Request, response: Response) => {
    const session = await requireAssetSession(request);
    if (!session) {
      sendJson(response, 403, { success: false, errorCode: "ASSET_MANAGE_REQUIRED", message: "자산관리 권한이 필요합니다." });
      return;
    }
    try {
      const payload = { ...(request.body || {}), id: request.params.assetId || request.body?.id || "" };
      sendJson(response, 200, { success: true, data: await assetService.savePhysicalAsset(payload, session.user.id) });
    } catch (error) {
      sendAssetError(response, error);
    }
  };

  deletePhysicalAsset = async (request: Request, response: Response) => {
    const session = await requireAssetSession(request);
    if (!session) {
      sendJson(response, 403, { success: false, errorCode: "ASSET_MANAGE_REQUIRED", message: "자산관리 권한이 필요합니다." });
      return;
    }
    try {
      sendJson(response, 200, { success: true, data: await assetService.deletePhysicalAsset(String(request.params.assetId || ""), session.user.id) });
    } catch (error) {
      sendAssetError(response, error);
    }
  };

  saveKnowledgeRecord = async (request: Request, response: Response) => {
    const session = await requireAssetSession(request);
    if (!session) {
      sendJson(response, 403, { success: false, errorCode: "ASSET_MANAGE_REQUIRED", message: "자산관리 권한이 필요합니다." });
      return;
    }
    try {
      const payload = { ...(request.body || {}), id: request.params.recordId || request.body?.id || "" };
      sendJson(response, 200, { success: true, data: await assetService.saveKnowledgeRecord(payload, session.user.id) });
    } catch (error) {
      sendAssetError(response, error);
    }
  };

  deleteKnowledgeRecord = async (request: Request, response: Response) => {
    const session = await requireAssetSession(request);
    if (!session) {
      sendJson(response, 403, { success: false, errorCode: "ASSET_MANAGE_REQUIRED", message: "자산관리 권한이 필요합니다." });
      return;
    }
    try {
      sendJson(response, 200, { success: true, data: await assetService.deleteKnowledgeRecord(String(request.params.recordId || ""), session.user.id) });
    } catch (error) {
      sendAssetError(response, error);
    }
  };
}

export const assetController = new AssetController();
