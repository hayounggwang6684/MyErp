import type { Request, Response } from "express";

const authCookieName = "erp_demo_session";

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

export function writeAuthCookie(response: Response, value: string) {
  response.cookie(authCookieName, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export function clearAuthCookie(response: Response) {
  response.clearCookie(authCookieName, {
    path: "/",
  });
}
