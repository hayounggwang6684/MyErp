import type { Request, Response } from "express";
import { readAuthCookie } from "../../shared/utils/cookies.js";
import { sendJson } from "../../shared/utils/responses.js";
import { sessionService } from "../sessions/index.js";
import { customerService } from "./customer.service.js";

async function requireCustomerSession(request: Request) {
  const sessionId = readAuthCookie(request);
  if (!sessionId) {
    return null;
  }

  const session = await sessionService.getAuthenticatedSession(sessionId);
  if (!session || (!session.user.roles.includes("CUSTOMER_MANAGE") && !session.user.roles.includes("SYSTEM_ADMIN"))) {
    return null;
  }

  return session;
}

export class CustomerController {
  listCustomers = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const customers = await customerService.listCustomers(String(request.query.search || ""));
    sendJson(response, 200, {
      success: true,
      data: customers,
    });
  };

  getCustomer = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const detail = await customerService.getCustomerById(String(request.params.customerId || ""));
    if (!detail) {
      sendJson(response, 404, {
        success: false,
        errorCode: "CUSTOMER_NOT_FOUND",
        message: "고객 정보를 찾을 수 없습니다.",
      });
      return;
    }

    sendJson(response, 200, {
      success: true,
      data: detail,
    });
  };

  createCustomer = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const result = await customerService.createCustomer(request.body || {}, session.user.id);
    sendJson(response, 201, {
      success: true,
      data: result,
    });
  };

  addContact = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const detail = await customerService.addContact(String(request.params.customerId || ""), request.body || {}, session.user.id);
    sendJson(response, 201, {
      success: true,
      data: detail,
    });
  };

  addAddress = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const detail = await customerService.addAddress(String(request.params.customerId || ""), request.body || {}, session.user.id);
    sendJson(response, 201, {
      success: true,
      data: detail,
    });
  };

  addAsset = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const detail = await customerService.addAsset(String(request.params.customerId || ""), request.body || {}, session.user.id);
    sendJson(response, 201, {
      success: true,
      data: detail,
    });
  };

  addEquipment = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const detail = await customerService.addEquipment(String(request.params.assetId || ""), request.body || {}, session.user.id);
    if (!detail) {
      sendJson(response, 404, {
        success: false,
        errorCode: "ASSET_NOT_FOUND",
        message: "자산 정보를 찾을 수 없습니다.",
      });
      return;
    }

    sendJson(response, 201, {
      success: true,
      data: detail,
    });
  };

  listEngineModels = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const data = await customerService.listEngineModels(String(request.query.search || ""));
    sendJson(response, 200, {
      success: true,
      data,
    });
  };

  createEngineModel = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const data = await customerService.createEngineModel(request.body || {}, session.user.id);
    sendJson(response, 201, {
      success: true,
      data,
    });
  };

  listGearboxModels = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const data = await customerService.listGearboxModels(String(request.query.search || ""));
    sendJson(response, 200, {
      success: true,
      data,
    });
  };

  createGearboxModel = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const data = await customerService.createGearboxModel(request.body || {}, session.user.id);
    sendJson(response, 201, {
      success: true,
      data,
    });
  };

  createFile = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const data = await customerService.createFile(request.body || {}, session.user.id);
    sendJson(response, 201, {
      success: true,
      data,
    });
  };

  linkFile = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const data = await customerService.linkFile(
      {
        fileId: String(request.params.fileId || ""),
        domain: String(request.body.domain || "customer"),
        entityType: String(request.body.entity_type || "customer"),
        entityId: String(request.body.entity_id || ""),
      },
      session.user.id,
    );

    sendJson(response, 201, {
      success: true,
      data,
    });
  };

  extractBusinessLicense = async (request: Request, response: Response) => {
    const session = await requireCustomerSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "CUSTOMER_MANAGE_REQUIRED",
        message: "고객관리 권한이 필요합니다.",
      });
      return;
    }

    const data = await customerService.extractBusinessLicense(String(request.params.customerId || ""), request.body || {}, session.user.id);
    sendJson(response, 201, {
      success: true,
      data,
    });
  };
}

export const customerController = new CustomerController();
