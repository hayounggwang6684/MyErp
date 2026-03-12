import express, { type Express, type Request, type Response } from "express";
import path from "node:path";
import { authController } from "../modules/auth/index.js";
import { sessionService } from "../modules/sessions/index.js";
import { renderTemplate } from "../shared/infrastructure/templates/render.js";
import { getCookieValue } from "../shared/utils/cookies.js";

const authCookieName = "erp_demo_session";
const staticAssetRoot = path.resolve(process.cwd(), "src/web/assets");

function getSessionFromRequest(request: Request) {
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

  app.get("/login", (request, response) => {
    const session = getSessionFromRequest(request);
    if (session) {
      response.redirect("/dashboard");
      return;
    }

    renderPage(response, "login.html", {
      PAGE_TITLE: "ERP Login",
      STATUS_BADGE_CLASS: "ok",
      STATUS_BADGE_TEXT: "접속 인증서 확인 완료",
      FEEDBACK_CLASS: "info",
      FEEDBACK_MESSAGE: "기본 사용자 계정은 ha / 1234 이고, OTP는 123456 입니다.",
    });
  });

  app.get("/mfa/verify", (request, response) => {
    const pending = sessionService.getPendingChallenge(
      getCookieValue(request.headers.cookie, authCookieName),
    );

    if (!pending) {
      response.redirect("/login");
      return;
    }

    renderPage(response, "mfa.html", {
      PAGE_TITLE: "ERP MFA Verification",
      FEEDBACK_CLASS: "info",
      FEEDBACK_MESSAGE: "Authenticator 앱 대신 데모 OTP 123456으로 검증합니다.",
    });
  });

  app.get("/dashboard", (request, response) => {
    const session = getSessionFromRequest(request);
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
    renderPage(response, "admin-login.html", {
      PAGE_TITLE: "ERP Admin Login",
      STATUS_BADGE_CLASS: "warn",
      STATUS_BADGE_TEXT: "관리자 로컬 전용",
      FEEDBACK_CLASS: "warn",
      FEEDBACK_MESSAGE: "이 화면은 Mac mini 로컬 접속 전용으로 설계된 관리자 로그인 시연입니다.",
    });
  });

  app.post("/api/v1/auth/login", authController.login);
  app.post("/api/v1/auth/mfa/verify", authController.verifyMfa);
  app.get("/api/v1/sessions/me", authController.getCurrentSession);
  app.post("/api/v1/auth/logout", authController.logout);
}
