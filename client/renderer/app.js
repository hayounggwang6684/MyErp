const dashboardTabDefinitions = [
  { key: "customers", label: "고객관리" },
  { key: "orders", label: "수주관리" },
  { key: "work", label: "작업관리" },
  { key: "inventory", label: "재고관리" },
  { key: "staff", label: "직원관리", department: "관리부" },
  { key: "settings", label: "설정" },
];

const dashboardContent = {
  customers: {
    title: "고객관리",
    summary: "신규 고객, 장기 미응답, 미수 고객과 최근 상담 상태를 한 화면에서 정리합니다.",
    cards: [
      { label: "신규 고객", value: "18", detail: "이번 주 신규 등록 6건" },
      { label: "장기 미응답", value: "7", detail: "7일 이상 미응답 고객" },
      { label: "미수 고객", value: "5", detail: "청구 후 30일 경과" },
      { label: "최근 상담", value: "23", detail: "오늘 상담 이력 등록" },
    ],
    actions: ["고객 등록", "상담 이력", "장기 미응답 조회"],
    columns: ["고객명", "담당자", "최근 상담일", "상태"],
    rows: [
      ["태성중공업", "김하영", "2026-03-24", "후속 견적 요청"],
      ["유신엔진", "박민수", "2026-03-23", "장기 미응답"],
      ["남해상사", "이현우", "2026-03-22", "미수 관리"],
    ],
  },
  orders: {
    title: "수주관리",
    summary: "견적부터 승인, 출하 예정 건까지 수주 흐름을 기준으로 현재 진행 상황을 확인합니다.",
    cards: [
      { label: "신규 수주", value: "14", detail: "오늘 등록 4건" },
      { label: "견적 진행", value: "9", detail: "견적 회신 대기 포함" },
      { label: "승인 대기", value: "3", detail: "내부 승인 필요" },
      { label: "출하 예정", value: "8", detail: "이번 주 출하 일정" },
    ],
    actions: ["수주 등록", "견적 조회", "출하 일정 보기"],
    columns: ["수주번호", "고객명", "품목/작업", "상태", "담당자"],
    rows: [
      ["SO-2026-0324-011", "태성중공업", "실린더 헤드 수리", "승인 대기", "영업 1팀"],
      ["SO-2026-0324-010", "유신엔진", "인젝터 세트 납품", "출하 준비", "영업 2팀"],
      ["SO-2026-0324-008", "남해상사", "정비 견적", "견적 진행", "김하영"],
    ],
  },
  work: {
    title: "작업관리",
    summary: "현장 접수부터 완료 예정 작업까지 정비 및 작업 배정 상태를 중심으로 관리합니다.",
    cards: [
      { label: "작업 접수", value: "11", detail: "오늘 신규 접수" },
      { label: "진행 중", value: "26", detail: "현장/공장 작업 포함" },
      { label: "부품 대기", value: "4", detail: "재고 또는 발주 대기" },
      { label: "완료 예정", value: "6", detail: "금일 종료 목표" },
    ],
    actions: ["작업 등록", "일정 보기", "현장 배정 현황"],
    columns: ["작업번호", "장비/엔진", "상태", "담당자", "마감 예정"],
    rows: [
      ["WK-2026-0324-014", "CAT C18", "진행 중", "정비 1팀", "2026-03-25"],
      ["WK-2026-0324-012", "현장 발전기", "부품 대기", "정비 2팀", "2026-03-26"],
      ["WK-2026-0324-009", "Volvo Penta", "완료 예정", "정비 3팀", "2026-03-24"],
    ],
  },
  inventory: {
    title: "재고관리",
    summary: "재고 경고, 긴급 발주, 입출고 대기 상태를 기준으로 자재 흐름을 빠르게 파악합니다.",
    cards: [
      { label: "재고 경고", value: "6", detail: "최소재고 이하 품목" },
      { label: "긴급 발주 필요", value: "3", detail: "오늘 발주 요청 필요" },
      { label: "입고 대기", value: "12", detail: "입고 처리 전 품목" },
      { label: "출고 요청", value: "9", detail: "작업/판매 출고 예정" },
    ],
    actions: ["재고 조회", "발주 요청", "입출고 이력"],
    columns: ["품목명", "현재고", "최소재고", "상태", "위치"],
    rows: [
      ["필터 키트 A", "8", "10", "경고", "창고 A-02"],
      ["터보 차저", "2", "2", "긴급 발주 필요", "고가품 캐비닛"],
      ["가스켓 세트", "31", "15", "정상", "창고 B-11"],
    ],
  },
  staff: {
    title: "직원관리",
    summary: "관리부에서 인원 현황, 부서, 현재 업무 상태와 담당 건수를 빠르게 확인하는 운영용 탭입니다.",
    cards: [
      { label: "근무 중 인원", value: "18", detail: "현장 포함 근무 중" },
      { label: "배정 대기", value: "2", detail: "신규 배정 가능" },
      { label: "과다 배정", value: "3", detail: "담당 7건 이상" },
      { label: "부재/휴가", value: "1", detail: "금일 부재" },
    ],
    actions: ["직원 조회", "배정 현황", "부서별 보기"],
    columns: ["이름", "부서", "직무", "담당 건수", "현재 상태", "연락처"],
    rows: [
      ["김하영", "관리부", "운영 총괄", "2", "근무 중", "010-2222-1001"],
      ["박민수", "정비부", "정비 팀장", "6", "현장 작업", "010-2222-1002"],
      ["이현우", "영업부", "영업 담당", "4", "상담 중", "010-2222-1003"],
    ],
  },
};

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
const enrollmentQr = document.getElementById("enrollment-qr");
const enrollmentSecret = document.getElementById("enrollment-secret");
const scopeToggleButtons = Array.from(document.querySelectorAll(".login-scope-button"));
const dashboardTabs = document.getElementById("dashboard-tabs");
const dashboardSectionTitle = document.getElementById("dashboard-section-title");
const dashboardSectionCopy = document.getElementById("dashboard-section-copy");
const dashboardCards = document.getElementById("dashboard-cards");
const dashboardActions = document.getElementById("dashboard-actions");
const dashboardTableHead = document.getElementById("dashboard-table-head");
const dashboardTableBody = document.getElementById("dashboard-table-body");
const settingsAutoLogin = document.getElementById("settings-auto-login");
const settingsShowUsername = document.getElementById("settings-show-username");
const settingsRememberedUsername = document.getElementById("settings-remembered-username");
const settingsScopeButtons = Array.from(document.querySelectorAll(".settings-scope-button"));
const settingsFeedback = document.getElementById("settings-feedback");

let selectedTestScope = "AUTO";
let dashboardState = {
  activeTab: "orders",
  session: null,
  preferences: null,
};

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

function renderScopeToggle(scope) {
  selectedTestScope = scope;
  for (const button of scopeToggleButtons) {
    button.classList.toggle("active", button.dataset.scope === scope);
  }
}

function renderSettingsScopeToggle(scope) {
  for (const button of settingsScopeButtons) {
    button.classList.toggle("active", button.dataset.scope === scope);
  }
}

function getVisibleTabs() {
  const department = dashboardState.session?.data?.user?.department || "";
  return dashboardTabDefinitions.filter((tab) => !tab.department || tab.department === department);
}

function getActiveTab() {
  const visibleTabs = getVisibleTabs();
  const exists = visibleTabs.some((tab) => tab.key === dashboardState.activeTab);
  if (!exists) {
    dashboardState.activeTab = "orders";
  }
  return dashboardState.activeTab;
}

function renderDashboardTabs() {
  const visibleTabs = getVisibleTabs();
  const activeTab = getActiveTab();
  dashboardTabs.innerHTML = visibleTabs
    .map(
      (tab) => `
        <button
          type="button"
          class="dashboard-tab${tab.key === activeTab ? " active" : ""}"
          data-dashboard-tab="${tab.key}"
        >${tab.label}</button>
      `,
    )
    .join("");
}

function renderMetricCards(cards) {
  dashboardCards.innerHTML = cards
    .map(
      (card) => `
        <article class="metric-card">
          <p class="eyebrow">${card.label}</p>
          <p class="metric">${card.value}</p>
          <p class="detail">${card.detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderActions(actions) {
  dashboardActions.innerHTML = actions
    .map((action) => `<button type="button" class="secondary-button action-button">${action}</button>`)
    .join("");
}

function renderTable(columns, rows) {
  dashboardTableHead.innerHTML = `<tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>`;
  dashboardTableBody.innerHTML = rows
    .map((row) => `<tr>${row.map((value) => `<td>${value}</td>`).join("")}</tr>`)
    .join("");
}

function renderSettingsTab() {
  const preferences = dashboardState.preferences;
  if (!preferences) {
    return;
  }

  settingsAutoLogin.checked = Boolean(preferences.autoLoginEnabled);
  settingsShowUsername.checked = Boolean(preferences.showRememberedUsername);
  settingsRememberedUsername.textContent = preferences.rememberedUsername || "저장된 아이디 없음";
  renderSettingsScopeToggle(preferences.testAccessScope || "AUTO");
}

function renderActiveTab() {
  const activeTab = getActiveTab();
  const isSettings = activeTab === "settings";
  const content = dashboardContent[activeTab];

  document.getElementById("dashboard-main-pane").classList.toggle("hidden", isSettings);
  document.getElementById("dashboard-settings-pane").classList.toggle("hidden", !isSettings);

  if (isSettings) {
    dashboardSectionTitle.textContent = "설정";
    dashboardSectionCopy.textContent = "자동 로그인, 기본 접속 범위 테스트값, 최근 로그인 아이디 표시 여부를 이 화면에서 조정합니다.";
    renderSettingsTab();
    return;
  }

  dashboardSectionTitle.textContent = content.title;
  dashboardSectionCopy.textContent = content.summary;
  renderMetricCards(content.cards);
  renderActions(content.actions);
  renderTable(content.columns, content.rows);
}

async function saveDashboardPreference(partial, successMessage) {
  const nextPreferences = await window.erpClient.savePreference({
    ...dashboardState.preferences,
    ...partial,
  });
  dashboardState.preferences = nextPreferences;
  await loadPreferences();
  renderActiveTab();
  setMessage(settingsFeedback, "info", successMessage);
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

async function loadPreferences() {
  const preferences = await window.erpClient.getPreference();
  dashboardState.preferences = preferences;
  document.getElementById("login-id").value = preferences.showRememberedUsername ? preferences.rememberedUsername || "" : "";
  autoLoginCheckbox.checked = Boolean(preferences.autoLoginEnabled);
  renderScopeToggle(preferences.testAccessScope || "AUTO");
  return preferences;
}

async function refreshSession() {
  try {
    const session = await window.erpClient.getSession();
    dashboardState.session = session;
    sessionUser.textContent = `${session.data.user.name} · ${session.data.user.department} · ${session.data.roles.join(", ")}`;
    renderDashboardTabs();
    renderActiveTab();
    showScreen("dashboard");
    return true;
  } catch {
    dashboardState.session = null;
    showScreen("login");
    return false;
  }
}

async function attemptAutoLogin() {
  const preferences = await window.erpClient.getPreference();
  if (!preferences.autoLoginEnabled || !preferences.rememberedUsername) {
    return false;
  }

  try {
    const scopeResult = await window.erpClient.getAccessScope();
    const currentScope = scopeResult?.data?.access_scope || "EXTERNAL";
    if (currentScope !== "INTERNAL") {
      document.getElementById("login-id").value = preferences.showRememberedUsername ? preferences.rememberedUsername : "";
      setMessage(loginFeedback, "info", "외부망에서는 자동 로그인을 사용하지 않습니다.");
      return false;
    }
  } catch {
    document.getElementById("login-id").value = preferences.showRememberedUsername ? preferences.rememberedUsername : "";
    setMessage(loginFeedback, "warn", "접속 범위를 확인하지 못해 자동 로그인을 건너뜁니다.");
    return false;
  }

  const hasSession = await refreshSession();
  if (hasSession) {
    setMessage(loginFeedback, "info", "최근 로그인 세션으로 자동 로그인되었습니다.");
    return true;
  }

  document.getElementById("login-id").value = preferences.showRememberedUsername ? preferences.rememberedUsername : "";
  setMessage(loginFeedback, "info", "최근 로그인 계정이 준비되었습니다.");
  return false;
}

document.getElementById("check-updates").addEventListener("click", async () => {
  const result = await window.erpClient.checkForUpdates();
  const kind = result.status === "CHECK_FAILED" ? "warn" : "info";
  setMessage(updateStatus, kind, result.message);
});

window.erpClient.onUpdateStatus((payload) => {
  const kind = payload.status === "CHECK_FAILED" ? "warn" : "info";
  setMessage(updateStatus, kind, payload.message);
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(loginForm).entries());
  payload.test_access_scope = selectedTestScope;

  try {
    const result = await window.erpClient.login(payload);
    await window.erpClient.savePreference({
      ...dashboardState.preferences,
      rememberedUsername: String(payload.username || ""),
      autoLoginEnabled: Boolean(autoLoginCheckbox.checked),
      lastLoginAt: new Date().toISOString(),
      accessScope: result.data.access_scope,
      testAccessScope: selectedTestScope,
    });
    await loadPreferences();

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

for (const button of scopeToggleButtons) {
  button.addEventListener("click", () => {
    const nextScope = button.dataset.scope || "AUTO";
    renderScopeToggle(nextScope);
    setMessage(
      loginFeedback,
      "info",
      nextScope === "AUTO"
        ? "접속 범위 테스트가 자동 판정으로 돌아갔습니다."
        : `${nextScope === "INTERNAL" ? "내부망" : "외부망"} 테스트 모드로 로그인합니다.`,
    );
  });
}

document.getElementById("restart-enrollment").addEventListener("click", async () => {
  await window.erpClient.logout();
  showScreen("login");
});

document.getElementById("refresh-session").addEventListener("click", async () => {
  await refreshSession();
});

document.getElementById("logout").addEventListener("click", async () => {
  await window.erpClient.logout();
  dashboardState.activeTab = "orders";
  await loadPreferences();
  setMessage(loginFeedback, "info", "로그아웃되었습니다.");
  showScreen("login");
});

dashboardTabs.addEventListener("click", (event) => {
  const target = event.target.closest("[data-dashboard-tab]");
  if (!target) {
    return;
  }

  dashboardState.activeTab = target.dataset.dashboardTab;
  renderDashboardTabs();
  renderActiveTab();
});

settingsAutoLogin.addEventListener("change", async () => {
  await saveDashboardPreference(
    { autoLoginEnabled: Boolean(settingsAutoLogin.checked) },
    settingsAutoLogin.checked ? "자동 로그인을 활성화했습니다." : "자동 로그인을 비활성화했습니다.",
  );
});

settingsShowUsername.addEventListener("change", async () => {
  await saveDashboardPreference(
    { showRememberedUsername: Boolean(settingsShowUsername.checked) },
    settingsShowUsername.checked ? "최근 로그인 아이디 표시를 활성화했습니다." : "최근 로그인 아이디 표시를 숨깁니다.",
  );
});

for (const button of settingsScopeButtons) {
  button.addEventListener("click", async () => {
    const nextScope = button.dataset.scope || "AUTO";
    renderScopeToggle(nextScope);
    await saveDashboardPreference(
      { testAccessScope: nextScope },
      nextScope === "AUTO"
        ? "기본 접속 범위를 자동 판정으로 저장했습니다."
        : `${nextScope === "INTERNAL" ? "내부망" : "외부망"} 테스트값을 기본으로 저장했습니다.`,
    );
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadAppVersion();
  await loadPreferences();
  await attemptAutoLogin();
  renderDashboardTabs();
  renderActiveTab();
});
