import type { Request } from "express";

function normalizeIp(value: string | undefined) {
  return String(value || "")
    .replace(/^::ffff:/, "")
    .trim();
}

function isIpv6Loopback(ip: string) {
  return ip === "::1" || ip === "0:0:0:0:0:0:0:1";
}

export function isLoopbackIp(ip: string) {
  const normalized = normalizeIp(ip);
  return normalized === "127.0.0.1" || normalized === "localhost" || isIpv6Loopback(normalized);
}

export function isPrivateNetworkIp(ip: string) {
  const normalized = normalizeIp(ip);
  if (!normalized) {
    return false;
  }
  if (isLoopbackIp(normalized)) {
    return true;
  }
  if (normalized.startsWith("10.") || normalized.startsWith("192.168.")) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)) {
    return true;
  }
  if (normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:")) {
    return true;
  }
  return false;
}

export function getRequestIp(request: Request) {
  return normalizeIp(request.ip || request.socket.remoteAddress);
}

export function isLocalRequest(request: Request) {
  return isLoopbackIp(getRequestIp(request));
}

export function resolveRequestAccessScope(request: Request) {
  const clientIp = getRequestIp(request);
  if (request.path.startsWith("/admin") && isLoopbackIp(clientIp)) {
    return "LOCAL_ADMIN" as const;
  }
  if (isPrivateNetworkIp(clientIp)) {
    return "INTERNAL" as const;
  }
  return "EXTERNAL" as const;
}

export function getRequestTlsContext(request: Request) {
  const socket = request.socket as Request["socket"] & {
    authorized?: boolean;
    getPeerCertificate?: () => { fingerprint256?: string; fingerprint?: string } | null;
  };

  const certificate = typeof socket.getPeerCertificate === "function" ? socket.getPeerCertificate() : null;
  return {
    mtlsVerified: Boolean(socket.authorized),
    certificateFingerprint: String(certificate?.fingerprint256 || certificate?.fingerprint || "").trim(),
  };
}
