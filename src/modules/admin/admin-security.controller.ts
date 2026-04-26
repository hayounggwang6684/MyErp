import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import { withTransaction } from "../../shared/infrastructure/persistence/postgres.js";
import { readAuthCookie } from "../../shared/utils/cookies.js";
import { sendJson } from "../../shared/utils/responses.js";
import { sessionService } from "../sessions/index.js";
import { userService } from "../users/index.js";
import { auditService } from "../audit/index.js";
import { getRequestIp, isLocalRequest } from "../../shared/utils/request-security.js";
import {
  approveMasterDataRequest as approveStoredMasterDataRequest,
  listMasterDataRequests,
} from "./master-data-request.store.js";

async function requireAdminSession(request: Request) {
  if (!isLocalRequest(request)) {
    return null;
  }

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

function getPackageVersion() {
  const packagePath = path.resolve(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8")) as { version?: string };
  return packageJson.version || "0.0.0";
}

const AVAILABLE_ROLES = [
  "SYSTEM_ADMIN",
  "CUSTOMER_MANAGE",
  "ORDER_MANAGE",
  "WORK_MANAGE",
  "INVENTORY_VIEW",
  "STAFF_VIEW",
  "PARTS_SALES",
] as const;

export class AdminSecurityController {
  getOverview = async (request: Request, response: Response) => {
    const session = await requireAdminSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ADMIN_REQUIRED",
        message: "관리자 권한이 필요합니다.",
      });
      return;
    }

    const events = await auditService.listRecentAuthEvents(20);
    sendJson(response, 200, {
      success: true,
      data: {
        serverVersion: getPackageVersion(),
        latestClientReleaseVersion: getPackageVersion(),
        postgresStatus: "CONNECTED",
        maintenanceMode: false,
        loginFailures: events.filter((event) => event.eventType === "LOGIN_FAILED").length,
        accountLocks: events.filter((event) => event.eventType === "ACCOUNT_LOCKED").length,
        mfaEvents: events.filter((event) => event.eventType.startsWith("MFA_")).length,
        adminActions: events.filter((event) => event.eventType.startsWith("ADMIN_")).length,
      },
    });
  };

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
    const employees = await userService.listEmployees();
    sendJson(response, 200, {
      success: true,
      data: {
        users,
        employees,
        availableRoles: AVAILABLE_ROLES,
      },
    });
  };

  listAuditEvents = async (request: Request, response: Response) => {
    const session = await requireAdminSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ADMIN_REQUIRED",
        message: "관리자 권한이 필요합니다.",
      });
      return;
    }

    const events = await auditService.listRecentAuthEvents({
      limit: 100,
      username: request.query.username ? String(request.query.username) : undefined,
      eventType: request.query.event_type ? String(request.query.event_type) : undefined,
      success:
        request.query.success === "true"
          ? true
          : request.query.success === "false"
            ? false
            : undefined,
      dateFrom: request.query.date_from ? String(request.query.date_from) : undefined,
      dateTo: request.query.date_to ? String(request.query.date_to) : undefined,
    });
    sendJson(response, 200, {
      success: true,
      data: events,
    });
  };

  getUpdateStatus = async (request: Request, response: Response) => {
    const session = await requireAdminSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ADMIN_REQUIRED",
        message: "관리자 권한이 필요합니다.",
      });
      return;
    }

    sendJson(response, 200, {
      success: true,
      data: {
        serverVersion: getPackageVersion(),
        latestClientReleaseVersion: getPackageVersion(),
        releaseChannel: "GitHub Releases",
        serverUpdateSteps: [
          "git pull origin main",
          "npm install",
          "npm run db:migrate",
          "서버 재시작",
        ],
        clientUpdateNotes: [
          "Windows 클라이언트는 GitHub Releases 자동 업데이트를 사용합니다.",
          "서버 업데이트를 먼저 반영한 뒤 클라이언트 릴리즈를 게시합니다.",
        ],
      },
    });
  };

  listMasterDataRequests = async (request: Request, response: Response) => {
    const session = await requireAdminSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ADMIN_REQUIRED",
        message: "관리자 권한이 필요합니다.",
      });
      return;
    }

    sendJson(response, 200, {
      success: true,
      data: listMasterDataRequests(),
    });
  };

  approveMasterDataRequest = async (request: Request, response: Response) => {
    const session = await requireAdminSession(request);
    if (!session) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ADMIN_REQUIRED",
        message: "관리자 권한이 필요합니다.",
      });
      return;
    }

    const data = approveStoredMasterDataRequest(String(request.params.requestId || ""), session.user.id);
    if (!data) {
      sendJson(response, 404, {
        success: false,
        errorCode: "REQUEST_NOT_FOUND",
        message: "요청을 찾을 수 없습니다.",
      });
      return;
    }

    sendJson(response, 200, {
      success: true,
      data,
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
        clientIp: getRequestIp(request),
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
        clientIp: getRequestIp(request),
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

  updateEmployee = async (request: Request, response: Response) => {
    const adminSession = await requireAdminSession(request);
    if (!adminSession) {
      sendJson(response, 403, {
        success: false,
        errorCode: "ADMIN_REQUIRED",
        message: "관리자 권한이 필요합니다.",
      });
      return;
    }

    const employeeId = String(request.params.employeeId || "");
    await withTransaction(async (client) => {
      await userService.updateEmployee(
        employeeId,
        {
          department: request.body.department ? String(request.body.department) : undefined,
          jobTitle: request.body.job_title ? String(request.body.job_title) : undefined,
          contact: request.body.contact ? String(request.body.contact) : undefined,
          workStatus: request.body.work_status ? String(request.body.work_status) : undefined,
          assignedWorkCount:
            request.body.assigned_work_count !== undefined ? Number(request.body.assigned_work_count) : undefined,
        },
        client,
      );
      await auditService.recordAuthEvent({
        userId: adminSession.user.id,
        usernameSnapshot: adminSession.user.username,
        eventType: "ADMIN_EMPLOYEE_UPDATED",
        accessScope: adminSession.context.accessScope,
        deviceId: adminSession.context.deviceId,
        clientIp: getRequestIp(request),
        certificateFingerprint: adminSession.context.certificateFingerprint,
        success: true,
        reasonCode: `ADMIN:${adminSession.user.username};EMPLOYEE:${employeeId}`,
        client,
      });
    });

    sendJson(response, 200, {
      success: true,
    });
  };

  updateUserStatus = async (request: Request, response: Response) => {
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

    const nextStatus = request.body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

    await withTransaction(async (client) => {
      await userService.updateStatus(targetUser.id, nextStatus, client);
      await auditService.recordAuthEvent({
        userId: targetUser.id,
        usernameSnapshot: targetUser.username,
        eventType: "ADMIN_USER_STATUS_UPDATED",
        accessScope: adminSession.context.accessScope,
        deviceId: adminSession.context.deviceId,
        clientIp: getRequestIp(request),
        certificateFingerprint: adminSession.context.certificateFingerprint,
        success: true,
        reasonCode: `ADMIN:${adminSession.user.username};STATUS:${nextStatus}`,
        client,
      });
    });

    sendJson(response, 200, {
      success: true,
      data: {
        status: nextStatus,
      },
    });
  };

  updateUserRoles = async (request: Request, response: Response) => {
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

    const requestedRoles = Array.isArray(request.body.roles)
      ? request.body.roles.map((role: unknown) => String(role))
      : [];
    const sanitizedRoles = requestedRoles.filter((role: string) =>
      AVAILABLE_ROLES.includes(role as (typeof AVAILABLE_ROLES)[number]),
    );

    await withTransaction(async (client) => {
      await userService.updateRoles(targetUser.id, sanitizedRoles, client);
      await auditService.recordAuthEvent({
        userId: targetUser.id,
        usernameSnapshot: targetUser.username,
        eventType: "ADMIN_ROLES_UPDATED",
        accessScope: adminSession.context.accessScope,
        deviceId: adminSession.context.deviceId,
        clientIp: getRequestIp(request),
        certificateFingerprint: adminSession.context.certificateFingerprint,
        success: true,
        reasonCode: `ADMIN:${adminSession.user.username};ROLES:${sanitizedRoles.join(",") || "NONE"}`,
        client,
      });
    });

    sendJson(response, 200, {
      success: true,
      data: {
        roles: sanitizedRoles,
      },
    });
  };
}

export const adminSecurityController = new AdminSecurityController();
