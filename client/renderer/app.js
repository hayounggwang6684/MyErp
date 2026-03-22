const screens = {
  login: document.getElementById("login-screen"),
  mfa: document.getElementById("mfa-screen"),
  enrollment: document.getElementById("mfa-enrollment-screen"),
  dashboard: document.getElementById("dashboard-screen"),
};

const loginForm = document.getElementById("login-form");
const mfaForm = document.getElementById("mfa-form");
const enrollmentForm = document.getElementById("mfa-enrollment-form");
const loginFeedback = document.getElementById("login-feedback");
const mfaFeedback = document.getElementById("mfa-feedback");
const enrollmentFeedback = document.getElementById("mfa-enrollment-feedback");
const updateStatus = document.getElementById("update-status");
const sessionUser = document.getElementById("session-user");
const autoLoginCheckbox = document.getElementById("auto-login");
const loginAppVersion = document.getElementById("login-app-version");
const dashboardAppVersion = document.getElementById("dashboard-app-version");
const dashboardAutoLogin = document.getElementById("dashboard-auto-login");
const dashboardAccessScope = document.getElementById("dashboard-access-scope");
const dashboardUpdateStatus = document.getElementById("dashboard-update-status");
const enrollmentQr = document.getElementById("enrollment-qr");
const enrollmentSecret = document.getElementById("enrollment-secret");
const adminSecurityPanel = document.getElementById("admin-security-panel");
const adminSecurityFeedback = document.getElementById("admin-security-feedback");
const adminUsersTableBody = document.getElementById("admin-users-table-body");
const refreshAdminUsersButton = document.getElementById("refresh-admin-users");
let currentSession = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadAppVersion() {
  try {
    const result = await window.erpClient.getAppVersion();
    const label = `버전 ${result.version}`;
    loginAppVersion.textContent = label;
    setBadgeText(dashboardAppVersion, result.version, "neutral");
  } catch {
    loginAppVersion.textContent = "버전 확인 실패";
    setBadgeText(dashboardAppVersion, "확인 실패", "warn");
  }
}

async function loadEnrollmentScreen() {
  const enrollment = await window.erpClient.startMfaEnrollment();
  enrollmentQr.src = enrollment.data.qr_code_data_url;
  enrollmentSecret.value = enrollment.data.secret_base32;
  document.getElementById("enrollment-otp-code").value = "";
  setMessage(enrollmentFeedback, "info", `${enrollment.data.username} 계정의 MFA 등록을 진행합니다.`);
  showScreen("enrollment");
}

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
    currentSession = session.data;
    sessionUser.textContent = `${session.data.user.name} · ${session.data.roles.join(", ")}`;
    setBadgeText(
      dashboardAccessScope,
      session.data.access_scope,
      session.data.access_scope === "EXTERNAL" ? "warn" : "ok",
    );
    await refreshAdminPanel();
    showScreen("dashboard");
    return true;
  } catch {
    currentSession = null;
    adminSecurityPanel.classList.add("hidden");
    showScreen("login");
    return false;
  }
}

async function refreshAdminPanel() {
  const isAdmin = Array.isArray(currentSession?.roles) && currentSession.roles.includes("SYSTEM_ADMIN");
  adminSecurityPanel.classList.toggle("hidden", !isAdmin);

  if (!isAdmin) {
    adminUsersTableBody.innerHTML = "";
    return;
  }

  try {
    const response = await window.erpClient.listAdminUsers();
    adminUsersTableBody.innerHTML = response.data
      .map((user) => {
        const statusBadgeClass = user.status === "LOCKED" ? "warn" : "ok";
        const mfaText = user.hasActiveMfa ? "활성" : "미등록";
        const mfaBadgeClass = user.hasActiveMfa ? "ok" : "warn";
        const lastUsedAt = user.activeMfaLastUsedAt
          ? new Date(user.activeMfaLastUsedAt).toLocaleString("ko-KR")
          : "-";

        return `
          <tr>
            <td>
              <strong>${escapeHtml(user.username)}</strong><br />
              <span class="table-subtext">${escapeHtml(user.roles.join(", "))}</span>
            </td>
            <td><span class="status-badge ${statusBadgeClass}">${escapeHtml(user.status)}</span></td>
            <td><span class="status-badge ${mfaBadgeClass}">${mfaText}</span></td>
            <td>${escapeHtml(String(user.failedPasswordAttempts))}</td>
            <td>${escapeHtml(lastUsedAt)}</td>
            <td>
              <div class="admin-actions">
                <button class="ghost-button admin-action-button" data-action="unlock" data-user-id="${escapeHtml(user.id)}">잠금 해제</button>
                <button class="ghost-button admin-action-button" data-action="reset-mfa" data-user-id="${escapeHtml(user.id)}">MFA 초기화</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    setMessage(adminSecurityFeedback, "info", "관리자 작업 대상 계정을 선택해 보안 상태를 복구할 수 있습니다.");
  } catch (error) {
    adminUsersTableBody.innerHTML = "";
    setMessage(adminSecurityFeedback, "error", error.message || "관리자 사용자 목록을 불러오지 못했습니다.");
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
      autoLoginEnabled: Boolean(autoLoginCheckbox.checked),
      lastLoginAt: autoLoginCheckbox.checked ? new Date().toISOString() : "",
      accessScope: result.data.access_scope,
    });
    setBadgeText(
      dashboardAutoLogin,
      autoLoginCheckbox.checked ? "활성" : "비활성",
      autoLoginCheckbox.checked ? "ok" : "neutral",
    );

    if (result.data.login_status === "AUTHENTICATED") {
      setMessage(loginFeedback, "info", "로그인되었습니다.");
      await refreshSession();
      return;
    }

    if (result.data.login_status === "MFA_ENROLLMENT_REQUIRED") {
      await loadEnrollmentScreen();
      return;
    }

    setMessage(mfaFeedback, "info", "Authenticator 앱의 6자리 코드를 입력하세요.");
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

enrollmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await window.erpClient.verifyMfaEnrollment({
      otp_code: document.getElementById("enrollment-otp-code").value.trim(),
    });
    await refreshSession();
  } catch (error) {
    setMessage(enrollmentFeedback, "error", error.message || "MFA 등록 확인에 실패했습니다.");
  }
});

document.getElementById("back-to-login").addEventListener("click", () => {
  showScreen("login");
});

document.getElementById("restart-enrollment").addEventListener("click", async () => {
  await window.erpClient.logout();
  showScreen("login");
});

document.getElementById("refresh-session").addEventListener("click", async () => {
  await refreshSession();
});

refreshAdminUsersButton.addEventListener("click", async () => {
  await refreshAdminPanel();
});

adminUsersTableBody.addEventListener("click", async (event) => {
  const button = event.target instanceof HTMLElement ? event.target.closest("button[data-action]") : null;
  if (!button) {
    return;
  }

  const action = button.getAttribute("data-action");
  const userId = button.getAttribute("data-user-id");
  if (!action || !userId) {
    return;
  }

  try {
    if (action === "unlock") {
      await window.erpClient.unlockAdminUser(userId);
      setMessage(adminSecurityFeedback, "info", "계정 잠금을 해제했습니다.");
    }

    if (action === "reset-mfa") {
      await window.erpClient.resetAdminUserMfa(userId);
      setMessage(adminSecurityFeedback, "info", "사용자 MFA를 초기화했습니다. 다음 외부망 로그인 시 다시 등록하게 됩니다.");
    }

    await refreshAdminPanel();
  } catch (error) {
    setMessage(adminSecurityFeedback, "error", error.message || "관리자 작업에 실패했습니다.");
  }
});

document.getElementById("logout").addEventListener("click", async () => {
  await window.erpClient.logout();
  await loadPreferences();
  setMessage(loginFeedback, "info", "로그아웃되었습니다.");
  showScreen("login");
});

loadPreferences()
  .then(() => loadAppVersion())
  .then(attemptAutoLogin)
  .then((autoLoggedIn) => {
    if (!autoLoggedIn) {
      return refreshSession();
    }

    return true;
  });
