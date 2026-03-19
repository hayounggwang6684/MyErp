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
const autoLoginCheckbox = document.getElementById("auto-login");
const dashboardAutoLogin = document.getElementById("dashboard-auto-login");
const dashboardAccessScope = document.getElementById("dashboard-access-scope");
const dashboardUpdateStatus = document.getElementById("dashboard-update-status");

function setMessage(element, kind, message) {
  element.className = `message ${kind}`;
  element.textContent = message;
}

function setBadgeText(element, text, kind = "neutral") {
  element.className = `status-badge ${kind}`;
  element.textContent = text;
}

function showScreen(name) {
  for (const [key, element] of Object.entries(screens)) {
    element.classList.toggle("active", key === name);
  }
}

async function loadPreferences() {
  const preferences = await window.erpClient.getPreference();
  document.getElementById("login-id").value = preferences.rememberedUsername || "";
  autoLoginCheckbox.checked = Boolean(preferences.autoLoginEnabled);
  setBadgeText(
    dashboardAutoLogin,
    preferences.autoLoginEnabled ? "활성" : "비활성",
    preferences.autoLoginEnabled ? "ok" : "neutral",
  );
  return preferences;
}

async function refreshSession() {
  try {
    const session = await window.erpClient.getSession();
    sessionUser.textContent = `${session.data.user.name} · ${session.data.roles.join(", ")}`;
    setBadgeText(
      dashboardAccessScope,
      session.data.access_scope,
      session.data.access_scope === "EXTERNAL" ? "warn" : "ok",
    );
    showScreen("dashboard");
    return true;
  } catch {
    showScreen("login");
    return false;
  }
}

async function attemptAutoLogin() {
  const preferences = await window.erpClient.getPreference();
  if (!preferences.autoLoginEnabled || !preferences.rememberedUsername) {
    return false;
  }

  const hasSession = await refreshSession();
  if (hasSession) {
    setMessage(loginFeedback, "info", "최근 로그인 세션으로 자동 로그인되었습니다.");
    return true;
  }

  document.getElementById("login-id").value = preferences.rememberedUsername;
  setMessage(loginFeedback, "info", "최근 로그인 계정이 준비되었습니다.");
  return false;
}

document.getElementById("check-updates").addEventListener("click", async () => {
  const result = await window.erpClient.checkForUpdates();
  const kind = result.status === "CHECK_FAILED" ? "warn" : "info";
  setMessage(updateStatus, kind, result.message);
  setBadgeText(
    dashboardUpdateStatus,
    result.status === "CHECK_FAILED" ? "실패" : result.status === "UP_TO_DATE" ? "최신" : "확인 중",
    result.status === "CHECK_FAILED" ? "warn" : result.status === "UP_TO_DATE" ? "ok" : "neutral",
  );
});

window.erpClient.onUpdateStatus((payload) => {
  const kind = payload.status === "CHECK_FAILED" ? "warn" : "info";
  setMessage(updateStatus, kind, payload.message);
  setBadgeText(
    dashboardUpdateStatus,
    payload.status === "CHECK_FAILED"
      ? "실패"
      : payload.status === "UP_TO_DATE"
        ? "최신"
        : payload.status === "DOWNLOADING"
          ? "다운로드 중"
          : "확인 중",
    payload.status === "CHECK_FAILED" ? "warn" : payload.status === "UP_TO_DATE" ? "ok" : "neutral",
  );
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(loginForm).entries());

  try {
    const result = await window.erpClient.login(payload);
    await window.erpClient.savePreference({
      rememberedUsername: autoLoginCheckbox.checked ? String(payload.username || "") : "",
      autoLoginEnabled: Boolean(autoLoginCheckbox.checked) && result.data.access_scope === "INTERNAL",
      lastLoginAt: autoLoginCheckbox.checked ? new Date().toISOString() : "",
      accessScope: result.data.access_scope,
    });
    setBadgeText(
      dashboardAutoLogin,
      autoLoginCheckbox.checked && result.data.access_scope === "INTERNAL" ? "활성" : "비활성",
      autoLoginCheckbox.checked && result.data.access_scope === "INTERNAL" ? "ok" : "neutral",
    );

    if (result.data.login_status === "AUTHENTICATED") {
      setMessage(loginFeedback, "info", "로그인되었습니다.");
      await refreshSession();
      return;
    }

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
  await loadPreferences();
  setMessage(loginFeedback, "info", "로그아웃되었습니다.");
  showScreen("login");
});

loadPreferences()
  .then(attemptAutoLogin)
  .then((autoLoggedIn) => {
    if (!autoLoggedIn) {
      return refreshSession();
    }

    return true;
  });
