const { app, BrowserWindow, dialog, ipcMain, Menu, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { autoUpdater } = require("electron-updater");
const clientConstants = require("./constants");

let mainWindow = null;
let splashWindow = null;
let sessionCookie = "";
let pendingSessionId = "";
let runtimeAccessScope = "EXTERNAL";
let resolvedServerUrl = "";
let resolvedServerKind = "configured";
let serverResolutionInFlight = null;
let startupUpdateMode = false;
let splashOpenedAt = 0;
let updateCheckInFlight = false;
let startupRetryCount = 0;
let backgroundRecheckTimer = null;
const defaultPreferences = {
  rememberedUsername: "",
  autoLoginEnabled: false,
  lastLoginAt: "",
  accessScope: "EXTERNAL",
  testAccessScope: "AUTO",
  showRememberedUsername: true,
};

function getCloudflareAccessConfig() {
  const accessConfig = clientConstants.cloudflareAccess || {};
  const clientId = String(accessConfig.clientId || "").trim();
  const clientSecret = String(accessConfig.clientSecret || "").trim();

  return {
    enabled: Boolean(accessConfig.enabled && clientId && clientSecret),
    clientId,
    clientSecret,
  };
}

function getPreferencePath() {
  return path.join(app.getPath("userData"), "client-preferences.json");
}

function getSessionPath() {
  return path.join(app.getPath("userData"), "client-session.json");
}

function readJsonFile(filePath, fallbackValue) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallbackValue;
    }

    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallbackValue;
  }
}

function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function readPreferences() {
  return {
    ...defaultPreferences,
    ...readJsonFile(getPreferencePath(), defaultPreferences),
  };
}

function writePreferences(nextPreferences) {
  const mergedPreferences = {
    ...defaultPreferences,
    ...nextPreferences,
  };
  writeJsonFile(getPreferencePath(), mergedPreferences);
  return mergedPreferences;
}

function readPersistedSession() {
  const persisted = readJsonFile(getSessionPath(), { cookie: "" });
  return typeof persisted.cookie === "string" ? persisted.cookie : "";
}

function writePersistedSession(cookieValue) {
  writeJsonFile(getSessionPath(), { cookie: cookieValue });
}

function clearPersistedSession() {
  try {
    fs.rmSync(getSessionPath(), { force: true });
  } catch {
    writePersistedSession("");
  }
}

function normalizeBaseUrl(serverUrl) {
  return String(serverUrl || "").replace(/\/+$/, "");
}

function getConfiguredServerUrl() {
  return normalizeBaseUrl(clientConstants.serverUrl);
}

function getLocalServerUrl() {
  return normalizeBaseUrl(clientConstants.localServerUrl || "http://127.0.0.1:3000");
}

function isLocalServerUrl(baseUrl) {
  return baseUrl === getLocalServerUrl();
}

function getScopePreference(scopeOverride) {
  const preferences = readPreferences();
  if (scopeOverride && scopeOverride !== "AUTO") {
    return scopeOverride;
  }

  if (preferences.testAccessScope && preferences.testAccessScope !== "AUTO") {
    return preferences.testAccessScope;
  }

  if (clientConstants.forceAccessScopeForTesting && clientConstants.forceAccessScopeForTesting !== "AUTO") {
    return clientConstants.forceAccessScopeForTesting;
  }

  return "AUTO";
}

function buildCandidateServerUrls(scopePreference = "AUTO") {
  const configured = getConfiguredServerUrl();
  const local = getLocalServerUrl();

  if (scopePreference === "EXTERNAL") {
    return [configured].filter(Boolean);
  }

  if (scopePreference === "INTERNAL") {
    return Array.from(new Set([local, configured].filter(Boolean)));
  }

  return Array.from(new Set([local, configured].filter(Boolean)));
}

function parseSetCookie(headerValue) {
  if (!headerValue) {
    return "";
  }

  return headerValue.split(";")[0];
}

function readSetCookieHeader(headers) {
  if (!headers) {
    return "";
  }

  if (typeof headers.getSetCookie === "function") {
    const values = headers.getSetCookie();
    if (Array.isArray(values) && values.length > 0) {
      return values[0];
    }
  }

  return headers.get("set-cookie") || "";
}

function sanitizeErrorSnippet(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function normalizeVersionTag(value) {
  return String(value || "")
    .trim()
    .replace(/^v/i, "");
}

function compareVersions(left, right) {
  const leftParts = normalizeVersionTag(left).split(".").map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = normalizeVersionTag(right).split(".").map((part) => Number.parseInt(part, 10) || 0);
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] || 0;
    const rightValue = rightParts[index] || 0;
    if (leftValue > rightValue) {
      return 1;
    }
    if (leftValue < rightValue) {
      return -1;
    }
  }

  return 0;
}

async function fetchLatestReleaseInfo() {
  const owner = clientConstants.updateRepoOwner;
  const repo = clientConstants.updateRepoName;
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "Sunjin-ERP",
    },
  });

  if (!response.ok) {
    throw new Error(`릴리즈 조회 실패 (HTTP ${response.status})`);
  }

  return response.json();
}

function findMacAssetDownloadUrl(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const preferredAsset = assets.find((asset) => /\.dmg$/i.test(asset.name || ""));
  return preferredAsset?.browser_download_url || release?.html_url || "";
}

function buildRequestHeaders(routePath, options = {}, baseUrl = getConfiguredServerUrl()) {
  const preferences = readPreferences();
  const cloudflareAccess = getCloudflareAccessConfig();
  const headers = {
    "Content-Type": "application/json",
  };

  if (sessionCookie) {
    headers.Cookie = sessionCookie;
  }

  if (!isLocalServerUrl(baseUrl) && cloudflareAccess.enabled) {
    headers["CF-Access-Client-Id"] = cloudflareAccess.clientId;
    headers["CF-Access-Client-Secret"] = cloudflareAccess.clientSecret;
  }

  if (options.pendingSessionId) {
    headers["x-pending-session-id"] = options.pendingSessionId;
  }

  if (routePath === "/api/v1/auth/login") {
    headers["x-demo-mtls-verified"] = "true";
  }

  const forcedScope =
    options.testAccessScope && options.testAccessScope !== "AUTO"
      ? options.testAccessScope
      : preferences.testAccessScope && preferences.testAccessScope !== "AUTO"
        ? preferences.testAccessScope
        : clientConstants.forceAccessScopeForTesting;

  if (forcedScope) {
    headers["x-demo-force-access-scope"] = forcedScope;
  }

  return headers;
}

async function probeServerUrl(baseUrl, options = {}) {
  if (!baseUrl) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 1200);

  try {
    const response = await fetch(`${baseUrl}/api/v1/auth/access-scope`, {
      method: "GET",
      headers: buildRequestHeaders("/api/v1/auth/access-scope", options, baseUrl),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    clearTimeout(timeout);
    return false;
  }
}

async function resolveServerUrl(options = {}) {
  if (serverResolutionInFlight) {
    return serverResolutionInFlight;
  }

  const scopePreference = getScopePreference(options.testAccessScope);
  const candidates = buildCandidateServerUrls(scopePreference);

  serverResolutionInFlight = (async () => {
    for (const candidate of candidates) {
      if (await probeServerUrl(candidate, options)) {
        resolvedServerUrl = candidate;
        resolvedServerKind = isLocalServerUrl(candidate) ? "local" : "configured";
        return candidate;
      }
    }

    const fallback = getConfiguredServerUrl() || getLocalServerUrl();
    resolvedServerUrl = fallback;
    resolvedServerKind = isLocalServerUrl(fallback) ? "local" : "configured";
    return fallback;
  })();

  try {
    return await serverResolutionInFlight;
  } finally {
    serverResolutionInFlight = null;
  }
}

function persistCurrentSessionIfAllowed(scopeOverride) {
  const preferences = readPreferences();
  const resolvedScope = scopeOverride || preferences.accessScope || runtimeAccessScope;

  if (!preferences.autoLoginEnabled) {
    clearPersistedSession();
    return;
  }

  if (resolvedScope === "INTERNAL" && sessionCookie) {
    writePersistedSession(sessionCookie);
    return;
  }
}

async function apiRequest(method, routePath, body, options = {}) {
  const baseUrl = await resolveServerUrl({ testAccessScope: options.testAccessScope });

  if (!baseUrl) {
    throw new Error("서버 URL이 설정되지 않았습니다.");
  }

  const headers = buildRequestHeaders(routePath, options, baseUrl);

  let response;
  try {
    response = await fetch(`${baseUrl}${routePath}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error(
      `[${routePath}] 네트워크 요청 실패: ${error?.message || "알 수 없는 네트워크 오류"}`,
    );
  }

  const setCookie = readSetCookieHeader(response.headers);
  if (setCookie) {
    sessionCookie = parseSetCookie(setCookie);
  }

  const contentType = response.headers.get("content-type") || "";
  const responseBody = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const messageFromJson =
      typeof responseBody === "object" && responseBody && "message" in responseBody
        ? String(responseBody.message)
        : "";
    const rawSnippet =
      typeof responseBody === "string"
        ? sanitizeErrorSnippet(responseBody)
        : sanitizeErrorSnippet(JSON.stringify(responseBody));
    const errorSummary = [messageFromJson, rawSnippet].filter(Boolean).join(" / ");
    throw new Error(
      `[${routePath}] HTTP ${response.status}${errorSummary ? `: ${errorSummary}` : ""}`,
    );
  }

  return responseBody;
}

function sendUpdateStatus(payload) {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send("splash-status", payload);
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-status", payload);
  }
}

function clearBackgroundRecheckTimer() {
  if (backgroundRecheckTimer) {
    clearTimeout(backgroundRecheckTimer);
    backgroundRecheckTimer = null;
  }
}

function closeSplashWindow() {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close();
  }

  splashWindow = null;
}

async function ensureMinimumSplashTime() {
  const elapsed = Date.now() - splashOpenedAt;
  const minimumDuration = 1800;
  if (elapsed >= minimumDuration) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, minimumDuration - elapsed));
}

function scheduleBackgroundUpdateRecheck(delayMs = 30000) {
  if (!app.isPackaged) {
    return;
  }

  clearBackgroundRecheckTimer();
  backgroundRecheckTimer = setTimeout(() => {
    checkForUpdates({ silent: true }).catch(() => {});
  }, delayMs);
}

function finishStartupUpdateFlow() {
  startupUpdateMode = false;
  startupRetryCount = 0;
  ensureMinimumSplashTime().then(() => {
    createMainWindow();
    closeSplashWindow();
    scheduleBackgroundUpdateRecheck(30000);
  });
}

function scheduleStartupRetry(error) {
  if (startupRetryCount >= 2) {
    finishStartupUpdateFlow();
    return;
  }

  startupRetryCount += 1;
  sendUpdateStatus({
    status: "CHECKING",
    message: `업데이트 정보를 다시 확인하는 중입니다. (${startupRetryCount}/2)${error?.message ? ` ${error.message}` : ""}`,
  });

  setTimeout(() => {
    runStartupUpdateFlow();
  }, 8000);
}

function registerAutoUpdater() {
  if (process.platform === "darwin") {
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    updateCheckInFlight = true;
    sendUpdateStatus({
      status: "CHECKING",
      message: "최신 업데이트를 확인하는 중입니다.",
    });
  });

  autoUpdater.on("update-available", (info) => {
    updateCheckInFlight = false;
    sendUpdateStatus({
      status: "UPDATE_AVAILABLE",
      message: `새 버전 ${info.version} 다운로드를 시작합니다.`,
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    updateCheckInFlight = false;
    sendUpdateStatus({
      status: "UP_TO_DATE",
      message: `현재 버전(${app.getVersion()})이 최신입니다.`,
      latestVersion: info.version,
    });

    if (startupUpdateMode) {
      finishStartupUpdateFlow();
    }
  });

  autoUpdater.on("download-progress", (progress) => {
    sendUpdateStatus({
      status: "DOWNLOADING",
      message: `업데이트 다운로드 중 (${Math.round(progress.percent)}%)`,
    });
  });

  autoUpdater.on("update-downloaded", async (info) => {
    updateCheckInFlight = false;
    sendUpdateStatus({
      status: "DOWNLOADED",
      message: `새 버전 ${info.version} 다운로드가 완료되었습니다. 앱을 재시작해 업데이트를 적용합니다.`,
    });

    if (startupUpdateMode) {
      setTimeout(() => {
        autoUpdater.quitAndInstall(true, true);
      }, 1200);
      return;
    }

    const prompt = await dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["나중에", "지금 재시작"],
      defaultId: 1,
      cancelId: 0,
      title: "업데이트 준비 완료",
      message: `새 버전 ${info.version} 설치가 준비되었습니다.`,
      detail: "지금 재시작하면 백그라운드로 업데이트를 적용합니다.",
    });

    if (prompt.response === 1) {
      autoUpdater.quitAndInstall(true, true);
    }
  });

  autoUpdater.on("error", (error) => {
    updateCheckInFlight = false;
    sendUpdateStatus({
      status: "CHECK_FAILED",
      message: `업데이트 확인에 실패했습니다: ${error == null ? "unknown" : error.message}`,
    });

    if (startupUpdateMode) {
      scheduleStartupRetry(error);
    }
  });
}

async function checkForUpdates(_options = {}) {
  if (!app.isPackaged) {
    const status = {
      status: "DEV_MODE",
      message: "개발 모드에서는 자동 업데이트가 비활성화됩니다. 패키징된 앱에서 동작합니다.",
    };
    sendUpdateStatus(status);
    return status;
  }

  if (process.platform === "darwin") {
    sendUpdateStatus({
      status: "CHECKING",
      message: "최신 릴리즈를 확인하는 중입니다.",
    });

    try {
      const release = await fetchLatestReleaseInfo();
      const latestVersion = normalizeVersionTag(release.tag_name);
      const currentVersion = normalizeVersionTag(app.getVersion());
      const downloadUrl = findMacAssetDownloadUrl(release);

      if (compareVersions(latestVersion, currentVersion) > 0) {
        const status = {
          status: "MANUAL_UPDATE_AVAILABLE",
          message: `macOS 새 버전 ${latestVersion}이 있습니다. 자동 설치 대신 다운로드 후 수동 교체가 필요합니다.`,
          latestVersion,
          downloadUrl,
        };
        sendUpdateStatus(status);
        return status;
      }

      const status = {
        status: "UP_TO_DATE",
        message: `현재 버전(${currentVersion})이 최신입니다.`,
        latestVersion,
      };
      sendUpdateStatus(status);
      return status;
    } catch (error) {
      const status = {
        status: "CHECK_FAILED",
        message: `업데이트 확인에 실패했습니다: ${error?.message || "알 수 없는 오류"}`,
      };
      sendUpdateStatus(status);
      return status;
    } finally {
      if (startupUpdateMode) {
        finishStartupUpdateFlow();
      }
    }
  }

  if (updateCheckInFlight) {
    return {
      status: "CHECKING",
      message: "이미 최신 업데이트를 확인하는 중입니다.",
    };
  }

  await autoUpdater.checkForUpdates();
  return {
    status: "CHECKING",
    message: "최신 업데이트를 확인하는 중입니다.",
  };
}

function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1420,
    height: 940,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: "#eef3f8",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.platform !== "darwin") {
    Menu.setApplicationMenu(null);
    mainWindow.removeMenu();
  }

  mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));
}

function createSplashWindow() {
  if (splashWindow && !splashWindow.isDestroyed()) {
    return;
  }

  splashWindow = new BrowserWindow({
    width: 560,
    height: 360,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    transparent: false,
    backgroundColor: "#eef3f8",
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "splash-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.platform !== "darwin") {
    splashWindow.removeMenu();
  }

  splashOpenedAt = Date.now();
  splashWindow.loadFile(path.join(__dirname, "renderer/splash.html"));
}

async function runStartupUpdateFlow() {
  sendUpdateStatus({
    status: "READY",
    message: "앱 시작 중입니다. 최신 업데이트를 먼저 확인합니다.",
  });

  if (!app.isPackaged) {
    sendUpdateStatus({
      status: "DEV_MODE",
      message: "개발 모드에서는 스플래시 업데이트 확인을 건너뜁니다.",
    });
    createMainWindow();
    closeSplashWindow();
    return;
  }

  startupUpdateMode = true;

  try {
    await checkForUpdates({ startup: true });
  } catch (error) {
    scheduleStartupRetry(error);
  }
}

ipcMain.handle("preference:get", () => readPreferences());
ipcMain.handle("app:version", async () => {
  const serverUrl = await resolveServerUrl();
  return {
    version: app.getVersion(),
    platform: process.platform,
    cloudflareAccessEnabled: getCloudflareAccessConfig().enabled,
    serverUrl,
    serverKind: resolvedServerKind,
  };
});
ipcMain.handle("preference:save", (_event, payload) => {
  const nextPreferences = writePreferences(payload);
  persistCurrentSessionIfAllowed(nextPreferences.accessScope);
  return nextPreferences;
});
ipcMain.handle("auth:access-scope", async () => {
  const result = await apiRequest("GET", "/api/v1/auth/access-scope");
  runtimeAccessScope = result?.data?.access_scope || "EXTERNAL";
  return result;
});
ipcMain.handle("auth:login", async (_event, payload) =>
  {
    const { test_access_scope: testAccessScope, ...requestBody } = payload || {};
    const result = await apiRequest("POST", "/api/v1/auth/login", requestBody, {
      testAccessScope,
    });
    runtimeAccessScope = result?.data?.access_scope || runtimeAccessScope;
    const nextSessionId = result?.data?.pending_session_id || result?.data?.session_id;
    if (nextSessionId) {
      sessionCookie = `erp_demo_session=${encodeURIComponent(nextSessionId)}`;
      pendingSessionId =
        result?.data?.login_status === "AUTHENTICATED" ? "" : String(result.data.pending_session_id || "");
      if (result?.data?.login_status === "AUTHENTICATED" && runtimeAccessScope === "INTERNAL") {
        persistCurrentSessionIfAllowed(runtimeAccessScope);
      }
    }
    return result;
  },
);
ipcMain.handle("auth:verify-mfa", async (_event, payload) => {
  const result = await apiRequest("POST", "/api/v1/auth/mfa/verify", payload, {
    pendingSessionId,
  });
  runtimeAccessScope = result?.data?.session_context?.access_scope || runtimeAccessScope;
  const nextSessionId = result?.data?.session_id;
  if (nextSessionId) {
    sessionCookie = `erp_demo_session=${encodeURIComponent(nextSessionId)}`;
    pendingSessionId = "";
    if (runtimeAccessScope === "INTERNAL") {
      persistCurrentSessionIfAllowed(runtimeAccessScope);
    }
  }
  return result;
});
ipcMain.handle("auth:mfa-enrollment:start", async () =>
  apiRequest("POST", "/api/v1/auth/mfa/enrollment/start", undefined, {
    pendingSessionId,
  }),
);
ipcMain.handle("auth:mfa-enrollment:status", async () =>
  apiRequest("GET", "/api/v1/auth/mfa/enrollment/status", undefined, {
    pendingSessionId,
  }),
);
ipcMain.handle("auth:mfa-enrollment:verify", async (_event, payload) =>
  {
    const result = await apiRequest("POST", "/api/v1/auth/mfa/enrollment/verify", payload, {
      pendingSessionId,
    });
    runtimeAccessScope = result?.data?.session_context?.access_scope || runtimeAccessScope;
    const nextSessionId = result?.data?.session_id;
    if (nextSessionId) {
      sessionCookie = `erp_demo_session=${encodeURIComponent(nextSessionId)}`;
      pendingSessionId = "";
      if (runtimeAccessScope === "INTERNAL") {
        persistCurrentSessionIfAllowed(runtimeAccessScope);
      }
    }
    return result;
  },
);
ipcMain.handle("auth:logout", async () => {
  const result = await apiRequest("POST", "/api/v1/auth/logout");
  sessionCookie = "";
  pendingSessionId = "";
  clearPersistedSession();
  return result;
});
ipcMain.handle("session:get", async () => apiRequest("GET", "/api/v1/sessions/me"));
ipcMain.handle("customers:list", async (_event, search) =>
  apiRequest("GET", `/api/v1/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
);
ipcMain.handle("customers:get", async (_event, customerId) => apiRequest("GET", `/api/v1/customers/${customerId}`));
ipcMain.handle("customers:create", async (_event, payload) => apiRequest("POST", "/api/v1/customers", payload));
ipcMain.handle("customers:add-contact", async (_event, customerId, payload) =>
  apiRequest("POST", `/api/v1/customers/${customerId}/contacts`, payload),
);
ipcMain.handle("customers:add-address", async (_event, customerId, payload) =>
  apiRequest("POST", `/api/v1/customers/${customerId}/addresses`, payload),
);
ipcMain.handle("customers:add-asset", async (_event, customerId, payload) =>
  apiRequest("POST", `/api/v1/customers/${customerId}/assets`, payload),
);
ipcMain.handle("customers:add-equipment", async (_event, assetId, payload) =>
  apiRequest("POST", `/api/v1/assets/${assetId}/equipments`, payload),
);
ipcMain.handle("customers:list-engine-models", async (_event, search) =>
  apiRequest("GET", `/api/v1/master/engine-models${search ? `?search=${encodeURIComponent(search)}` : ""}`),
);
ipcMain.handle("customers:create-engine-model", async (_event, payload) =>
  apiRequest("POST", "/api/v1/master/engine-models", payload),
);
ipcMain.handle("customers:list-gearbox-models", async (_event, search) =>
  apiRequest("GET", `/api/v1/master/gearbox-models${search ? `?search=${encodeURIComponent(search)}` : ""}`),
);
ipcMain.handle("customers:create-gearbox-model", async (_event, payload) =>
  apiRequest("POST", "/api/v1/master/gearbox-models", payload),
);
ipcMain.handle("customers:upload-file", async (_event, payload) => apiRequest("POST", "/api/v1/files", payload));
ipcMain.handle("customers:link-file", async (_event, fileId, payload) =>
  apiRequest("POST", `/api/v1/files/${fileId}/links`, payload),
);
ipcMain.handle("customers:extract-business-license", async (_event, customerId, payload) =>
  apiRequest("POST", `/api/v1/customers/${customerId}/business-license/extract`, payload),
);
ipcMain.handle("updates:check", async () => checkForUpdates());
ipcMain.handle("updates:open-download", async (_event, url) => {
  if (!url) {
    return false;
  }

  await shell.openExternal(String(url));
  return true;
});

app.whenReady().then(() => {
  sessionCookie = readPersistedSession();
  pendingSessionId = "";
  registerAutoUpdater();
  createSplashWindow();
  runStartupUpdateFlow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createSplashWindow();
      runStartupUpdateFlow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
