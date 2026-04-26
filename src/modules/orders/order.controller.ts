import type { Request, Response } from "express";
import { readAuthCookie } from "../../shared/utils/cookies.js";
import { sendJson } from "../../shared/utils/responses.js";
import { sessionService } from "../sessions/index.js";
import { orderService } from "./order.service.js";

async function requireOrderSession(request: Request) {
  const sessionId = readAuthCookie(request);
  if (!sessionId) {
    return null;
  }

  const session = await sessionService.getAuthenticatedSession(sessionId);
  if (
    !session ||
    !(
      session.user.roles.includes("ORDER_MANAGE") ||
      session.user.roles.includes("WORK_MANAGE") ||
      session.user.roles.includes("PARTS_SALES") ||
      session.user.roles.includes("SYSTEM_ADMIN")
    )
  ) {
    return null;
  }

  return session;
}

function sendOrderError(response: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "ORDER_OPERATION_FAILED";
  const statusCode = message === "MERGE_ORDER_REQUIRED" || message === "ORDER_DELETE_REQUIRED" ? 400 : 500;
  sendJson(response, statusCode, {
    success: false,
    errorCode: message,
    message: "주문/공사 저장 중 오류가 발생했습니다.",
  });
}

export class OrderController {
  listOrders = async (request: Request, response: Response) => {
    const session = await requireOrderSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ORDER_MANAGE_REQUIRED",
        message: "주문관리 권한이 필요합니다.",
      });
      return;
    }

    sendJson(response, 200, {
      success: true,
      data: await orderService.listOrders(),
    });
  };

  saveOrder = async (request: Request, response: Response) => {
    const session = await requireOrderSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ORDER_MANAGE_REQUIRED",
        message: "주문관리 권한이 필요합니다.",
      });
      return;
    }

    try {
      const payload = {
        ...(request.body || {}),
        id: request.params.orderId || request.body?.id,
      };
      const result = await orderService.saveOrder(payload, session.user.id);
      sendJson(response, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      sendOrderError(response, error);
    }
  };

  mergeOrders = async (request: Request, response: Response) => {
    const session = await requireOrderSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ORDER_MANAGE_REQUIRED",
        message: "주문관리 권한이 필요합니다.",
      });
      return;
    }

    try {
      const result = await orderService.mergeOrders(request.body || {}, session.user.id);
      sendJson(response, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      sendOrderError(response, error);
    }
  };

  deleteOrder = async (request: Request, response: Response) => {
    const session = await requireOrderSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ORDER_MANAGE_REQUIRED",
        message: "주문관리 권한이 필요합니다.",
      });
      return;
    }

    try {
      const orderId = Array.isArray(request.params.orderId) ? request.params.orderId[0] || "" : request.params.orderId || "";
      const result = await orderService.deleteOrder(orderId, session.user.id);
      sendJson(response, 200, {
        success: true,
        data: result,
      });
    } catch (error) {
      sendOrderError(response, error);
    }
  };

  listProjects = async (request: Request, response: Response) => {
    const session = await requireOrderSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "WORK_MANAGE_REQUIRED",
        message: "공사관리 권한이 필요합니다.",
      });
      return;
    }

    sendJson(response, 200, {
      success: true,
      data: await orderService.listProjects(),
    });
  };
}

export const orderController = new OrderController();
