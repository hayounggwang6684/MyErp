const dashboardTabDefinitions = [
  { key: "customers", label: "고객관리", role: "CUSTOMER_MANAGE" },
  { key: "orders", label: "주문관리", roles: ["ORDER_MANAGE", "PARTS_SALES"] },
  { key: "work", label: "공사관리", role: "WORK_MANAGE" },
  { key: "assets", label: "자산관리", roles: ["CUSTOMER_MANAGE", "INVENTORY_VIEW"] },
  { key: "inventory", label: "부품관리", role: "INVENTORY_VIEW" },
  { key: "invoices", label: "청구관리", roles: ["INVOICE_MANAGE", "ORDER_MANAGE", "PARTS_SALES"] },
  { key: "staff", label: "직원관리", department: "관리부", role: "STAFF_VIEW" },
  { key: "settings", label: "설정" },
];

const assetPurposeOptions = ["COM", "CAT", "CUM", "VOL", "DOO", "SCA", "MIT"];
const assetCompanyPrefix = "SJJH";
const INVENTORY_LIST_PANE_WIDTH_STORAGE_KEY = "erp-inventory-list-pane-width";
const assetPhysicalColumnDefaults = {
  id: 190,
  purpose: 120,
  name: 180,
  purchase_price: 130,
  audit_cycle: 96,
  audit: 220,
  repair: 220,
};

const dashboardContent = {
  orders: {
    title: "주문관리",
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
    title: "공사관리",
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
  assets: {
    title: "자산관리",
    summary: "대시보드에서 핵심 현황을 보고, 좌측 하위 탭에서 실물 자산 관리와 지식 관리를 전환합니다.",
    cards: [
      { label: "실물 자산", value: "18", detail: "선박, 공구, 계측기, 노트북 포함" },
      { label: "인증 만료 임박", value: "3", detail: "30일 이내 확인 필요" },
      { label: "검사 예정", value: "5", detail: "월간 점검 캘린더 기준" },
      { label: "총 지식", value: "42", detail: "카테고리 초안 포함" },
    ],
    actions: ["실물 자산 관리", "지식 관리"],
    columns: ["등록번호", "이름", "인증&검사"],
    rows: [
      ["SJJH-COM-001", "3톤 지게차", "물류팀", "분기 검사 2026-05-07"],
      ["SJJH-CAT-001", "절연 저항계", "정비 2팀", "교정 2026-05-12"],
      ["SJJH-COM-002", "현장 노트북 07", "서비스팀", "백신/자산 점검 완료"],
    ],
  },
  inventory: {
    title: "부품관리",
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
  invoices: {
    title: "청구관리",
    summary: "공사와 판매/납품 건의 청구, 세금계산서, 수금 상태를 관리합니다.",
    cards: [
      { label: "청구 대기", value: "2", detail: "청구서 작성 필요" },
      { label: "발행 완료", value: "1", detail: "세금계산서 발행 완료" },
      { label: "미수금", value: "3", detail: "부분 수금 포함" },
      { label: "연체", value: "1", detail: "예정일 경과" },
    ],
    actions: ["청구 조회", "수금 등록", "문서 확인"],
    columns: ["청구번호", "거래처", "구분", "상태", "예정일"],
    rows: [],
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
const autoLoginCheckbox = document.getElementById("auto-login");
const loginAppVersion = document.getElementById("login-app-version");
const loginServerUrl = document.getElementById("login-server-url");
const loginAccessMode = document.getElementById("login-access-mode");
const dashboardAppVersion = document.getElementById("dashboard-app-version");
const settingsUpdateMode = document.getElementById("settings-update-mode");
const enrollmentQr = document.getElementById("enrollment-qr");
const enrollmentSecret = document.getElementById("enrollment-secret");
const scopeToggleButtons = Array.from(document.querySelectorAll(".login-scope-button"));
const dashboardTabs = document.getElementById("dashboard-tabs");
const workspaceTabs = document.getElementById("workspace-tabs");
const dashboardCards = document.getElementById("dashboard-cards");
const dashboardTableHead = document.getElementById("dashboard-table-head");
const dashboardTableBody = document.getElementById("dashboard-table-body");
const dashboardMainPane = document.getElementById("dashboard-main-pane");
const workspaceEmpty = document.getElementById("workspace-empty");
const customerWorkspace = document.getElementById("customer-workspace");
const orderWorkspace = document.getElementById("order-workspace");
const projectWorkspace = document.getElementById("project-workspace");
const invoiceWorkspace = document.getElementById("invoice-workspace");
const assetWorkspace = document.getElementById("asset-workspace");
const dashboardTablePanel = dashboardTableHead.closest(".dashboard-table-panel");
const settingsAutoLogin = document.getElementById("settings-auto-login");
const settingsShowUsername = document.getElementById("settings-show-username");
const settingsDefaultTab = document.getElementById("settings-default-tab");
const settingsDensity = document.getElementById("settings-density");
const settingsRememberedUsername = document.getElementById("settings-remembered-username");
const settingsServerSync = document.getElementById("settings-server-sync");
const settingsCloudflareAccess = document.getElementById("settings-cloudflare-access");
const openUpdateDownloadButton = document.getElementById("open-update-download");
const settingsScopeButtons = Array.from(document.querySelectorAll(".settings-scope-button"));
const settingsFeedback = document.getElementById("settings-feedback");
const settingsPasswordForm = document.getElementById("settings-password-form");
const settingsPasswordFeedback = document.getElementById("settings-password-feedback");

let selectedTestScope = "AUTO";
let dashboardState = {
  activeTab: "",
  openTabs: [],
  session: null,
  preferences: null,
  appInfo: null,
};
let latestManualDownloadUrl = "";
let assetState = {
  subtab: "dashboard",
  loading: false,
  loaded: false,
  error: "",
  physicalFilters: {
    query: "",
    purpose: "",
    state: "",
    sortKey: "updated_at",
    sortDirection: "desc",
    openFilter: "",
  },
  knowledgeTagSearch: "",
  knowledgeSearch: "",
  summary: {
    physicalAssetCount: 0,
    expiringSoonCount: 0,
    inspectionDueCount: 0,
    knowledgeCount: 0,
  },
  physicalAssets: [],
  knowledgeRecords: [],
};
let assetColumnResizeState = null;
let inventoryPaneResizeState = null;
let inventoryState = {
  viewMode: "stock",
  filters: {
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "",
    category: "",
    supplier: "",
    query: "",
  },
  activeDetailTab: "overview",
  selectedItemId: "PART-001",
  selectedSalesId: "SALE-001",
  items: [
    {
      id: "PART-001",
      no: "PRT-2026-001",
      category: "엔진 부품",
      supplier: "태성해운",
      name: "Caterpillar 3412 연료필터 세트",
      code: "CAT-3412-FLT",
      status: "발주 필요",
      onHand: 2,
      safetyStock: 5,
      inboundPending: 3,
      outboundPlanned: 1,
      unit: "EA",
      location: "창고 A-03",
      purchaseLeadTime: "7일",
      lastInDate: "2026-04-12",
      documents: [{ type: "발주서", name: "태성해운 필터 발주서", id: "DOC-PART-001" }],
      movements: [
        { date: "2026-04-20", type: "출고", quantity: 1, note: "TS BLUE 작업" },
        { date: "2026-04-12", type: "입고", quantity: 4, note: "정기 발주 입고" },
      ],
      purchaseOrders: [{ no: "PO-2026-0418-01", supplier: "태성해운", eta: "2026-04-27", status: "입고 대기" }],
      note: "메인 엔진 정기 점검용",
    },
    {
      id: "PART-002",
      no: "PRT-2026-002",
      category: "전기/제어",
      supplier: "남해플랜트서비스",
      name: "AVR 모듈",
      code: "AVR-MOD-220",
      status: "입고 대기",
      onHand: 0,
      safetyStock: 1,
      inboundPending: 2,
      outboundPlanned: 0,
      unit: "EA",
      location: "전기 캐비닛",
      purchaseLeadTime: "10일",
      lastInDate: "2026-03-28",
      documents: [{ type: "거래명세서", name: "AVR 모듈 거래명세", id: "DOC-PART-002" }],
      movements: [{ date: "2026-04-18", type: "발주", quantity: 2, note: "발전기 예비품" }],
      purchaseOrders: [{ no: "PO-2026-0418-03", supplier: "남해플랜트서비스", eta: "2026-04-29", status: "입고 대기" }],
      note: "2GE 예비품",
    },
    {
      id: "PART-003",
      no: "PRT-2026-003",
      category: "소모품",
      supplier: "영광기업",
      name: "가스켓 세트",
      code: "GSK-SET-77",
      status: "정상",
      onHand: 12,
      safetyStock: 4,
      inboundPending: 0,
      outboundPlanned: 2,
      unit: "SET",
      location: "창고 B-11",
      purchaseLeadTime: "3일",
      lastInDate: "2026-04-15",
      documents: [],
      movements: [{ date: "2026-04-22", type: "출고 예정", quantity: 2, note: "정비 2팀" }],
      purchaseOrders: [],
      note: "감속기 정기 점검",
    },
  ],
  sales: [
    {
      id: "SALE-001",
      no: "SAL-2026-0418-01",
      customer: "태성해운",
      itemName: "Caterpillar 3412 연료필터 세트",
      code: "CAT-3412-FLT",
      status: "출고 예정",
      plannedDate: "2026-04-26",
      quantity: 2,
      unit: "EA",
      amount: 680000,
      outboundStatus: "출고 준비",
      orderNo: "OR-2026-004",
      documents: [{ type: "거래명세서", name: "태성해운 필터 판매 명세", id: "DOC-SALE-001" }],
      movements: [{ date: "2026-04-24", type: "출고 준비", quantity: 2, note: "포장 대기" }],
      note: "엔진 오버홀 부품 판매",
    },
    {
      id: "SALE-002",
      no: "SAL-2026-0419-02",
      customer: "남해플랜트서비스",
      itemName: "AVR 모듈",
      code: "AVR-MOD-220",
      status: "납품 완료",
      plannedDate: "2026-04-22",
      quantity: 1,
      unit: "EA",
      amount: 420000,
      outboundStatus: "완료",
      orderNo: "OR-2026-011",
      documents: [{ type: "발주서", name: "AVR 모듈 발주서", id: "DOC-SALE-002" }],
      movements: [{ date: "2026-04-20", type: "출고", quantity: 1, note: "현장 직접 전달" }],
      note: "긴급 교체 건",
    },
    {
      id: "SALE-003",
      no: "SAL-2026-0420-01",
      customer: "영광기업",
      itemName: "가스켓 세트",
      code: "GSK-SET-77",
      status: "청구 대기",
      plannedDate: "2026-04-28",
      quantity: 3,
      unit: "SET",
      amount: 195000,
      outboundStatus: "출고 완료",
      orderNo: "OR-2026-013",
      documents: [],
      movements: [{ date: "2026-04-23", type: "출고", quantity: 3, note: "정비팀 수령" }],
      note: "정기 점검 소모품",
    },
  ],
};
let customerState = {
  loaded: false,
  loading: false,
  submitting: false,
  search: "",
  view: "detail",
  hasSearched: false,
  detailTab: "overview",
  list: [],
  multiSelectedCustomerIds: [],
  mergeHistory: [],
  selectedCustomerId: null,
  selectedCustomer: null,
  selectedAssetId: null,
  selectedEquipmentId: null,
  assetEditorMode: "edit",
  equipmentEditorMode: "create",
  assetSort: { key: "asset_name", direction: "asc" },
  equipmentSort: { key: "equipment_type", direction: "asc" },
  createDraft: {},
  masterDataLoaded: false,
  masterDataLoading: false,
  engineModels: [],
  gearboxModels: [],
  equipmentOptions: [],
  deletedEquipmentMasterOptions: [],
  uploadedFile: null,
  contextMenu: {
    visible: false,
    x: 0,
    y: 0,
    actionType: "edit",
    entityType: "customer",
    entityId: "",
    fieldKey: "",
    fieldLabel: "",
  },
  inlineEdit: {
    entityType: "customer",
    entityId: "",
    fieldKey: "",
    value: "",
  },
  notice: "고객, 담당자, 선박/장비, 엔진/감속기 마스터를 한 화면에서 관리합니다.",
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
  const roles = dashboardState.session?.data?.user?.roles || dashboardState.session?.data?.roles || [];
  return dashboardTabDefinitions.filter((tab) => {
    if (!tab.department && !tab.role && !tab.roles) {
      return true;
    }

    if (roles.includes("SYSTEM_ADMIN")) {
      return true;
    }

    if (tab.department && tab.department === department) {
      return true;
    }

    if (tab.role && roles.includes(tab.role)) {
      return true;
    }

    if (tab.roles && tab.roles.some((role) => roles.includes(role))) {
      return true;
    }

    return false;
  });
}

function getActiveTab() {
  const visibleTabs = getVisibleTabs();
  if (!dashboardState.activeTab && dashboardState.openTabs.length === 0) {
    return "";
  }
  const exists = visibleTabs.some((tab) => tab.key === dashboardState.activeTab);
  if (!exists) {
    dashboardState.activeTab = visibleTabs.some((tab) => tab.key === "orders")
      ? "orders"
      : visibleTabs[0]?.key || "settings";
  }
  return dashboardState.activeTab;
}

function openWorkspaceTab(tabKey) {
  const visibleTabs = getVisibleTabs();
  if (!visibleTabs.some((tab) => tab.key === tabKey)) {
    return;
  }
  if (!dashboardState.openTabs.includes(tabKey)) {
    dashboardState.openTabs = [...dashboardState.openTabs, tabKey];
  }
  dashboardState.activeTab = tabKey;
}

function renderDashboardTabs() {
  const visibleTabs = getVisibleTabs();
  const activeTab = dashboardState.openTabs.length ? getActiveTab() : "";
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

function renderWorkspaceTabs() {
  const visibleTabs = getVisibleTabs();
  const visibleKeys = new Set(visibleTabs.map((tab) => tab.key));
  dashboardState.openTabs = dashboardState.openTabs.filter((key) => visibleKeys.has(key));
  if (!dashboardState.openTabs.includes(dashboardState.activeTab) && visibleKeys.has(dashboardState.activeTab)) {
    dashboardState.openTabs.push(dashboardState.activeTab);
  }
  workspaceTabs.innerHTML = dashboardState.openTabs
    .map((key) => {
      const tab = visibleTabs.find((item) => item.key === key);
      if (!tab) {
        return "";
      }
      const closable = true;
      return `
        <button type="button" class="workspace-tab${key === dashboardState.activeTab ? " active" : ""}" data-workspace-tab="${key}">
          <span>${escapeTextarea(tab.label)}</span>
          ${closable ? `<span class="workspace-tab-close" data-workspace-tab-close="${key}" aria-label="${escapeAttribute(tab.label)} 닫기">×</span>` : ""}
        </button>
      `;
    })
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

function renderTable(columns, rows) {
  dashboardTableHead.innerHTML = `<tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>`;
  dashboardTableBody.innerHTML = rows
    .map((row) => `<tr>${row.map((value) => `<td>${value}</td>`).join("")}</tr>`)
    .join("");
}

function formatWon(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function getAssetPhysicalColumnWidths() {
  const saved = dashboardState.preferences?.assetPhysicalColumnWidths || {};
  return {
    ...assetPhysicalColumnDefaults,
    ...saved,
  };
}

function applyAssetWorkspacePayload(payload) {
  assetState.summary = payload?.summary || {
    physicalAssetCount: 0,
    expiringSoonCount: 0,
    inspectionDueCount: 0,
    knowledgeCount: 0,
  };
  assetState.physicalAssets = Array.isArray(payload?.physicalAssets) ? payload.physicalAssets : [];
  assetState.knowledgeRecords = Array.isArray(payload?.knowledgeRecords) ? payload.knowledgeRecords : [];
  assetState.loading = false;
  assetState.loaded = true;
  assetState.error = "";
}

async function loadAssetWorkspaceData(force = false) {
  if (assetState.loading) {
    return false;
  }
  if (assetState.loaded && !force) {
    return true;
  }
  assetState.loading = true;
  assetState.error = "";
  if (dashboardState.activeTab === "assets") {
    renderAssetWorkspace();
  }
  try {
    const result = await window.erpClient.getAssetWorkspace();
    applyAssetWorkspacePayload(result.data || {});
    if (dashboardState.activeTab === "assets") {
      renderAssetWorkspace();
    }
    return true;
  } catch (error) {
    assetState.loading = false;
    assetState.loaded = false;
    assetState.error = error?.message || "자산관리 데이터를 불러오지 못했습니다.";
    return false;
  }
}


function renderSettingsTab() {
  const preferences = dashboardState.preferences;
  if (!preferences) {
    return;
  }

  settingsAutoLogin.checked = Boolean(preferences.autoLoginEnabled);
  settingsShowUsername.checked = Boolean(preferences.showRememberedUsername);
  settingsDefaultTab.value = preferences.defaultDashboardTab || "orders";
  settingsDensity.value = preferences.dashboardDensity || "COMFORTABLE";
  if (settingsRememberedUsername) {
    settingsRememberedUsername.textContent = preferences.rememberedUsername || "저장된 아이디 없음";
  }
  if (settingsServerSync) {
    setBadgeText(settingsServerSync, preferences.updatedAt ? "동기화됨" : "로컬 저장", preferences.updatedAt ? "ok" : "neutral");
  }
  if (settingsCloudflareAccess) {
    setBadgeText(
      settingsCloudflareAccess,
      dashboardState.appInfo?.cloudflareAccessEnabled ? "활성" : "비활성",
      dashboardState.appInfo?.cloudflareAccessEnabled ? "ok" : "neutral",
    );
  }
  if (settingsUpdateMode) {
    setBadgeText(
      settingsUpdateMode,
      dashboardState.appInfo?.platform === "darwin" ? "수동 다운로드 설치" : "자동 다운로드 후 재시작",
      "neutral",
    );
  }
  renderSettingsScopeToggle(preferences.testAccessScope || "AUTO");
}

function applyDashboardPreferences(preferences) {
  document.body.classList.toggle("density-compact", preferences?.dashboardDensity === "COMPACT");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return String(value).slice(0, 10);
}

function escapeTextarea(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeTextarea(value).replaceAll('"', "&quot;");
}

function customerTypeLabel(value) {
  return value === "SHIP_OWNER" ? "선사" : "일반 고객";
}

function assetTypeLabel(value) {
  return value === "VESSEL" ? "선박" : "운용 장비";
}

function equipmentTypeLabel(value) {
  if (value === "GENERATOR_ENGINE") {
    return "Generator engine";
  }
  if (value === "MAIN_ENGINE") {
    return "Main engine";
  }
  if (value === "REDUCTION_GEAR") {
    return "Reduction gear";
  }
  if (value === "HPP_ENGINE") {
    return "HPP engine";
  }
  if (value === "ENGINE") {
    return "엔진";
  }
  if (value === "GEARBOX") {
    return "감속기";
  }
  if (value === "OTHER") {
    return "기타";
  }
  return value || "기타";
}

function customerMasterFieldLabel(fieldName) {
  return {
    equipment_type: "장비 분류",
    equipment_unit: "호기/장비명",
    manufacturer: "제조사",
    model_name: "모델명",
  }[fieldName] || "마스터 항목";
}

function canonicalEquipmentMasterValue(fieldName, value) {
  const normalizedValue = String(value || "").trim();
  if (fieldName === "manufacturer" && normalizedValue.toLowerCase() === "cat") {
    return "Caterpillar";
  }
  return normalizedValue;
}

function equipmentMasterValueKey(fieldName, value) {
  return canonicalEquipmentMasterValue(fieldName, value).toLowerCase();
}

function isDeletedEquipmentMasterOption(fieldName, value) {
  const targetKey = equipmentMasterValueKey(fieldName, value);
  return (customerState.deletedEquipmentMasterOptions || []).some((item) => item.fieldName === fieldName && equipmentMasterValueKey(item.fieldName, item.value) === targetKey);
}

function addEquipmentMasterValue(fieldName, value) {
  const nextValue = canonicalEquipmentMasterValue(fieldName, value);
  if (!fieldName || !nextValue || nextValue === "__add_new__") {
    return;
  }
  customerState.deletedEquipmentMasterOptions = (customerState.deletedEquipmentMasterOptions || []).filter(
    (item) => !(item.fieldName === fieldName && equipmentMasterValueKey(item.fieldName, item.value) === equipmentMasterValueKey(fieldName, nextValue)),
  );
  if (!customerState.equipmentOptions.some((option) => option.optionType === fieldName && equipmentMasterValueKey(option.optionType, option.optionValue) === equipmentMasterValueKey(fieldName, nextValue))) {
    customerState.equipmentOptions = [
      ...customerState.equipmentOptions,
      {
        id: `local-${fieldName}-${Date.now()}`,
        optionType: fieldName,
        optionValue: nextValue,
      },
    ];
  }
}

const CUSTOMER_DEFAULT_EQUIPMENT_TYPES = [
  ["GENERATOR_ENGINE", "Generator engine"],
  ["MAIN_ENGINE", "Main engine"],
  ["REDUCTION_GEAR", "Reduction gear"],
  ["HPP_ENGINE", "HPP engine"],
];

const CUSTOMER_DEFAULT_EQUIPMENT_UNITS = ["No.1", "No.2", "No.3", "좌현", "우현", "Port", "Stbd", "EMCY"];

const CUSTOMER_DEFAULT_MANUFACTURERS = [
  "YANMAR",
  "MAN",
  "Wartsila",
  "Daihatsu",
  "Hyundai Himsen",
  "Caterpillar",
  "Mitsubishi",
  "Cummins",
  "Volvo Penta",
  "Doosan",
];

const CUSTOMER_INLINE_EDIT_FIELDS = {
  customer_type: { label: "구분", type: "select" },
  customer_name: { label: "업체명" },
  representative_name: { label: "대표자명" },
  business_registration_no: { label: "사업자번호" },
  business_category: { label: "업태" },
  business_item: { label: "종목" },
  company_phone: { label: "연락처" },
  company_email: { label: "대표 이메일" },
  tax_category: { label: "과세구분" },
  bank_account: { label: "은행계좌" },
  invoice_email: { label: "세금계산서발송메일" },
  contact_name: { label: "영업담당자" },
  contact_phone: { label: "담당연락처" },
  postal_code: { label: "우편번호" },
  address_line_1: { label: "주소" },
  address_line_2: { label: "주소상세" },
  opening_date: { label: "개업일", type: "date" },
  notes: { label: "메모", type: "textarea" },
};

const CUSTOMER_CONTACT_EDIT_FIELDS = {
  contact_name: { label: "이름" },
  job_title: { label: "직책" },
  mobile_phone: { label: "연락처" },
  email: { label: "이메일" },
};

const CUSTOMER_ASSET_EDIT_FIELDS = {
  asset_name: { label: "선명" },
  imo_no: { label: "IMO" },
  vessel_type: { label: "선종" },
  registration_no: { label: "call.sign" },
  notes: { label: "REMARK" },
};

const CUSTOMER_EQUIPMENT_EDIT_FIELDS = {
  equipment_type: { label: "분류", type: "select" },
  equipment_name: { label: "호기" },
  manufacturer: { label: "제조사" },
  model_name: { label: "모델명" },
  serial_no: { label: "SN" },
  notes: { label: "REMARK" },
};

function customerEditFieldDefinition(entityType, fieldKey) {
  if (entityType === "contact") {
    return CUSTOMER_CONTACT_EDIT_FIELDS[fieldKey];
  }
  if (entityType === "asset") {
    return CUSTOMER_ASSET_EDIT_FIELDS[fieldKey];
  }
  if (entityType === "equipment") {
    return CUSTOMER_EQUIPMENT_EDIT_FIELDS[fieldKey];
  }
  return CUSTOMER_INLINE_EDIT_FIELDS[fieldKey];
}

function selectedCustomerAsset(customer) {
  if (!customer?.assets?.length) {
    return null;
  }

  return customer.assets.find((asset) => asset.id === customerState.selectedAssetId) || customer.assets[0];
}

function compareCustomerSortValues(left, right) {
  const leftValue = String(left || "").trim();
  const rightValue = String(right || "").trim();
  if (!leftValue && rightValue) {
    return 1;
  }
  if (leftValue && !rightValue) {
    return -1;
  }
  return leftValue.localeCompare(rightValue, "ko", { numeric: true, sensitivity: "base" });
}

function customerSortDirectionMultiplier(direction) {
  return direction === "desc" ? -1 : 1;
}

function customerAssetSortValue(asset, key) {
  if (key === "imo_no") {
    return asset.imoNo || asset.registrationNo || "";
  }
  if (key === "vessel_type") {
    return asset.vesselType || assetTypeLabel(asset.assetType);
  }
  return asset.assetName || "";
}

function customerEquipmentSortValue(equipment, key) {
  if (key === "equipment_type") {
    return equipmentTypeLabel(equipment.equipmentType);
  }
  if (key === "equipment_name") {
    return equipment.equipmentName || equipment.installationPosition || "";
  }
  if (key === "manufacturer") {
    return canonicalEquipmentMasterValue("manufacturer", equipment.manufacturer || "");
  }
  if (key === "model_name") {
    return equipment.modelName || "";
  }
  if (key === "serial_no") {
    return equipment.serialNo || "";
  }
  if (key === "notes") {
    return equipment.notes || "";
  }
  return "";
}

function sortedCustomerAssets(assets = []) {
  const sort = customerState.assetSort || { key: "asset_name", direction: "asc" };
  const multiplier = customerSortDirectionMultiplier(sort.direction);
  return [...assets].sort((left, right) => {
    const compared = compareCustomerSortValues(customerAssetSortValue(left, sort.key), customerAssetSortValue(right, sort.key));
    return compared ? compared * multiplier : compareCustomerSortValues(left.assetName, right.assetName);
  });
}

function sortedCustomerEquipments(equipments = []) {
  const sort = customerState.equipmentSort || { key: "equipment_type", direction: "asc" };
  const multiplier = customerSortDirectionMultiplier(sort.direction);
  return [...equipments].sort((left, right) => {
    const compared = compareCustomerSortValues(customerEquipmentSortValue(left, sort.key), customerEquipmentSortValue(right, sort.key));
    return compared ? compared * multiplier : compareCustomerSortValues(left.equipmentName, right.equipmentName);
  });
}

function customerSortButtonMarkup(scope, key, label) {
  const sort = scope === "asset" ? customerState.assetSort : customerState.equipmentSort;
  const active = sort?.key === key;
  const direction = active ? sort.direction : "none";
  const arrow = active ? (sort.direction === "desc" ? "↓" : "↑") : "";
  return `<button type="button" class="customer-sort-button${active ? " active" : ""}" data-customer-sort-scope="${scope}" data-customer-sort-key="${key}" aria-sort="${direction}"><span>${label}</span><span class="customer-sort-arrow">${arrow}</span></button>`;
}

function syncCustomerAssetEquipmentSelection(customer, options = {}) {
  const asset = selectedCustomerAsset(customer);
  customerState.selectedAssetId = asset?.id || null;

  if (!asset?.equipments?.length) {
    customerState.selectedEquipmentId = null;
    customerState.equipmentEditorMode = "create";
    return;
  }

  const hasSelectedEquipment = asset.equipments.some((equipment) => equipment.id === customerState.selectedEquipmentId);
  if (!hasSelectedEquipment || options.selectFirstEquipment) {
    customerState.selectedEquipmentId = asset.equipments[0].id;
    customerState.equipmentEditorMode = "edit";
  }
}

function setCustomerView(view) {
  customerState.view = view === "create" ? "create" : "detail";
}

function readCustomerCreateDraft() {
  const form = document.getElementById("customer-create-form");
  if (form instanceof HTMLFormElement) {
    customerState.createDraft = Object.fromEntries(new FormData(form).entries());
  }
}

function mergeCustomerCreateDraft(fields) {
  customerState.createDraft = {
    ...customerState.createDraft,
    ...Object.fromEntries(Object.entries(fields).filter(([, value]) => value)),
  };
}

function closeCustomerContextMenu() {
  customerState.contextMenu = {
    visible: false,
    x: 0,
    y: 0,
    actionType: "edit",
    entityType: "customer",
    entityId: "",
    fieldKey: "",
    fieldLabel: "",
  };
}

function resetCustomerInlineEdit() {
  customerState.inlineEdit = {
    entityType: "customer",
    entityId: "",
    fieldKey: "",
    value: "",
  };
}

function customerInlineEditPayload(fieldKey, value) {
  if (!CUSTOMER_INLINE_EDIT_FIELDS[fieldKey]) {
    return null;
  }
  return { [fieldKey]: value };
}

function findCustomerContact(contactId) {
  return customerState.selectedCustomer?.contacts?.find((contact) => contact.id === contactId) || null;
}

function findCustomerAsset(assetId) {
  return customerState.selectedCustomer?.assets?.find((asset) => asset.id === assetId) || null;
}

function findCustomerEquipment(equipmentId) {
  for (const asset of customerState.selectedCustomer?.assets || []) {
    const equipment = asset.equipments?.find((item) => item.id === equipmentId);
    if (equipment) {
      return { asset, equipment };
    }
  }
  return { asset: null, equipment: null };
}

function customerListItemById(customerId) {
  return customerState.list.find((customer) => customer.id === customerId) || null;
}

function customerListName(customerId) {
  return customerListItemById(customerId)?.customerName || customerId || "-";
}

function toggleCustomerMultiSelection(customerId) {
  const selectedIds = new Set(customerState.multiSelectedCustomerIds || []);
  if (selectedIds.has(customerId)) {
    selectedIds.delete(customerId);
  } else if (customerId) {
    selectedIds.add(customerId);
  }
  customerState.multiSelectedCustomerIds = Array.from(selectedIds);
}

function customerContactUpdatePayload(contact, fieldKey, value) {
  if (!contact || !CUSTOMER_CONTACT_EDIT_FIELDS[fieldKey]) {
    return null;
  }
  return {
    contact_name: contact.contactName || "",
    contact_role: contact.contactRole || "STAFF",
    department_name: contact.departmentName || "",
    job_title: contact.jobTitle || "",
    mobile_phone: contact.mobilePhone || "",
    office_phone: contact.officePhone || "",
    email: contact.email || "",
    notes: contact.notes || "",
    [fieldKey]: value,
  };
}

function customerAssetUpdatePayload(asset, fieldKey, value) {
  if (!asset || !CUSTOMER_ASSET_EDIT_FIELDS[fieldKey]) {
    return null;
  }
  return {
    asset_name: asset.assetName || "",
    asset_type: asset.assetType || "VESSEL",
    vessel_type: asset.vesselType || "",
    asset_code: asset.assetCode || "",
    registration_no: asset.registrationNo || "",
    imo_no: asset.imoNo || "",
    location_description: asset.locationDescription || "",
    notes: asset.notes || "",
    [fieldKey]: value,
  };
}

function customerEquipmentUpdatePayload(equipment, fieldKey, value) {
  if (!equipment || !CUSTOMER_EQUIPMENT_EDIT_FIELDS[fieldKey]) {
    return null;
  }
  return {
    equipment_name: equipment.equipmentName || "",
    equipment_type: equipment.equipmentType || "OTHER",
    serial_no: equipment.serialNo || "",
    installation_position: equipment.installationPosition || "",
    engine_model_id: equipment.engineModelId || "",
    gearbox_model_id: equipment.gearboxModelId || "",
    manufacturer: equipment.manufacturer || "",
    model_name: equipment.modelName || "",
    notes: equipment.notes || "",
    [fieldKey]: value,
  };
}

function renderCustomerEditContextMenu() {
  if (!customerState.contextMenu.visible) {
    return "";
  }

  const actionType = customerState.contextMenu.actionType || "edit";
  if (actionType === "merge") {
    const canMerge = (customerState.multiSelectedCustomerIds || []).length >= 2;
    return `
      <div class="customer-edit-context-menu" style="left: ${customerState.contextMenu.x}px; top: ${customerState.contextMenu.y}px;" role="menu">
        <button type="button" data-customer-context-action="merge" role="menuitem"${canMerge ? "" : " disabled"}>합치기</button>
      </div>
    `;
  }

  if (actionType === "asset-delete") {
    return `
      <div class="customer-edit-context-menu" style="left: ${customerState.contextMenu.x}px; top: ${customerState.contextMenu.y}px;" role="menu">
        <button type="button" data-customer-context-action="asset-delete" role="menuitem">선박 삭제</button>
      </div>
    `;
  }

  if (actionType === "equipment-delete") {
    return `
      <div class="customer-edit-context-menu" style="left: ${customerState.contextMenu.x}px; top: ${customerState.contextMenu.y}px;" role="menu">
        <button type="button" data-customer-context-action="equipment-delete" role="menuitem">장비 삭제</button>
      </div>
    `;
  }

  if (actionType === "master-delete") {
    return `
      <div class="customer-edit-context-menu" style="left: ${customerState.contextMenu.x}px; top: ${customerState.contextMenu.y}px;" role="menu">
        <button type="button" data-customer-context-action="master-delete" role="menuitem">${escapeTextarea(customerState.contextMenu.fieldLabel)} 삭제</button>
      </div>
    `;
  }

  if (!customerState.contextMenu.fieldKey) {
    return "";
  }

  return `
    <div class="customer-edit-context-menu" style="left: ${customerState.contextMenu.x}px; top: ${customerState.contextMenu.y}px;" role="menu">
      <button type="button" data-customer-context-action="edit" role="menuitem">${escapeTextarea(customerState.contextMenu.fieldLabel)} 수정</button>
    </div>
  `;
}

function showCustomerMergeDialog(selectedIds) {
  return new Promise((resolve) => {
    const selectedCustomers = selectedIds.map((id) => customerListItemById(id)).filter(Boolean);
    const dialog = document.createElement("div");
    dialog.className = "app-dialog-backdrop";
    dialog.setAttribute("role", "presentation");

    const panel = document.createElement("section");
    panel.className = "app-dialog customer-merge-dialog";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");

    const title = document.createElement("h2");
    title.className = "app-dialog-title";
    title.textContent = "회사 합치기";

    const message = document.createElement("p");
    message.className = "app-dialog-message";
    message.textContent = "남길 회사를 선택하세요. 나머지 회사는 남길 회사로 병합됩니다.";

    const list = document.createElement("div");
    list.className = "customer-merge-list";
    for (const customer of selectedCustomers) {
      const label = document.createElement("label");
      label.className = "customer-merge-option";
      label.innerHTML = `
        <input type="radio" name="customer_merge_keep" value="${escapeAttribute(customer.id)}" />
        <span>
          <strong>${escapeTextarea(customer.customerName || "-")}</strong>
          <small>${escapeTextarea(customer.primaryContactName || customer.representativeName || "담당 정보 없음")}</small>
        </span>
      `;
      list.appendChild(label);
    }

    const summary = document.createElement("p");
    summary.className = "customer-merge-summary";
    summary.textContent = "남길 회사를 선택하면 병합 대상이 표시됩니다.";

    const actions = document.createElement("div");
    actions.className = "app-dialog-actions";
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "secondary-button";
    cancelButton.textContent = "취소";
    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.className = "primary-button";
    confirmButton.textContent = "합치기";
    confirmButton.disabled = true;
    actions.append(cancelButton, confirmButton);

    function cleanup(value) {
      document.removeEventListener("keydown", handleKeydown);
      dialog.remove();
      resolve(value);
    }

    function selectedKeepId() {
      return panel.querySelector('input[name="customer_merge_keep"]:checked')?.value || "";
    }

    function updateSummary() {
      const keepId = selectedKeepId();
      const keepName = customerListName(keepId);
      const mergedNames = selectedCustomers.filter((customer) => customer.id !== keepId).map((customer) => customer.customerName).join(", ");
      confirmButton.disabled = !keepId;
      summary.textContent = keepId ? `선택한 회사들을 ${keepName}(으)로 합칩니다. 병합 대상: ${mergedNames || "-"}` : "남길 회사를 선택하면 병합 대상이 표시됩니다.";
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        cleanup(null);
      }
    }

    list.addEventListener("change", updateSummary);
    cancelButton.addEventListener("click", () => cleanup(null));
    confirmButton.addEventListener("click", async () => {
      const keepId = selectedKeepId();
      const keepName = customerListName(keepId);
      const ok = await requestAppConfirm(`선택한 회사들을 ${keepName}(으)로 합칠까요?`, "합치기 확인");
      cleanup(ok && keepId ? keepId : null);
    });

    panel.append(title, message, list, summary, actions);
    dialog.appendChild(panel);
    document.body.appendChild(dialog);
    document.addEventListener("keydown", handleKeydown);
    panel.querySelector("input")?.focus();
  });
}

function isCustomerInlineEditing(entityType, entityId, fieldKey) {
  return (
    customerState.inlineEdit.entityType === entityType &&
    customerState.inlineEdit.entityId === entityId &&
    customerState.inlineEdit.fieldKey === fieldKey
  );
}

function renderCustomerInlineActions(fieldKey) {
  return `
    <div class="customer-inline-edit-actions">
      <button type="button" class="primary-button" data-customer-inline-save="${escapeAttribute(fieldKey)}">저장</button>
      <button type="button" class="ghost-button" data-customer-inline-cancel>취소</button>
    </div>
  `;
}

function renderCustomerEditValueInput({ entityType, fieldKey, value, type = "text" }) {
  if (entityType === "equipment" && fieldKey === "equipment_type") {
    return `
      <select class="customer-inline-cell-input" name="customer_inline_value">
        ${equipmentTypeOptionsFor(customerState.selectedCustomer)
          .map(([optionValue, label]) => `<option value="${escapeAttribute(optionValue)}"${optionValue === value ? " selected" : ""}>${escapeTextarea(label)}</option>`)
          .join("")}
      </select>
    `;
  }

  if (entityType === "equipment" && fieldKey === "equipment_name") {
    const options = equipmentUnitOptionsFor(customerState.selectedCustomer);
    return `
      <select class="customer-inline-cell-input" name="customer_inline_value">
        ${options.map((option) => `<option value="${escapeAttribute(option)}"${option === value ? " selected" : ""}>${escapeTextarea(option)}</option>`).join("")}
      </select>
    `;
  }

  if (entityType === "equipment" && fieldKey === "manufacturer") {
    const options = equipmentManufacturerOptionsFor(customerState.selectedCustomer);
    return `
      <select class="customer-inline-cell-input" name="customer_inline_value">
        ${options.map((option) => `<option value="${escapeAttribute(option)}"${option === value ? " selected" : ""}>${escapeTextarea(option)}</option>`).join("")}
      </select>
    `;
  }

  if (entityType === "equipment" && fieldKey === "model_name") {
    const { equipment } = findCustomerEquipment(customerState.inlineEdit.entityId);
    const options = equipmentModelOptionsFor(customerState.selectedCustomer, equipment?.manufacturer || "");
    return `
      <select class="customer-inline-cell-input" name="customer_inline_value">
        ${options.map((option) => `<option value="${escapeAttribute(option)}"${option === value ? " selected" : ""}>${escapeTextarea(option)}</option>`).join("")}
      </select>
    `;
  }

  if (type === "textarea") {
    return `<textarea class="customer-inline-cell-input customer-inline-cell-textarea" name="customer_inline_value">${escapeTextarea(value)}</textarea>`;
  }

  return `<input class="customer-inline-cell-input" name="customer_inline_value" value="${escapeAttribute(value)}" />`;
}

function renderCustomerEditableCell({ entityType, entityId, fieldKey, label, value, displayValue, type = "text" }) {
  const isEditing = isCustomerInlineEditing(entityType, entityId, fieldKey);
  return `
    <span
      class="customer-editable-cell${isEditing ? " editing" : ""}"
      data-customer-edit-field="${escapeAttribute(fieldKey)}"
      data-customer-edit-label="${escapeAttribute(label)}"
      data-customer-edit-entity="${escapeAttribute(entityType)}"
      data-customer-edit-id="${escapeAttribute(entityId)}"
    >
      ${
        isEditing
          ? renderCustomerEditValueInput({ entityType, fieldKey, value: customerState.inlineEdit.value, type })
          : escapeTextarea(displayValue ?? value ?? "-")
      }
    </span>
  `;
}

function renderCustomerEditableField({ label, fieldKey, value, type = "text", wide = false, editable = true }) {
  const isEditing = isCustomerInlineEditing("customer", customerState.selectedCustomerId || "", fieldKey);
  const editValue = isEditing ? customerState.inlineEdit.value : value;
  const fieldAttrs = editable
    ? ` data-customer-edit-field="${escapeAttribute(fieldKey)}" data-customer-edit-label="${escapeAttribute(label)}" data-customer-edit-entity="customer" data-customer-edit-id="${escapeAttribute(customerState.selectedCustomerId || "")}"`
    : "";
  const className = `customer-classic-field${wide ? " wide" : ""}${isEditing ? " editing" : ""}`;
  const inputMarkup =
    type === "select"
      ? `
        <select class="customer-classic-input" name="customer_inline_value" ${isEditing ? "" : "disabled"}>
          <option value="SHIP_OWNER"${editValue === "SHIP_OWNER" ? " selected" : ""}>선사</option>
          <option value="GENERAL"${editValue === "GENERAL" ? " selected" : ""}>일반 고객</option>
        </select>
      `
      : `<input class="customer-classic-input" name="customer_inline_value" type="${escapeAttribute(type)}" value="${escapeAttribute(editValue)}" ${isEditing ? "" : "readonly"} />`;

  return `
    <label class="${className}"${fieldAttrs}>
      <span>${escapeTextarea(label)}</span>
      ${inputMarkup}
    </label>
  `;
}

function equipmentTypeOptionsFor(customer) {
  const defaultOptions = CUSTOMER_DEFAULT_EQUIPMENT_TYPES;
  const deprecatedOptions = new Set(["ENGINE", "GEARBOX", "OTHER"]);
  const dbOptions = customerState.equipmentOptions
    .filter((option) => option.optionType === "equipment_type" && !deprecatedOptions.has(option.optionValue) && !isDeletedEquipmentMasterOption("equipment_type", option.optionValue))
    .map((option) => [option.optionValue, equipmentTypeLabel(option.optionValue)]);
  const customValues = new Set();
  for (const asset of customer?.assets || []) {
    for (const equipment of asset.equipments || []) {
      if (equipment.equipmentType && !defaultOptions.some(([value]) => value === equipment.equipmentType) && !isDeletedEquipmentMasterOption("equipment_type", equipment.equipmentType)) {
        customValues.add(equipment.equipmentType);
      }
    }
  }
  const activeDefaults = defaultOptions.filter(([value]) => !isDeletedEquipmentMasterOption("equipment_type", value));
  const merged = new Map([...activeDefaults, ...dbOptions, ...Array.from(customValues).map((value) => [value, value])]);
  return Array.from(merged.entries());
}

function equipmentUnitOptionsFor(customer) {
  const values = new Set(CUSTOMER_DEFAULT_EQUIPMENT_UNITS.filter((value) => !isDeletedEquipmentMasterOption("equipment_unit", value)));
  for (const option of customerState.equipmentOptions.filter((item) => item.optionType === "equipment_unit" && !isDeletedEquipmentMasterOption("equipment_unit", item.optionValue))) {
    values.add(option.optionValue);
  }
  for (const asset of customer?.assets || []) {
    for (const equipment of asset.equipments || []) {
      if (equipment.equipmentName && !isDeletedEquipmentMasterOption("equipment_unit", equipment.equipmentName)) {
        values.add(equipment.equipmentName);
      }
    }
  }
  return Array.from(values);
}

function equipmentManufacturerOptionsFor(customer) {
  const values = new Set(CUSTOMER_DEFAULT_MANUFACTURERS.filter((value) => !isDeletedEquipmentMasterOption("manufacturer", value)));
  for (const option of customerState.equipmentOptions.filter((item) => item.optionType === "manufacturer" && !isDeletedEquipmentMasterOption("manufacturer", item.optionValue))) {
    values.add(canonicalEquipmentMasterValue("manufacturer", option.optionValue));
  }
  for (const model of [...customerState.engineModels, ...customerState.gearboxModels]) {
    if (model.manufacturer && !isDeletedEquipmentMasterOption("manufacturer", model.manufacturer)) {
      values.add(canonicalEquipmentMasterValue("manufacturer", model.manufacturer));
    }
  }
  for (const asset of customer?.assets || []) {
    for (const equipment of asset.equipments || []) {
      if (equipment.manufacturer && !isDeletedEquipmentMasterOption("manufacturer", equipment.manufacturer)) {
        values.add(canonicalEquipmentMasterValue("manufacturer", equipment.manufacturer));
      }
    }
  }
  return Array.from(values).sort((left, right) => left.localeCompare(right, "ko"));
}

function equipmentModelOptionsFor(customer, manufacturer = "") {
  const normalizedManufacturer = equipmentMasterValueKey("manufacturer", manufacturer);
  const values = new Set();
  for (const model of [...customerState.engineModels, ...customerState.gearboxModels]) {
    const modelManufacturer = equipmentMasterValueKey("manufacturer", model.manufacturer);
    if (!normalizedManufacturer || modelManufacturer === normalizedManufacturer) {
      if (model.modelName && !isDeletedEquipmentMasterOption("model_name", model.modelName)) {
        values.add(model.modelName);
      }
    }
  }
  for (const option of customerState.equipmentOptions.filter((item) => item.optionType === "model_name" && !isDeletedEquipmentMasterOption("model_name", item.optionValue))) {
    values.add(option.optionValue);
  }
  for (const asset of customer?.assets || []) {
    for (const equipment of asset.equipments || []) {
      const equipmentManufacturer = equipmentMasterValueKey("manufacturer", equipment.manufacturer);
      if ((!normalizedManufacturer || equipmentManufacturer === normalizedManufacturer) && equipment.modelName && !isDeletedEquipmentMasterOption("model_name", equipment.modelName)) {
        values.add(equipment.modelName);
      }
    }
  }
  return Array.from(values).sort((left, right) => left.localeCompare(right, "ko"));
}

function customerSelectOptions(values, selectedValue = "") {
  return values
    .map((value) => `<option value="${escapeAttribute(value)}"${value === selectedValue ? " selected" : ""}>${escapeTextarea(value)}</option>`)
    .join("");
}

function equipmentMasterOptionsForField(fieldName, excludeValue = "") {
  const selected = customerState.selectedCustomer;
  const values =
    fieldName === "equipment_type"
      ? equipmentTypeOptionsFor(selected).map(([value]) => value)
      : fieldName === "equipment_unit"
        ? equipmentUnitOptionsFor(selected)
        : fieldName === "manufacturer"
          ? equipmentManufacturerOptionsFor(selected)
          : fieldName === "model_name"
            ? equipmentModelOptionsFor(selected)
            : [];
  return Array.from(new Set(values.filter((value) => value && value !== excludeValue && value !== "__add_new__"))).sort((left, right) => left.localeCompare(right, "ko"));
}

function equipmentMasterValueLabel(fieldName, value) {
  return fieldName === "equipment_type" ? equipmentTypeLabel(value) : value;
}

function findEquipmentMasterUsage(fieldName, value) {
  const usage = [];
  const targetValueKey = equipmentMasterValueKey(fieldName, value);
  for (const asset of customerState.selectedCustomer?.assets || []) {
    for (const equipment of asset.equipments || []) {
      const currentValue =
        fieldName === "equipment_type"
          ? equipment.equipmentType
          : fieldName === "equipment_unit"
            ? equipment.equipmentName
            : fieldName === "manufacturer"
              ? equipment.manufacturer
              : fieldName === "model_name"
                ? equipment.modelName
                : "";
      if (equipmentMasterValueKey(fieldName, currentValue) === targetValueKey) {
        usage.push({
          customerName: customerState.selectedCustomer?.customer?.customerName || "-",
          assetName: asset.assetName || "-",
          equipmentName: equipment.equipmentName || "-",
          equipment,
          currentValue,
        });
      }
    }
  }
  return usage;
}

async function replaceEquipmentMasterValue(fieldName, oldValue, nextValue) {
  const usage = findEquipmentMasterUsage(fieldName, oldValue);
  let latestDetail = null;
  for (const item of usage) {
    const payloadField =
      fieldName === "equipment_unit"
        ? "equipment_name"
        : fieldName;
    const payload = customerEquipmentUpdatePayload(item.equipment, payloadField, nextValue);
    if (!payload) {
      continue;
    }
    const result = await window.erpClient.updateAssetEquipment(item.equipment.id, payload);
    latestDetail = result.data || latestDetail;
  }
  if (latestDetail) {
    customerState.selectedCustomer = latestDetail;
    customerState.selectedAssetId = customerState.selectedAssetId || latestDetail.assets?.[0]?.id || null;
  }
  return usage.map((item) => item.equipment.id);
}

function deleteEquipmentMasterValue(fieldName, value) {
  const targetKey = equipmentMasterValueKey(fieldName, value);
  customerState.equipmentOptions = customerState.equipmentOptions.filter((option) => !(option.optionType === fieldName && equipmentMasterValueKey(option.optionType, option.optionValue) === targetKey));
  customerState.deletedEquipmentMasterOptions = [
    ...(customerState.deletedEquipmentMasterOptions || []).filter((item) => !(item.fieldName === fieldName && equipmentMasterValueKey(item.fieldName, item.value) === targetKey)),
    { fieldName, value: canonicalEquipmentMasterValue(fieldName, value), deletedAt: new Date().toISOString() },
  ];
}

function showEquipmentMasterReplaceDialog({ fieldName, value, usage, options }) {
  return new Promise((resolve) => {
    const dialog = document.createElement("div");
    dialog.className = "app-dialog-backdrop";
    dialog.setAttribute("role", "presentation");

    const panel = document.createElement("section");
    panel.className = "app-dialog customer-master-delete-dialog";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");

    const title = document.createElement("h2");
    title.className = "app-dialog-title";
    title.textContent = "마스터 항목 삭제 및 일괄 변경";

    const message = document.createElement("p");
    message.className = "app-dialog-message";
    message.textContent = `${customerMasterFieldLabel(fieldName)} "${equipmentMasterValueLabel(fieldName, value)}" 사용 장비 ${usage.length}건`;

    const list = document.createElement("div");
    list.className = "customer-master-usage-list";
    list.innerHTML = usage.length
      ? usage
          .map(
            (item) => `
              <div class="customer-master-usage-row">
                <span>${escapeTextarea(item.customerName)}</span>
                <span>${escapeTextarea(item.assetName)}</span>
                <span>${escapeTextarea(item.equipmentName)}</span>
                <span>${escapeTextarea(equipmentMasterValueLabel(fieldName, item.currentValue))}</span>
              </div>
            `,
          )
          .join("")
      : '<div class="empty-inline">현재 선택 고객의 장비에는 사용 중이지 않습니다.</div>';

    const valueRow = document.createElement("label");
    valueRow.className = "customer-master-replace-row";
    valueRow.innerHTML = `
      <span>대체 값</span>
      <input class="text-field" list="customer-master-replace-options" name="next_value" />
      <datalist id="customer-master-replace-options">
        ${options.map((option) => `<option value="${escapeAttribute(option)}"></option>`).join("")}
      </datalist>
    `;

    const actions = document.createElement("div");
    actions.className = "app-dialog-actions";
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "secondary-button";
    cancelButton.textContent = "취소";
    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.className = "primary-button danger-button";
    confirmButton.textContent = usage.length ? "일괄 변경 후 삭제" : "삭제";
    actions.append(cancelButton, confirmButton);

    function cleanup(result) {
      document.removeEventListener("keydown", handleKeydown);
      dialog.remove();
      resolve(result);
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        cleanup(null);
      }
    }

    cancelButton.addEventListener("click", () => cleanup(null));
    confirmButton.addEventListener("click", async () => {
      const nextValue = String(panel.querySelector('[name="next_value"]')?.value || "").trim();
      if (usage.length && (!nextValue || nextValue === value)) {
        await showAppMessage("삭제 대상과 다른 대체 값을 입력하세요.");
        return;
      }
      const confirmed = await requestAppConfirm(
        usage.length
          ? `${usage.length}개 장비 값을 "${nextValue}"(으)로 바꾸고 기존 항목을 삭제할까요?`
          : `${customerMasterFieldLabel(fieldName)} "${value}" 항목을 삭제할까요?`,
        "마스터 항목 삭제 확인",
      );
      cleanup(confirmed ? { nextValue } : null);
    });

    panel.append(title, message, list, valueRow, actions);
    dialog.appendChild(panel);
    document.body.appendChild(dialog);
    document.addEventListener("keydown", handleKeydown);
    panel.querySelector("input")?.focus();
  });
}

function renderCustomerModelOptions(manufacturer, selectedValue = "") {
  return customerSelectOptions(equipmentModelOptionsFor(customerState.selectedCustomer, manufacturer), selectedValue);
}

function openCustomerMasterDeleteContextMenu(field, event) {
  if (!(field instanceof HTMLElement) || !customerWorkspace.contains(field) || customerState.detailTab !== "assets") {
    return false;
  }
  event.preventDefault();
  event.stopPropagation();
  const fieldName = field.dataset.masterField || "";
  const value = field.value || field.getAttribute("data-current-value") || "";
  if (!fieldName || !value || value === "__add_new__") {
    return true;
  }

  customerState.contextMenu = {
    visible: true,
    x: Math.max(8, event.clientX),
    y: Math.max(8, event.clientY),
    actionType: "master-delete",
    entityType: "equipment-master",
    entityId: value,
    fieldKey: fieldName,
    fieldLabel: `${customerMasterFieldLabel(fieldName)} "${equipmentMasterValueLabel(fieldName, value)}"`,
  };
  renderCustomerWorkspace();
  return true;
}

function renderCustomerWorkspace() {
  const selected = customerState.selectedCustomer;
  const isCreateMode = customerState.view === "create";
  const primaryAddress = selected?.addresses?.[0];
  const primaryContact = selected?.contacts?.[0];
  const customerItems = customerState.list
    .map(
      (customer) => {
        const isMultiSelected = customerState.multiSelectedCustomerIds.includes(customer.id);
        return `
        <button type="button" class="customer-list-row${customer.id === customerState.selectedCustomerId ? " active" : ""}${isMultiSelected ? " multi-selected" : ""}" data-customer-select="${customer.id}" aria-pressed="${isMultiSelected ? "true" : "false"}">
          <span class="customer-row-company">${customer.customerName}</span>
          <span class="customer-row-owner">${customer.primaryContactName || customer.representativeName || "-"}</span>
        </button>
      `;
      },
    )
    .join("");
  const selectedAsset = selectedCustomerAsset(selected);
  const selectedEquipment = selectedAsset?.equipments?.find((equipment) => equipment.id === customerState.selectedEquipmentId) || null;
  const assetEditorMode = customerState.assetEditorMode === "create" ? "create" : "edit";
  const equipmentEditorMode = customerState.equipmentEditorMode === "edit" && selectedEquipment ? "edit" : "create";
  const createDraft = customerState.createDraft;
  const equipmentTypeOptions = equipmentTypeOptionsFor(selected);
  const manufacturerOptions = equipmentManufacturerOptionsFor(selected);
  const equipmentUnitOptions = equipmentUnitOptionsFor(selected);

  const customerClassicFields = isCreateMode
    ? `
      <label class="customer-classic-field">
        <span>구분</span>
        <select class="customer-classic-input" name="customer_type">
          <option value="SHIP_OWNER"${createDraft.customer_type === "SHIP_OWNER" ? " selected" : ""}>선사</option>
          <option value="GENERAL"${createDraft.customer_type === "GENERAL" || !createDraft.customer_type ? " selected" : ""}>일반 고객</option>
        </select>
      </label>
      <label class="customer-classic-field">
        <span>업체명</span>
        <input class="customer-classic-input" name="customer_name" value="${escapeAttribute(createDraft.customer_name || "")}" required />
      </label>
      <label class="customer-classic-field">
        <span>대표자명</span>
        <input class="customer-classic-input" name="representative_name" value="${escapeAttribute(createDraft.representative_name || "")}" />
      </label>
      <label class="customer-classic-field">
        <span>사업자번호</span>
        <input class="customer-classic-input" name="business_registration_no" value="${escapeAttribute(createDraft.business_registration_no || "")}" />
      </label>
      <label class="customer-classic-field">
        <span>업태</span>
        <input class="customer-classic-input" name="business_category" value="${escapeAttribute(createDraft.business_category || "")}" />
      </label>
      <label class="customer-classic-field">
        <span>종목</span>
        <input class="customer-classic-input" name="business_item" value="${escapeAttribute(createDraft.business_item || "")}" />
      </label>
      <label class="customer-classic-field">
        <span>연락처</span>
        <input class="customer-classic-input" name="company_phone" value="${escapeAttribute(createDraft.company_phone || "")}" />
      </label>
      <label class="customer-classic-field">
        <span>메일</span>
        <input class="customer-classic-input" name="company_email" value="${escapeAttribute(createDraft.company_email || "")}" />
      </label>
      <label class="customer-classic-field">
        <span>과세구분</span>
        <input class="customer-classic-input" name="tax_category" value="${escapeAttribute(createDraft.tax_category || "")}" />
      </label>
      <label class="customer-classic-field">
        <span>은행계좌</span>
        <input class="customer-classic-input" name="bank_account" value="${escapeAttribute(createDraft.bank_account || "")}" />
      </label>
      <label class="customer-classic-field wide">
        <span>세금계산서발송메일</span>
        <input class="customer-classic-input" name="invoice_email" value="${escapeAttribute(createDraft.invoice_email || "")}" />
      </label>
      <label class="customer-classic-field">
        <span>개업일</span>
        <input class="customer-classic-input" name="opening_date" type="date" value="${escapeAttribute(createDraft.opening_date || "")}" />
      </label>
      <label class="customer-classic-field">
        <span>주소</span>
        <input class="customer-classic-input" name="address_line_1" value="${escapeAttribute(createDraft.address_line_1 || "")}" placeholder="저장 후 주소 탭에서 정식 추가" />
      </label>
    `
    : selected
      ? [
        { label: "업체명", fieldKey: "customer_name", value: selected.customer.customerName || "" },
        { label: "대표자명", fieldKey: "representative_name", value: selected.customer.representativeName || "" },
        { label: "사업자번호", fieldKey: "business_registration_no", value: selected.customer.businessRegistrationNo || "" },
        { label: "업태", fieldKey: "business_category", value: selected.customer.businessCategory || "" },
        { label: "종목", fieldKey: "business_item", value: selected.customer.businessItem || "" },
        { label: "구분", fieldKey: "customer_type", value: selected.customer.customerType || "GENERAL", type: "select" },
        { label: "연락처", fieldKey: "company_phone", value: selected.customer.companyPhone || "" },
        { label: "대표 이메일", fieldKey: "company_email", value: selected.customer.companyEmail || "" },
        { label: "과세구분", fieldKey: "tax_category", value: selected.customer.taxCategory || "" },
        { label: "은행계좌", fieldKey: "bank_account", value: selected.customer.bankAccount || "" },
        { label: "세금계산서발송메일", fieldKey: "invoice_email", value: selected.customer.invoiceEmail || selected.customer.companyEmail || "", wide: true },
        { label: "영업담당자", fieldKey: "contact_name", value: primaryContact?.contactName || selected.customer.primaryContactName || "" },
        { label: "담당연락처", fieldKey: "contact_phone", value: primaryContact?.mobilePhone || primaryContact?.officePhone || "" },
        { label: "우편번호", fieldKey: "postal_code", value: primaryAddress?.postalCode || "" },
        { label: "주소", fieldKey: "address_line_1", value: primaryAddress?.addressLine1 || "", wide: true },
        { label: "주소상세", fieldKey: "address_line_2", value: primaryAddress?.addressLine2 || "", wide: true },
        { label: "개업일", fieldKey: "opening_date", value: formatDate(selected.customer.openingDate) === "-" ? "" : formatDate(selected.customer.openingDate), type: "date" },
        { label: "수정일", fieldKey: "updated_at", value: formatDate(selected.customer.updatedAt) === "-" ? "" : formatDate(selected.customer.updatedAt), editable: false },
      ]
        .map((field) => renderCustomerEditableField(field))
        .join("")
      : "";
  const vesselRowsMarkup = selected
    ? selected.assets.length
      ? sortedCustomerAssets(selected.assets)
          .map(
            (asset) => `
              <div class="customer-vessel-row${selectedAsset?.id === asset.id ? " active" : ""}" role="button" tabindex="0" data-customer-asset-select="${asset.id}">
                ${renderCustomerEditableCell({ entityType: "asset", entityId: asset.id, fieldKey: "asset_name", label: "선명", value: asset.assetName || "" })}
                ${renderCustomerEditableCell({ entityType: "asset", entityId: asset.id, fieldKey: "imo_no", label: "IMO", value: asset.imoNo || "", displayValue: asset.imoNo || asset.registrationNo || "-" })}
                ${renderCustomerEditableCell({ entityType: "asset", entityId: asset.id, fieldKey: "vessel_type", label: "선종", value: asset.vesselType || "", displayValue: asset.vesselType || assetTypeLabel(asset.assetType) })}
              </div>
            `,
          )
          .join("")
      : `<div class="empty-inline">등록된 선박이 없습니다.</div>`
    : `<div class="empty-inline">고객을 선택하면 선박 목록이 표시됩니다.</div>`;

  const equipmentRowsMarkup = selectedAsset
    ? selectedAsset.equipments.length
      ? sortedCustomerEquipments(selectedAsset.equipments)
          .map(
            (equipment) => `
              <div class="customer-equipment-row${selectedEquipment?.id === equipment.id ? " active" : ""}" role="button" tabindex="0" data-customer-equipment-select="${equipment.id}">
                ${renderCustomerEditableCell({ entityType: "equipment", entityId: equipment.id, fieldKey: "equipment_type", label: "분류", value: equipment.equipmentType || "OTHER", displayValue: equipmentTypeLabel(equipment.equipmentType) })}
                ${renderCustomerEditableCell({ entityType: "equipment", entityId: equipment.id, fieldKey: "equipment_name", label: "호기", value: equipment.equipmentName || "", displayValue: equipment.equipmentName || equipment.installationPosition || "-" })}
                ${renderCustomerEditableCell({ entityType: "equipment", entityId: equipment.id, fieldKey: "manufacturer", label: "제조사", value: equipment.manufacturer || "" })}
                ${renderCustomerEditableCell({ entityType: "equipment", entityId: equipment.id, fieldKey: "model_name", label: "모델명", value: equipment.modelName || "" })}
                ${renderCustomerEditableCell({ entityType: "equipment", entityId: equipment.id, fieldKey: "serial_no", label: "SN", value: equipment.serialNo || "" })}
                ${renderCustomerEditableCell({ entityType: "equipment", entityId: equipment.id, fieldKey: "notes", label: "REMARK", value: equipment.notes || "" })}
              </div>
            `,
          )
          .join("")
      : `<div class="empty-inline">선택 선박에 등록된 장비가 없습니다.</div>`
    : `<div class="empty-inline">왼쪽 선박을 선택하면 장비 목록이 표시됩니다.</div>`;

  const assetFormTarget = assetEditorMode === "edit" ? selectedAsset : null;
  const assetEditorMarkup = selected
    ? `
      <form id="customer-asset-form" class="customer-equipment-editor">
        <input type="hidden" name="asset_id" value="${escapeAttribute(assetFormTarget?.id || "")}" />
        <input type="hidden" name="asset_type" value="VESSEL" />
        <div class="customer-equipment-editor-head">
          <strong>${assetEditorMode === "create" ? "선박 신규 추가" : "선박 정보 변경"}</strong>
          <button type="button" class="customer-add-row compact" data-customer-asset-new>${assetEditorMode === "create" ? "신규 입력 중" : "+ 선박 신규"}</button>
        </div>
        <div class="customer-equipment-editor-fields">
          <input class="text-field" name="asset_name" placeholder="선명" value="${escapeAttribute(assetFormTarget?.assetName || "")}" required />
          <input class="text-field" name="imo_no" placeholder="IMO" value="${escapeAttribute(assetFormTarget?.imoNo || "")}" />
          <input class="text-field" name="vessel_type" placeholder="선종" value="${escapeAttribute(assetFormTarget?.vesselType || "")}" />
          <input class="text-field" name="registration_no" placeholder="call.sign" value="${escapeAttribute(assetFormTarget?.registrationNo || "")}" />
          <textarea class="text-area" name="notes" placeholder="REMARK">${escapeTextarea(assetFormTarget?.notes || "")}</textarea>
        </div>
        <button class="secondary-button" type="submit">${assetEditorMode === "create" ? "선박 추가" : "선박 변경 저장"}</button>
      </form>
    `
    : "";

  const equipmentFormTarget = equipmentEditorMode === "edit" ? selectedEquipment : null;
  const currentManufacturer = canonicalEquipmentMasterValue("manufacturer", equipmentFormTarget?.manufacturer || manufacturerOptions[0] || "");
  const currentModelOptions = Array.from(new Set([...equipmentModelOptionsFor(selected, currentManufacturer), equipmentFormTarget?.modelName].filter(Boolean)));
  const equipmentEditorMarkup = selectedAsset
    ? `
      <form id="customer-equipment-form" class="customer-equipment-editor">
        <input type="hidden" name="asset_id" value="${escapeAttribute(selectedAsset.id)}" />
        <input type="hidden" name="equipment_id" value="${escapeAttribute(equipmentFormTarget?.id || "")}" />
        <div class="customer-equipment-editor-head">
          <strong>${equipmentEditorMode === "create" ? "장비 신규 추가" : "장비 정보 변경"}</strong>
          <button type="button" class="customer-add-row compact" data-customer-equipment-new>${equipmentEditorMode === "create" ? "신규 입력 중" : "+ 장비 신규"}</button>
        </div>
        <div class="customer-equipment-editor-fields">
          <select class="text-field" name="equipment_type" data-master-field="equipment_type" data-current-value="${escapeAttribute(equipmentFormTarget?.equipmentType || "MAIN_ENGINE")}">
            ${equipmentTypeOptions
              .map(([value, label]) => `<option value="${escapeAttribute(value)}"${equipmentFormTarget?.equipmentType === value || (!equipmentFormTarget && value === "MAIN_ENGINE") ? " selected" : ""}>${escapeTextarea(label)}</option>`)
              .join("")}
            <option value="__add_new__">새 항목 추가</option>
          </select>
          <select class="text-field" name="equipment_name" data-master-field="equipment_unit" data-current-value="${escapeAttribute(equipmentFormTarget?.equipmentName || "")}" required>
            <option value=""${equipmentFormTarget?.equipmentName ? "" : " selected"}>호기/장비명</option>
            ${customerSelectOptions(equipmentUnitOptions, equipmentFormTarget?.equipmentName || "")}
            <option value="__add_new__">새 항목 추가</option>
          </select>
          <select class="text-field" name="manufacturer" data-master-field="manufacturer" data-current-value="${escapeAttribute(currentManufacturer)}">
            <option value=""${currentManufacturer ? "" : " selected"}>제조사</option>
            ${customerSelectOptions(manufacturerOptions, currentManufacturer)}
            <option value="__add_new__">새 항목 추가</option>
          </select>
          <select class="text-field" name="model_name" data-master-field="model_name" data-current-value="${escapeAttribute(equipmentFormTarget?.modelName || "")}" data-customer-model-select>
            <option value=""${equipmentFormTarget?.modelName ? "" : " selected"}>모델명</option>
            ${customerSelectOptions(currentModelOptions, equipmentFormTarget?.modelName || "")}
            <option value="__add_new__">새 항목 추가</option>
          </select>
          <input class="text-field" name="serial_no" placeholder="SN" value="${escapeAttribute(equipmentFormTarget?.serialNo || "")}" />
          <input class="text-field" name="installation_position" placeholder="설치 위치" value="${escapeAttribute(equipmentFormTarget?.installationPosition || "")}" />
          <textarea class="text-area" name="notes" placeholder="REMARK">${escapeTextarea(equipmentFormTarget?.notes || "")}</textarea>
        </div>
        <button class="secondary-button" type="submit">${equipmentEditorMode === "create" ? "장비 추가" : "장비 변경 저장"}</button>
      </form>
    `
    : `
      <div class="customer-equipment-editor customer-equipment-editor-empty">
        <div class="customer-equipment-editor-head">
          <strong>장비 신규 추가</strong>
          <button type="button" class="customer-add-row compact" data-customer-equipment-new disabled>+ 장비 신규</button>
        </div>
        <div class="empty-inline">선박 선택 후 장비를 추가할 수 있습니다.</div>
      </div>
    `;

  const assetsMarkup = selected
    ? `
      <section class="customer-equipment-layout">
        <article class="customer-equipment-pane customer-vessel-pane">
          <div class="customer-equipment-pane-head">
            <h4 class="section-mini-title">선박 목록</h4>
            <span class="table-subtext">${selected.assets.length}척</span>
          </div>
          <div class="customer-vessel-head">
            ${customerSortButtonMarkup("asset", "asset_name", "선명")}
            ${customerSortButtonMarkup("asset", "imo_no", "IMO")}
            ${customerSortButtonMarkup("asset", "vessel_type", "선종")}
          </div>
          <div class="customer-vessel-list">
            ${vesselRowsMarkup}
          </div>
          ${assetEditorMarkup}
        </article>
        <article class="customer-equipment-pane">
          <div class="customer-equipment-pane-head">
            <h4 class="section-mini-title">장비 목록</h4>
            <span class="table-subtext">${selectedAsset ? selectedAsset.assetName : "선박 미선택"}</span>
          </div>
          <div class="customer-equipment-head">
            ${customerSortButtonMarkup("equipment", "equipment_type", "분류")}
            ${customerSortButtonMarkup("equipment", "equipment_name", "호기")}
            ${customerSortButtonMarkup("equipment", "manufacturer", "제조사")}
            ${customerSortButtonMarkup("equipment", "model_name", "모델명")}
            ${customerSortButtonMarkup("equipment", "serial_no", "SN")}
            ${customerSortButtonMarkup("equipment", "notes", "REMARK")}
          </div>
          <div class="customer-equipment-list">
            ${equipmentRowsMarkup}
          </div>
          ${equipmentEditorMarkup}
        </article>
      </section>
    `
    : `<div class="empty-inline">고객을 선택하면 선박/장비 목록이 표시됩니다.</div>`;

  const employeeRowsMarkup =
    selected && selected.contacts.length
      ? selected.contacts
          .map(
            (contact) => `
              <div class="customer-employee-row">
                ${renderCustomerEditableCell({ entityType: "contact", entityId: contact.id, fieldKey: "contact_name", label: "이름", value: contact.contactName || "" })}
                ${renderCustomerEditableCell({ entityType: "contact", entityId: contact.id, fieldKey: "job_title", label: "직책", value: contact.jobTitle || "" })}
                ${renderCustomerEditableCell({ entityType: "contact", entityId: contact.id, fieldKey: "mobile_phone", label: "연락처", value: contact.mobilePhone || contact.officePhone || "" })}
                ${renderCustomerEditableCell({ entityType: "contact", entityId: contact.id, fieldKey: "email", label: "이메일", value: contact.email || "" })}
                <span>${formatDate(contact.updatedAt)}</span>
              </div>
            `,
          )
          .join("")
      : `<div class="empty-inline">${isCreateMode ? "고객 저장 후 담당자를 추가할 수 있습니다." : selected ? "저장된 직원 정보가 없습니다." : "선택 업체가 없습니다."}</div>`;
  const employeeAddMarkup =
    selected && !isCreateMode
      ? `
        <form id="customer-contact-form" class="customer-employee-add-row" aria-label="새 직원 추가">
          <input type="hidden" name="contact_role" value="STAFF" />
          <input class="text-field" name="contact_name" placeholder="이름" required />
          <input class="text-field" name="job_title" placeholder="직책" />
          <input class="text-field" name="mobile_phone" placeholder="연락처" />
          <input class="text-field" name="email" placeholder="이메일" />
          <button class="secondary-button" type="submit">추가</button>
        </form>
      `
      : "";
  const employeeMarkup = `
    <div class="customer-employee-table">
      <div class="customer-employee-head">
        <span>이름</span>
        <span>직책</span>
        <span>연락처</span>
        <span>이메일</span>
        <span>수정일</span>
      </div>
      ${employeeRowsMarkup}
      ${employeeAddMarkup}
    </div>
  `;

  const listPane = `
    <section class="customer-stage-panel customer-stage-stack">
      <section class="info-card customer-search-panel">
        <form id="customer-search-form" class="customer-searchbar">
          <input class="text-field" name="search" placeholder="업체명 / 대표자 / 사업자번호 / 선박명 / 엔진명으로 검색" value="${customerState.search}" />
          ${
            isCreateMode
              ? '<button type="button" class="ghost-button" data-customer-create-cancel>등록 취소</button>'
              : '<button type="button" class="ghost-button" data-customer-refresh>새로고침</button>'
          }
          ${
            isCreateMode
              ? '<button type="button" class="primary-button" data-customer-create-save>저장</button>'
              : customerState.inlineEdit.fieldKey
                ? `<button type="button" class="primary-button" data-customer-inline-save="${escapeAttribute(customerState.inlineEdit.fieldKey)}">저장</button>`
              : '<button type="button" class="secondary-button" data-customer-create-open>신규</button>'
          }
          <button class="secondary-button" type="submit">검색</button>
          <span class="message info customer-search-notice" role="status">${escapeTextarea(customerState.notice)}</span>
        </form>
      </section>
      <section class="customer-list-detail-layout">
        <section class="info-card customer-list-dock">
          <div class="stack-item customer-panel-heading">
            <div>
              <p class="eyebrow">목록</p>
            </div>
          </div>
          <div class="customer-list-table-head">
            <span>업체명</span>
            <span>대표/담당</span>
          </div>
          <div class="customer-list-scroll">
            <div class="customer-list">
              ${
                customerState.hasSearched
                  ? (customerItems || '<div class="empty-inline">검색 결과가 없습니다.</div>')
                  : '<div class="empty-inline">검색하거나 새로고침하면 업체 목록이 표시됨.</div>'
              }
            </div>
          </div>
        </section>
        <section class="info-card customer-inline-detail">
          <div class="stack-item customer-panel-heading">
            <div>
              ${
                selected || isCreateMode
                  ? `
                    <div class="customer-record-tabs customer-detail-tabs">
                      <button type="button" class="customer-record-tab${customerState.detailTab === "overview" ? " active" : ""}" data-customer-detail-tab="overview">기본</button>
                      <button type="button" class="customer-record-tab${customerState.detailTab === "organization" ? " active" : ""}" data-customer-detail-tab="organization">조직</button>
                      <button type="button" class="customer-record-tab${customerState.detailTab === "assets" ? " active" : ""}" data-customer-detail-tab="assets">장비</button>
                    </div>
                  `
                  : '<p class="eyebrow">상세</p>'
              }
              <h3 class="subsection-title">${isCreateMode ? "신규 고객" : selected ? selected.customer.customerName : "업체를 선택하세요"}</h3>
            </div>
            ${isCreateMode ? '<span class="status-badge neutral">입력</span>' : selected ? `<span class="status-badge neutral">${customerTypeLabel(selected.customer.customerType)}</span>` : ""}
          </div>
          ${
            selected || isCreateMode
              ? `
                <div class="customer-detail-scroll${customerState.detailTab === "assets" ? " customer-detail-scroll-assets" : ""}">
                  <div class="customer-record-layout customer-record-layout-single">
                    <section class="customer-record-sheet">
                      ${
                        customerState.detailTab === "assets"
                          ? `
                            ${isCreateMode ? '<div class="empty-inline">고객 저장 후 선박/장비를 추가할 수 있습니다.</div>' : assetsMarkup}
                          `
                          : customerState.detailTab === "organization"
                            ? `
                              <article class="customer-section-card customer-employee-list-card">
                                <h4 class="section-mini-title">직원 정보</h4>
                                <div class="customer-employee-scroll">
                                  ${employeeMarkup}
                                </div>
                              </article>
                            `
                            : `
                              ${isCreateMode ? '<form id="customer-create-form" class="customer-classic-layout customer-create-form">' : '<section class="customer-classic-layout">'}
                                <div class="customer-classic-form">
                                  ${customerClassicFields}
                                </div>
                                ${
                                  isCreateMode
                                    ? '<div class="customer-classic-memo">'
                                    : `<div class="customer-classic-memo${isCustomerInlineEditing("customer", customerState.selectedCustomerId || "", "notes") ? " editing" : ""}" data-customer-edit-field="notes" data-customer-edit-label="메모" data-customer-edit-entity="customer" data-customer-edit-id="${escapeAttribute(customerState.selectedCustomerId || "")}">`
                                }
                                  <label class="customer-classic-memo-label" for="customer-notes">메모</label>
                                  <textarea id="customer-notes" class="text-area customer-memo-textarea" name="${isCustomerInlineEditing("customer", customerState.selectedCustomerId || "", "notes") ? "customer_inline_value" : "notes"}" placeholder="업체 관련 메모를 자유롭게 입력" ${!isCreateMode && !isCustomerInlineEditing("customer", customerState.selectedCustomerId || "", "notes") ? "readonly" : ""}>${escapeTextarea(isCustomerInlineEditing("customer", customerState.selectedCustomerId || "", "notes") ? customerState.inlineEdit.value : isCreateMode ? createDraft.notes || "" : selected.customer.notes)}</textarea>
                                  ${
                                    isCreateMode
                                      ? `
                                        <div class="customer-upload-actions">
                                          <button type="button" class="secondary-button" data-customer-license-pick>사업자등록증 파일 선택</button>
                                          <span class="table-subtext">${customerState.uploadedFile ? `선택됨: ${customerState.uploadedFile.originalName}` : "PDF/PNG/JPG OCR 보조"}</span>
                                        </div>
                                        <p class="table-subtext">주소/담당자/선박/장비는 고객 저장 후 각 탭에서 추가할 수 있습니다.</p>
                                      `
                                      : isCustomerInlineEditing("customer", customerState.selectedCustomerId || "", "notes")
                                        ? '<p class="table-subtext">상단 저장 버튼으로 저장합니다.</p>'
                                        : '<p class="table-subtext">메모에서 우클릭하면 바로 수정할 수 있습니다.</p>'
                                  }
                                ${isCreateMode ? "</div></form>" : "</div></section>"}
                            `
                      }
                    </section>
                  </div>
                </div>
              `
              : '<div class="empty-inline customer-empty">왼쪽 목록에서 업체를 선택하면 여기 표시됨.</div>'
          }
        </section>
      </section>
    </section>
  `;

  const activePane = listPane;

  customerWorkspace.innerHTML = `
    ${activePane}
    ${renderCustomerEditContextMenu()}
  `;
}

async function refreshCustomerWorkspace(options = {}) {
  if (dashboardState.activeTab !== "customers") {
    return;
  }

  if (options.search !== undefined) {
    customerState.search = options.search;
  }

  customerState.loading = true;
  customerState.notice = options.notice || customerState.notice;
  customerState.hasSearched = true;
  renderCustomerWorkspace();

  try {
    const customersResult = await window.erpClient.listCustomers(customerState.search);

    customerState.list = customersResult.data || [];
    customerState.multiSelectedCustomerIds = [];
    customerState.loaded = true;

  if (options.selectFirst) {
    customerState.selectedCustomerId = customerState.list[0]?.id || null;
    customerState.selectedCustomer = null;
    customerState.selectedAssetId = null;
    customerState.selectedEquipmentId = null;
  }

  if (customerState.selectedCustomerId) {
    const exists = customerState.list.some((customer) => customer.id === customerState.selectedCustomerId);
    if (!exists) {
      customerState.selectedCustomerId = null;
      customerState.selectedCustomer = null;
      customerState.selectedAssetId = null;
      customerState.selectedEquipmentId = null;
    }
  }

  if (customerState.selectedCustomerId && !options.deferDetail) {
    const detailResult = await window.erpClient.getCustomer(customerState.selectedCustomerId);
    customerState.selectedCustomer = detailResult.data;
    syncCustomerAssetEquipmentSelection(customerState.selectedCustomer, { selectFirstEquipment: customerState.detailTab === "assets" });
  }

    customerState.notice = options.notice || "검색 결과를 확인하고 업체를 선택하거나 신규 등록하면 됨.";
  } catch (error) {
    customerState.notice = error.message || "고객관리 데이터를 불러오지 못했습니다.";
  } finally {
    customerState.loading = false;
    renderCustomerWorkspace();
    loadCustomerMasterDataInBackground();
  }
}

function loadCustomerMasterDataInBackground() {
  if (customerState.masterDataLoaded || customerState.masterDataLoading) {
    return;
  }

  customerState.masterDataLoading = true;
  Promise.all([
    window.erpClient.listEngineModels(""),
    window.erpClient.listGearboxModels(""),
    window.erpClient.listEquipmentOptions(""),
  ])
    .then(([engineModelsResult, gearboxModelsResult, equipmentOptionsResult]) => {
      customerState.engineModels = engineModelsResult.data || [];
      customerState.gearboxModels = gearboxModelsResult.data || [];
      customerState.equipmentOptions = equipmentOptionsResult.data || [];
      customerState.masterDataLoaded = true;
    })
    .catch(() => {
      customerState.masterDataLoaded = false;
    })
    .finally(() => {
      customerState.masterDataLoading = false;
      if (dashboardState.activeTab === "customers" && customerState.selectedCustomer) {
        renderCustomerWorkspace();
      }
    });
}

async function loadCustomerDetail(customerId, notice) {
  customerState.selectedCustomerId = customerId;
  customerState.selectedCustomer = null;
  customerState.selectedAssetId = null;
  customerState.selectedEquipmentId = null;
  customerState.detailTab = "overview";
  setCustomerView("detail");
  customerState.notice = notice || customerState.notice;
  renderCustomerWorkspace();
  loadCustomerMasterDataInBackground();

  try {
    const result = await window.erpClient.getCustomer(customerId);
    customerState.selectedCustomer = result.data;
    syncCustomerAssetEquipmentSelection(result.data, { selectFirstEquipment: customerState.detailTab === "assets" });
    customerState.notice = notice || customerState.notice;
  } catch (error) {
    customerState.notice = error.message || "고객 상세를 불러오지 못했습니다.";
  }

  renderCustomerWorkspace();
}

async function saveDashboardPreference(partial, successMessage) {
  const nextPreferences = await window.erpClient.savePreference({
    ...dashboardState.preferences,
    ...partial,
  });
  dashboardState.preferences = nextPreferences;
  applyDashboardPreferences(nextPreferences);
  await loadPreferences();
  renderActiveTab();
  setMessage(settingsFeedback, "info", successMessage);
}

async function handleSettingsPasswordChange(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const currentPassword = String(data.current_password || "");
  const nextPassword = String(data.next_password || "");
  const nextPasswordConfirm = String(data.next_password_confirm || "");

  if (!currentPassword || !nextPassword || !nextPasswordConfirm) {
    setMessage(settingsPasswordFeedback, "error", "현재 비밀번호, 새 비밀번호, 확인값을 모두 입력하세요.");
    return;
  }

  if (nextPassword !== nextPasswordConfirm) {
    setMessage(settingsPasswordFeedback, "error", "새 비밀번호와 확인값이 일치하지 않습니다.");
    return;
  }

  if (nextPassword.length < 8) {
    setMessage(settingsPasswordFeedback, "error", "새 비밀번호는 최소 8자 이상이어야 합니다.");
    return;
  }

  const confirmed = await requestAppConfirm("비밀번호를 변경할까요?");
  if (!confirmed) {
    return;
  }

  try {
    await window.erpClient.changePassword({ currentPassword, nextPassword });
    form.reset();
    setMessage(settingsPasswordFeedback, "info", "비밀번호가 변경되었습니다.");
    await showAppMessage("비밀번호가 변경되었습니다.");
  } catch (error) {
    const message = String(error?.message || "비밀번호 변경에 실패했습니다.").replace(/^\[[^\]]+\]\s*HTTP\s*\d+:\s*/, "");
    setMessage(settingsPasswordFeedback, "error", message || "비밀번호 변경에 실패했습니다.");
  }
}

async function loadAppVersion() {
  try {
    const result = await window.erpClient.getAppVersion();
    dashboardState.appInfo = result;
    const label = `버전 ${result.version}`;
    document.title = `Sunjin ERP ${result.version}`;
    loginAppVersion.textContent = label;
    loginServerUrl.textContent = `서버 주소 ${result.serverUrl}${result.serverKind === "local" ? " (로컬 자동 선택)" : ""}`;
    loginAccessMode.textContent = `Cloudflare Access ${result.cloudflareAccessEnabled ? "활성" : "비활성"}`;
    if (dashboardAppVersion) {
      setBadgeText(dashboardAppVersion, result.version, "neutral");
    }
    if (result.platform === "darwin") {
      setMessage(updateStatus, "info", "macOS는 앱 내 자동 설치를 사용하지 않습니다. 새 버전이 있으면 다운로드 페이지에서 수동 설치합니다.");
    }
  } catch {
    dashboardState.appInfo = null;
    document.title = "Sunjin ERP";
    loginAppVersion.textContent = "버전 확인 실패";
    loginServerUrl.textContent = "서버 주소 확인 실패";
    loginAccessMode.textContent = "Cloudflare Access 확인 실패";
    if (dashboardAppVersion) {
      setBadgeText(dashboardAppVersion, "확인 실패", "warn");
    }
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
  applyDashboardPreferences(preferences);
  document.getElementById("login-id").value = preferences.showRememberedUsername ? preferences.rememberedUsername || "" : "";
  autoLoginCheckbox.checked = Boolean(preferences.autoLoginEnabled);
  renderScopeToggle(preferences.testAccessScope || "AUTO");
  return preferences;
}

async function refreshSession() {
  try {
    const session = await window.erpClient.getSession();
    dashboardState.session = session;
    dashboardState.activeTab = "";
    dashboardState.openTabs = [];
    applyDashboardPreferences(dashboardState.preferences);
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

  const hasSession = await refreshSession();
  if (hasSession) {
    setMessage(loginFeedback, "info", "최근 로그인 세션으로 자동 로그인되었습니다.");
    return true;
  }

  document.getElementById("login-id").value = preferences.showRememberedUsername ? preferences.rememberedUsername : "";
  setMessage(loginFeedback, "info", "최근 로그인 계정이 준비되었습니다.");
  return false;
}

function renderActiveTab() {
  if (dashboardState.openTabs.length === 0) {
    dashboardState.activeTab = "";
    document.getElementById("dashboard-main-pane").classList.remove("hidden");
    document.getElementById("dashboard-settings-pane").classList.add("hidden");
    workspaceEmpty.classList.remove("hidden");
    customerWorkspace.classList.add("hidden");
    orderWorkspace.classList.add("hidden");
    projectWorkspace.classList.add("hidden");
    invoiceWorkspace.classList.add("hidden");
    assetWorkspace.classList.add("hidden");
    dashboardCards.classList.add("hidden");
    dashboardTablePanel.classList.add("hidden");
    renderWorkspaceTabs();
    return;
  }

  const activeTab = getActiveTab();
  const isSettings = activeTab === "settings";
  const isCustomers = activeTab === "customers";
  const isOrders = activeTab === "orders";
  const isProject = activeTab === "work";
  const isInvoices = activeTab === "invoices";
  const isAssets = activeTab === "assets";
  const isInventory = activeTab === "inventory";
  const content = dashboardContent[activeTab];

  document.getElementById("dashboard-main-pane").classList.toggle("hidden", isSettings);
  document.getElementById("dashboard-settings-pane").classList.toggle("hidden", !isSettings);
  workspaceEmpty.classList.add("hidden");
  customerWorkspace.classList.toggle("hidden", !isCustomers);
  orderWorkspace.classList.toggle("hidden", !isOrders);
  projectWorkspace.classList.toggle("hidden", !isProject);
  invoiceWorkspace.classList.toggle("hidden", !isInvoices);
  assetWorkspace.classList.toggle("hidden", !(isAssets || isInventory));
  dashboardCards.classList.toggle("hidden", isCustomers || isOrders || isProject || isInvoices || isAssets || isInventory);
  dashboardTablePanel.classList.toggle("hidden", isCustomers || isOrders || isProject || isInvoices || isAssets || isInventory);
  renderWorkspaceTabs();

  if (isSettings) {
    renderSettingsTab();
    return;
  }

  if (isCustomers) {
    renderCustomerWorkspace();
    return;
  }

  if (isOrders) {
    renderOrderWorkspace();
    return;
  }

  if (isProject) {
    renderProjectWorkspace();
    return;
  }

  if (isInvoices) {
    renderInvoiceWorkspace();
    return;
  }

  if (isAssets) {
    renderAssetWorkspace();
    return;
  }

  if (isInventory) {
    renderInventoryWorkspace();
    return;
  }

  renderMetricCards(content.cards);
  renderTable(content.columns, content.rows);
}

function renderAssetWorkspace() {
  if (!assetState.loaded && !assetState.loading) {
    void loadAssetWorkspaceData();
  }
  const allPhysicalAssets = assetState.physicalAssets;
  const physicalAssets = filteredPhysicalAssets();
  const physicalFilters = assetState.physicalFilters || {};
  const physicalColumnWidths = getAssetPhysicalColumnWidths();
  const physicalColumns = assetPhysicalColumnDefinitions();
  const knowledgeRecords = filteredKnowledgeRecords();
  const groupedKnowledge = new Map();
  for (const record of knowledgeRecords) {
    const list = groupedKnowledge.get(record.category) || [];
    list.push(record);
    groupedKnowledge.set(record.category, list);
  }
  const knowledgeCategories = Array.from(groupedKnowledge.entries()).map(([category, records]) => ({ category, records }));
  const activeSubtab = assetState.subtab || "dashboard";
  const metricCards = [
    { label: "실물 자산", value: assetState.summary.physicalAssetCount, detail: "서버 DB 기준" },
    { label: "인증 만료 임박", value: assetState.summary.expiringSoonCount, detail: "30일 이내" },
    { label: "검사 예정", value: assetState.summary.inspectionDueCount, detail: "7일 이내 또는 경과" },
    { label: "총 지식", value: assetState.summary.knowledgeCount, detail: "서버 DB 기준" },
  ].map((card) => `
    <article class="metric-card asset-metric-card">
      <p class="eyebrow">${card.label}</p>
      <p class="metric">${card.value}</p>
      <p class="detail">${card.detail}</p>
    </article>
  `).join("");

  const physicalRows = physicalAssets.map((asset) => `
    <tr data-asset-record-type="physical" data-asset-record-id="${escapeAttribute(asset.id)}" class="asset-record-row">
      <td>${asset.id}</td>
      <td>${asset.purpose || parsePhysicalAssetPurpose(asset.id)}</td>
      <td>${asset.name}</td>
      <td>${asset.purchasePrice || "-"}</td>
      <td>${asset.auditCycle || "-"}</td>
      <td><span class="status-badge ${asset.state}">${formatLatestAuditEntry(asset)}</span></td>
      <td>${formatLatestRepairEntry(asset)}</td>
    </tr>
  `).join("");

  const knowledgeBlocks = knowledgeCategories.map((section) => `
    <article class="asset-knowledge-section">
      <div class="asset-section-heading">
        <div>
          <p class="eyebrow">Knowledge Category</p>
          <h3>${section.category}</h3>
        </div>
        <span class="status-badge neutral">${section.records.length}건</span>
      </div>
      <table class="data-table asset-table">
        <thead>
          <tr>
            <th>등록번호</th>
            <th>내용</th>
            <th>해시태그</th>
            <th>작성자</th>
          </tr>
        </thead>
        <tbody>
          ${section.records.map((record) => `
            <tr data-asset-record-type="knowledge" data-asset-record-id="${escapeAttribute(record.id)}" class="asset-record-row">
              <td>${record.id}</td>
              <td>${record.content}</td>
              <td><div class="asset-hashtag-list">${renderKnowledgeHashtags(record)}</div></td>
              <td>${record.author}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </article>
  `).join("");

  const subtabButtons = [
    { key: "dashboard", label: "대시보드", description: "핵심 자산/지식 현황" },
    { key: "physical", label: "실물 자산 관리", description: "실물 자산 목록 확인" },
    { key: "knowledge", label: "지식 관리", description: "지식 카테고리와 목록 확인" },
  ].map((tab) => `
    <button type="button" class="asset-subtab-button${activeSubtab === tab.key ? " active" : ""}" data-asset-subtab="${tab.key}">
      <strong>${tab.label}</strong>
      <span>${tab.description}</span>
    </button>
  `).join("");

  let contentPanel = "";
  if (assetState.loading && !assetState.loaded) {
    contentPanel = `
      <article class="info-card asset-panel">
        <div class="asset-section-heading">
          <div><h3>자산관리 로딩 중</h3></div>
          <span class="status-badge neutral">로딩</span>
        </div>
        <p class="detail">서버 DB에서 자산 데이터를 읽고 있습니다.</p>
      </article>
    `;
  } else if (assetState.error) {
    contentPanel = `
      <article class="info-card asset-panel">
        <div class="asset-section-heading">
          <div><h3>자산관리 오류</h3></div>
          <span class="status-badge warn">오류</span>
        </div>
        <p class="detail">${escapeTextarea(assetState.error)}</p>
      </article>
    `;
  } else if (activeSubtab === "physical") {
    contentPanel = `
      <article class="info-card asset-panel asset-physical-panel">
        <div class="asset-section-heading">
          <div>
            <h3>실물 자산 목록</h3>
            <p class="detail">${physicalAssets.length} / ${assetState.physicalAssets.length}건 표시</p>
          </div>
          <div class="asset-panel-actions">
            <span class="status-badge warn">등록번호 기본키</span>
            <button type="button" class="secondary-button" data-asset-create="physical">신규 작성</button>
          </div>
        </div>
        <label class="asset-list-search">
          <span>검색</span>
          <input type="search" class="text-field" data-asset-physical-filter="query" value="${escapeAttribute(physicalFilters.query || "")}" placeholder="등록번호, 이름, 가격, 주기, 검사, 수리 검색" />
        </label>
        <div class="asset-table-wrap">
        <table class="data-table asset-table asset-physical-table">
          <colgroup>
            ${physicalColumns.map((column) => `<col style="width:${physicalColumnWidths[column.key]}px" />`).join("")}
          </colgroup>
          <thead>
            <tr>
              ${physicalColumns.map((column) => `
                <th class="asset-resizable-th" style="width:${physicalColumnWidths[column.key]}px">
                  <div class="asset-header-cell">
                    <button type="button" class="asset-header-sort${physicalFilters.sortKey === column.key ? " active" : ""}" data-asset-sort="${column.key}">
                      <span>${column.label}</span>
                      <b>${physicalFilters.sortKey === column.key ? (physicalFilters.sortDirection === "asc" ? "▲" : "▼") : "↕"}</b>
                    </button>
                    ${assetFilterMenu(column, physicalFilters)}
                  </div>
                  <i data-asset-column-resize="${column.key}" aria-hidden="true"></i>
                </th>
              `).join("")}
            </tr>
          </thead>
          <tbody>${physicalRows || '<tr><td colspan="7">조건에 맞는 실물 자산이 없습니다.</td></tr>'}</tbody>
        </table>
        </div>
      </article>
    `;
  } else if (activeSubtab === "knowledge") {
    contentPanel = `
      <article class="info-card asset-panel">
        <div class="asset-section-heading">
          <div>
            <h3>지식 관리 목록</h3>
            <p class="detail">${knowledgeRecords.length} / ${assetState.knowledgeRecords.length}건 표시</p>
          </div>
          <div class="asset-panel-actions">
            <span class="status-badge ok">카테고리 기반</span>
            <button type="button" class="secondary-button" data-asset-create="knowledge">신규 작성</button>
          </div>
        </div>
        <label class="asset-list-search">
          <span>검색</span>
          <input type="search" class="text-field" data-asset-knowledge-search value="${escapeAttribute(assetState.knowledgeSearch || "")}" placeholder="내용, 카테고리, 작성자, #해시태그 검색" />
        </label>
        <div class="asset-knowledge-stack">
          ${knowledgeBlocks || '<article class="asset-knowledge-section"><p class="detail">등록된 지식이 없습니다.</p></article>'}
        </div>
      </article>
    `;
  } else {
    contentPanel = `
      <section class="asset-card-grid">${metricCards}</section>
      <article class="info-card asset-panel">
        <div class="asset-section-heading">
          <div>
            <p class="eyebrow">Dashboard</p>
            <h3>자산관리 기본 화면</h3>
          </div>
          <span class="status-badge neutral">요약</span>
        </div>
        <div class="asset-dashboard-grid">
          <div class="asset-dashboard-block">
            <p class="detail">최근 주의 항목</p>
            <div class="asset-alert-list">
              ${
                allPhysicalAssets.slice(0, 3).map((item) => `<div class="stack-item"><span>${item.id}</span><strong>${item.name} / ${formatLatestAuditEntry(item)}</strong></div>`).join("")
                || '<div class="stack-item"><span>-</span><strong>등록된 자산이 없습니다.</strong></div>'
              }
            </div>
          </div>
        </div>
      </article>
    `;
  }

  assetWorkspace.innerHTML = `
    <section class="asset-layout">
      <aside class="info-card asset-subtab-nav">
        <div class="asset-subtab-list">
          ${subtabButtons}
        </div>
      </aside>
      <div class="asset-main-column">
        ${contentPanel}
      </div>
    </section>
  `;
}

function inventorySummaryCards(items) {
  return [
    { label: "재고 부족", value: items.filter((item) => item.onHand < item.safetyStock).length, detail: "안전재고 미만" },
    { label: "발주 필요", value: items.filter((item) => item.status === "발주 필요").length, detail: "즉시 발주 대상" },
    { label: "입고 대기", value: items.filter((item) => item.status === "입고 대기").length, detail: "입고 예정 품목" },
    { label: "출고 예정", value: items.filter((item) => item.outboundPlanned > 0).length, detail: "작업/판매 출고" },
  ];
}

function inventorySalesSummaryCards(records) {
  return [
    { label: "판매 진행", value: records.filter((record) => record.status === "출고 예정").length, detail: "출고 준비 포함" },
    { label: "납품 완료", value: records.filter((record) => record.status === "납품 완료").length, detail: "완료 처리" },
    { label: "청구 대기", value: records.filter((record) => record.status === "청구 대기").length, detail: "매출 반영 필요" },
    { label: "문서 미첨부", value: records.filter((record) => !(record.documents || []).length).length, detail: "증빙 보완 필요" },
  ];
}

function filteredInventoryItems() {
  const query = String(inventoryState.filters.query || "").trim().toLowerCase();
  return inventoryState.items.filter((item) => {
    if (inventoryState.filters.status && item.status !== inventoryState.filters.status) {
      return false;
    }
    if (inventoryState.filters.category && item.category !== inventoryState.filters.category) {
      return false;
    }
    if (inventoryState.filters.supplier && item.supplier !== inventoryState.filters.supplier) {
      return false;
    }
    if (!query) {
      return true;
    }
    return [item.name, item.code, item.no, item.supplier].some((value) => String(value || "").toLowerCase().includes(query));
  });
}

function filteredInventorySales() {
  const query = String(inventoryState.filters.query || "").trim().toLowerCase();
  return inventoryState.sales.filter((record) => {
    if (inventoryState.filters.status && record.status !== inventoryState.filters.status) {
      return false;
    }
    if (inventoryState.filters.supplier && record.customer !== inventoryState.filters.supplier) {
      return false;
    }
    if (!query) {
      return true;
    }
    return [record.no, record.customer, record.itemName, record.code, record.orderNo].some((value) => String(value || "").toLowerCase().includes(query));
  });
}

function selectedInventoryItem() {
  const items = filteredInventoryItems();
  return items.find((item) => item.id === inventoryState.selectedItemId) || items[0] || null;
}

function selectedInventorySales() {
  const records = filteredInventorySales();
  return records.find((record) => record.id === inventoryState.selectedSalesId) || records[0] || null;
}

function getInventoryPaneWidth() {
  const stored = Number(localStorage.getItem(INVENTORY_LIST_PANE_WIDTH_STORAGE_KEY) || "");
  return Number.isFinite(stored) && stored >= 360 ? stored : 720;
}

function setInventoryPaneWidth(width) {
  if (!Number.isFinite(width) || width < 360) {
    localStorage.removeItem(INVENTORY_LIST_PANE_WIDTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(INVENTORY_LIST_PANE_WIDTH_STORAGE_KEY, String(Math.round(width)));
}

function inventoryPaneStyle() {
  const width = getInventoryPaneWidth();
  return `grid-template-columns: minmax(${Math.max(420, width)}px, ${Math.max(420, width)}px) 8px minmax(320px, 1fr);`;
}

function renderInventoryViewToggle() {
  return `
    <div class="project-view-toggle" role="group" aria-label="부품관리 보기 전환">
      <button type="button" class="project-view-button${inventoryState.viewMode === "stock" ? " active" : ""}" data-inventory-view-mode="stock">재고관리</button>
      <button type="button" class="project-view-button${inventoryState.viewMode === "sales" ? " active" : ""}" data-inventory-view-mode="sales">판매관리</button>
    </div>
  `;
}

function renderInventoryWorkspace() {
  const isSalesView = inventoryState.viewMode === "sales";
  const items = isSalesView ? filteredInventorySales() : filteredInventoryItems();
  const selected = isSalesView ? selectedInventorySales() : selectedInventoryItem();
  const summaryCards = isSalesView ? inventorySalesSummaryCards(inventoryState.sales) : inventorySummaryCards(inventoryState.items);
  const categoryOptions = Array.from(new Set(inventoryState.items.map((item) => item.category)));
  const supplierOptions = Array.from(new Set((isSalesView ? inventoryState.sales.map((item) => item.customer) : inventoryState.items.map((item) => item.supplier))));
  const detailTabs = isSalesView
    ? [
        ["overview", "개요"],
        ["movement", "입출고"],
        ["purchase", "주문"],
        ["documents", "문서"],
      ]
    : [
        ["overview", "개요"],
        ["stock", "재고"],
        ["movement", "입출고"],
        ["purchase", "발주"],
        ["documents", "문서"],
      ];
  const detailBody = !selected
    ? `<section class="project-panel"><p class="detail">선택된 ${isSalesView ? "판매" : "부품"}이 없습니다.</p></section>`
    : isSalesView
      ? inventoryState.activeDetailTab === "movement"
        ? `
          <section class="project-panel">
            <table class="data-table project-table">
              <thead><tr><th>일자</th><th>구분</th><th>수량</th><th>비고</th></tr></thead>
              <tbody>${selected.movements.map((row) => `<tr><td>${row.date}</td><td>${row.type}</td><td>${row.quantity}</td><td>${row.note}</td></tr>`).join("") || '<tr><td colspan="4">이력이 없습니다.</td></tr>'}</tbody>
            </table>
          </section>
        `
        : inventoryState.activeDetailTab === "purchase"
          ? `
            <section class="project-panel">
              <div class="project-form-grid">
                <label><span>판매번호</span><input class="text-field" value="${escapeAttribute(selected.no)}" readonly /></label>
                <label><span>원주문번호</span><input class="text-field" value="${escapeAttribute(selected.orderNo)}" readonly /></label>
                <label><span>거래처</span><input class="text-field" value="${escapeAttribute(selected.customer)}" readonly /></label>
                <label><span>출고 상태</span><input class="text-field" value="${escapeAttribute(selected.outboundStatus)}" readonly /></label>
                <label><span>수량</span><input class="text-field" value="${escapeAttribute(String(selected.quantity))}" readonly /></label>
                <label><span>금액</span><input class="text-field" value="${escapeAttribute(String(selected.amount))}" readonly /></label>
              </div>
            </section>
          `
          : inventoryState.activeDetailTab === "documents"
            ? `
              <section class="project-panel">
                <table class="data-table project-table">
                  <thead><tr><th>문서종류</th><th>문서명</th><th>문서ID</th></tr></thead>
                  <tbody>${selected.documents.map((row) => `<tr><td>${row.type}</td><td>${row.name}</td><td>${row.id}</td></tr>`).join("") || '<tr><td colspan="3">등록된 문서가 없습니다.</td></tr>'}</tbody>
                </table>
              </section>
            `
            : `
              <section class="project-panel">
                <div class="project-form-grid">
                  <label><span>판매번호</span><input class="text-field" value="${escapeAttribute(selected.no)}" readonly /></label>
                  <label><span>거래처</span><input class="text-field" value="${escapeAttribute(selected.customer)}" readonly /></label>
                  <label><span>품목명</span><input class="text-field" value="${escapeAttribute(selected.itemName)}" readonly /></label>
                  <label><span>품번/코드</span><input class="text-field" value="${escapeAttribute(selected.code)}" readonly /></label>
                  <label><span>상태</span><input class="text-field" value="${escapeAttribute(selected.status)}" readonly /></label>
                  <label><span>납품 예정</span><input class="text-field" value="${escapeAttribute(selected.plannedDate)}" readonly /></label>
                </div>
                <section class="project-panel" style="margin-top:12px;">
                  <p class="eyebrow">메모</p>
                  <p class="detail">${escapeTextarea(selected.note || "-")}</p>
                </section>
              </section>
            `
    : inventoryState.activeDetailTab === "stock"
      ? `
        <section class="project-panel">
          <div class="project-form-grid">
            <label><span>현재고</span><input class="text-field" value="${escapeAttribute(String(selected.onHand))}" readonly /></label>
            <label><span>안전재고</span><input class="text-field" value="${escapeAttribute(String(selected.safetyStock))}" readonly /></label>
            <label><span>입고 대기</span><input class="text-field" value="${escapeAttribute(String(selected.inboundPending))}" readonly /></label>
            <label><span>출고 예정</span><input class="text-field" value="${escapeAttribute(String(selected.outboundPlanned))}" readonly /></label>
            <label><span>보관 위치</span><input class="text-field" value="${escapeAttribute(selected.location)}" readonly /></label>
            <label><span>리드타임</span><input class="text-field" value="${escapeAttribute(selected.purchaseLeadTime)}" readonly /></label>
          </div>
        </section>
      `
      : inventoryState.activeDetailTab === "movement"
        ? `
          <section class="project-panel">
            <table class="data-table project-table">
              <thead><tr><th>일자</th><th>구분</th><th>수량</th><th>비고</th></tr></thead>
              <tbody>${selected.movements.map((row) => `<tr><td>${row.date}</td><td>${row.type}</td><td>${row.quantity}</td><td>${row.note}</td></tr>`).join("") || '<tr><td colspan="4">이력이 없습니다.</td></tr>'}</tbody>
            </table>
          </section>
        `
        : inventoryState.activeDetailTab === "purchase"
          ? `
            <section class="project-panel">
              <table class="data-table project-table">
                <thead><tr><th>발주번호</th><th>공급처</th><th>입고예정</th><th>상태</th></tr></thead>
                <tbody>${selected.purchaseOrders.map((row) => `<tr><td>${row.no}</td><td>${row.supplier}</td><td>${row.eta}</td><td>${row.status}</td></tr>`).join("") || '<tr><td colspan="4">발주 건이 없습니다.</td></tr>'}</tbody>
              </table>
            </section>
          `
          : inventoryState.activeDetailTab === "documents"
            ? `
              <section class="project-panel">
                <table class="data-table project-table">
                  <thead><tr><th>문서종류</th><th>문서명</th><th>문서ID</th></tr></thead>
                  <tbody>${selected.documents.map((row) => `<tr><td>${row.type}</td><td>${row.name}</td><td>${row.id}</td></tr>`).join("") || '<tr><td colspan="3">등록된 문서가 없습니다.</td></tr>'}</tbody>
                </table>
              </section>
            `
            : `
              <section class="project-panel">
                <div class="project-form-grid">
                  <label><span>품목번호</span><input class="text-field" value="${escapeAttribute(selected.no)}" readonly /></label>
                  <label><span>분류</span><input class="text-field" value="${escapeAttribute(selected.category)}" readonly /></label>
                  <label><span>공급처</span><input class="text-field" value="${escapeAttribute(selected.supplier)}" readonly /></label>
                  <label><span>품목명</span><input class="text-field" value="${escapeAttribute(selected.name)}" readonly /></label>
                  <label><span>품번/코드</span><input class="text-field" value="${escapeAttribute(selected.code)}" readonly /></label>
                  <label><span>상태</span><input class="text-field" value="${escapeAttribute(selected.status)}" readonly /></label>
                </div>
                <section class="project-panel" style="margin-top:12px;">
                  <p class="eyebrow">메모</p>
                  <p class="detail">${escapeTextarea(selected.note || "-")}</p>
                </section>
              </section>
            `;

  assetWorkspace.innerHTML = `
    <section class="project-shell">
      <form class="project-filterbar" data-inventory-filter-form>
        ${renderInventoryViewToggle()}
        <label>기간 <input class="text-field" type="date" name="start_date" value="${escapeAttribute(inventoryState.filters.startDate)}" /></label>
        <label>~ <input class="text-field" type="date" name="end_date" value="${escapeAttribute(inventoryState.filters.endDate)}" /></label>
        <label>상태 <select class="text-field" name="status"><option value="">전체</option>${(isSalesView ? ["출고 예정", "납품 완료", "청구 대기"] : ["정상", "발주 필요", "입고 대기"]).map((value) => `<option value="${escapeAttribute(value)}"${inventoryState.filters.status === value ? " selected" : ""}>${value}</option>`).join("")}</select></label>
        <label>분류 <select class="text-field" name="category"><option value="">전체</option>${categoryOptions.map((value) => `<option value="${escapeAttribute(value)}"${inventoryState.filters.category === value ? " selected" : ""}>${value}</option>`).join("")}</select></label>
        <label>거래처/공급처 <select class="text-field" name="supplier"><option value="">전체</option>${supplierOptions.map((value) => `<option value="${escapeAttribute(value)}"${inventoryState.filters.supplier === value ? " selected" : ""}>${value}</option>`).join("")}</select></label>
        <label class="project-filter-query">검색 <input class="text-field" type="search" name="query" value="${escapeAttribute(inventoryState.filters.query)}" placeholder="${isSalesView ? "거래처 / 품목명 / 판매번호 / 주문번호" : "품목명 / 품번 / 코드"}" /></label>
        <div class="project-filter-actions">
          <button type="submit" class="secondary-button">조회</button>
          <button type="button" class="secondary-button" data-inventory-new>신규</button>
          <button type="button" class="secondary-button" data-inventory-clear>Clear</button>
        </div>
      </form>
      <section class="project-summary-grid">
        ${summaryCards.map((card) => `<article class="metric-card project-summary-card"><p class="eyebrow">${card.label}</p><p class="metric">${card.value}</p><p class="detail">${card.detail}</p></article>`).join("")}
      </section>
      <section class="project-layout" style="${inventoryPaneStyle()}">
        <aside class="project-sidebar">
          <div class="project-panel-title">
            <strong>${isSalesView ? "판매 목록" : "부품 목록"}</strong>
            <span class="status-badge neutral">${items.length}건</span>
          </div>
          <div class="project-list-head" style="grid-template-columns: 132px minmax(0, 1fr) 96px 108px;">
            <div class="project-list-th"><span>${isSalesView ? "판매번호" : "품목번호"}</span></div>
            <div class="project-list-th"><span>${isSalesView ? "품목/거래처" : "품목명"}</span></div>
            <div class="project-list-th"><span>${isSalesView ? "예정일" : "공급처"}</span></div>
            <div class="project-list-th"><span>상태</span></div>
          </div>
          <div class="project-list-scroll">
            <div class="project-list">
              ${items.map((item) => `
                <button type="button" class="project-list-row${item.id === selected?.id ? " active" : ""}" style="grid-template-columns: 132px minmax(0, 1fr) 96px 108px;" data-inventory-select="${escapeAttribute(item.id)}">
                  <span class="project-list-no">${item.no}</span>
                  <span>${isSalesView ? `${item.itemName} · ${item.customer}` : item.name}</span>
                  <span>${isSalesView ? item.plannedDate : item.supplier}</span>
                  <span><span class="status-badge ${item.status === "발주 필요" ? "warn" : item.status === "입고 대기" ? "neutral" : item.status === "출고 예정" ? "warn" : item.status === "청구 대기" ? "neutral" : "ok"}">${item.status}</span></span>
                </button>
              `).join("") || '<div class="project-empty">조건에 맞는 부품이 없습니다.</div>'}
            </div>
          </div>
        </aside>
        <span class="project-pane-resizer" data-inventory-pane-resizer title="부품 목록 폭 조절"></span>
        <section class="project-detail">
          <div class="project-detail-header">
            <div>
              <p class="eyebrow">${selected ? selected.no : isSalesView ? "판매관리" : "부품관리"}</p>
              <h3>${selected ? isSalesView ? selected.itemName : selected.name : isSalesView ? "선택된 판매 없음" : "선택된 부품 없음"}</h3>
              <p class="detail">${selected ? isSalesView ? `${selected.customer} · ${selected.code}` : `${selected.supplier} · ${selected.code}` : `좌측 목록에서 ${isSalesView ? "판매" : "품목"}을 선택하세요.`}</p>
            </div>
            <span class="status-badge neutral">${selected ? selected.status : "대기"}</span>
          </div>
          <div class="project-detail-tabs">
            ${detailTabs.map(([key, label]) => `<button type="button" class="project-detail-tab${inventoryState.activeDetailTab === key ? " active" : ""}" data-inventory-detail-tab="${key}">${label}</button>`).join("")}
          </div>
          <div class="project-detail-scroll">
            ${detailBody}
          </div>
        </section>
      </section>
    </section>
  `;
}

function handleInventoryMouseDown(event) {
  const paneResizer = event.target.closest("[data-inventory-pane-resizer]");
  if (!paneResizer) {
    return false;
  }
  event.preventDefault();
  inventoryPaneResizeState = {
    startX: event.clientX,
    startWidth: getInventoryPaneWidth(),
  };
  return true;
}

async function handleInventoryClick(event) {
  const viewButton = event.target.closest("[data-inventory-view-mode]");
  if (viewButton) {
    inventoryState.viewMode = viewButton.dataset.inventoryViewMode || "stock";
    inventoryState.activeDetailTab = "overview";
    renderInventoryWorkspace();
    return true;
  }

  const selectButton = event.target.closest("[data-inventory-select]");
  if (selectButton) {
    if (inventoryState.viewMode === "sales") {
      inventoryState.selectedSalesId = selectButton.dataset.inventorySelect || "";
    } else {
      inventoryState.selectedItemId = selectButton.dataset.inventorySelect || "";
    }
    renderInventoryWorkspace();
    return true;
  }

  const tabButton = event.target.closest("[data-inventory-detail-tab]");
  if (tabButton) {
    inventoryState.activeDetailTab = tabButton.dataset.inventoryDetailTab || "overview";
    renderInventoryWorkspace();
    return true;
  }

  const clearButton = event.target.closest("[data-inventory-clear]");
  if (clearButton) {
    inventoryState.filters = {
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      status: "",
      category: "",
      supplier: "",
      query: "",
    };
    renderInventoryWorkspace();
    return true;
  }

  const newButton = event.target.closest("[data-inventory-new]");
  if (newButton) {
    await showAppMessage(`${inventoryState.viewMode === "sales" ? "판매관리" : "재고관리"} 신규 등록 서버 연동은 다음 단계입니다.`, "부품관리");
    return true;
  }

  return false;
}

function parsePhysicalAssetPurpose(id = "") {
  const [, purpose = "COM"] = String(id).split("-").slice(1);
  return assetPurposeOptions.includes(purpose) ? purpose : "COM";
}

function buildNextPhysicalAssetId(purpose = "COM", previousId = "") {
  const numbers = assetState.physicalAssets
    .filter((item) => item.id !== previousId)
    .filter((item) => (item.purpose || parsePhysicalAssetPurpose(item.id)) === purpose)
    .map((item) => {
      const parts = String(item.id).split("-");
      return Number(parts[2] || 0);
    })
    .filter((value) => Number.isFinite(value) && value > 0);
  const nextNumber = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return `${assetCompanyPrefix}-${purpose}-${String(nextNumber).padStart(3, "0")}`;
}

function buildNextKnowledgeId() {
  const serial = String(assetState.knowledgeRecords.length + 1).padStart(3, "0");
  return `KN-NEW-${serial}`;
}

function inferAssetStateFromAudit(audit) {
  if (audit.includes("완료")) {
    return "ok";
  }
  if (audit.includes("검사") || audit.includes("교정")) {
    return "warn";
  }
  return "neutral";
}

function resolvePhysicalAssetId(purpose = "COM", previousId = "") {
  if (previousId && parsePhysicalAssetPurpose(previousId) === purpose) {
    return previousId;
  }
  return buildNextPhysicalAssetId(purpose, previousId);
}

function normalizeAuditHistory(history = []) {
  return history
    .map((item) => ({
      date: String(item?.date || "").trim(),
      content: String(item?.content || "").trim(),
      cost: String(item?.cost || "").trim(),
    }))
    .filter((item) => item.date || item.content || item.cost);
}

function normalizeRepairHistory(history = []) {
  return history
    .map((item) => ({
      date: String(item?.date || "").trim(),
      content: String(item?.content || "").trim(),
      cost: String(item?.cost || "").trim(),
    }))
    .filter((item) => item.date || item.content || item.cost);
}

function getLatestAuditEntry(asset) {
  const history = normalizeAuditHistory(asset?.auditHistory || []);
  return history[history.length - 1] || { date: "", content: "" };
}

function getLatestRepairEntry(asset) {
  const history = normalizeRepairHistory(asset?.repairHistory || []);
  return history[history.length - 1] || { date: "", content: "" };
}

function formatLatestAuditEntry(asset) {
  const latest = getLatestAuditEntry(asset);
  if (!latest.date && !latest.content) {
    return "이력 없음";
  }
  const costLabel = latest.cost ? ` / ${latest.cost}` : "";
  if (!latest.date) {
    return `${latest.content}${costLabel}`.trim();
  }
  if (!latest.content) {
    return `${latest.date}${costLabel}`.trim();
  }
  return `${latest.date} / ${latest.content}${costLabel}`;
}

function formatLatestRepairEntry(asset) {
  const latest = getLatestRepairEntry(asset);
  if (!latest.date && !latest.content) {
    return "이력 없음";
  }
  const costLabel = latest.cost ? ` / ${latest.cost}` : "";
  if (!latest.date) {
    return `${latest.content}${costLabel}`.trim();
  }
  if (!latest.content) {
    return `${latest.date}${costLabel}`.trim();
  }
  return `${latest.date} / ${latest.content}${costLabel}`;
}

function assetColumnValue(asset, key) {
  if (key === "id") {
    return asset.id || "";
  }
  if (key === "name") {
    return asset.name || "";
  }
  if (key === "purpose") {
    return asset.purpose || parsePhysicalAssetPurpose(asset.id);
  }
  if (key === "purchase_price") {
    return Number(String(asset.purchasePrice || "").replace(/,/g, "")) || 0;
  }
  if (key === "audit_cycle") {
    return asset.auditCycle || "";
  }
  if (key === "audit") {
    return formatLatestAuditEntry(asset);
  }
  if (key === "repair") {
    return formatLatestRepairEntry(asset);
  }
  if (key === "state") {
    return asset.state || "neutral";
  }
  if (key === "updated_at") {
    return asset.updatedAt || "";
  }
  return "";
}

function assetStateLabel(value) {
  if (value === "ok") {
    return "정상";
  }
  if (value === "warn") {
    return "주의";
  }
  return "일반";
}

function filteredPhysicalAssets() {
  const filters = assetState.physicalFilters || {};
  const query = String(filters.query || "").trim().toLowerCase();
  const purpose = String(filters.purpose || "");
  const state = String(filters.state || "");
  const sortKey = String(filters.sortKey || "updated_at");
  const sortDirection = filters.sortDirection === "asc" ? 1 : -1;
  return assetState.physicalAssets
    .filter((asset) => {
      const assetPurpose = asset.purpose || parsePhysicalAssetPurpose(asset.id);
      if (purpose && assetPurpose !== purpose) {
        return false;
      }
      if (state && (asset.state || "neutral") !== state) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [
        asset.id,
        assetPurpose,
        asset.name,
        asset.purchaseSource,
        asset.purchasePrice,
        asset.auditCycle,
        formatLatestAuditEntry(asset),
        formatLatestRepairEntry(asset),
      ].some((value) => String(value || "").toLowerCase().includes(query));
    })
    .sort((left, right) => {
      const leftValue = assetColumnValue(left, sortKey);
      const rightValue = assetColumnValue(right, sortKey);
      if (typeof leftValue === "number" || typeof rightValue === "number") {
        return ((Number(leftValue) || 0) - (Number(rightValue) || 0)) * sortDirection;
      }
      return String(leftValue || "").localeCompare(String(rightValue || ""), "ko-KR", { numeric: true }) * sortDirection;
    });
}

function normalizeKnowledgeHashtags(record) {
  return Array.isArray(record?.hashtags) ? record.hashtags.map((tag) => String(tag || "").trim()).filter(Boolean) : [];
}

function renderKnowledgeHashtags(record) {
  const tags = normalizeKnowledgeHashtags(record);
  if (!tags.length) {
    return '<span class="asset-hashtag-empty">태그 없음</span>';
  }
  return tags.map((tag) => `<span class="asset-hashtag">#${escapeTextarea(tag)}</span>`).join("");
}

function filteredKnowledgeRecords() {
  const searchQuery = String(assetState.knowledgeSearch || "").trim().replace(/^#+/, "").toLowerCase();
  if (!searchQuery) {
    return assetState.knowledgeRecords;
  }
  return assetState.knowledgeRecords.filter((record) => {
    const hashtags = normalizeKnowledgeHashtags(record);
    return [
      record.id,
      record.category,
      record.content,
      record.author,
      ...hashtags,
    ].some((value) => String(value || "").toLowerCase().includes(searchQuery));
  });
}

function assetFilterMenu(column, physicalFilters) {
  const open = physicalFilters.openFilter === column.key;
  const active = (
    (column.key === "purpose" && physicalFilters.purpose)
    || (column.key === "audit" && physicalFilters.state)
    || (!["purpose", "audit"].includes(column.key) && physicalFilters.query)
  );
  const menu = open
    ? `
      <div class="asset-filter-popover" data-asset-filter-popover>
        ${
          column.key === "purpose"
            ? `
              <button type="button" class="asset-filter-option${!physicalFilters.purpose ? " active" : ""}" data-asset-filter-set="purpose" data-asset-filter-value="">전체</button>
              ${assetPurposeOptions.map((option) => `
                <button type="button" class="asset-filter-option${physicalFilters.purpose === option ? " active" : ""}" data-asset-filter-set="purpose" data-asset-filter-value="${option}">${option}</button>
              `).join("")}
            `
            : ""
        }
        ${
          column.key === "audit"
            ? `
              <button type="button" class="asset-filter-option${!physicalFilters.state ? " active" : ""}" data-asset-filter-set="state" data-asset-filter-value="">전체</button>
              ${["ok", "warn", "neutral"].map((option) => `
                <button type="button" class="asset-filter-option${physicalFilters.state === option ? " active" : ""}" data-asset-filter-set="state" data-asset-filter-value="${option}">${assetStateLabel(option)}</button>
              `).join("")}
            `
            : ""
        }
        ${
          !["purpose", "audit"].includes(column.key)
            ? `
              <label class="asset-filter-search">
                <span>검색어</span>
                <input type="search" class="text-field" data-asset-physical-filter="query" value="${escapeAttribute(physicalFilters.query || "")}" placeholder="검색어 입력" />
              </label>
            `
            : ""
        }
        <button type="button" class="asset-filter-clear" data-asset-filter-clear="${column.key}">이 필터 지우기</button>
      </div>
    `
    : "";
  return `
    <button type="button" class="asset-filter-button${active ? " active" : ""}${open ? " open" : ""}" data-asset-filter-toggle="${column.key}" aria-label="${escapeAttribute(column.label)} 필터">
      <span aria-hidden="true"></span>
    </button>
    ${menu}
  `;
}

function assetPhysicalColumnDefinitions() {
  return [
    { key: "id", label: "등록번호" },
    { key: "purpose", label: "카테고리" },
    { key: "name", label: "이름" },
    { key: "purchase_price", label: "구입 가격" },
    { key: "audit_cycle", label: "주기" },
    { key: "audit", label: "인증&검사" },
    { key: "repair", label: "수리 이력" },
  ];
}

function showAssetEditorDialog(kind, record = null) {
  return new Promise((resolve) => {
    const dialog = document.createElement("div");
    dialog.className = "app-dialog-backdrop";
    dialog.setAttribute("role", "presentation");

    const panel = document.createElement("section");
    panel.className = "app-dialog asset-edit-dialog";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");

    const title = document.createElement("h2");
    title.className = "app-dialog-title";
    title.textContent = kind === "physical" ? "실물 자산 수정" : "지식 관리 수정";

    const form = document.createElement("form");
    form.className = "asset-edit-form";

    const isNew = !record;
    if (kind === "physical") {
      const selectedPurpose = record?.purpose || parsePhysicalAssetPurpose(record?.id || "");
      const auditHistory = normalizeAuditHistory(record?.auditHistory || [{ date: "", content: "" }]);
      const repairHistory = normalizeRepairHistory(record?.repairHistory || [{ date: "", content: "" }]);
      form.innerHTML = `
        <label>
          <span>등록번호</span>
          <input name="id" class="text-field" value="${escapeAttribute(record?.id || "저장 시 자동 생성")}" readonly />
        </label>
        <label>
          <span>용도</span>
          <select name="purpose" class="text-field">
            ${assetPurposeOptions.map((option) => `<option value="${option}"${option === (selectedPurpose || "COM") ? " selected" : ""}>${option}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>이름</span>
          <input name="name" class="text-field" value="${escapeAttribute(record?.name || "")}" />
        </label>
        <label>
          <span>구입처</span>
          <input name="purchase_source" class="text-field" value="${escapeAttribute(record?.purchaseSource || "")}" />
        </label>
        <label>
          <span>구입 가격</span>
          <input name="purchase_price" class="text-field" value="${escapeAttribute(record?.purchasePrice || "")}" />
        </label>
        <label class="asset-edit-wide">
          <span>인증&amp;검사 주기</span>
          <input name="audit_cycle" class="text-field" value="${escapeAttribute(record?.auditCycle || "")}" />
        </label>
        <label class="asset-edit-wide">
          <span>인증&amp;검사</span>
          <div class="asset-audit-sheet">
            <div class="asset-audit-sheet-head">
              <span>순번</span>
              <span>날짜</span>
              <span>내용</span>
              <span>소요비용</span>
            </div>
            <div class="asset-audit-sheet-body">
              ${auditHistory.map((item, index) => `
                <div class="asset-audit-row" data-asset-audit-row>
                  <span class="asset-audit-order">${index + 1}</span>
                  <input type="date" class="text-field" data-asset-audit-date value="${escapeAttribute(item.date)}" />
                  <input type="text" class="text-field" data-asset-audit-content value="${escapeAttribute(item.content)}" />
                  <input type="text" class="text-field" data-asset-audit-cost value="${escapeAttribute(item.cost)}" />
                </div>
              `).join("")}
            </div>
            <div class="asset-audit-sheet-actions">
              <button type="button" class="secondary-button" data-asset-audit-add>행 추가</button>
            </div>
          </div>
        </label>
        <label class="asset-edit-wide">
          <span>수리 이력</span>
          <div class="asset-audit-sheet">
            <div class="asset-audit-sheet-head">
              <span>순번</span>
              <span>날짜</span>
              <span>내용</span>
              <span>소요비용</span>
            </div>
            <div class="asset-repair-sheet-body">
              ${repairHistory.map((item, index) => `
                <div class="asset-audit-row" data-asset-repair-row>
                  <span class="asset-audit-order">${index + 1}</span>
                  <input type="date" class="text-field" data-asset-repair-date value="${escapeAttribute(item.date)}" />
                  <input type="text" class="text-field" data-asset-repair-content value="${escapeAttribute(item.content)}" />
                  <input type="text" class="text-field" data-asset-repair-cost value="${escapeAttribute(item.cost)}" />
                </div>
              `).join("")}
            </div>
            <div class="asset-audit-sheet-actions">
              <button type="button" class="secondary-button" data-asset-repair-add>행 추가</button>
            </div>
          </div>
        </label>
      `;
    } else {
      form.innerHTML = `
        <label>
          <span>등록번호</span>
          <input name="id" class="text-field" value="${escapeAttribute(record?.id || "저장 시 자동 생성")}" readonly />
        </label>
        <label>
          <span>카테고리</span>
          <input name="category" class="text-field" value="${escapeAttribute(record?.category || "")}" />
        </label>
        <label>
          <span>작성자</span>
          <input name="author" class="text-field" value="${escapeAttribute(record?.author || "")}" />
        </label>
        <label class="asset-edit-wide">
          <span>내용</span>
          <textarea name="content" class="text-area asset-edit-textarea">${escapeTextarea(record?.content || "")}</textarea>
        </label>
        <label class="asset-edit-wide">
          <span>해시태그</span>
          <input name="hashtags" class="text-field" value="${escapeAttribute(normalizeKnowledgeHashtags(record).map((tag) => `#${tag}`).join(" "))}" placeholder="#정비 #검사 #매뉴얼" />
        </label>
      `;
    }

    const actions = document.createElement("div");
    actions.className = "asset-edit-actions";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "secondary-button";
    closeButton.textContent = "닫기";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "secondary-button";
    deleteButton.textContent = "삭제";
    deleteButton.disabled = isNew;

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "secondary-button";
    saveButton.textContent = "저장";

    const cleanup = () => {
      dialog.remove();
      document.removeEventListener("keydown", handleKeydown);
    };

    const finish = (result) => {
      cleanup();
      resolve(result);
    };

    function handleKeydown(event) {
      if (event.key === "Escape") {
        finish(null);
      }
    }

    if (kind === "physical") {
      const purposeField = form.querySelector('[name="purpose"]');
      const idField = form.querySelector('[name="id"]');
      const auditSheetBody = form.querySelector(".asset-audit-sheet-body");
      const addAuditRowButton = form.querySelector("[data-asset-audit-add]");
      const repairSheetBody = form.querySelector(".asset-repair-sheet-body");
      const addRepairRowButton = form.querySelector("[data-asset-repair-add]");

      const renderRowOrder = (selector) => {
        const rows = Array.from(form.querySelectorAll(selector));
        rows.forEach((row, index) => {
          const order = row.querySelector(".asset-audit-order");
          if (order) {
            order.textContent = String(index + 1);
          }
        });
      };

      const createAuditRow = (item = { date: "", content: "", cost: "" }) => {
        const row = document.createElement("div");
        row.className = "asset-audit-row";
        row.setAttribute("data-asset-audit-row", "");
        row.innerHTML = `
          <span class="asset-audit-order"></span>
          <input type="date" class="text-field" data-asset-audit-date value="${escapeAttribute(item.date || "")}" />
          <input type="text" class="text-field" data-asset-audit-content value="${escapeAttribute(item.content || "")}" />
          <input type="text" class="text-field" data-asset-audit-cost value="${escapeAttribute(item.cost || "")}" />
        `;
        return row;
      };

      const createRepairRow = (item = { date: "", content: "", cost: "" }) => {
        const row = document.createElement("div");
        row.className = "asset-audit-row";
        row.setAttribute("data-asset-repair-row", "");
        row.innerHTML = `
          <span class="asset-audit-order"></span>
          <input type="date" class="text-field" data-asset-repair-date value="${escapeAttribute(item.date || "")}" />
          <input type="text" class="text-field" data-asset-repair-content value="${escapeAttribute(item.content || "")}" />
          <input type="text" class="text-field" data-asset-repair-cost value="${escapeAttribute(item.cost || "")}" />
        `;
        return row;
      };

      purposeField?.addEventListener("change", () => {
        if (!record?.id && idField) {
          idField.value = "저장 시 자동 생성";
        }
      });
      addAuditRowButton?.addEventListener("click", () => {
        auditSheetBody?.appendChild(createAuditRow());
        renderRowOrder("[data-asset-audit-row]");
      });
      addRepairRowButton?.addEventListener("click", () => {
        repairSheetBody?.appendChild(createRepairRow());
        renderRowOrder("[data-asset-repair-row]");
      });
      auditSheetBody?.addEventListener("contextmenu", async (event) => {
        const row = event.target.closest("[data-asset-audit-row]");
        if (!row) {
          return;
        }
        event.preventDefault();
        const rows = auditSheetBody.querySelectorAll("[data-asset-audit-row]");
        if (!(await requestAppConfirm("이 이력 행을 삭제할까요?", "행 삭제"))) {
          return;
        }
        if (rows.length <= 1) {
          row.querySelector("[data-asset-audit-date]")?.setAttribute("value", "");
          row.querySelector("[data-asset-audit-content]")?.setAttribute("value", "");
          row.querySelector("[data-asset-audit-cost]")?.setAttribute("value", "");
          const dateInput = row.querySelector("[data-asset-audit-date]");
          const contentInput = row.querySelector("[data-asset-audit-content]");
          const costInput = row.querySelector("[data-asset-audit-cost]");
          if (dateInput) {
            dateInput.value = "";
          }
          if (contentInput) {
            contentInput.value = "";
          }
          if (costInput) {
            costInput.value = "";
          }
          return;
        }
        row.remove();
        renderRowOrder("[data-asset-audit-row]");
      });
      repairSheetBody?.addEventListener("contextmenu", async (event) => {
        const row = event.target.closest("[data-asset-repair-row]");
        if (!row) {
          return;
        }
        event.preventDefault();
        const rows = repairSheetBody.querySelectorAll("[data-asset-repair-row]");
        if (!(await requestAppConfirm("이 수리 이력 행을 삭제할까요?", "행 삭제"))) {
          return;
        }
        if (rows.length <= 1) {
          row.querySelector("[data-asset-repair-date]")?.setAttribute("value", "");
          row.querySelector("[data-asset-repair-content]")?.setAttribute("value", "");
          row.querySelector("[data-asset-repair-cost]")?.setAttribute("value", "");
          const dateInput = row.querySelector("[data-asset-repair-date]");
          const contentInput = row.querySelector("[data-asset-repair-content]");
          const costInput = row.querySelector("[data-asset-repair-cost]");
          if (dateInput) {
            dateInput.value = "";
          }
          if (contentInput) {
            contentInput.value = "";
          }
          if (costInput) {
            costInput.value = "";
          }
          return;
        }
        row.remove();
        renderRowOrder("[data-asset-repair-row]");
      });
      renderRowOrder("[data-asset-audit-row]");
      renderRowOrder("[data-asset-repair-row]");
    }

    closeButton.addEventListener("click", () => finish(null));
    saveButton.addEventListener("click", () => {
      form.requestSubmit();
    });
    deleteButton.addEventListener("click", async () => {
      if (!(await requestAppConfirm("이 항목을 삭제할까요?", "삭제 확인"))) {
        return;
      }
      finish({ action: "delete", kind, id: record?.id || "" });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      if (kind === "physical") {
        const purpose = String(values.purpose || "COM").trim();
        const auditHistory = normalizeAuditHistory(
          Array.from(form.querySelectorAll("[data-asset-audit-row]")).map((row) => ({
            date: row.querySelector("[data-asset-audit-date]")?.value || "",
            content: row.querySelector("[data-asset-audit-content]")?.value || "",
            cost: row.querySelector("[data-asset-audit-cost]")?.value || "",
          })),
        );
        const repairHistory = normalizeRepairHistory(
          Array.from(form.querySelectorAll("[data-asset-repair-row]")).map((row) => ({
            date: row.querySelector("[data-asset-repair-date]")?.value || "",
            content: row.querySelector("[data-asset-repair-content]")?.value || "",
            cost: row.querySelector("[data-asset-repair-cost]")?.value || "",
          })),
        );
        const latestAudit = auditHistory[auditHistory.length - 1] || { date: "", content: "" };
        finish({
          action: "save",
          kind,
          record: {
            id: record?.id || "",
            purpose,
            name: String(values.name || "").trim(),
            purchaseSource: String(values.purchase_source || "").trim(),
            purchasePrice: String(values.purchase_price || "").trim(),
            auditCycle: String(values.audit_cycle || "").trim(),
            auditHistory,
            repairHistory,
            state: inferAssetStateFromAudit(String(latestAudit.content || "").trim()),
          },
          previousId: record?.id || "",
        });
        return;
      }

      finish({
        action: "save",
        kind,
          record: {
            id: record?.id || "",
            category: String(values.category || "").trim(),
            author: String(values.author || "").trim(),
            content: String(values.content || "").trim(),
            hashtags: String(values.hashtags || "")
              .split(/[,\s]+/)
              .map((tag) => tag.trim().replace(/^#+/, ""))
              .filter(Boolean),
          },
        previousId: record?.id || "",
      });
    });

    actions.append(closeButton, deleteButton, saveButton);
    panel.append(title, form, actions);
    dialog.appendChild(panel);
    document.body.appendChild(dialog);
    document.addEventListener("keydown", handleKeydown);
    form.querySelector("input, textarea")?.focus();
  });
}

async function openAssetEditor(kind, id = "") {
  try {
    const current = kind === "physical"
      ? assetState.physicalAssets.find((item) => item.id === id) || null
      : assetState.knowledgeRecords.find((item) => item.id === id) || null;
    const result = await showAssetEditorDialog(kind, current);
    if (!result) {
      return;
    }

    if (result.action === "delete") {
      const response = kind === "physical"
        ? await window.erpClient.deletePhysicalAssetRecord(result.id)
        : await window.erpClient.deleteKnowledgeRecord(result.id);
      applyAssetWorkspacePayload(response.data || {});
      renderAssetWorkspace();
      return;
    }

    const response = kind === "physical"
      ? await window.erpClient.savePhysicalAssetRecord(result.previousId || "", result.record)
      : await window.erpClient.saveKnowledgeRecord(result.previousId || "", result.record);
    applyAssetWorkspacePayload(response.data || {});
    renderAssetWorkspace();
  } catch (error) {
    await showAppMessage(error?.message || "자산관리 저장에 실패했습니다.");
  }
}

async function handleUploadFile(form) {
  const formData = Object.fromEntries(new FormData(form).entries());
  const result = await window.erpClient.uploadFile({
    domain: "customer",
    entity_type: "business_license",
    original_name: formData.original_name || "business-license.txt",
    mime_type: "text/plain",
    ocr_source_text: formData.ocr_source_text || "",
  });
  customerState.uploadedFile = result.data;
  customerState.notice = `사업자등록증 메타데이터가 저장되었습니다: ${result.data.originalName}`;
  renderCustomerWorkspace();
}

async function handleSelectBusinessLicenseFile() {
  readCustomerCreateDraft();
  const selection = await window.erpClient.selectBusinessLicenseFile();
  if (selection?.canceled) {
    return;
  }

  const file = selection.file;
  const result = await window.erpClient.uploadFile({
    domain: "customer",
    entity_type: "business_license",
    original_name: file.originalName,
    mime_type: file.mimeType,
    size_bytes: file.sizeBytes,
    sha256: file.sha256,
    ocr_source_text: file.ocrSourceText || "",
    upload_note: file.path,
  });
  customerState.uploadedFile = result.data;
  mergeCustomerCreateDraft({
    customer_type: customerState.createDraft.customer_type || "SHIP_OWNER",
    customer_name: file.extracted?.customerName || "",
    business_registration_no: file.extracted?.businessRegistrationNo || "",
    representative_name: file.extracted?.representativeName || "",
    business_category: file.extracted?.businessCategory || "",
    business_item: file.extracted?.businessItem || "",
    opening_date: file.extracted?.openingDate || "",
    address_line_1: file.extracted?.addressLine1 || "",
    notes: file.extracted?.addressLine1 ? `주소 ${file.extracted.addressLine1}` : "",
  });
  customerState.notice = file.ocrSourceText
    ? "사업자등록증 파일을 읽고 신규등록 필드를 자동 채웠습니다."
    : "파일은 저장했지만 추출 텍스트가 없습니다. 스캔 품질이 낮거나 문서 글자가 인식되지 않았습니다.";
  renderCustomerWorkspace();
}

async function handleCreateCustomer(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  const addressLine1 = String(payload.address_line_1 || "").trim();
  delete payload.address_line_1;
  if (customerState.uploadedFile?.id) {
    payload.business_license_file_id = customerState.uploadedFile.id;
  }
  const result = await window.erpClient.createCustomer(payload);
  const createdCustomerId = result.data.customer?.customer?.id || null;
  const createdCustomerName = result.data.customer?.customer?.customerName || payload.customer_name || "";
  if (createdCustomerId && addressLine1) {
    await window.erpClient.addCustomerAddress(createdCustomerId, {
      address_type: "BUSINESS",
      address_line_1: addressLine1,
    });
  }
  customerState.selectedCustomerId = createdCustomerId;
  customerState.notice = result.data.duplicates?.length
    ? `동일 사업자번호 후보 ${result.data.duplicates.length}건을 확인했습니다. 신규 등록은 완료되었습니다.`
    : "신규 업체가 등록되었습니다.";
  customerState.uploadedFile = null;
  customerState.createDraft = {};
  setCustomerView("detail");
  customerState.hasSearched = true;
  await showAppMessage(customerState.notice, "고객 등록");
  await refreshCustomerWorkspace({ search: String(createdCustomerName), notice: customerState.notice });
  form.reset();
}

async function handleCreateContact(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  const result = await window.erpClient.addCustomerContact(customerState.selectedCustomerId, payload);
  customerState.selectedCustomer = result.data;
  customerState.notice = "담당자가 추가되었습니다.";
  form.reset();
  renderCustomerWorkspace();
}

async function handleUpdateCustomerMemo(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  const result = await window.erpClient.updateCustomerMemo(customerState.selectedCustomerId, payload);
  customerState.selectedCustomer = result.data;
  customerState.notice = "메모가 저장되었습니다.";
  renderCustomerWorkspace();
}

async function handleSaveCustomerInlineEdit(options = {}) {
  const showAlert = options.showAlert !== false;
  const entityType = customerState.inlineEdit.entityType || "customer";
  const entityId = customerState.inlineEdit.entityId || customerState.selectedCustomerId || "";
  const fieldKey = customerState.inlineEdit.fieldKey;
  const previousCustomer = customerState.selectedCustomer?.customer || null;
  const previousAsset = entityType === "asset" ? findCustomerAsset(entityId) : null;
  const previousEquipment = entityType === "equipment" ? findCustomerEquipment(entityId).equipment : null;
  if (!fieldKey || !customerState.selectedCustomerId) {
    return;
  }

  const editRoot = customerWorkspace.querySelector(
    `[data-customer-edit-entity="${CSS.escape(entityType)}"][data-customer-edit-id="${CSS.escape(entityId)}"][data-customer-edit-field="${CSS.escape(fieldKey)}"]`,
  );
  const valueField = editRoot?.querySelector("[name='customer_inline_value']");
  const value = valueField ? valueField.value : customerState.inlineEdit.value;
  let payload = null;
  let result = null;
  let label = customerEditFieldDefinition(entityType, fieldKey)?.label || "필드";

  if (entityType === "contact") {
    payload = customerContactUpdatePayload(findCustomerContact(entityId), fieldKey, value);
    if (payload) {
      result = await window.erpClient.updateCustomerContact(entityId, payload);
    }
  } else if (entityType === "asset") {
    payload = customerAssetUpdatePayload(findCustomerAsset(entityId), fieldKey, value);
    if (payload) {
      result = await window.erpClient.updateCustomerAsset(entityId, payload);
    }
  } else if (entityType === "equipment") {
    const { equipment } = findCustomerEquipment(entityId);
    payload = customerEquipmentUpdatePayload(equipment, fieldKey, value);
    if (payload) {
      result = await window.erpClient.updateAssetEquipment(entityId, payload);
    }
  } else {
    payload = customerInlineEditPayload(fieldKey, value);
    if (payload) {
      result = await window.erpClient.updateCustomer(customerState.selectedCustomerId, payload);
    }
  }

  if (!payload) {
    customerState.notice = "수정할 수 없는 필드입니다.";
    resetCustomerInlineEdit();
    renderCustomerWorkspace();
    return;
  }

  resetCustomerInlineEdit();
  closeCustomerContextMenu();

  let latestResult = null;
  try {
    latestResult = await window.erpClient.getCustomer(customerState.selectedCustomerId);
  } catch {
    latestResult = null;
  }
  customerState.selectedCustomer = latestResult?.data || result?.data || customerState.selectedCustomer;
  const latestSummary = customerState.selectedCustomer?.customer;
  if (latestSummary) {
    customerState.list = customerState.list.map((customer) =>
      customer.id === latestSummary.id
        ? {
            ...customer,
            customerName: latestSummary.customerName,
            representativeName: latestSummary.representativeName,
            customerType: latestSummary.customerType,
            businessRegistrationNo: latestSummary.businessRegistrationNo,
            companyPhone: latestSummary.companyPhone,
            companyEmail: latestSummary.companyEmail,
            taxCategory: latestSummary.taxCategory,
            bankAccount: latestSummary.bankAccount,
            invoiceEmail: latestSummary.invoiceEmail,
            primaryContactName: customerState.selectedCustomer.contacts?.[0]?.contactName || latestSummary.primaryContactName,
            primaryContactPhone: customerState.selectedCustomer.contacts?.[0]?.mobilePhone || latestSummary.primaryContactPhone,
          }
        : customer,
    );
  }
  if (entityType === "customer" && fieldKey === "customer_name") {
    syncOrdersAfterCustomerChange({
      customerId: latestSummary?.id || customerState.selectedCustomerId,
      customerName: latestSummary?.customerName || value,
      customerMatchName: previousCustomer?.customerName || "",
    });
  } else if (entityType === "asset" && fieldKey === "asset_name") {
    const latestAsset = findCustomerAsset(entityId);
    syncOrdersAfterCustomerChange({
      assetId: entityId,
      assetName: latestAsset?.assetName || value,
      assetMatchName: previousAsset?.assetName || "",
    });
  } else if (entityType === "equipment" && fieldKey === "equipment_name") {
    const { equipment: latestEquipment } = findCustomerEquipment(entityId);
    syncOrdersAfterCustomerChange({
      equipmentId: entityId,
      equipmentName: latestEquipment?.equipmentName || value,
      equipmentMatchName: previousEquipment?.equipmentName || "",
    });
  }
  customerState.notice = `${label} 저장 완료.`;
  if (showAlert) {
    await showAppMessage("저장 완료");
  }
  renderCustomerWorkspace();
  return true;
}

async function confirmCustomerInlineEditBeforeLeave() {
  if (!customerState.inlineEdit.fieldKey) {
    return true;
  }

  const entityType = customerState.inlineEdit.entityType || "customer";
  const entityId = customerState.inlineEdit.entityId || customerState.selectedCustomerId || "";
  const fieldKey = customerState.inlineEdit.fieldKey;
  const editRoot = customerWorkspace.querySelector(
    `[data-customer-edit-entity="${CSS.escape(entityType)}"][data-customer-edit-id="${CSS.escape(entityId)}"][data-customer-edit-field="${CSS.escape(fieldKey)}"]`,
  );
  if (!editRoot?.querySelector("[name='customer_inline_value']")) {
    resetCustomerInlineEdit();
    closeCustomerContextMenu();
    return true;
  }

  const shouldSave = await requestAppConfirm("변경사항을 저장 하시겠습니까?");
  if (shouldSave) {
    await handleSaveCustomerInlineEdit({ showAlert: false });
    return true;
  }

  resetCustomerInlineEdit();
  closeCustomerContextMenu();
  renderCustomerWorkspace();
  return true;
}

async function handleCreateAddress(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  const result = await window.erpClient.addCustomerAddress(customerState.selectedCustomerId, payload);
  customerState.selectedCustomer = result.data;
  customerState.notice = "주소가 추가되었습니다.";
  form.reset();
  renderCustomerWorkspace();
}

async function handleCreateAsset(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  const assetId = payload.asset_id;
  const previousAsset = assetId ? findCustomerAsset(assetId) : null;
  delete payload.asset_id;
  const result = assetId
    ? await window.erpClient.updateCustomerAsset(assetId, payload)
    : await window.erpClient.addCustomerAsset(customerState.selectedCustomerId, payload);
  customerState.selectedCustomer = result.data;
  const nextAsset = assetId ? assetId : result.data.assets[0]?.id;
  customerState.selectedAssetId = nextAsset || customerState.selectedAssetId;
  if (assetId) {
    const updatedAsset = findCustomerAsset(assetId);
    syncOrdersAfterCustomerChange({
      assetId,
      assetName: updatedAsset?.assetName || payload.asset_name || "",
      assetMatchName: previousAsset?.assetName || "",
    });
  }
  customerState.assetEditorMode = "edit";
  customerState.notice = assetId ? "선박 정보가 변경되었습니다." : "선박이 추가되었습니다.";
  form.reset();
  renderCustomerWorkspace();
}

async function handleCreateEquipment(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  const assetId = payload.asset_id;
  const equipmentId = payload.equipment_id;
  const previousEquipment = equipmentId ? findCustomerEquipment(equipmentId).equipment : null;
  delete payload.asset_id;
  delete payload.equipment_id;
  const result = equipmentId
    ? await window.erpClient.updateAssetEquipment(equipmentId, payload)
    : await window.erpClient.addAssetEquipment(assetId, payload);
  customerState.selectedCustomer = result.data;
  customerState.selectedAssetId = assetId;
  customerState.selectedEquipmentId = equipmentId || null;
  if (equipmentId) {
    const { equipment: updatedEquipment } = findCustomerEquipment(equipmentId);
    syncOrdersAfterCustomerChange({
      equipmentId,
      equipmentName: updatedEquipment?.equipmentName || payload.equipment_name || "",
      equipmentMatchName: previousEquipment?.equipmentName || "",
    });
  }
  customerState.equipmentEditorMode = "create";
  customerState.notice = equipmentId ? "장비 정보가 변경되었습니다." : "장비가 추가되었습니다.";
  form.reset();
  renderCustomerWorkspace();
}

async function handleDeleteCustomerAsset(assetId) {
  const asset = findCustomerAsset(assetId);
  if (orderReferencesAsset(assetId, asset?.assetName || "")) {
    await showAppMessage("해당 선박에 연결된 주문이 있어 삭제할 수 없습니다.");
    return;
  }
  if (!assetId || !(await requestAppConfirm("이 선박을 삭제할까요? 연결된 장비도 함께 삭제됩니다."))) {
    return;
  }

  const result = await window.erpClient.deleteCustomerAsset(assetId);
  customerState.selectedCustomer = result.data;
  customerState.selectedAssetId = result.data.assets[0]?.id || null;
  customerState.selectedEquipmentId = null;
  customerState.assetEditorMode = "edit";
  customerState.equipmentEditorMode = "create";
  customerState.notice = "선박이 삭제되었습니다.";
  renderCustomerWorkspace();
}

async function handleDeleteAssetEquipment(equipmentId) {
  const { equipment } = findCustomerEquipment(equipmentId);
  if (orderReferencesEquipment(equipmentId, equipment?.equipmentName || "")) {
    await showAppMessage("해당 장비에 연결된 주문이 있어 삭제할 수 없습니다.");
    return;
  }
  if (!equipmentId || !(await requestAppConfirm("이 장비를 삭제할까요?"))) {
    return;
  }

  const result = await window.erpClient.deleteAssetEquipment(equipmentId);
  customerState.selectedCustomer = result.data;
  const selectedAsset = getSelectedAsset(result.data);
  customerState.selectedAssetId = selectedAsset?.id || null;
  customerState.selectedEquipmentId = null;
  customerState.equipmentEditorMode = "create";
  customerState.notice = "장비가 삭제되었습니다.";
  renderCustomerWorkspace();
}

function syncCustomerReferencesAfterMerge({ keepCustomerId, keepCustomerName, mergedCustomerIds, mergedCustomerNames }) {
  if (typeof orderState !== "undefined") {
    orderState.orders = orderState.orders.map((order) => {
      const matched = mergedCustomerIds.includes(order.customerId || "") || mergedCustomerNames.includes(order.customer || "") || mergedCustomerNames.includes(order.shipOwner || "");
      return matched
        ? {
            ...order,
            customerId: keepCustomerId,
            customer: keepCustomerName,
            shipOwner: keepCustomerName,
          }
        : order;
    });
  }

  if (typeof projectState !== "undefined") {
    projectState.projects = projectState.projects.map((project) => (mergedCustomerNames.includes(project.customer || "") ? { ...project, customer: keepCustomerName } : project));
  }

  if (typeof invoiceState !== "undefined") {
    invoiceState.invoices = invoiceState.invoices.map((invoice) => (mergedCustomerNames.includes(invoice.customer || "") ? { ...invoice, customer: keepCustomerName } : invoice));
  }
}

async function mergeCustomersMockService({ keepCustomerId, mergeCustomerIds }) {
  const keepCustomer = customerListItemById(keepCustomerId);
  const mergedCustomers = mergeCustomerIds.map((id) => customerListItemById(id)).filter(Boolean);
  const mergedCustomerIds = mergedCustomers.map((customer) => customer.id);
  const mergedCustomerNames = mergedCustomers.map((customer) => customer.customerName).filter(Boolean);
  const keepCustomerName = keepCustomer?.customerName || keepCustomerId;

  syncCustomerReferencesAfterMerge({
    keepCustomerId,
    keepCustomerName,
    mergedCustomerIds,
    mergedCustomerNames,
  });

  customerState.mergeHistory = [
    {
      mergedAt: new Date().toISOString(),
      user: dashboardState.session?.data?.user?.username || dashboardState.session?.data?.user?.displayName || "시연 사용자",
      keepCustomerId,
      keepCustomerName,
      mergedCustomerIds,
      mergedCustomerNames,
    },
    ...(customerState.mergeHistory || []),
  ];

  customerState.list = customerState.list.filter((customer) => !mergedCustomerIds.includes(customer.id));
  customerState.multiSelectedCustomerIds = [];
  customerState.selectedCustomerId = keepCustomerId;
  customerState.notice = `${mergedCustomerNames.length}개 회사를 ${keepCustomerName}(으)로 합쳤습니다. 서버 병합 API 연결 전까지 현재 화면 상태에 mock 반영됩니다.`;
  if (customerState.selectedCustomer?.customer?.id && mergedCustomerIds.includes(customerState.selectedCustomer.customer.id)) {
    customerState.selectedCustomer = null;
  }
}

async function handleMergeSelectedCustomers() {
  const selectedIds = (customerState.multiSelectedCustomerIds || []).filter((id) => customerListItemById(id));
  if (selectedIds.length < 2) {
    await showAppMessage("2개 이상 선택해야 합칠 수 있습니다.");
    return;
  }

  const keepCustomerId = await showCustomerMergeDialog(selectedIds);
  if (!keepCustomerId) {
    return;
  }

  const mergeCustomerIds = selectedIds.filter((id) => id !== keepCustomerId);
  await mergeCustomersMockService({ keepCustomerId, mergeCustomerIds });
  try {
    await loadCustomerDetail(keepCustomerId, customerState.notice);
  } catch {
    renderCustomerWorkspace();
  }
}

async function handleCreateMasterDataRequest(field, action, value, nextValue = "") {
  const reason = await requestAppPrompt("관리자에게 보낼 요청 사유 입력", "", "마스터 변경 요청");
  if (reason === null) {
    return;
  }

  await window.erpClient.createMasterDataRequest({
    field,
    action,
    value,
    next_value: nextValue,
    reason,
  });
  customerState.notice = "관리자에게 마스터 항목 변경 요청을 보냈습니다.";
  renderCustomerWorkspace();
}

async function handleDeleteEquipmentMasterOption(fieldName, value) {
  const usage = findEquipmentMasterUsage(fieldName, value);
  const options = equipmentMasterOptionsForField(fieldName, value);
  const result = await showEquipmentMasterReplaceDialog({ fieldName, value, usage, options });
  if (!result) {
    return;
  }

  if (usage.length) {
    addEquipmentMasterValue(fieldName, result.nextValue);
    await replaceEquipmentMasterValue(fieldName, value, result.nextValue);
  }

  deleteEquipmentMasterValue(fieldName, value);
  customerState.notice = usage.length
    ? `${customerMasterFieldLabel(fieldName)} "${value}" 항목을 "${result.nextValue}"(으)로 일괄 변경 후 삭제했습니다.`
    : `${customerMasterFieldLabel(fieldName)} "${value}" 항목을 삭제했습니다.`;
  renderCustomerWorkspace();
}

async function handleCreateEngineModel(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  await window.erpClient.createEngineModel(payload);
  customerState.notice = "엔진 마스터가 추가되었습니다.";
  form.reset();
  await refreshCustomerWorkspace({ notice: customerState.notice });
}

async function handleCreateGearboxModel(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  await window.erpClient.createGearboxModel(payload);
  customerState.notice = "감속기 마스터가 추가되었습니다.";
  form.reset();
  await refreshCustomerWorkspace({ notice: customerState.notice });
}

window.erpClient.onUpdateStatus((payload) => {
  const kind = payload.status === "CHECK_FAILED" ? "warn" : "info";
  setMessage(updateStatus, kind, payload.message);
  latestManualDownloadUrl = payload.downloadUrl || "";
  openUpdateDownloadButton?.classList.toggle("hidden", !latestManualDownloadUrl);
});

openUpdateDownloadButton?.addEventListener("click", async () => {
  if (latestManualDownloadUrl) {
    await window.erpClient.openUpdateDownload(latestManualDownloadUrl);
  }
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
      accessScope: result.data.session_context?.access_scope || result.data.access_scope || dashboardState.preferences?.accessScope,
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

window.addEventListener("keydown", async (event) => {
  if (event.key === "Escape" && (customerState.contextMenu.visible || customerState.inlineEdit.fieldKey)) {
    closeCustomerContextMenu();
    if (customerState.inlineEdit.fieldKey) {
      resetCustomerInlineEdit();
    }
    renderCustomerWorkspace();
    return;
  }

  if (event.key !== "F5") {
    return;
  }

  event.preventDefault();

  if (screens.dashboard.classList.contains("active")) {
    await refreshSession();
    setMessage(updateStatus, "info", "F5로 현재 세션과 화면을 새로고침했습니다.");
    return;
  }

  if (screens.login.classList.contains("active")) {
    await loadAppVersion();
    await loadPreferences();
    setMessage(loginFeedback, "info", "F5로 로그인 화면 정보를 새로고침했습니다.");
  }
});

dashboardTabs.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-dashboard-tab]");
  if (!target) {
    return;
  }

  if (!(await confirmCustomerInlineEditBeforeLeave())) {
    return;
  }

  openWorkspaceTab(target.dataset.dashboardTab);
  renderDashboardTabs();
  renderActiveTab();
});

workspaceTabs.addEventListener("click", async (event) => {
  const closeButton = event.target.closest("[data-workspace-tab-close]");
  if (closeButton) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return;
    }
    const key = closeButton.dataset.workspaceTabClose;
    dashboardState.openTabs = dashboardState.openTabs.filter((item) => item !== key);
    if (dashboardState.activeTab === key) {
      dashboardState.activeTab = dashboardState.openTabs[dashboardState.openTabs.length - 1] || "";
    }
    renderDashboardTabs();
    renderActiveTab();
    return;
  }

  const target = event.target.closest("[data-workspace-tab]");
  if (!target) {
    return;
  }

  if (!(await confirmCustomerInlineEditBeforeLeave())) {
    return;
  }

  dashboardState.activeTab = target.dataset.workspaceTab;
  renderDashboardTabs();
  renderActiveTab();
});

dashboardMainPane.addEventListener("click", async (event) => {
  const assetSubtabButton = event.target.closest("[data-asset-subtab]");
  if (assetSubtabButton) {
    assetState.subtab = assetSubtabButton.dataset.assetSubtab || "dashboard";
    renderAssetWorkspace();
    return;
  }

  const assetCreateButton = event.target.closest("[data-asset-create]");
  if (assetCreateButton) {
    await openAssetEditor(assetCreateButton.dataset.assetCreate || "physical");
    return;
  }

  const assetFilterToggle = event.target.closest("[data-asset-filter-toggle]");
  if (assetFilterToggle) {
    const filterKey = assetFilterToggle.dataset.assetFilterToggle || "";
    const current = assetState.physicalFilters || {};
    assetState.physicalFilters = {
      ...current,
      openFilter: current.openFilter === filterKey ? "" : filterKey,
    };
    renderAssetWorkspace();
    return;
  }

  const assetFilterOption = event.target.closest("[data-asset-filter-set]");
  if (assetFilterOption) {
    const key = assetFilterOption.dataset.assetFilterSet || "";
    assetState.physicalFilters = {
      ...assetState.physicalFilters,
      [key]: assetFilterOption.dataset.assetFilterValue || "",
      openFilter: "",
    };
    renderAssetWorkspace();
    return;
  }

  const assetFilterClear = event.target.closest("[data-asset-filter-clear]");
  if (assetFilterClear) {
    const key = assetFilterClear.dataset.assetFilterClear || "";
    const nextFilters = { ...assetState.physicalFilters, openFilter: "" };
    if (key === "purpose") {
      nextFilters.purpose = "";
    } else if (key === "audit") {
      nextFilters.state = "";
    } else {
      nextFilters.query = "";
    }
    assetState.physicalFilters = nextFilters;
    renderAssetWorkspace();
    return;
  }

  const assetSortButton = event.target.closest("[data-asset-sort]");
  if (assetSortButton) {
    const sortKey = assetSortButton.dataset.assetSort || "updated_at";
    const current = assetState.physicalFilters || {};
    assetState.physicalFilters = {
      ...current,
      sortKey,
      sortDirection: current.sortKey === sortKey && current.sortDirection !== "asc" ? "asc" : "desc",
      openFilter: "",
    };
    renderAssetWorkspace();
    return;
  }

  const assetResetButton = event.target.closest("[data-asset-physical-reset]");
  if (assetResetButton) {
    assetState.physicalFilters = {
      query: "",
      purpose: "",
      state: "",
      sortKey: "updated_at",
      sortDirection: "desc",
      openFilter: "",
    };
    renderAssetWorkspace();
    return;
  }

  if (assetState.physicalFilters?.openFilter && !event.target.closest("[data-asset-filter-popover]")) {
    assetState.physicalFilters = {
      ...assetState.physicalFilters,
      openFilter: "",
    };
    renderAssetWorkspace();
    return;
  }

  if (await handleInventoryClick(event)) {
    return;
  }

  if (await handleProjectClick(event)) {
    return;
  }

  if (await handleInvoiceClick(event)) {
    return;
  }

  if (await handleOrderClick(event)) {
    return;
  }

  const customerContextMergeButton = event.target.closest("[data-customer-context-action='merge']");
  if (customerContextMergeButton) {
    closeCustomerContextMenu();
    renderCustomerWorkspace();
    await handleMergeSelectedCustomers();
    return;
  }

  const customerContextAssetDeleteButton = event.target.closest("[data-customer-context-action='asset-delete']");
  if (customerContextAssetDeleteButton) {
    const assetId = customerState.contextMenu.entityId || "";
    closeCustomerContextMenu();
    renderCustomerWorkspace();
    await handleDeleteCustomerAsset(assetId);
    return;
  }

  const customerContextEquipmentDeleteButton = event.target.closest("[data-customer-context-action='equipment-delete']");
  if (customerContextEquipmentDeleteButton) {
    const equipmentId = customerState.contextMenu.entityId || "";
    closeCustomerContextMenu();
    renderCustomerWorkspace();
    await handleDeleteAssetEquipment(equipmentId);
    return;
  }

  const customerContextMasterDeleteButton = event.target.closest("[data-customer-context-action='master-delete']");
  if (customerContextMasterDeleteButton) {
    const fieldName = customerState.contextMenu.fieldKey || "";
    const value = customerState.contextMenu.entityId || "";
    closeCustomerContextMenu();
    renderCustomerWorkspace();
    await handleDeleteEquipmentMasterOption(fieldName, value);
    return;
  }

  const customerContextEditButton = event.target.closest("[data-customer-context-action='edit']");
  if (customerContextEditButton) {
    const entityType = customerState.contextMenu.entityType || "customer";
    const entityId = customerState.contextMenu.entityId || customerState.selectedCustomerId || "";
    const fieldKey = customerState.contextMenu.fieldKey;
    const editRoot = customerWorkspace.querySelector(
      `[data-customer-edit-entity="${CSS.escape(entityType)}"][data-customer-edit-id="${CSS.escape(entityId)}"][data-customer-edit-field="${CSS.escape(fieldKey)}"]`,
    );
    const valueField = editRoot?.querySelector("input, textarea, select");
    customerState.inlineEdit = {
      entityType,
      entityId,
      fieldKey,
      value: valueField?.value || "",
    };
    closeCustomerContextMenu();
    renderCustomerWorkspace();
    return;
  }

  const customerInlineSaveButton = event.target.closest("[data-customer-inline-save]");
  if (customerInlineSaveButton) {
    await handleSaveCustomerInlineEdit();
    return;
  }

  const customerInlineCancelButton = event.target.closest("[data-customer-inline-cancel]");
  if (customerInlineCancelButton) {
    resetCustomerInlineEdit();
    closeCustomerContextMenu();
    renderCustomerWorkspace();
    return;
  }

  if (customerState.contextMenu.visible && !event.target.closest(".customer-edit-context-menu")) {
    closeCustomerContextMenu();
    renderCustomerWorkspace();
    return;
  }

  const selectButton = event.target.closest("[data-customer-select]");
  if (selectButton) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      toggleCustomerMultiSelection(selectButton.dataset.customerSelect || "");
      closeCustomerContextMenu();
      renderCustomerWorkspace();
      return;
    }
    customerState.multiSelectedCustomerIds = [];
    resetCustomerInlineEdit();
    closeCustomerContextMenu();
    await loadCustomerDetail(selectButton.dataset.customerSelect, "고객 상세를 불러왔습니다.");
    return;
  }

  const createOpenButton = event.target.closest("[data-customer-create-open]");
  if (createOpenButton) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return;
    }
    readCustomerCreateDraft();
    setCustomerView("create");
    customerState.detailTab = "overview";
    customerState.notice = "신규 업체 등록 화면입니다.";
    renderCustomerWorkspace();
    return;
  }

  const createCancelButton = event.target.closest("[data-customer-create-cancel]");
  if (createCancelButton) {
    customerState.createDraft = {};
    customerState.uploadedFile = null;
    setCustomerView("detail");
    customerState.notice = "신규 등록을 취소했습니다.";
    renderCustomerWorkspace();
    return;
  }

  const createSaveButton = event.target.closest("[data-customer-create-save]");
  if (createSaveButton) {
    const form = document.getElementById("customer-create-form");
    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
      return;
    }
    customerState.notice = "기본 탭에서 저장할 수 있습니다.";
    customerState.detailTab = "overview";
    renderCustomerWorkspace();
    return;
  }

  const detailOpenButton = event.target.closest("[data-customer-detail-open]");
  if (detailOpenButton) {
    setCustomerView("detail");
    customerState.notice = "선택 업체 상세 화면입니다.";
    renderCustomerWorkspace();
    return;
  }

  const licensePickButton = event.target.closest("[data-customer-license-pick]");
  if (licensePickButton) {
    try {
      await handleSelectBusinessLicenseFile();
    } catch (error) {
      customerState.notice = error.message || "사업자등록증 파일을 읽지 못했습니다.";
      renderCustomerWorkspace();
    }
    return;
  }

  const detailTabButton = event.target.closest("[data-customer-detail-tab]");
  if (detailTabButton) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return;
    }
    resetCustomerInlineEdit();
    closeCustomerContextMenu();
    customerState.detailTab = detailTabButton.dataset.customerDetailTab || "overview";
    if (customerState.detailTab === "assets") {
      syncCustomerAssetEquipmentSelection(customerState.selectedCustomer, { selectFirstEquipment: true });
    }
    renderCustomerWorkspace();
    return;
  }

  const customerSortButton = event.target.closest("[data-customer-sort-scope][data-customer-sort-key]");
  if (customerSortButton && customerWorkspace.contains(customerSortButton)) {
    const scope = customerSortButton.dataset.customerSortScope || "";
    const key = customerSortButton.dataset.customerSortKey || "";
    if (scope === "asset") {
      customerState.assetSort = {
        key,
        direction: customerState.assetSort?.key === key && customerState.assetSort.direction === "asc" ? "desc" : "asc",
      };
    } else if (scope === "equipment") {
      customerState.equipmentSort = {
        key,
        direction: customerState.equipmentSort?.key === key && customerState.equipmentSort.direction === "asc" ? "desc" : "asc",
      };
    }
    renderCustomerWorkspace();
    return;
  }

  if (event.target.closest(".customer-editable-cell.editing")) {
    return;
  }

  const assetSelectButton = event.target.closest("[data-customer-asset-select]");
  if (assetSelectButton) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return;
    }
    customerState.selectedAssetId = assetSelectButton.dataset.customerAssetSelect || null;
    syncCustomerAssetEquipmentSelection(customerState.selectedCustomer, { selectFirstEquipment: true });
    customerState.assetEditorMode = "edit";
    renderCustomerWorkspace();
    return;
  }

  const assetNewButton = event.target.closest("[data-customer-asset-new]");
  if (assetNewButton) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return;
    }
    customerState.assetEditorMode = "create";
    customerState.selectedEquipmentId = null;
    renderCustomerWorkspace();
    return;
  }

  const equipmentSelectButton = event.target.closest("[data-customer-equipment-select]");
  if (equipmentSelectButton) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return;
    }
    customerState.selectedEquipmentId = equipmentSelectButton.dataset.customerEquipmentSelect || null;
    customerState.equipmentEditorMode = "edit";
    renderCustomerWorkspace();
    return;
  }

  const equipmentNewButton = event.target.closest("[data-customer-equipment-new]");
  if (equipmentNewButton) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return;
    }
    customerState.selectedEquipmentId = null;
    customerState.equipmentEditorMode = "create";
    renderCustomerWorkspace();
    return;
  }

  const refreshButton = event.target.closest("[data-customer-refresh]");
  if (refreshButton) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return;
    }
    await refreshCustomerWorkspace({ notice: "고객 목록을 새로고침했습니다." });
    return;
  }
});

dashboardMainPane.addEventListener("mousedown", (event) => {
  const handle = event.target.closest("[data-asset-column-resize]");
  if (!handle) {
    return;
  }
  event.preventDefault();
  const columnKey = handle.dataset.assetColumnResize || "";
  const widths = getAssetPhysicalColumnWidths();
  assetColumnResizeState = {
    key: columnKey,
    startX: event.clientX,
    startWidth: widths[columnKey] || 120,
  };
});

dashboardMainPane.addEventListener("dblclick", async (event) => {
  const assetRecordRow = event.target.closest("[data-asset-record-type][data-asset-record-id]");
  if (assetRecordRow) {
    await openAssetEditor(
      assetRecordRow.dataset.assetRecordType || "physical",
      assetRecordRow.dataset.assetRecordId || "",
    );
    return;
  }

  if (await handleProjectDoubleClick(event)) {
    return;
  }
  await handleOrderDoubleClick(event);
});

dashboardMainPane.addEventListener("keydown", async (event) => {
  if (await handleOrderKeydown(event)) {
    event.preventDefault();
    event.stopPropagation();
  }
});

window.addEventListener("resize", () => {
  if (dashboardState.activeTab === "orders" && typeof positionOrderLookupMenus === "function") {
    positionOrderLookupMenus();
  }
});

window.addEventListener("mousemove", (event) => {
  if (inventoryPaneResizeState) {
    const nextWidth = Math.max(420, inventoryPaneResizeState.startWidth + (event.clientX - inventoryPaneResizeState.startX));
    setInventoryPaneWidth(nextWidth);
    if (dashboardState.activeTab === "inventory") {
      renderInventoryWorkspace();
    }
    return;
  }
  if (!assetColumnResizeState) {
    return;
  }
  const nextWidth = Math.max(80, assetColumnResizeState.startWidth + (event.clientX - assetColumnResizeState.startX));
  const current = getAssetPhysicalColumnWidths();
  dashboardState.preferences = {
    ...dashboardState.preferences,
    assetPhysicalColumnWidths: {
      ...current,
      [assetColumnResizeState.key]: nextWidth,
    },
  };
  if (dashboardState.activeTab === "assets" && assetState.subtab === "physical") {
    renderAssetWorkspace();
  }
});

window.addEventListener("mouseup", async () => {
  if (inventoryPaneResizeState) {
    inventoryPaneResizeState = null;
    return;
  }
  if (!assetColumnResizeState) {
    return;
  }
  const widths = dashboardState.preferences?.assetPhysicalColumnWidths || getAssetPhysicalColumnWidths();
  assetColumnResizeState = null;
  try {
    await saveDashboardPreference(
      { assetPhysicalColumnWidths: widths },
      "실물 자산 목록 너비를 개인화 설정으로 저장했습니다.",
    );
  } catch {
    renderActiveTab();
  }
});

dashboardMainPane.addEventListener(
  "wheel",
  (event) => {
    handleOrderWheel(event);
  },
  { passive: false },
);

dashboardMainPane.addEventListener(
  "scroll",
  (event) => {
    if (dashboardState.activeTab === "orders" && event.target instanceof HTMLElement && event.target.closest(".order-detail-scroll") && typeof positionOrderLookupMenus === "function") {
      positionOrderLookupMenus();
    }
  },
  true,
);

dashboardMainPane.addEventListener("contextmenu", (event) => {
  if (handleProjectContextMenu(event)) {
    return;
  }

  if (handleOrderContextMenu(event)) {
    return;
  }

  const customerListRow = event.target.closest("[data-customer-select]");
  if (customerListRow && customerWorkspace.contains(customerListRow)) {
    const customerId = customerListRow.dataset.customerSelect || "";
    if ((customerState.multiSelectedCustomerIds || []).length >= 2 && customerState.multiSelectedCustomerIds.includes(customerId)) {
      event.preventDefault();
      customerState.contextMenu = {
        visible: true,
        x: Math.max(8, event.clientX),
        y: Math.max(8, event.clientY),
        actionType: "merge",
        entityType: "customer",
        entityId: customerId,
        fieldKey: "",
        fieldLabel: "",
      };
      renderCustomerWorkspace();
      return;
    }
  }

  const assetRow = event.target.closest("[data-customer-asset-select]");
  if (assetRow && customerWorkspace.contains(assetRow) && customerState.detailTab === "assets") {
    event.preventDefault();
    customerState.contextMenu = {
      visible: true,
      x: Math.max(8, event.clientX),
      y: Math.max(8, event.clientY),
      actionType: "asset-delete",
      entityType: "asset",
      entityId: assetRow.dataset.customerAssetSelect || "",
      fieldKey: "",
      fieldLabel: "",
    };
    renderCustomerWorkspace();
    return;
  }

  const equipmentRow = event.target.closest("[data-customer-equipment-select]");
  if (equipmentRow && customerWorkspace.contains(equipmentRow) && customerState.detailTab === "assets") {
    event.preventDefault();
    customerState.contextMenu = {
      visible: true,
      x: Math.max(8, event.clientX),
      y: Math.max(8, event.clientY),
      actionType: "equipment-delete",
      entityType: "equipment",
      entityId: equipmentRow.dataset.customerEquipmentSelect || "",
      fieldKey: "",
      fieldLabel: "",
    };
    renderCustomerWorkspace();
    return;
  }

  const editTarget = event.target.closest("[data-customer-edit-field]");
  if (
    !editTarget ||
    !customerWorkspace.contains(editTarget) ||
    customerState.view === "create" ||
    !customerState.selectedCustomerId
  ) {
    return;
  }

  event.preventDefault();
  const fieldKey = editTarget.dataset.customerEditField || "";
  const entityType = editTarget.dataset.customerEditEntity || "customer";
  const entityId = editTarget.dataset.customerEditId || customerState.selectedCustomerId || "";
  const fieldLabel = editTarget.dataset.customerEditLabel || customerEditFieldDefinition(entityType, fieldKey)?.label || "필드";
  if (!customerEditFieldDefinition(entityType, fieldKey)) {
    return;
  }

  if (
    customerState.inlineEdit.fieldKey &&
    (customerState.inlineEdit.fieldKey !== fieldKey || customerState.inlineEdit.entityType !== entityType || customerState.inlineEdit.entityId !== entityId)
  ) {
    closeCustomerContextMenu();
    customerState.notice = "수정 중입니다. 저장 또는 취소 후 다른 필드를 수정하세요.";
    renderCustomerWorkspace();
    return;
  }

  customerState.contextMenu = {
    visible: true,
    x: Math.max(8, event.clientX),
    y: Math.max(8, event.clientY),
    actionType: "edit",
    entityType,
    entityId,
    fieldKey,
    fieldLabel,
  };
  renderCustomerWorkspace();
});

dashboardMainPane.addEventListener("mousedown", (event) => {
  if (handleProjectMouseDown(event)) {
    return;
  }
  if (handleInventoryMouseDown(event)) {
    return;
  }
  handleOrderMouseDown(event);
});

dashboardMainPane.addEventListener("dragstart", (event) => {
  if (handleProjectDragStart(event)) {
    return;
  }
  handleOrderDragStart(event);
});

dashboardMainPane.addEventListener("dragover", (event) => {
  if (handleProjectDragOver(event)) {
    return;
  }
  handleOrderDragOver(event);
});

dashboardMainPane.addEventListener("drop", (event) => {
  if (handleProjectDrop(event)) {
    return;
  }
  handleOrderDrop(event);
});

dashboardMainPane.addEventListener("dragend", () => {
  handleProjectDragEnd();
  handleOrderDragEnd();
});

dashboardMainPane.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  event.preventDefault();

  if (await handleProjectFormSubmit(form)) {
    return;
  }

  if (await handleOrderFormSubmit(form)) {
    return;
  }

  if (await handleInvoiceFormSubmit(form)) {
    return;
  }

  try {
  if (form.id === "customer-search-form") {
      const formData = Object.fromEntries(new FormData(form).entries());
      const searchText = String(formData.search || "").trim();
      if (!(await confirmCustomerInlineEditBeforeLeave())) {
        return;
      }
      if (customerState.view === "create") {
        readCustomerCreateDraft();
        customerState.search = searchText;
        customerState.notice = "신규 입력 중입니다. 저장 또는 등록 취소 후 검색하세요.";
        renderCustomerWorkspace();
        return;
      }
      await refreshCustomerWorkspace({
        search: searchText,
        notice: searchText ? "검색 결과입니다. 업체를 선택하면 상세를 불러옵니다." : "등록된 전체 업체 목록입니다.",
        selectFirst: false,
        deferDetail: true,
      });
      return;
    }

    if (form.id === "customer-file-form") {
      await handleUploadFile(form);
      return;
    }

    if (form.id === "customer-create-form") {
      await handleCreateCustomer(form);
      return;
    }

    if (form.id === "customer-contact-form") {
      await handleCreateContact(form);
      return;
    }

    if (form.id === "customer-memo-form") {
      await handleUpdateCustomerMemo(form);
      return;
    }

    if (form.id === "customer-address-form") {
      await handleCreateAddress(form);
      return;
    }

    if (form.id === "customer-asset-form") {
      await handleCreateAsset(form);
      return;
    }

    if (form.id === "customer-equipment-form") {
      await handleCreateEquipment(form);
      return;
    }

    if (form.id === "engine-model-form") {
      await handleCreateEngineModel(form);
      return;
    }

    if (form.id === "gearbox-model-form") {
      await handleCreateGearboxModel(form);
    }
  } catch (error) {
    customerState.notice = error.message || "고객관리 작업을 처리하지 못했습니다.";
    renderCustomerWorkspace();
  }

  if (form.matches("[data-inventory-filter-form]")) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    inventoryState.filters = {
      startDate: String(data.start_date || inventoryState.filters.startDate || ""),
      endDate: String(data.end_date || inventoryState.filters.endDate || ""),
      status: String(data.status || ""),
      category: String(data.category || ""),
      supplier: String(data.supplier || ""),
      query: String(data.query || ""),
    };
    renderInventoryWorkspace();
    return;
  }
});

dashboardMainPane.addEventListener("input", (event) => {
  const knowledgeSearch = event.target.closest("[data-asset-knowledge-search]");
  if (knowledgeSearch) {
    assetState.knowledgeSearch = knowledgeSearch.value || "";
    renderAssetWorkspace();
    const queryInput = dashboardMainPane.querySelector("[data-asset-knowledge-search]");
    if (queryInput instanceof HTMLInputElement) {
      queryInput.focus();
      queryInput.setSelectionRange(queryInput.value.length, queryInput.value.length);
    }
    return;
  }

  const knowledgeTagSearch = event.target.closest("[data-asset-knowledge-tag-search]");
  if (knowledgeTagSearch) {
    assetState.knowledgeTagSearch = knowledgeTagSearch.value || "";
    renderAssetWorkspace();
    const queryInput = dashboardMainPane.querySelector("[data-asset-knowledge-tag-search]");
    if (queryInput instanceof HTMLInputElement) {
      queryInput.focus();
      queryInput.setSelectionRange(queryInput.value.length, queryInput.value.length);
    }
    return;
  }

  const assetFilter = event.target.closest("[data-asset-physical-filter]");
  if (assetFilter) {
    const key = assetFilter.dataset.assetPhysicalFilter || "";
    assetState.physicalFilters = {
      ...assetState.physicalFilters,
      [key]: assetFilter.value || "",
    };
    renderAssetWorkspace();
    if (key === "query") {
      const queryInput = dashboardMainPane.querySelector('[data-asset-physical-filter="query"]');
      if (queryInput instanceof HTMLInputElement) {
        queryInput.focus();
        queryInput.setSelectionRange(queryInput.value.length, queryInput.value.length);
      }
    }
    return;
  }

  if (handleProjectInput(event)) {
    return;
  }

  if (handleOrderInput(event)) {
    return;
  }
});

dashboardMainPane.addEventListener("change", (event) => {
  const assetFilter = event.target.closest("[data-asset-physical-filter]");
  if (assetFilter) {
    const key = assetFilter.dataset.assetPhysicalFilter || "";
    assetState.physicalFilters = {
      ...assetState.physicalFilters,
      [key]: assetFilter.value || "",
    };
    renderAssetWorkspace();
    return;
  }

  if (handleProjectChange(event)) {
    return;
  }

  if (handleOrderChange(event)) {
    return;
  }
});

dashboardMainPane.addEventListener("change", async (event) => {
  const manufacturerSelect = event.target.closest('select[name="manufacturer"]');
  if (manufacturerSelect instanceof HTMLSelectElement && manufacturerSelect.value !== "__add_new__") {
    const form = manufacturerSelect.closest("#customer-equipment-form");
    const modelSelect = form?.querySelector('select[name="model_name"]');
    if (modelSelect instanceof HTMLSelectElement) {
      const values = equipmentModelOptionsFor(customerState.selectedCustomer, manufacturerSelect.value);
      modelSelect.innerHTML = `<option value="" selected>모델명</option>${customerSelectOptions(values)}<option value="__add_new__">새 항목 추가</option>`;
      modelSelect.dataset.currentValue = "";
    }
  }

  const select = event.target.closest('select[data-master-field]');
  if (!(select instanceof HTMLSelectElement) || select.value !== "__add_new__") {
    if (select instanceof HTMLSelectElement) {
      select.dataset.currentValue = select.value || "";
    }
    return;
  }

  const fieldName = select.dataset.masterField || select.name || "";
  const titleMap = {
    equipment_type: "장비 분류 추가",
    equipment_unit: "호기/장비명 추가",
    manufacturer: "제조사 추가",
    model_name: "모델명 추가",
  };
  const labelMap = {
    equipment_type: "새 장비 분류 입력",
    equipment_unit: "새 호기/장비명 입력",
    manufacturer: "새 제조사 입력",
    model_name: "새 모델명 입력",
  };
  const fallbackValue = select.dataset.currentValue || (fieldName === "equipment_type" ? "MAIN_ENGINE" : "");
  const nextValue = await requestAppPrompt(labelMap[fieldName] || "새 항목 입력", "", titleMap[fieldName] || "마스터 항목 추가");
  const normalizedValue = String(nextValue || "").trim();
  if (!normalizedValue) {
    select.value = fallbackValue;
    return;
  }

  const existingValue = equipmentMasterOptionsForField(fieldName).find((item) => item.toLowerCase() === normalizedValue.toLowerCase());
  if (existingValue) {
    select.value = existingValue;
    select.dataset.currentValue = existingValue;
    return;
  }

  addEquipmentMasterValue(fieldName, normalizedValue);

  const option = document.createElement("option");
  option.value = normalizedValue;
  option.textContent = normalizedValue;
  option.selected = true;
  select.insertBefore(option, select.querySelector('option[value="__add_new__"]'));
  select.value = normalizedValue;
  select.dataset.currentValue = normalizedValue;

  if (fieldName === "manufacturer") {
    const form = select.closest("#customer-equipment-form");
    const modelSelect = form?.querySelector('select[name="model_name"]');
    if (modelSelect instanceof HTMLSelectElement) {
      modelSelect.innerHTML = '<option value="" selected>모델명</option><option value="__add_new__">새 항목 추가</option>';
      modelSelect.dataset.currentValue = "";
    }
  }
});

dashboardMainPane.addEventListener("mousedown", (event) => {
  if (event.button !== 2) {
    return;
  }
  const field = event.target.closest("[data-master-field]");
  if (field) {
    openCustomerMasterDeleteContextMenu(field, event);
  }
});

dashboardMainPane.addEventListener("contextmenu", async (event) => {
  const field = event.target.closest("[data-master-field]");
  if (field) {
    openCustomerMasterDeleteContextMenu(field, event);
  }
});

dashboardMainPane.addEventListener("input", (event) => {
  const form = event.target.closest("#customer-create-form");
  if (form instanceof HTMLFormElement) {
    customerState.createDraft = Object.fromEntries(new FormData(form).entries());
  }
});

dashboardMainPane.addEventListener("change", (event) => {
  const form = event.target.closest("#customer-create-form");
  if (form instanceof HTMLFormElement) {
    customerState.createDraft = Object.fromEntries(new FormData(form).entries());
  }
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

settingsDefaultTab.addEventListener("change", async () => {
  await saveDashboardPreference(
    { defaultDashboardTab: settingsDefaultTab.value || "orders" },
    "로그인 후 기본 탭을 저장했습니다.",
  );
});

settingsDensity.addEventListener("change", async () => {
  await saveDashboardPreference(
    { dashboardDensity: settingsDensity.value || "COMFORTABLE" },
    settingsDensity.value === "COMPACT" ? "촘촘한 목록 간격을 저장했습니다." : "기본 화면 간격을 저장했습니다.",
  );
});

for (const button of settingsScopeButtons) {
  button.addEventListener("click", async () => {
    const nextScope = button.dataset.scope || "AUTO";
    renderScopeToggle(nextScope);
    renderSettingsScopeToggle(nextScope);
    await saveDashboardPreference(
      { testAccessScope: nextScope },
      nextScope === "AUTO"
        ? "기본 접속 범위를 자동 판정으로 저장했습니다."
        : `${nextScope === "INTERNAL" ? "내부망" : "외부망"} 테스트값을 기본으로 저장했습니다.`,
    );
  });
}

settingsPasswordForm?.addEventListener("submit", handleSettingsPasswordChange);

window.addEventListener("DOMContentLoaded", async () => {
  await loadAppVersion();
  await loadPreferences();
  const autoLoggedIn = await attemptAutoLogin();
  if (!autoLoggedIn) {
    showScreen("login");
  }
  renderDashboardTabs();
  renderActiveTab();
});
