const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { autoUpdater } = require("electron-updater");
const clientConstants = require("./constants");

let mainWindow = null;
let sessionCookie = "";
const defaultPreferences = {
  rememberedUsername: "",
  autoLoginEnabled: false,
  lastLoginAt: "",
  accessScope: "EXTERNAL",
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

function persistCurrentSessionIfAllowed() {
  const preferences = readPreferences();
  if (preferences.autoLoginEnabled && preferences.accessScope === "INTERNAL" && sessionCookie) {
    writePersistedSession(sessionCookie);
    return;
  }

  clearPersistedSession();
}

async function apiRequest(method, routePath, body) {
  const baseUrl = normalizeBaseUrl(clientConstants.serverUrl);

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

  if (clientConstants.forceAccessScopeForTesting) {
    headers["x-demo-force-access-scope"] = clientConstants.forceAccessScopeForTesting;
  }

  const response = await fetch(`${baseUrl}${routePath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    sessionCookie = parseSetCookie(setCookie);
    persistCurrentSessionIfAllowed();
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
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-status", payload);
  }
}

function registerAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    sendUpdateStatus({
      status: "CHECKING",
      message: "최신 업데이트를 확인하는 중입니다.",
    });
  });

  autoUpdater.on("update-available", (info) => {
    sendUpdateStatus({
      status: "UPDATE_AVAILABLE",
      message: `새 버전 ${info.version} 다운로드를 시작합니다.`,
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    sendUpdateStatus({
      status: "UP_TO_DATE",
      message: `현재 버전(${app.getVersion()})이 최신입니다.`,
      latestVersion: info.version,
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    sendUpdateStatus({
      status: "DOWNLOADING",
      message: `업데이트 다운로드 중 (${Math.round(progress.percent)}%)`,
    });
  });

  autoUpdater.on("update-downloaded", async (info) => {
    sendUpdateStatus({
      status: "DOWNLOADED",
      message: `새 버전 ${info.version} 다운로드가 완료되었습니다.`,
    });

    const prompt = await dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["나중에", "지금 재시작"],
      defaultId: 1,
      cancelId: 0,
      title: "업데이트 준비 완료",
      message: `새 버전 ${info.version} 설치가 준비되었습니다.`,
      detail: "지금 재시작하면 업데이트를 적용합니다.",
    });

    if (prompt.response === 1) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on("error", (error) => {
    sendUpdateStatus({
      status: "CHECK_FAILED",
      message: `업데이트 확인에 실패했습니다: ${error == null ? "unknown" : error.message}`,
    });
  });
}

async function checkForUpdates() {
  if (!app.isPackaged) {
    const status = {
      status: "DEV_MODE",
      message: "개발 모드에서는 자동 업데이트가 비활성화됩니다. 패키징된 앱에서 동작합니다.",
    };
    sendUpdateStatus(status);
    return status;
  }

  await autoUpdater.checkForUpdates();
  return {
    status: "CHECKING",
    message: "최신 업데이트를 확인하는 중입니다.",
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1420,
    height: 940,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: "#eef3f8",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));
  mainWindow.webContents.on("did-finish-load", () => {
    sendUpdateStatus({
      status: "READY",
      message: "앱 시작 시 최신 릴리즈를 자동으로 확인합니다.",
    });
    checkForUpdates().catch(() => {
      sendUpdateStatus({
        status: "CHECK_FAILED",
        message: "앱 시작 시 업데이트 확인에 실패했습니다.",
      });
    });
  });
}

ipcMain.handle("preference:get", () => readPreferences());
ipcMain.handle("app:version", () => ({
  version: app.getVersion(),
}));
ipcMain.handle("preference:save", (_event, payload) => {
  const nextPreferences = writePreferences(payload);
  persistCurrentSessionIfAllowed();
  return nextPreferences;
});
ipcMain.handle("auth:login", async (_event, payload) =>
  apiRequest("POST", "/api/v1/auth/login", payload),
);
ipcMain.handle("auth:verify-mfa", async (_event, payload) =>
  apiRequest("POST", "/api/v1/auth/mfa/verify", payload),
);
ipcMain.handle("auth:mfa-enrollment:start", async () =>
  apiRequest("POST", "/api/v1/auth/mfa/enrollment/start"),
);
ipcMain.handle("auth:mfa-enrollment:status", async () =>
  apiRequest("GET", "/api/v1/auth/mfa/enrollment/status"),
);
ipcMain.handle("auth:mfa-enrollment:verify", async (_event, payload) =>
  apiRequest("POST", "/api/v1/auth/mfa/enrollment/verify", payload),
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
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
