import express, { type Express, type Request, type Response } from "express";
import path from "node:path";
import { authController } from "../modules/auth/index.js";
import { adminSecurityController } from "../modules/admin/index.js";
import { customerController } from "../modules/customers/index.js";
import { sessionService } from "../modules/sessions/index.js";
import { renderTemplate } from "../shared/infrastructure/templates/render.js";
import { getCookieValue } from "../shared/utils/cookies.js";

const authCookieName = "erp_demo_session";
const staticAssetRoot = path.resolve(process.cwd(), "src/web/assets");

function normalizeIp(value: string | undefined) {
  return String(value || "")
    .replace(/^::ffff:/, "")
    .trim();
}

function isLocalRequest(request: Request) {
  const forwarded = request.header("x-forwarded-for");
  const clientIp = forwarded ? normalizeIp(forwarded.split(",")[0]) : normalizeIp(request.ip || request.socket.remoteAddress);
  return clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "localhost";
}

async function getSessionFromRequest(request: Request) {
  const sessionId = getCookieValue(request.headers.cookie, authCookieName);
  if (!sessionId) {
    return null;
  }

  return sessionService.getAuthenticatedSession(sessionId);
}

function renderPage(response: Response, templateName: string, replacements: Record<string, string>) {
  response.type("html").send(renderTemplate(templateName, replacements));
}

export function registerRoutes(app: Express) {
  app.use("/assets", express.static(staticAssetRoot));

  app.get("/", (_request, response) => {
    response.redirect("/login");
  });

  app.get("/admin", async (request, response) => {
    if (!isLocalRequest(request)) {
      response.status(403).type("text/plain").send("관리자 화면은 Mac mini 로컬 접속에서만 사용할 수 있습니다.");
      return;
    }

    const session = await getSessionFromRequest(request);
    if (session && session.user.roles.includes("SYSTEM_ADMIN")) {
      response.redirect("/admin/dashboard");
      return;
    }

    response.redirect("/admin/login");
  });

  app.get("/login", async (request, response) => {
    const isLocalAdmin = isLocalRequest(request);
    renderPage(response, "client-access.html", {
      PAGE_TITLE: "ERP Client Access",
      STATUS_BADGE_CLASS: "warn",
      STATUS_BADGE_TEXT: "Electron 클라이언트 전용",
      FEEDBACK_CLASS: "info",
      FEEDBACK_MESSAGE: "일반 사용자는 Windows 또는 macOS Electron 클라이언트로만 접속합니다.",
      ADMIN_LINK: isLocalAdmin
        ? '<a class="secondary-button" href="/admin/login">Mac mini 관리자 로그인</a>'
        : "",
    });
  });

  app.get("/mfa/verify", async (request, response) => {
    const isLocalAdmin = isLocalRequest(request);
    renderPage(response, "client-access.html", {
      PAGE_TITLE: "ERP Client Access",
      STATUS_BADGE_CLASS: "warn",
      STATUS_BADGE_TEXT: "브라우저 업무 UI 폐기",
      FEEDBACK_CLASS: "warn",
      FEEDBACK_MESSAGE: "MFA와 대시보드는 Electron 최신 UI에서만 제공합니다.",
      ADMIN_LINK: isLocalAdmin
        ? '<a class="secondary-button" href="/admin/login">Mac mini 관리자 로그인</a>'
        : "",
    });
  });

  app.get("/dashboard", async (request, response) => {
    const isLocalAdmin = isLocalRequest(request);
    renderPage(response, "client-access.html", {
      PAGE_TITLE: "ERP Client Access",
      STATUS_BADGE_CLASS: "warn",
      STATUS_BADGE_TEXT: "브라우저 업무 UI 폐기",
      FEEDBACK_CLASS: "warn",
      FEEDBACK_MESSAGE: "대시보드는 Windows 및 macOS Electron 클라이언트에서만 사용합니다.",
      ADMIN_LINK: isLocalAdmin
        ? '<a class="secondary-button" href="/admin/login">Mac mini 관리자 로그인</a>'
        : "",
    });
  });

  app.get("/admin/login", (_request, response) => {
    if (!isLocalRequest(_request)) {
      response.status(403).type("text/plain").send("관리자 화면은 Mac mini 로컬 접속에서만 사용할 수 있습니다.");
      return;
    }

    renderPage(response, "admin-login.html", {
      PAGE_TITLE: "ERP Admin Login",
      STATUS_BADGE_CLASS: "warn",
      STATUS_BADGE_TEXT: "관리자 로컬 전용",
      FEEDBACK_CLASS: "warn",
      FEEDBACK_MESSAGE: "이 화면은 Mac mini 로컬 접속 전용으로 설계된 관리자 로그인 시연입니다.",
    });
  });

  app.get("/admin/dashboard", async (request, response) => {
    if (!isLocalRequest(request)) {
      response.status(403).type("text/plain").send("관리자 화면은 Mac mini 로컬 접속에서만 사용할 수 있습니다.");
      return;
    }

    const session = await getSessionFromRequest(request);
    if (!session || !session.user.roles.includes("SYSTEM_ADMIN")) {
      response.redirect("/admin/login");
      return;
    }

    renderPage(response, "admin-dashboard.html", {
      PAGE_TITLE: "ERP Admin Dashboard",
      ADMIN_NAME: session.user.name,
      ADMIN_ROLE: session.user.roles.join(", "),
    });
  });

  app.get("/admin/users", async (request, response) => {
    if (!isLocalRequest(request)) {
      response.status(403).type("text/plain").send("관리자 화면은 Mac mini 로컬 접속에서만 사용할 수 있습니다.");
      return;
    }

    const session = await getSessionFromRequest(request);
    if (!session || !session.user.roles.includes("SYSTEM_ADMIN")) {
      response.redirect("/admin/login");
      return;
    }

    renderPage(response, "admin-users.html", {
      PAGE_TITLE: "ERP Admin Users",
      ADMIN_NAME: session.user.name,
      ADMIN_ROLE: session.user.roles.join(", "),
    });
  });

  app.get("/admin/updates", async (request, response) => {
    if (!isLocalRequest(request)) {
      response.status(403).type("text/plain").send("관리자 화면은 Mac mini 로컬 접속에서만 사용할 수 있습니다.");
      return;
    }

    const session = await getSessionFromRequest(request);
    if (!session || !session.user.roles.includes("SYSTEM_ADMIN")) {
      response.redirect("/admin/login");
      return;
    }

    renderPage(response, "admin-updates.html", {
      PAGE_TITLE: "ERP Admin Updates",
      ADMIN_NAME: session.user.name,
      ADMIN_ROLE: session.user.roles.join(", "),
    });
  });

  app.get("/admin/audit", async (request, response) => {
    if (!isLocalRequest(request)) {
      response.status(403).type("text/plain").send("관리자 화면은 Mac mini 로컬 접속에서만 사용할 수 있습니다.");
      return;
    }

    const session = await getSessionFromRequest(request);
    if (!session || !session.user.roles.includes("SYSTEM_ADMIN")) {
      response.redirect("/admin/login");
      return;
    }

    renderPage(response, "admin-audit.html", {
      PAGE_TITLE: "ERP Admin Audit",
      ADMIN_NAME: session.user.name,
      ADMIN_ROLE: session.user.roles.join(", "),
    });
  });

  app.get("/admin/security", async (request, response) => {
    if (!isLocalRequest(request)) {
      response.status(403).type("text/plain").send("관리자 화면은 Mac mini 로컬 접속에서만 사용할 수 있습니다.");
      return;
    }

    const session = await getSessionFromRequest(request);
    if (!session || !session.user.roles.includes("SYSTEM_ADMIN")) {
      response.redirect("/admin/login");
      return;
    }

    response.redirect("/admin/users");
  });

  app.get("/api/v1/auth/access-scope", authController.getAccessScope);
  app.post("/api/v1/auth/login", authController.login);
  app.post("/api/v1/auth/mfa/verify", authController.verifyMfa);
  app.post("/api/v1/auth/mfa/enrollment/start", authController.startMfaEnrollment);
  app.get("/api/v1/auth/mfa/enrollment/status", authController.getMfaEnrollmentStatus);
  app.post("/api/v1/auth/mfa/enrollment/verify", authController.verifyMfaEnrollment);
  app.get("/api/v1/sessions/me", authController.getCurrentSession);
  app.post("/api/v1/auth/logout", authController.logout);
  app.get("/api/v1/customers", customerController.listCustomers);
  app.post("/api/v1/customers", customerController.createCustomer);
  app.get("/api/v1/customers/:customerId", customerController.getCustomer);
  app.post("/api/v1/customers/:customerId/contacts", customerController.addContact);
  app.post("/api/v1/customers/:customerId/addresses", customerController.addAddress);
  app.post("/api/v1/customers/:customerId/assets", customerController.addAsset);
  app.post("/api/v1/assets/:assetId/equipments", customerController.addEquipment);
  app.get("/api/v1/master/engine-models", customerController.listEngineModels);
  app.post("/api/v1/master/engine-models", customerController.createEngineModel);
  app.get("/api/v1/master/gearbox-models", customerController.listGearboxModels);
  app.post("/api/v1/master/gearbox-models", customerController.createGearboxModel);
  app.post("/api/v1/files", customerController.createFile);
  app.post("/api/v1/files/:fileId/links", customerController.linkFile);
  app.post("/api/v1/customers/:customerId/business-license/extract", customerController.extractBusinessLicense);
  app.get("/api/v1/admin/users/security", adminSecurityController.listUsers);
  app.post("/api/v1/admin/users/:userId/unlock", adminSecurityController.unlockUser);
  app.post("/api/v1/admin/users/:userId/reset-mfa", adminSecurityController.resetUserMfa);

  app.post("/admin/api/v1/auth/login", authController.login);
  app.get("/admin/api/v1/sessions/me", authController.getCurrentSession);
  app.post("/admin/api/v1/auth/logout", authController.logout);
  app.get("/admin/api/v1/overview", adminSecurityController.getOverview);
  app.get("/admin/api/v1/users/security", adminSecurityController.listUsers);
  app.get("/admin/api/v1/audit", adminSecurityController.listAuditEvents);
  app.get("/admin/api/v1/updates", adminSecurityController.getUpdateStatus);
  app.patch("/admin/api/v1/employees/:employeeId", adminSecurityController.updateEmployee);
  app.post("/admin/api/v1/users/:userId/status", adminSecurityController.updateUserStatus);
  app.put("/admin/api/v1/users/:userId/roles", adminSecurityController.updateUserRoles);
  app.post("/admin/api/v1/users/:userId/unlock", adminSecurityController.unlockUser);
  app.post("/admin/api/v1/users/:userId/reset-mfa", adminSecurityController.resetUserMfa);
}
