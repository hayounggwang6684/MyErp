const { app, BrowserWindow, dialog, ipcMain, Menu } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { autoUpdater } = require("electron-updater");
const clientConstants = require("./constants");

let mainWindow = null;
let splashWindow = null;
let sessionCookie = "";
let runtimeAccessScope = "EXTERNAL";
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
  const baseUrl = normalizeBaseUrl(clientConstants.serverUrl);
  const preferences = readPreferences();

  if (!baseUrl) {
    throw new Error("서버 URL이 설정되지 않았습니다.");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (sessionCookie) {
    headers.Cookie = sessionCookie;
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

  const response = await fetch(`${baseUrl}${routePath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie = readSetCookieHeader(response.headers);
  if (setCookie) {
    sessionCookie = parseSetCookie(setCookie);
  }

  const contentType = response.headers.get("content-type") || "";
  const responseBody = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof responseBody === "object" && responseBody && "message" in responseBody
        ? responseBody.message
        : "요청 처리에 실패했습니다.";
    throw new Error(String(message));
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
ipcMain.handle("app:version", () => ({
  version: app.getVersion(),
}));
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
      if (result?.data?.login_status === "AUTHENTICATED" && runtimeAccessScope === "INTERNAL") {
        persistCurrentSessionIfAllowed(runtimeAccessScope);
      }
    }
    return result;
  },
);
ipcMain.handle("auth:verify-mfa", async (_event, payload) => {
  const result = await apiRequest("POST", "/api/v1/auth/mfa/verify", payload);
  runtimeAccessScope = result?.data?.session_context?.access_scope || runtimeAccessScope;
  const nextSessionId = result?.data?.session_id;
  if (nextSessionId) {
    sessionCookie = `erp_demo_session=${encodeURIComponent(nextSessionId)}`;
    if (runtimeAccessScope === "INTERNAL") {
      persistCurrentSessionIfAllowed(runtimeAccessScope);
    }
  }
  return result;
});
ipcMain.handle("auth:mfa-enrollment:start", async () =>
  apiRequest("POST", "/api/v1/auth/mfa/enrollment/start"),
);
ipcMain.handle("auth:mfa-enrollment:status", async () =>
  apiRequest("GET", "/api/v1/auth/mfa/enrollment/status"),
);
ipcMain.handle("auth:mfa-enrollment:verify", async (_event, payload) =>
  {
    const result = await apiRequest("POST", "/api/v1/auth/mfa/enrollment/verify", payload);
    runtimeAccessScope = result?.data?.session_context?.access_scope || runtimeAccessScope;
    const nextSessionId = result?.data?.session_id;
    if (nextSessionId) {
      sessionCookie = `erp_demo_session=${encodeURIComponent(nextSessionId)}`;
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
  clearPersistedSession();
  return result;
});
ipcMain.handle("session:get", async () => apiRequest("GET", "/api/v1/sessions/me"));
ipcMain.handle("updates:check", async () => checkForUpdates());

app.whenReady().then(() => {
  sessionCookie = readPersistedSession();
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
