import express, { type Express, type Request, type Response } from "express";
import path from "node:path";
import { authController } from "../modules/auth/index.js";
import { adminSecurityController } from "../modules/admin/index.js";
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
      response.redirect("/admin/security");
      return;
    }

    response.redirect("/admin/login");
  });

  app.get("/login", async (request, response) => {
    const session = await getSessionFromRequest(request);
    if (session) {
      response.redirect("/dashboard");
      return;
    }

    renderPage(response, "login.html", {
      PAGE_TITLE: "ERP Login",
      STATUS_BADGE_CLASS: "ok",
      STATUS_BADGE_TEXT: "접속 인증서 확인 완료",
      FEEDBACK_CLASS: "info",
      FEEDBACK_MESSAGE: "PostgreSQL과 TOTP MFA 기준 로그인 화면입니다.",
    });
  });

  app.get("/mfa/verify", async (request, response) => {
    const pending = await sessionService.getPendingChallenge(getCookieValue(request.headers.cookie, authCookieName));

    if (!pending) {
      response.redirect("/login");
      return;
    }

    renderPage(response, "mfa.html", {
      PAGE_TITLE: "ERP MFA Verification",
      FEEDBACK_CLASS: "info",
      FEEDBACK_MESSAGE: "Authenticator 앱 코드를 입력해 주세요.",
    });
  });

  app.get("/dashboard", async (request, response) => {
    const session = await getSessionFromRequest(request);
    if (!session) {
      response.redirect("/login");
      return;
    }

    renderPage(response, "dashboard.html", {
      PAGE_TITLE: "ERP Dashboard",
      USER_NAME: session.user.name,
      USER_ROLE: session.user.roles.join(", "),
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

    renderPage(response, "admin-security.html", {
      PAGE_TITLE: "ERP Admin Security",
      ADMIN_NAME: session.user.name,
      ADMIN_ROLE: session.user.roles.join(", "),
    });
  });

  app.get("/api/v1/auth/access-scope", authController.getAccessScope);
  app.post("/api/v1/auth/login", authController.login);
  app.post("/api/v1/auth/mfa/verify", authController.verifyMfa);
  app.post("/api/v1/auth/mfa/enrollment/start", authController.startMfaEnrollment);
  app.get("/api/v1/auth/mfa/enrollment/status", authController.getMfaEnrollmentStatus);
  app.post("/api/v1/auth/mfa/enrollment/verify", authController.verifyMfaEnrollment);
  app.get("/api/v1/sessions/me", authController.getCurrentSession);
  app.post("/api/v1/auth/logout", authController.logout);
  app.get("/api/v1/admin/users/security", adminSecurityController.listUsers);
  app.post("/api/v1/admin/users/:userId/unlock", adminSecurityController.unlockUser);
  app.post("/api/v1/admin/users/:userId/reset-mfa", adminSecurityController.resetUserMfa);

  app.post("/admin/api/v1/auth/login", authController.login);
  app.get("/admin/api/v1/sessions/me", authController.getCurrentSession);
  app.post("/admin/api/v1/auth/logout", authController.logout);
  app.get("/admin/api/v1/users/security", adminSecurityController.listUsers);
  app.post("/admin/api/v1/users/:userId/unlock", adminSecurityController.unlockUser);
  app.post("/admin/api/v1/users/:userId/reset-mfa", adminSecurityController.resetUserMfa);
}
