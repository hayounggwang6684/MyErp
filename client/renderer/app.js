const state = {
  currentScreen: "login",
};

const screens = {
  login: document.getElementById("login-screen"),
  mfa: document.getElementById("mfa-screen"),
  dashboard: document.getElementById("dashboard-screen"),
};

const loginForm = document.getElementById("login-form");
const mfaForm = document.getElementById("mfa-form");
const loginFeedback = document.getElementById("login-feedback");
const mfaFeedback = document.getElementById("mfa-feedback");
const updateStatus = document.getElementById("update-status");
const sessionUser = document.getElementById("session-user");
const dashboardServerUrl = document.getElementById("dashboard-server-url");
const serverUrlInput = document.getElementById("server-url");
const repoOwnerInput = document.getElementById("repo-owner");
const repoNameInput = document.getElementById("repo-name");

function setMessage(element, kind, message) {
  element.className = `message ${kind}`;
  element.textContent = message;
}

function showScreen(name) {
  state.currentScreen = name;
  for (const [key, element] of Object.entries(screens)) {
    element.classList.toggle("active", key === name);
  }
}

async function loadConfig() {
  const config = await window.erpClient.getConfig();
  serverUrlInput.value = config.serverUrl || "";
  repoOwnerInput.value = config.updateRepoOwner || "";
  repoNameInput.value = config.updateRepoName || "";
  dashboardServerUrl.textContent = config.serverUrl || "-";
}

async function refreshSession() {
  try {
    const session = await window.erpClient.getSession();
    sessionUser.textContent = `${session.data.user.name} · ${session.data.roles.join(", ")}`;
    showScreen("dashboard");
  } catch {
    showScreen("login");
  }
}

document.getElementById("save-config").addEventListener("click", async () => {
  const config = await window.erpClient.saveConfig({
    serverUrl: serverUrlInput.value.trim(),
    updateRepoOwner: repoOwnerInput.value.trim(),
    updateRepoName: repoNameInput.value.trim(),
  });
  dashboardServerUrl.textContent = config.serverUrl || "-";
  setMessage(updateStatus, "info", "클라이언트 설정을 저장했습니다.");
});

document.getElementById("check-updates").addEventListener("click", async () => {
  const result = await window.erpClient.checkForUpdates();
  setMessage(updateStatus, result.status === "CHECK_FAILED" ? "warn" : "info", result.message);
});

window.erpClient.onUpdateStatus((payload) => {
  const kind = payload.status === "CHECK_FAILED" ? "warn" : "info";
  setMessage(updateStatus, kind, payload.message);
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(loginForm).entries());

  try {
    await window.erpClient.login(payload);
    setMessage(loginFeedback, "info", "1차 인증 성공. MFA 화면으로 이동합니다.");
    showScreen("mfa");
  } catch (error) {
    setMessage(loginFeedback, "error", error.message || "로그인에 실패했습니다.");
  }
});

mfaForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await window.erpClient.verifyMfa({
      otp_code: document.getElementById("otp-code").value.trim(),
    });
    setMessage(mfaFeedback, "info", "2차 인증 성공. 대시보드로 이동합니다.");
    await refreshSession();
  } catch (error) {
    setMessage(mfaFeedback, "error", error.message || "2차 인증에 실패했습니다.");
  }
});

document.getElementById("back-to-login").addEventListener("click", () => {
  showScreen("login");
});

document.getElementById("refresh-session").addEventListener("click", async () => {
  await refreshSession();
});

document.getElementById("logout").addEventListener("click", async () => {
  await window.erpClient.logout();
  showScreen("login");
});

loadConfig().then(refreshSession);
