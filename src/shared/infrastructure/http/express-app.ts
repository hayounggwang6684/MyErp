import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", "loopback, linklocal, uniquelocal");

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ extended: false, limit: "256kb" }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      errorCode: "RATE_LIMITED",
      message: "요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
    },
  });

  const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      errorCode: "RATE_LIMITED",
      message: "관리자 요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
    },
  });

  app.use(
    [
      "/api/v1/auth/login",
      "/api/v1/auth/mfa/verify",
      "/api/v1/auth/mfa/enrollment/start",
      "/api/v1/auth/mfa/enrollment/verify",
      "/api/v1/me/password",
      "/admin/api/v1/auth/login",
      "/admin/api/v1/auth/mfa/verify",
      "/admin/api/v1/auth/mfa/enrollment/start",
      "/admin/api/v1/auth/mfa/enrollment/verify",
    ],
    authLimiter,
  );
  app.use("/admin/api", adminLimiter);

  app.use((request, response, next) => {
    const isAdminMutation =
      request.path.startsWith("/admin/api/") &&
      !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase());

    if (!isAdminMutation) {
      next();
      return;
    }

    const origin = String(request.get("origin") || "").trim();
    const host = String(request.get("host") || "").trim();
    const expectedOrigin = `${request.protocol}://${host}`;
    if (!origin || origin === expectedOrigin) {
      next();
      return;
    }

    response.status(403).json({
      success: false,
      errorCode: "CSRF_BLOCKED",
      message: "허용되지 않은 관리자 요청 출처입니다.",
    });
  });

  return app;
}
