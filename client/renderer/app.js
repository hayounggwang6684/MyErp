const dashboardTabDefinitions = [
  { key: "customers", label: "고객관리", role: "CUSTOMER_MANAGE" },
  { key: "orders", label: "수주관리", roles: ["ORDER_MANAGE", "PARTS_SALES"] },
  { key: "work", label: "작업관리", role: "WORK_MANAGE" },
  { key: "inventory", label: "재고관리", role: "INVENTORY_VIEW" },
  { key: "staff", label: "직원관리", department: "관리부", role: "STAFF_VIEW" },
  { key: "settings", label: "설정" },
];

const dashboardContent = {
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
const dashboardSectionTitle = document.getElementById("dashboard-section-title");
const dashboardSectionCopy = document.getElementById("dashboard-section-copy");
const dashboardCards = document.getElementById("dashboard-cards");
const dashboardActions = document.getElementById("dashboard-actions");
const dashboardTableHead = document.getElementById("dashboard-table-head");
const dashboardTableBody = document.getElementById("dashboard-table-body");
const dashboardMainPane = document.getElementById("dashboard-main-pane");
const customerWorkspace = document.getElementById("customer-workspace");
const dashboardTablePanel = dashboardTableHead.closest(".dashboard-table-panel");
const settingsAutoLogin = document.getElementById("settings-auto-login");
const settingsShowUsername = document.getElementById("settings-show-username");
const settingsRememberedUsername = document.getElementById("settings-remembered-username");
const settingsCloudflareAccess = document.getElementById("settings-cloudflare-access");
const openUpdateDownloadButton = document.getElementById("open-update-download");
const settingsScopeButtons = Array.from(document.querySelectorAll(".settings-scope-button"));
const settingsFeedback = document.getElementById("settings-feedback");

let selectedTestScope = "AUTO";
let dashboardState = {
  activeTab: "orders",
  session: null,
  preferences: null,
  appInfo: null,
};
let latestManualDownloadUrl = "";

let customerState = {
  loaded: false,
  loading: false,
  submitting: false,
  search: "",
  list: [],
  selectedCustomerId: null,
  selectedCustomer: null,
  engineModels: [],
  gearboxModels: [],
  uploadedFile: null,
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
  const roles = dashboardState.session?.data?.roles || [];
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
  const exists = visibleTabs.some((tab) => tab.key === dashboardState.activeTab);
  if (!exists) {
    dashboardState.activeTab = visibleTabs.some((tab) => tab.key === "orders")
      ? "orders"
      : visibleTabs[0]?.key || "settings";
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
  setBadgeText(
    settingsCloudflareAccess,
    dashboardState.appInfo?.cloudflareAccessEnabled ? "활성" : "비활성",
    dashboardState.appInfo?.cloudflareAccessEnabled ? "ok" : "neutral",
  );
  setBadgeText(
    settingsUpdateMode,
    dashboardState.appInfo?.platform === "darwin" ? "수동 다운로드 설치" : "자동 다운로드 후 재시작",
    "neutral",
  );
  renderSettingsScopeToggle(preferences.testAccessScope || "AUTO");
}

function buildCustomerCards() {
  const totalCustomers = customerState.list.length;
  const selected = customerState.selectedCustomer;
  const contactCount = selected?.contacts?.length || 0;
  const assetCount = selected?.assets?.length || 0;
  const equipmentCount = selected?.assets?.reduce((count, asset) => count + asset.equipments.length, 0) || 0;

  return [
    { label: "조회 고객", value: String(totalCustomers), detail: customerState.search ? "검색 결과 기준" : "전체 고객 목록" },
    { label: "담당자", value: String(contactCount), detail: selected ? "선택 고객의 주소록" : "고객을 선택하세요" },
    { label: "자산", value: String(assetCount), detail: selected ? "선박 또는 운용 장비" : "선택 고객 기준" },
    { label: "탑재 장비", value: String(equipmentCount), detail: selected ? "엔진/감속기/기타 장비" : "선택 고객 기준" },
  ];
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return String(value).slice(0, 10);
}

function customerTypeLabel(value) {
  return value === "SHIP_OWNER" ? "선사" : "일반 고객";
}

function assetTypeLabel(value) {
  return value === "VESSEL" ? "선박" : "운용 장비";
}

function equipmentTypeLabel(value) {
  if (value === "ENGINE") {
    return "엔진";
  }
  if (value === "GEARBOX") {
    return "감속기";
  }
  return "기타";
}

function renderCustomerWorkspace() {
  const selected = customerState.selectedCustomer;
  const primaryAddress = selected?.addresses?.[0];
  const primaryContact = selected?.contacts?.[0];
  const customerItems = customerState.list
    .map(
      (customer, index) => `
        <button type="button" class="customer-list-row${customer.id === customerState.selectedCustomerId ? " active" : ""}" data-customer-select="${customer.id}">
          <span class="customer-row-index">${index + 1}</span>
          <span class="customer-row-company">${customer.customerName}</span>
          <span class="customer-row-owner">${customer.primaryContactName || customer.representativeName || "-"}</span>
        </button>
      `,
    )
    .join("");

  const extraction = selected?.latestExtraction;
  const files = selected?.files || [];
  const customerInfoRows = selected
    ? [
        ["업체번호", selected.customer.customerNo || "-"],
        ["업체명", selected.customer.customerName || "-"],
        ["구분", customerTypeLabel(selected.customer.customerType)],
        ["대표자명", selected.customer.representativeName || "-"],
        ["사업자번호", selected.customer.businessRegistrationNo || "-"],
        ["업태/종목", [selected.customer.businessCategory, selected.customer.businessItem].filter(Boolean).join(" / ") || "-"],
        ["회사전화", selected.customer.companyPhone || "-"],
        ["대표메일", selected.customer.companyEmail || "-"],
        ["담당자", primaryContact?.contactName || selected.customer.primaryContactName || "-"],
        ["담당 연락처", primaryContact?.mobilePhone || primaryContact?.officePhone || "-"],
        ["주소", primaryAddress ? [primaryAddress.postalCode, primaryAddress.addressLine1, primaryAddress.addressLine2].filter(Boolean).join(" ") : "-"],
        ["개업일", formatDate(selected.customer.openingDate)],
      ]
          .map(
            ([label, value]) => `
              <div class="customer-sheet-row">
                <label>${label}</label>
                <div>${value}</div>
              </div>
            `,
          )
          .join("")
    : "";
  const assetsMarkup = selected
    ? selected.assets
        .map(
          (asset) => `
            <article class="customer-nested-card customer-asset-card">
              <div class="customer-asset-head">
                <strong>${asset.assetName}</strong>
                <span class="status-badge neutral">${assetTypeLabel(asset.assetType)}</span>
              </div>
              <p class="table-subtext">코드 ${asset.assetCode || "-"} / 등록 ${asset.registrationNo || "-"} / 위치 ${asset.locationDescription || "-"}</p>
              <div class="stack-list dense-stack-list">
                ${asset.equipments.length
                  ? asset.equipments
                      .map(
                        (equipment) => `
                          <div class="customer-inline-item">
                            <span>${equipment.equipmentName} · ${equipmentTypeLabel(equipment.equipmentType)}</span>
                            <span class="table-subtext">${equipment.modelName || equipment.manufacturer || "-"} / ${equipment.serialNo || "시리얼 미입력"}</span>
                          </div>
                        `,
                      )
                      .join("")
                  : `<div class="table-subtext">등록된 장비가 없습니다.</div>`}
              </div>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-inline">고객을 선택하면 선박/장비와 탑재 장비가 여기에 표시됩니다.</div>`;

  const contactsMarkup = selected
    ? selected.contacts.length
      ? selected.contacts
          .map(
            (contact) => `
              <div class="customer-inline-item">
                <span>${contact.contactName} · ${contact.contactRole === "OWNER" ? "대표" : contact.jobTitle || contact.contactRole}</span>
                <span class="table-subtext">${contact.mobilePhone || contact.officePhone || "-"} / ${contact.email || "이메일 미입력"}</span>
              </div>
            `,
          )
          .join("")
      : `<div class="empty-inline">담당자가 아직 없습니다.</div>`
    : `<div class="empty-inline">선택 고객이 없습니다.</div>`;

  const addressMarkup = selected
    ? selected.addresses.length
      ? selected.addresses
          .map(
            (address) => `
              <div class="customer-inline-item">
                <span>${address.addressType}</span>
                <span class="table-subtext">${[address.postalCode, address.addressLine1, address.addressLine2].filter(Boolean).join(" ")}</span>
              </div>
            `,
          )
          .join("")
      : `<div class="empty-inline">등록된 주소가 없습니다.</div>`
    : `<div class="empty-inline">선택 고객이 없습니다.</div>`;

  const fileMarkup = files.length
    ? files
        .map(
          (file) => `
            <div class="customer-inline-item">
              <span>${file.originalName}</span>
              <span class="table-subtext">${file.mimeType} / ${file.scanStatus}</span>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-inline">연결된 사업자등록증 파일이 없습니다.</div>`;

  customerWorkspace.innerHTML = `
    <section class="customer-toolbar info-card customer-toolbar-legacy">
      <div class="customer-toolbar-main">
        <div>
          <p class="eyebrow">거래처 등록부</p>
          <h3 class="subsection-title">고객 검색 · 등록 · 상세 관리</h3>
        </div>
        <div class="customer-toolbar-actions">
          <button type="button" class="ghost-button" data-customer-refresh>목록 새로고침</button>
          <button type="button" class="secondary-button" data-customer-extract="${selected?.customer?.id || ""}" ${selected?.customer?.id ? "" : "disabled"}>OCR 재시도</button>
        </div>
      </div>
      <form id="customer-search-form" class="customer-searchbar">
        <div class="customer-search-flags">
          <label><input type="checkbox" checked disabled /> 자사</label>
          <label><input type="checkbox" checked disabled /> 매출처</label>
          <label><input type="checkbox" checked disabled /> 매입처</label>
          <label><input type="checkbox" checked disabled /> 선사</label>
          <label><input type="checkbox" checked disabled /> 엔진업체</label>
        </div>
        <input class="text-field" name="search" placeholder="업체명 / 대표자 / 사업자번호 / 선박명 / 엔진명으로 검색" value="${customerState.search}" />
        <button class="primary-button" type="submit">검색</button>
      </form>
      <div class="customer-status-strip">
        ${buildCustomerCards()
          .map(
            (card) => `
              <article class="customer-status-chip">
                <span class="customer-status-label">${card.label}</span>
                <strong>${card.value}</strong>
                <span>${card.detail}</span>
              </article>
            `,
          )
          .join("")}
      </div>
      <div class="message info">${customerState.notice}</div>
    </section>

    <section class="customer-layout customer-layout-dense">
      <aside class="info-card customer-panel customer-list-panel">
        <div class="stack-item customer-panel-heading">
          <div>
            <p class="eyebrow">거래처 목록</p>
            <h3 class="subsection-title">검색 결과 ${customerState.list.length}건</h3>
          </div>
          <span class="status-badge neutral">${customerState.search ? "검색 적용" : "전체"}</span>
        </div>
        <div class="customer-list-toolbar">
          <span class="customer-list-filter active">거래처등록</span>
          <span class="customer-list-filter">매출관리</span>
          <span class="customer-list-filter">선박</span>
        </div>
        <div class="customer-list-table-head">
          <span>순번</span>
          <span>업체명</span>
          <span>대표/담당</span>
        </div>
        <div class="customer-list-scroll">
          <div class="customer-list">
            ${customerItems || '<div class="empty-inline">검색 결과가 없습니다. 신규 업체를 바로 등록할 수 있습니다.</div>'}
          </div>
        </div>
      </aside>

      <section class="info-card customer-panel customer-detail-panel">
        <div class="stack-item customer-panel-heading">
          <div>
            <p class="eyebrow">기본정보</p>
            <h3 class="subsection-title">${selected ? selected.customer.customerName : "고객을 선택하세요"}</h3>
          </div>
          ${selected ? `<span class="status-badge neutral">${customerTypeLabel(selected.customer.customerType)}</span>` : ""}
        </div>
        <div class="customer-record-tabs">
          <button type="button" class="customer-record-tab active">기본정보</button>
          <button type="button" class="customer-record-tab" disabled>선박/엔진</button>
          <button type="button" class="customer-record-tab" disabled>문서/OCR</button>
        </div>
        ${
          selected
            ? `
              <div class="customer-detail-scroll">
              <div class="customer-record-layout">
                <section class="customer-record-sheet">
                  <div class="customer-sheet-frame">
                    <div class="customer-sheet-head">
                      <span>기본정보 시트</span>
                      <span>${selected.customer.customerNo}</span>
                    </div>
                    <div class="customer-sheet-grid">
                      ${customerInfoRows}
                    </div>
                  </div>

                  <section class="customer-sheet-subgrid">
                    <article class="customer-section-card">
                      <h4 class="section-mini-title">담당자 / 주소록</h4>
                      <div class="stack-list">${contactsMarkup}</div>
                    </article>
                    <article class="customer-section-card">
                      <h4 class="section-mini-title">주소</h4>
                      <div class="stack-list">${addressMarkup}</div>
                    </article>
                    <article class="customer-section-card customer-assets-block">
                      <h4 class="section-mini-title">자산 / 탑재 장비</h4>
                      <div class="stack-list">${assetsMarkup}</div>
                    </article>
                  </section>
                </section>

                <aside class="customer-memo-panel">
                  <article class="customer-section-card">
                    <div class="stack-item">
                      <h4 class="section-mini-title">사업자등록증 / OCR</h4>
                      <button type="button" class="secondary-button" data-customer-extract="${selected.customer.id}">OCR 재시도</button>
                    </div>
                    ${fileMarkup}
                    ${
                      extraction
                        ? `
                          <div class="ocr-grid">
                            <div>
                              <p class="eyebrow">자동 추출값</p>
                              <div class="stack-list dense-stack-list">
                                <div class="customer-inline-item"><span>사업자번호</span><span>${extraction.extractedRegistrationNo || "-"}</span></div>
                                <div class="customer-inline-item"><span>상호</span><span>${extraction.extractedCompanyName || "-"}</span></div>
                                <div class="customer-inline-item"><span>대표자</span><span>${extraction.extractedRepresentativeName || "-"}</span></div>
                                <div class="customer-inline-item"><span>주소</span><span>${extraction.extractedAddress || "-"}</span></div>
                                <div class="customer-inline-item"><span>업태/종목</span><span>${[extraction.extractedBusinessCategory, extraction.extractedBusinessItem].filter(Boolean).join(" / ") || "-"}</span></div>
                                <div class="customer-inline-item"><span>개업일</span><span>${extraction.extractedOpeningDate || "-"}</span></div>
                              </div>
                            </div>
                            <div>
                              <p class="eyebrow">확정 저장값</p>
                              <div class="stack-list dense-stack-list">
                                <div class="customer-inline-item"><span>사업자번호</span><span>${selected.customer.businessRegistrationNo || "-"}</span></div>
                                <div class="customer-inline-item"><span>상호</span><span>${selected.customer.customerName || "-"}</span></div>
                                <div class="customer-inline-item"><span>대표자</span><span>${selected.customer.representativeName || "-"}</span></div>
                                <div class="customer-inline-item"><span>주소</span><span>${primaryAddress ? [primaryAddress.addressLine1, primaryAddress.addressLine2].filter(Boolean).join(" ") : "-"}</span></div>
                                <div class="customer-inline-item"><span>업태/종목</span><span>${[selected.customer.businessCategory, selected.customer.businessItem].filter(Boolean).join(" / ") || "-"}</span></div>
                                <div class="customer-inline-item"><span>개업일</span><span>${formatDate(selected.customer.openingDate)}</span></div>
                              </div>
                            </div>
                          </div>
                        `
                        : `<div class="empty-inline">OCR 결과가 아직 없습니다. 업로드 후 재시도할 수 있습니다.</div>`
                    }
                  </article>
                </aside>
              </div>
              </div>
            `
            : '<div class="empty-inline customer-empty">좌측 거래처 목록에서 업체를 선택하거나 우측 등록 패널에서 신규 거래처를 먼저 등록하세요.</div>'
        }
      </section>

      <aside class="info-card customer-panel customer-form-panel">
        <div class="customer-panel-heading">
          <div>
            <p class="eyebrow">등록 패널</p>
            <h3 class="subsection-title">신규 업체 단계형 입력</h3>
          </div>
          <span class="status-badge neutral">입력 워크시트</span>
        </div>
        <div class="customer-form-scroll">
          <article class="customer-form-block">
            <h4 class="section-mini-title">1. 사업자등록증 업로드 / OCR 보조</h4>
            <form id="customer-file-form" class="stack-form">
              <input class="text-field" name="original_name" placeholder="파일명 또는 문서명" value="${customerState.uploadedFile?.originalName || "business-license.txt"}" />
              <textarea class="text-area" name="ocr_source_text" placeholder="OCR용 텍스트를 붙여넣거나 사업자등록증 주요 내용을 입력하세요.">${customerState.uploadedFile?.metadata?.ocr_source_text || ""}</textarea>
              <button class="secondary-button" type="submit">${customerState.uploadedFile ? "업로드 갱신" : "파일 메타데이터 저장"}</button>
            </form>
            <p class="table-subtext">${customerState.uploadedFile ? `저장됨: ${customerState.uploadedFile.originalName}` : "텍스트를 함께 저장하면 OCR 재시도 시 자동 추출에 사용됩니다."}</p>
          </article>

          <article class="customer-form-block">
            <h4 class="section-mini-title">2. 고객 기본정보</h4>
            <form id="customer-create-form" class="stack-form">
              <select class="text-field" name="customer_type">
                <option value="SHIP_OWNER">선사</option>
                <option value="GENERAL">일반 고객</option>
              </select>
              <input class="text-field" name="customer_name" placeholder="업체명" required />
              <input class="text-field" name="business_registration_no" placeholder="사업자번호" />
              <input class="text-field" name="representative_name" placeholder="대표자명" />
              <input class="text-field" name="company_phone" placeholder="회사 전화번호" />
              <input class="text-field" name="company_email" placeholder="대표 이메일" />
              <input class="text-field" name="business_category" placeholder="업태" />
              <input class="text-field" name="business_item" placeholder="종목" />
              <input class="text-field" name="opening_date" type="date" />
              <textarea class="text-area" name="notes" placeholder="고객 메모"></textarea>
              <button class="primary-button" type="submit">신규 업체 등록</button>
            </form>
          </article>

          <article class="customer-form-block">
            <h4 class="section-mini-title">3. 담당자 / 주소록</h4>
            <form id="customer-contact-form" class="stack-form">
              <input class="text-field" name="contact_name" placeholder="이름" ${selected ? "" : "disabled"} />
              <select class="text-field" name="contact_role" ${selected ? "" : "disabled"}>
                <option value="OWNER">대표</option>
                <option value="STAFF">실무자</option>
                <option value="MANAGER">관리자</option>
                <option value="ACCOUNTING">회계</option>
              </select>
              <input class="text-field" name="department_name" placeholder="부서" ${selected ? "" : "disabled"} />
              <input class="text-field" name="job_title" placeholder="직책" ${selected ? "" : "disabled"} />
              <input class="text-field" name="mobile_phone" placeholder="휴대폰" ${selected ? "" : "disabled"} />
              <input class="text-field" name="office_phone" placeholder="회사 전화" ${selected ? "" : "disabled"} />
              <input class="text-field" name="email" placeholder="이메일" ${selected ? "" : "disabled"} />
              <label class="checkbox-row compact-checkbox">
                <input name="is_primary" type="checkbox" ${selected ? "" : "disabled"} />
                <span>기본 담당자로 지정</span>
              </label>
              <button class="secondary-button" type="submit" ${selected ? "" : "disabled"}>담당자 추가</button>
            </form>
          </article>

          <article class="customer-form-block">
            <h4 class="section-mini-title">4. 주소 등록</h4>
            <form id="customer-address-form" class="stack-form">
              <select class="text-field" name="address_type" ${selected ? "" : "disabled"}>
                <option value="BUSINESS">사업장</option>
                <option value="BILLING">청구지</option>
                <option value="SITE">현장 주소</option>
                <option value="VESSEL_MANAGEMENT">선박 관리지</option>
              </select>
              <input class="text-field" name="postal_code" placeholder="우편번호" ${selected ? "" : "disabled"} />
              <input class="text-field" name="address_line_1" placeholder="기본 주소" ${selected ? "" : "disabled"} />
              <input class="text-field" name="address_line_2" placeholder="상세 주소" ${selected ? "" : "disabled"} />
              <button class="secondary-button" type="submit" ${selected ? "" : "disabled"}>주소 추가</button>
            </form>
          </article>

          <article class="customer-form-block">
            <h4 class="section-mini-title">5. 자산 등록</h4>
            <form id="customer-asset-form" class="stack-form">
              <select class="text-field" name="asset_type" ${selected ? "" : "disabled"}>
                <option value="VESSEL">선박</option>
                <option value="SITE_EQUIPMENT">일반 운용 장비</option>
              </select>
              <input class="text-field" name="asset_name" placeholder="자산명" ${selected ? "" : "disabled"} />
              <input class="text-field" name="asset_code" placeholder="자산 코드" ${selected ? "" : "disabled"} />
              <input class="text-field" name="registration_no" placeholder="선박/설비 등록번호" ${selected ? "" : "disabled"} />
              <input class="text-field" name="imo_no" placeholder="IMO 번호 (선박일 때)" ${selected ? "" : "disabled"} />
              <input class="text-field" name="location_description" placeholder="운용 위치" ${selected ? "" : "disabled"} />
              <textarea class="text-area" name="notes" placeholder="자산 메모" ${selected ? "" : "disabled"}></textarea>
              <button class="secondary-button" type="submit" ${selected ? "" : "disabled"}>자산 추가</button>
            </form>
          </article>

          <article class="customer-form-block">
            <h4 class="section-mini-title">6. 탑재 장비 등록</h4>
            <form id="customer-equipment-form" class="stack-form">
              <select class="text-field" name="asset_id" ${selected?.assets?.length ? "" : "disabled"}>
                <option value="">자산 선택</option>
                ${(selected?.assets || []).map((asset) => `<option value="${asset.id}">${asset.assetName}</option>`).join("")}
              </select>
              <select class="text-field" name="equipment_type" ${selected?.assets?.length ? "" : "disabled"}>
                <option value="ENGINE">엔진</option>
                <option value="GEARBOX">감속기</option>
                <option value="OTHER">기타</option>
              </select>
              <input class="text-field" name="equipment_name" placeholder="장비명" ${selected?.assets?.length ? "" : "disabled"} />
              <input class="text-field" name="serial_no" placeholder="시리얼 번호" ${selected?.assets?.length ? "" : "disabled"} />
              <input class="text-field" name="installation_position" placeholder="설치 위치" ${selected?.assets?.length ? "" : "disabled"} />
              <select class="text-field" name="engine_model_id" ${selected?.assets?.length ? "" : "disabled"}>
                <option value="">엔진 모델 선택</option>
                ${customerState.engineModels.map((model) => `<option value="${model.id}">${model.manufacturer} ${model.modelName}</option>`).join("")}
              </select>
              <select class="text-field" name="gearbox_model_id" ${selected?.assets?.length ? "" : "disabled"}>
                <option value="">감속기 모델 선택</option>
                ${customerState.gearboxModels.map((model) => `<option value="${model.id}">${model.manufacturer} ${model.modelName}</option>`).join("")}
              </select>
              <input class="text-field" name="manufacturer" placeholder="제조사" ${selected?.assets?.length ? "" : "disabled"} />
              <input class="text-field" name="model_name" placeholder="현장 표기 모델명" ${selected?.assets?.length ? "" : "disabled"} />
              <textarea class="text-area" name="notes" placeholder="장비 메모" ${selected?.assets?.length ? "" : "disabled"}></textarea>
              <button class="secondary-button" type="submit" ${selected?.assets?.length ? "" : "disabled"}>장비 추가</button>
            </form>
          </article>

          <article class="customer-form-block">
            <h4 class="section-mini-title">7. 엔진 / 감속기 마스터 추가</h4>
            <div class="master-form-grid">
              <form id="engine-model-form" class="stack-form">
                <p class="table-subtext">엔진 모델</p>
                <input class="text-field" name="manufacturer" placeholder="제조사" />
                <input class="text-field" name="model_name" placeholder="모델명" />
                <input class="text-field" name="engine_type" placeholder="형식" />
                <input class="text-field" name="fuel_type" placeholder="연료" />
                <input class="text-field" name="power_rating" placeholder="출력" />
                <button class="secondary-button" type="submit">엔진 모델 추가</button>
              </form>
              <form id="gearbox-model-form" class="stack-form">
                <p class="table-subtext">감속기 모델</p>
                <input class="text-field" name="manufacturer" placeholder="제조사" />
                <input class="text-field" name="model_name" placeholder="모델명" />
                <input class="text-field" name="gear_type" placeholder="형식" />
                <input class="text-field" name="gear_ratio" placeholder="감속비" />
                <input class="text-field" name="torque_rating" placeholder="토크" />
                <button class="secondary-button" type="submit">감속기 모델 추가</button>
              </form>
            </div>
          </article>
        </div>
      </aside>
    </section>
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
  renderCustomerWorkspace();

  try {
    const [customersResult, engineModelsResult, gearboxModelsResult] = await Promise.all([
      window.erpClient.listCustomers(customerState.search),
      window.erpClient.listEngineModels(""),
      window.erpClient.listGearboxModels(""),
    ]);

    customerState.list = customersResult.data || [];
    customerState.engineModels = engineModelsResult.data || [];
    customerState.gearboxModels = gearboxModelsResult.data || [];
    customerState.loaded = true;

    if (!customerState.selectedCustomerId && customerState.list[0]) {
      customerState.selectedCustomerId = customerState.list[0].id;
    }

    if (customerState.selectedCustomerId) {
      const detailResult = await window.erpClient.getCustomer(customerState.selectedCustomerId);
      customerState.selectedCustomer = detailResult.data;
    } else {
      customerState.selectedCustomer = null;
    }

    customerState.notice = options.notice || "중복 후보가 있으면 검색 목록에서 먼저 확인한 뒤 신규 업체를 등록하세요.";
  } catch (error) {
    customerState.notice = error.message || "고객관리 데이터를 불러오지 못했습니다.";
  } finally {
    customerState.loading = false;
    renderCustomerWorkspace();
  }
}

async function loadCustomerDetail(customerId, notice) {
  customerState.selectedCustomerId = customerId;
  customerState.selectedCustomer = null;
  customerState.notice = notice || customerState.notice;
  renderCustomerWorkspace();

  try {
    const result = await window.erpClient.getCustomer(customerId);
    customerState.selectedCustomer = result.data;
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
  await loadPreferences();
  renderActiveTab();
  setMessage(settingsFeedback, "info", successMessage);
}

async function loadAppVersion() {
  try {
    const result = await window.erpClient.getAppVersion();
    dashboardState.appInfo = result;
    const label = `버전 ${result.version}`;
    loginAppVersion.textContent = label;
    loginServerUrl.textContent = `서버 주소 ${result.serverUrl}${result.serverKind === "local" ? " (로컬 자동 선택)" : ""}`;
    loginAccessMode.textContent = `Cloudflare Access ${result.cloudflareAccessEnabled ? "활성" : "비활성"}`;
    setBadgeText(dashboardAppVersion, result.version, "neutral");
    if (result.platform === "darwin") {
      setMessage(updateStatus, "info", "macOS는 앱 내 자동 설치를 사용하지 않습니다. 새 버전이 있으면 다운로드 페이지에서 수동 설치합니다.");
    }
  } catch {
    dashboardState.appInfo = null;
    loginAppVersion.textContent = "버전 확인 실패";
    loginServerUrl.textContent = "서버 주소 확인 실패";
    loginAccessMode.textContent = "Cloudflare Access 확인 실패";
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
  } catch (error) {
    document.getElementById("login-id").value = preferences.showRememberedUsername ? preferences.rememberedUsername : "";
    setMessage(
      loginFeedback,
      "warn",
      `접속 범위를 확인하지 못해 자동 로그인을 건너뜁니다. ${error?.message || ""}`.trim(),
    );
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
  const activeTab = getActiveTab();
  const isSettings = activeTab === "settings";
  const isCustomers = activeTab === "customers";
  const content = dashboardContent[activeTab];

  document.getElementById("dashboard-main-pane").classList.toggle("hidden", isSettings);
  document.getElementById("dashboard-settings-pane").classList.toggle("hidden", !isSettings);
  customerWorkspace.classList.toggle("hidden", !isCustomers);
  dashboardCards.classList.toggle("hidden", isCustomers);
  dashboardTablePanel.classList.toggle("hidden", isCustomers);

  if (isSettings) {
    dashboardSectionTitle.textContent = "설정";
    dashboardSectionCopy.textContent = "자동 로그인, 기본 접속 범위 테스트값, 최근 로그인 아이디 표시 여부를 이 화면에서 조정합니다.";
    renderSettingsTab();
    return;
  }

  if (isCustomers) {
    dashboardSectionTitle.textContent = "고객관리";
    dashboardSectionCopy.textContent = "신규/기존 업체 판별부터 사업자등록증, 담당자, 선박/운용 장비, 탑재 장비, 엔진/감속기 마스터까지 한 흐름으로 관리합니다.";
    dashboardActions.innerHTML = `
      <button type="button" class="secondary-button action-button" data-customer-refresh>목록 새로고침</button>
      <button type="button" class="secondary-button action-button" data-customer-extract="${customerState.selectedCustomerId || ""}" ${customerState.selectedCustomerId ? "" : "disabled"}>OCR 재시도</button>
    `;
    renderCustomerWorkspace();
    if (!customerState.loaded) {
      refreshCustomerWorkspace().catch((error) => {
        customerState.notice = error.message || "고객관리 데이터를 불러오지 못했습니다.";
        renderCustomerWorkspace();
      });
    }
    return;
  }

  dashboardSectionTitle.textContent = content.title;
  dashboardSectionCopy.textContent = content.summary;
  renderMetricCards(content.cards);
  renderActions(content.actions);
  renderTable(content.columns, content.rows);
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

async function handleCreateCustomer(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  if (customerState.uploadedFile?.id) {
    payload.business_license_file_id = customerState.uploadedFile.id;
  }
  const result = await window.erpClient.createCustomer(payload);
  customerState.selectedCustomerId = result.data.customer?.customer?.id || null;
  customerState.notice = result.data.duplicates?.length
    ? `동일 사업자번호 후보 ${result.data.duplicates.length}건을 확인했습니다. 신규 등록은 완료되었습니다.`
    : "신규 업체가 등록되었습니다.";
  customerState.uploadedFile = null;
  await refreshCustomerWorkspace({ notice: customerState.notice });
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
  const result = await window.erpClient.addCustomerAsset(customerState.selectedCustomerId, payload);
  customerState.selectedCustomer = result.data;
  customerState.notice = "자산이 추가되었습니다.";
  form.reset();
  renderCustomerWorkspace();
}

async function handleCreateEquipment(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  const assetId = payload.asset_id;
  delete payload.asset_id;
  const result = await window.erpClient.addAssetEquipment(assetId, payload);
  customerState.selectedCustomer = result.data;
  customerState.notice = "탑재 장비가 추가되었습니다.";
  form.reset();
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

async function handleExtractBusinessLicense(customerId) {
  if (!customerId) {
    return;
  }

  const payload = {};
  if (customerState.uploadedFile?.id) {
    payload.file_id = customerState.uploadedFile.id;
  }

  await window.erpClient.extractBusinessLicense(customerId, payload);
  customerState.notice = "사업자등록증 OCR을 다시 실행했습니다.";
  await loadCustomerDetail(customerId, customerState.notice);
}

window.erpClient.onUpdateStatus((payload) => {
  const kind = payload.status === "CHECK_FAILED" ? "warn" : "info";
  setMessage(updateStatus, kind, payload.message);
  latestManualDownloadUrl = payload.downloadUrl || "";
  openUpdateDownloadButton.classList.toggle("hidden", !latestManualDownloadUrl);
});

openUpdateDownloadButton.addEventListener("click", async () => {
  if (!latestManualDownloadUrl) {
    return;
  }

  await window.erpClient.openUpdateDownload(latestManualDownloadUrl);
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

window.addEventListener("keydown", async (event) => {
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

dashboardTabs.addEventListener("click", (event) => {
  const target = event.target.closest("[data-dashboard-tab]");
  if (!target) {
    return;
  }

  dashboardState.activeTab = target.dataset.dashboardTab;
  renderDashboardTabs();
  renderActiveTab();
});

dashboardActions.addEventListener("click", async (event) => {
  const refreshButton = event.target.closest("[data-customer-refresh]");
  if (refreshButton) {
    await refreshCustomerWorkspace({ notice: "고객 목록을 새로고침했습니다." });
    return;
  }

  const extractButton = event.target.closest("[data-customer-extract]");
  if (extractButton) {
    await handleExtractBusinessLicense(extractButton.dataset.customerExtract);
  }
});

dashboardMainPane.addEventListener("click", async (event) => {
  const selectButton = event.target.closest("[data-customer-select]");
  if (selectButton) {
    await loadCustomerDetail(selectButton.dataset.customerSelect, "고객 상세를 불러왔습니다.");
    return;
  }

  const refreshButton = event.target.closest("[data-customer-refresh]");
  if (refreshButton) {
    await refreshCustomerWorkspace({ notice: "고객 목록을 새로고침했습니다." });
    return;
  }

  const extractButton = event.target.closest("[data-customer-extract]");
  if (extractButton) {
    await handleExtractBusinessLicense(extractButton.dataset.customerExtract);
  }
});

dashboardMainPane.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  event.preventDefault();

  try {
    if (form.id === "customer-search-form") {
      const formData = Object.fromEntries(new FormData(form).entries());
      await refreshCustomerWorkspace({ search: String(formData.search || ""), notice: "검색 결과를 불러왔습니다." });
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
