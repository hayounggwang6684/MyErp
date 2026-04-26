import type { Request, Response } from "express";

const authCookieName = "erp_demo_session";
const pendingAuthCookieName = "erp_demo_pending_challenge";

export function getCookieValue(cookieHeader: string | undefined, key: string) {
  if (!cookieHeader) {
    return null;
  }

  const segments = cookieHeader.split(";").map((segment) => segment.trim());
  for (const segment of segments) {
    const [name, ...valueParts] = segment.split("=");
    if (name === key) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export function readAuthCookie(request: Request) {
  return getCookieValue(request.headers.cookie, authCookieName);
}

export function readPendingAuthCookie(request: Request) {
  return getCookieValue(request.headers.cookie, pendingAuthCookieName);
}

function buildCookieOptions(request: Request) {
  return {
    httpOnly: true,
    secure: Boolean(request.secure),
    sameSite: "lax",
    path: "/",
  } as const;
}

export function writeAuthCookie(request: Request, response: Response, value: string) {
  response.cookie(authCookieName, value, buildCookieOptions(request));
}

export function writePendingAuthCookie(request: Request, response: Response, value: string) {
  response.cookie(pendingAuthCookieName, value, buildCookieOptions(request));
}

export function clearAuthCookie(request: Request, response: Response) {
  response.clearCookie(authCookieName, {
    ...buildCookieOptions(request),
    maxAge: 0,
  });
}

export function clearPendingAuthCookie(request: Request, response: Response) {
  response.clearCookie(pendingAuthCookieName, {
    ...buildCookieOptions(request),
    maxAge: 0,
  });
}
