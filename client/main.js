const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const defaultConfig = {
  serverUrl: "http://127.0.0.1:3000",
  updateRepoOwner: "",
  updateRepoName: "",
};

let mainWindow = null;
let sessionCookie = "";

function getConfigPath() {
  return path.join(app.getPath("userData"), "client-config.json");
}

function readConfig() {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return { ...defaultConfig };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return { ...defaultConfig, ...parsed };
  } catch {
    return { ...defaultConfig };
  }
}

function writeConfig(nextConfig) {
  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(nextConfig, null, 2));
  return nextConfig;
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

async function apiRequest(method, routePath, body) {
  const config = readConfig();
  const baseUrl = normalizeBaseUrl(config.serverUrl);

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

  const response = await fetch(`${baseUrl}${routePath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie = response.headers.get("set-cookie");
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

function compareVersions(currentVersion, nextVersion) {
  const current = currentVersion.replace(/^v/, "").split(".").map(Number);
  const next = nextVersion.replace(/^v/, "").split(".").map(Number);
  const max = Math.max(current.length, next.length);

  for (let index = 0; index < max; index += 1) {
    const a = current[index] || 0;
    const b = next[index] || 0;
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
  }

  return 0;
}

async function checkGithubRelease() {
  const config = readConfig();
  if (!config.updateRepoOwner || !config.updateRepoName) {
    return {
      configured: false,
      status: "NOT_CONFIGURED",
      message: "업데이트 저장소 정보가 아직 설정되지 않았습니다.",
    };
  }

  const response = await fetch(
    `https://api.github.com/repos/${config.updateRepoOwner}/${config.updateRepoName}/releases/latest`,
    {
      headers: {
        "User-Agent": "sunjin-erp-client",
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!response.ok) {
    return {
      configured: true,
      status: "CHECK_FAILED",
      message: "GitHub Releases 확인에 실패했습니다.",
    };
  }

  const release = await response.json();
  const latestVersion = String(release.tag_name || "").replace(/^v/, "");
  const currentVersion = app.getVersion();

  if (!latestVersion) {
    return {
      configured: true,
      status: "CHECK_FAILED",
      message: "최신 릴리즈 버전을 읽지 못했습니다.",
    };
  }

  if (compareVersions(currentVersion, latestVersion) >= 0) {
    return {
      configured: true,
      status: "UP_TO_DATE",
      message: `현재 버전(${currentVersion})이 최신입니다.`,
      currentVersion,
      latestVersion,
      releaseUrl: release.html_url,
    };
  }

  return {
    configured: true,
    status: "UPDATE_AVAILABLE",
    message: `새 버전 ${latestVersion} 이(가) 있습니다.`,
    currentVersion,
    latestVersion,
    releaseUrl: release.html_url,
  };
}

async function promptForUpdate() {
  const result = await checkGithubRelease();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-status", result);
  }

  if (result.status !== "UPDATE_AVAILABLE") {
    return result;
  }

  const prompt = await dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["나중에", "다운로드"],
    defaultId: 1,
    cancelId: 0,
    title: "업데이트 확인",
    message: `새 버전 ${result.latestVersion} 이(가) 있습니다.`,
    detail: "GitHub Releases 페이지를 열어 설치 파일을 다운로드합니다.",
  });

  if (prompt.response === 1 && result.releaseUrl) {
    await shell.openExternal(result.releaseUrl);
    return {
      ...result,
      status: "UPDATE_OPENED",
      message: "릴리즈 페이지를 열었습니다.",
    };
  }

  return result;
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
    promptForUpdate().catch(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("update-status", {
          configured: true,
          status: "CHECK_FAILED",
          message: "앱 시작 시 업데이트 확인에 실패했습니다.",
        });
      }
    });
  });
}

ipcMain.handle("config:get", () => readConfig());
ipcMain.handle("config:save", (_event, nextPartial) => {
  const nextConfig = { ...readConfig(), ...nextPartial };
  return writeConfig(nextConfig);
});
ipcMain.handle("auth:login", async (_event, payload) =>
  apiRequest("POST", "/api/v1/auth/login", payload),
);
ipcMain.handle("auth:verify-mfa", async (_event, payload) =>
  apiRequest("POST", "/api/v1/auth/mfa/verify", payload),
);
ipcMain.handle("auth:logout", async () => {
  const result = await apiRequest("POST", "/api/v1/auth/logout");
  sessionCookie = "";
  return result;
});
ipcMain.handle("session:get", async () => apiRequest("GET", "/api/v1/sessions/me"));
ipcMain.handle("updates:check", async () => promptForUpdate());

app.whenReady().then(() => {
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
