const PROJECT_LIST_PANE_WIDTH_STORAGE_KEY = "erp-project-list-pane-width";
const PROJECT_QUOTATION_FORM_WIDTH_STORAGE_KEY = "erp-project-quotation-form-width";
const PROJECT_COLUMN_ORDER_STORAGE_KEY = "erp-project-list-column-order";
const PROJECT_COLUMN_WIDTH_STORAGE_KEY = "erp-project-list-column-widths";
const PROJECT_QUOTATIONS_STORAGE_KEY = "erp-project-quotations";
const PROJECT_QUOTATION_TEMPLATES_STORAGE_KEY = "erp-project-quotation-templates";
const PROJECT_LIST_COLUMNS = [
  { field: "managementNo", label: "관리번호", width: 112 },
  { field: "customer", label: "발주처", width: 104 },
  { field: "vesselEquipment", label: "선박/장비", width: 168 },
  { field: "status", label: "상태", width: 92 },
];

function currentProjectMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const format = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return {
    startDate: format(start),
    endDate: format(end),
  };
}

function defaultProjectFilters() {
  return {
    ...currentProjectMonthRange(),
    status: "",
    manager: "",
    query: "",
  };
}

var projectState = {
  viewMode: "project",
  selectedProjectId: "PRJ-2026-001",
  activeDetailTab: "overview",
  hasSearched: false,
  quotations: [],
  quotationModal: {
    open: false,
    mode: "create",
    quotationId: "",
    dirty: false,
    draft: null,
    selectedItemIndexes: [],
    clipboardItems: [],
    contextMenu: { visible: false, x: 0, y: 0 },
  },
  quotationPreview: {
    open: false,
    html: "",
  },
  templateModal: {
    open: false,
    selectedTemplateId: "",
    draft: null,
    contextMenu: { visible: false, x: 0, y: 0, target: "" },
  },
  filters: defaultProjectFilters(),
  projects: [
    {
      id: "PRJ-2026-001",
      estimateNo: "QT-2026-014",
      managementNo: "SH-2026-001-T",
      name: "TS BLUE Main Engine 진동 점검",
      customer: "태성해운",
      vessel: "TS BLUE",
      equipment: "Main Engine",
      status: "진행 중",
      manager: "김태성",
      quoteStatus: "수주 확정",
      quoteDate: "2026-04-12",
      quoteAmount: 4620000,
      quoteManager: "김태성",
      quoteDocumentId: "QT-DOC-2026-014",
      quoteDocumentName: "TS BLUE Main Engine 견적서",
      partsQuote: true,
      repairQuote: true,
      quoteNote: "부품 및 수리 견적 동시 요청.",
      orderConfirmed: true,
      plannedStart: "2026-04-18",
      plannedEnd: "2026-04-24",
      folderCreated: true,
      folderCreatedAt: "2026-04-12",
      folderPath: "projects/SH-2026-001-T",
      checklist: [
        { id: "CHK-001", checked: true, item: "엔진 진동 측정", standard: "견적서 작업 범위 1", status: "완료", manager: "김태성", completedAt: "2026-04-18", note: "기준치 초과 확인" },
        { id: "CHK-002", checked: false, item: "커플링 정렬 확인", standard: "정렬 오차 기록", status: "진행 중", manager: "박민수", completedAt: "", note: "" },
        { id: "CHK-003", checked: false, item: "시운전 결과 기록", standard: "부하별 RPM/진동값", status: "미시작", manager: "김태성", completedAt: "", note: "" },
      ],
      progressLogs: [
        { date: "2026-04-18", status: "진행 중", manager: "김태성", content: "현장 진동 계측 완료. 커플링 정렬 점검 진행.", nextAction: "정렬값 보정 후 재계측", attachment: "SR-2026-001" },
        { date: "2026-04-12", status: "공사 준비", manager: "김태성", content: "수주 확정 및 공사 폴더 생성.", nextAction: "현장 일정 확정", attachment: "" },
      ],
      reports: [
        { type: "서비스 레포트", required: true, status: "작성 중", writer: "김태성", date: "", documentId: "SR-2026-001", file: "", note: "현장 사진 추가 필요" },
        { type: "계측 및 시험 성적서", required: true, status: "작성 필요", writer: "박민수", date: "", documentId: "", file: "", note: "" },
        { type: "점검 레포트", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
        { type: "소견서", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
      ],
      externalRequests: [
        { vendor: "KRM 계측", content: "진동 분석 리포트", requestDate: "2026-04-18", expectedReplyDate: "2026-04-20", replyDate: "", status: "회신 대기", attachment: "", note: "결과 수령 후 성적서 반영" },
      ],
      completion: {
        specCreated: false,
        sealed: false,
        receivedDate: "",
        documentId: "",
        storageLocation: "",
        completedAt: "",
        note: "",
        status: "작성 전",
      },
    },
    {
      id: "PRJ-2026-002",
      estimateNo: "QT-2026-015",
      managementNo: "견적 상태",
      name: "PLANT-02 Gearbox 점검 견적",
      customer: "남해플랜트서비스",
      vessel: "PLANT-02",
      equipment: "Gearbox",
      status: "견적 상태",
      manager: "박경수",
      quoteStatus: "견적 작성",
      quoteDate: "2026-04-16",
      quoteAmount: 1280000,
      quoteManager: "박경수",
      quoteDocumentId: "",
      quoteDocumentName: "",
      partsQuote: true,
      repairQuote: false,
      quoteNote: "부품 견적 우선 산출.",
      orderConfirmed: false,
      plannedStart: "",
      plannedEnd: "",
      folderCreated: false,
      folderCreatedAt: "",
      folderPath: "",
      checklist: [
        { id: "CHK-101", checked: false, item: "견적 범위 확인", standard: "부품/수리 분리", status: "미시작", manager: "박경수", completedAt: "", note: "" },
      ],
      progressLogs: [
        { date: "2026-04-16", status: "견적 상태", manager: "박경수", content: "감속기 점검 견적 요청 접수.", nextAction: "부품 견적 산출", attachment: "" },
      ],
      reports: [
        { type: "서비스 레포트", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
        { type: "계측 및 시험 성적서", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
        { type: "점검 레포트", required: true, status: "작성 필요", writer: "박경수", date: "", documentId: "", file: "", note: "" },
        { type: "소견서", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
      ],
      externalRequests: [],
      completion: {
        specCreated: false,
        sealed: false,
        receivedDate: "",
        documentId: "",
        storageLocation: "",
        completedAt: "",
        note: "",
        status: "작성 전",
      },
    },
    {
      id: "PRJ-2026-003",
      estimateNo: "QT-2026-010",
      managementNo: "SH-2026-002-T",
      name: "영광기업 발전기 준공 문서 정리",
      customer: "영광기업",
      vessel: "현장 발전기",
      equipment: "Generator",
      status: "준공 대기",
      manager: "이현우",
      quoteStatus: "수주 확정",
      quoteDate: "2026-04-08",
      quoteAmount: 3150000,
      quoteManager: "이현우",
      quoteDocumentId: "QT-DOC-2026-010",
      quoteDocumentName: "발전기 부하 테스트 견적서",
      partsQuote: false,
      repairQuote: true,
      quoteNote: "현장 수리 견적.",
      orderConfirmed: true,
      plannedStart: "2026-04-10",
      plannedEnd: "2026-04-19",
      folderCreated: true,
      folderCreatedAt: "2026-04-08",
      folderPath: "projects/SH-2026-002-T",
      checklist: [
        { id: "CHK-201", checked: true, item: "부하 테스트", standard: "75% 부하 2시간", status: "완료", manager: "이현우", completedAt: "2026-04-17", note: "정상" },
        { id: "CHK-202", checked: true, item: "고객 확인", standard: "현장 책임자 확인", status: "완료", manager: "이현우", completedAt: "2026-04-18", note: "" },
      ],
      progressLogs: [
        { date: "2026-04-18", status: "준공 대기", manager: "이현우", content: "수리완공사양서 날인 요청.", nextAction: "날인본 수령", attachment: "" },
      ],
      reports: [
        { type: "서비스 레포트", required: true, status: "발송 완료", writer: "이현우", date: "2026-04-17", documentId: "SR-2026-003", file: "", note: "" },
        { type: "계측 및 시험 성적서", required: true, status: "완료", writer: "이현우", date: "2026-04-17", documentId: "TR-2026-003", file: "", note: "" },
        { type: "점검 레포트", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
        { type: "소견서", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
      ],
      externalRequests: [],
      completion: {
        specCreated: true,
        sealed: false,
        receivedDate: "",
        documentId: "CD-2026-003",
        storageLocation: "준공/2026/SH-2026-002-T",
        completedAt: "",
        note: "날인본 수령 대기",
        status: "날인 대기",
      },
    },
  ],
};

function loadProjectQuotations() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROJECT_QUOTATIONS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map((quotation) => normalizeQuotationDraft(quotation)) : [];
  } catch {
    return [];
  }
}

function saveProjectQuotations(quotations) {
  const normalized = (quotations || []).map((quotation) => normalizeQuotationDraft(quotation));
  projectState.quotations = normalized;
  localStorage.setItem(PROJECT_QUOTATIONS_STORAGE_KEY, JSON.stringify(normalized));
}

function normalizeQuotationTemplate(template = {}) {
  const base = blankQuotationTemplate();
  const normalizedInfoFields = Array.isArray(template.infoFields)
    ? template.infoFields.filter((key) => PROJECT_TEMPLATE_INFO_FIELDS.some((field) => field.key === key))
    : base.infoFields;
  return {
    ...base,
    ...template,
    page: {
      ...base.page,
      ...(template.page || {}),
    },
    styles: {
      ...base.styles,
      ...(template.styles || {}),
    },
    document: {
      ...base.document,
      ...(template.document || {}),
    },
    table: {
      ...base.table,
      ...(template.table || {}),
    },
    infoFields: normalizedInfoFields.length ? normalizedInfoFields : base.infoFields,
    items: (Array.isArray(template.items) && template.items.length ? template.items : base.items).map((item, index) => normalizeQuotationItem(item, index)),
  };
}

function loadQuotationTemplates() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROJECT_QUOTATION_TEMPLATES_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map((template) => normalizeQuotationTemplate(template)) : [];
  } catch {
    return [];
  }
}

function saveQuotationTemplates(templates) {
  localStorage.setItem(PROJECT_QUOTATION_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
}

function saveQuotationTemplate(template) {
  const templates = loadQuotationTemplates();
  const nextTemplate = normalizeQuotationTemplate({
    ...template,
    id: template.id || `tpl-${Date.now()}`,
    updatedAt: new Date().toISOString().slice(0, 10),
  });
  const exists = templates.some((item) => item.id === nextTemplate.id);
  const nextTemplates = exists ? templates.map((item) => (item.id === nextTemplate.id ? nextTemplate : item)) : [...templates, nextTemplate];
  saveQuotationTemplates(nextTemplates);
  return nextTemplate;
}

projectState.quotations = loadProjectQuotations();

function projectListColumns() {
  try {
    const savedFields = JSON.parse(localStorage.getItem(PROJECT_COLUMN_ORDER_STORAGE_KEY) || "[]");
    const validFields = new Set(PROJECT_LIST_COLUMNS.map((column) => column.field));
    const savedColumns = savedFields
      .filter((field) => validFields.has(field))
      .map((field) => PROJECT_LIST_COLUMNS.find((column) => column.field === field));
    const missingColumns = PROJECT_LIST_COLUMNS.filter((column) => !savedFields.includes(column.field));
    return [...savedColumns, ...missingColumns];
  } catch {
    return [...PROJECT_LIST_COLUMNS];
  }
}

function saveProjectColumnOrder(columns) {
  localStorage.setItem(PROJECT_COLUMN_ORDER_STORAGE_KEY, JSON.stringify(columns.map((column) => column.field)));
}

function loadProjectColumnWidths() {
  try {
    const widths = JSON.parse(localStorage.getItem(PROJECT_COLUMN_WIDTH_STORAGE_KEY) || "{}");
    return widths && typeof widths === "object" ? widths : {};
  } catch {
    return {};
  }
}

function saveProjectColumnWidths(widths) {
  localStorage.setItem(PROJECT_COLUMN_WIDTH_STORAGE_KEY, JSON.stringify(widths));
}

function projectColumnWidth(column, widths = loadProjectColumnWidths()) {
  const savedWidth = Number(widths[column.field]);
  return Number.isFinite(savedWidth) && savedWidth >= 64 ? savedWidth : column.width;
}

function projectListColumnTemplate(columns = projectListColumns(), widths = loadProjectColumnWidths()) {
  return columns.map((column) => `${projectColumnWidth(column, widths)}px`).join(" ");
}

function projectListColumnStyle(columns = projectListColumns()) {
  return `grid-template-columns: ${projectListColumnTemplate(columns)};`;
}

function moveProjectColumn(sourceField, targetField) {
  if (!sourceField || !targetField || sourceField === targetField) {
    return false;
  }
  const columns = projectListColumns();
  const sourceIndex = columns.findIndex((column) => column.field === sourceField);
  const targetIndex = columns.findIndex((column) => column.field === targetField);
  if (sourceIndex < 0 || targetIndex < 0) {
    return false;
  }
  const [moved] = columns.splice(sourceIndex, 1);
  columns.splice(targetIndex, 0, moved);
  saveProjectColumnOrder(columns);
  return true;
}

function projectListValue(project, field) {
  const mapping = {
    managementNo: project.managementNo || project.estimateNo || "",
    customer: project.customer || "",
    vesselEquipment: [project.vessel, project.equipment].filter(Boolean).join(" / "),
    status: project.status || "",
  };
  return mapping[field] || "";
}

function renderProjectListCell(project, field) {
  if (field === "status") {
    return `<span><mark class="status-badge ${projectBadgeKind(project.status)}">${escapeTextarea(project.status || "-")}</mark></span>`;
  }
  const className = field === "managementNo" ? ' class="project-list-no"' : "";
  return `<span${className}>${escapeTextarea(projectListValue(project, field) || "-")}</span>`;
}

function loadProjectListPaneWidth() {
  const width = Number(localStorage.getItem(PROJECT_LIST_PANE_WIDTH_STORAGE_KEY) || "");
  return Number.isFinite(width) && width >= 520 ? width : 0;
}

function saveProjectListPaneWidth(width) {
  if (!Number.isFinite(width) || width < 520) {
    localStorage.removeItem(PROJECT_LIST_PANE_WIDTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(PROJECT_LIST_PANE_WIDTH_STORAGE_KEY, String(Math.round(width)));
}

function projectPaneStyle() {
  const width = loadProjectListPaneWidth();
  return width ? `grid-template-columns: ${width}px 8px minmax(300px, 1fr);` : "";
}

function loadProjectQuotationFormWidth() {
  const width = Number(localStorage.getItem(PROJECT_QUOTATION_FORM_WIDTH_STORAGE_KEY) || "");
  return Number.isFinite(width) && width >= 132 ? width : 0;
}

function saveProjectQuotationFormWidth(width) {
  if (!Number.isFinite(width) || width < 132) {
    localStorage.removeItem(PROJECT_QUOTATION_FORM_WIDTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(PROJECT_QUOTATION_FORM_WIDTH_STORAGE_KEY, String(Math.round(width)));
}

function projectQuotationLayoutStyle() {
  const width = loadProjectQuotationFormWidth();
  return width
    ? `grid-template-columns: ${width}px 8px minmax(0, 1fr);`
    : "grid-template-columns: minmax(132px, 0.408fr) 8px minmax(0, 1fr);";
}


const PROJECT_STATUS_OPTIONS = ["견적 상태", "수주 확정", "공사 준비", "진행 중", "레포트 작성 중", "외부 의뢰 대기", "준공 대기", "준공", "보류", "취소"];
const PROJECT_CHECKLIST_STATUS_OPTIONS = ["미시작", "진행 중", "완료", "제외"];
const PROJECT_REPORT_STATUS_OPTIONS = ["요청 없음", "작성 필요", "작성 중", "검토 중", "완료", "발송 완료"];
const PROJECT_EXTERNAL_STATUS_OPTIONS = ["의뢰 전", "의뢰 중", "회신 대기", "회신 완료", "지연"];
const PROJECT_COMPLETION_STATUS_OPTIONS = ["작성 전", "작성 중", "날인 대기", "보관 완료"];
const PROJECT_QUOTATION_CATEGORY_OPTIONS = ["제목", "세부제목", "수리항목", "부품항목", "항목설명", "소계", "주석제목", "주석항목", "빈칸"];
const PROJECT_TEMPLATE_INFO_FIELDS = [
  { key: "managementNo", label: "관리번호" },
  { key: "quotationNo", label: "견적번호" },
  { key: "customer", label: "거래처" },
  { key: "vessel", label: "선박" },
  { key: "equipment", label: "장비" },
  { key: "projectName", label: "공사명" },
  { key: "createdDate", label: "작성일" },
  { key: "issuedDate", label: "발행일" },
  { key: "currency", label: "통화" },
  { key: "writer", label: "작성자" },
];
const PROJECT_TEMPLATE_SUPPLIER_FIELD_MAP = {
  등록번호: "supplierRegistrationNo",
  상호: "supplierName",
  성명: "supplierRepresentative",
  주소: "supplierAddress",
  "업태/종목": "supplierBusinessType",
};

function projectSelectOptions(options, selectedValue = "") {
  return options.map((option) => `<option value="${escapeAttribute(option)}"${option === selectedValue ? " selected" : ""}>${escapeTextarea(option)}</option>`).join("");
}

function projectCurrencyOptions(selectedValue = "KRW") {
  return projectSelectOptions(["KRW", "USD", "JPY", "EUR"], selectedValue || "KRW");
}

function quotationStatusOptions(selectedValue = "작성중") {
  return projectSelectOptions(["작성중", "검토중", "발행", "수정 필요", "취소"], selectedValue || "작성중");
}

function quotationCategoryOptions(selectedValue = "") {
  return `<option value="">선택 안 함</option>${projectSelectOptions(PROJECT_QUOTATION_CATEGORY_OPTIONS, selectedValue || "")}`;
}

function isQuotationPricedItem(item = {}) {
  return ["수리항목", "부품항목"].includes(String(item.category || ""));
}

function isQuotationDescriptionAmountItem(item = {}) {
  return String(item.category || "") === "항목설명";
}

function isQuotationSubtotalItem(item = {}) {
  return String(item.category || "") === "소계";
}

function isQuotationBlankItem(item = {}) {
  return String(item.category || "") === "빈칸";
}

function isQuotationQuantityInputItem(item = {}) {
  return isQuotationPricedItem(item) || isQuotationDescriptionAmountItem(item);
}

function isQuotationAmountInputItem(item = {}) {
  return isQuotationQuantityInputItem(item) || isQuotationSubtotalItem(item);
}

function blankQuotationTemplate() {
  return {
    id: "",
    name: "",
    defaultText: "",
    items: [emptyQuotationItem()],
    page: {
      size: "A4",
      orientation: "landscape",
      marginTop: 18,
      marginRight: 14,
      marginBottom: 18,
      marginLeft: 14,
    },
    styles: {
      accentColor: "#2a6fd2",
      fontSize: 11,
      headerBackground: "#eef4ff",
    },
    document: {
      title: "청구서",
      logoText: "SUNJIN",
      logoImageUrl: "",
      logoPosition: "left",
      logoWidth: 150,
      logoHeight: 46,
      extraLogoText: "STX · PULLMASTER",
      extraLogoImageUrl: "",
      extraLogoPosition: "right",
      extraLogoWidth: 150,
      extraLogoHeight: 46,
      tagline: "고객의 마음으로 일하는 욕·해상용 엔진/부속 공급, 수리전문점",
      supplierName: "(주)선진종합",
      supplierRegistrationNo: "601-81-31019",
      supplierRepresentative: "송치관",
      supplierAddress: "부산광역시 영도구 대평로41번길 3",
      supplierBusinessType: "제조/선박기관 및 부품",
      showSupplierBox: true,
      showKoreanAmount: true,
    },
    infoFields: PROJECT_TEMPLATE_INFO_FIELDS.map((field) => field.key),
    table: {
      headerVisible: true,
      rowHeight: 34,
    },
  };
}

function invoiceQuotationTemplatePreset() {
  return normalizeQuotationTemplate({
    ...blankQuotationTemplate(),
    id: "",
    name: "청구서 기본형",
    defaultText: "부가세 별도 / 유효기간 30일 / 작업 조건 변경 시 별도 협의",
    document: {
      title: "청구서",
      logoText: "SUNJIN",
      logoImageUrl: "",
      logoPosition: "left",
      logoWidth: 150,
      logoHeight: 46,
      extraLogoText: "STX · PULLMASTER",
      extraLogoImageUrl: "",
      extraLogoPosition: "right",
      extraLogoWidth: 150,
      extraLogoHeight: 46,
      tagline: "고객의 마음으로 일하는 욕·해상용 엔진/부속 공급, 수리전문점",
      supplierName: "(주)선진종합",
      supplierRegistrationNo: "601-81-31019",
      supplierRepresentative: "송치관",
      supplierAddress: "부산광역시 영도구 대평로41번길 3",
      supplierBusinessType: "제조/선박기관 및 부품",
      showSupplierBox: true,
      showKoreanAmount: true,
    },
    styles: {
      accentColor: "#111827",
      fontSize: 11,
      headerBackground: "#b7deea",
    },
    table: {
      headerVisible: true,
      rowHeight: 34,
    },
    items: [
      { category: "제목", lineNo: 1, code: "", description: "조선소 작업", quantity: 0, unit: "", unitPrice: 0, amount: 0, remark: "" },
      { category: "세부제목", lineNo: 2, code: "", description: "선체 상,하가 및 관련 일반 사항", quantity: 0, unit: "", unitPrice: 0, amount: 0, remark: "" },
      { category: "항목설명", lineNo: 3, code: "", description: "※ G/T : 292 TON, TUG BOAT", quantity: 0, unit: "", unitPrice: 0, amount: 0, remark: "" },
      { category: "수리항목", lineNo: 4, code: "", description: "선체 상,하가", quantity: 1, unit: "Lot", unitPrice: 7000000, amount: 7000000, remark: "" },
      { category: "수리항목", lineNo: 5, code: "", description: "예인선 사용료", quantity: 4, unit: "척", unitPrice: 350000, amount: 1400000, remark: "" },
      { category: "소계", lineNo: 6, code: "", description: "소계", quantity: 0, unit: "", unitPrice: 0, amount: 8400000, remark: "" },
      { category: "빈칸", lineNo: 7, code: "", description: "", quantity: 0, unit: "", unitPrice: 0, amount: 0, remark: "" },
      { category: "제목", lineNo: 8, code: "", description: "DOCK & OTHERS PART", quantity: 0, unit: "", unitPrice: 0, amount: 0, remark: "" },
      { category: "수리항목", lineNo: 9, code: "", description: "우현 외판 교체작업 관련", quantity: 1, unit: "식", unitPrice: 1000000, amount: 1000000, remark: "" },
    ],
  });
}

function quotationNumber(project) {
  const year = new Date().getFullYear();
  const count = projectState.quotations.filter((quotation) => String(quotation.createdAt || "").startsWith(String(year))).length + 1;
  return `QT-${year}-${String(count).padStart(3, "0")}`;
}

function emptyQuotationItem() {
  return {
    category: "",
    lineNo: "",
    code: "",
    description: "",
    quantity: 1,
    unit: "",
    unitPrice: 0,
    amount: 0,
    remark: "",
  };
}

function currentProjectQuotationWriter(project = null) {
  return (
    dashboardState?.session?.data?.user?.username ||
    dashboardState?.session?.data?.user?.displayName ||
    project?.manager ||
    "시연 사용자"
  );
}

function normalizeQuotationItem(item, index = 0) {
  const category = String(item?.category || "");
  const lineNo = item?.lineNo ?? item?.line_no ?? "";
  const quantity = Number(item?.quantity ?? 1) || 0;
  const unitPrice = Number(item?.unitPrice ?? item?.unit_price ?? 0) || 0;
  const inputAmount = Number(item?.amount ?? 0) || 0;
  const amount = isQuotationPricedItem({ category }) && !inputAmount ? quantity * unitPrice : inputAmount;
  if (isQuotationBlankItem({ category })) {
    return {
      category,
      lineNo,
      code: "",
      description: "",
      quantity: 0,
      unit: "",
      unitPrice: 0,
      amount: 0,
      remark: "",
    };
  }
  return {
    category,
    lineNo,
    code: String(item?.code || ""),
    description: String(item?.description ?? item?.itemName ?? ""),
    quantity: isQuotationQuantityInputItem({ category }) ? quantity : 0,
    unit: isQuotationQuantityInputItem({ category }) ? String(item?.unit ?? item?.spec ?? "") : "",
    unitPrice: isQuotationQuantityInputItem({ category }) ? unitPrice : 0,
    amount: isQuotationAmountInputItem({ category }) ? amount : 0,
    remark: String(item?.remark ?? item?.note ?? ""),
  };
}

function calculateQuotationTotals(items = []) {
  const supply = items.reduce((sum, item) => {
    if (!isQuotationPricedItem(item)) {
      return sum;
    }
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const amount = Number.isFinite(Number(item.amount)) && Number(item.amount) > 0 ? Number(item.amount) : quantity * unitPrice;
    return sum + amount;
  }, 0);
  const vat = Math.round(supply * 0.1);
  return { supply, vat, total: supply + vat };
}

function normalizeQuotationDraft(quotation, project = null) {
  const normalizedItems = (Array.isArray(quotation?.items) && quotation.items.length ? quotation.items : [emptyQuotationItem()]).map((item, index) => normalizeQuotationItem(item, index));
  const totals = calculateQuotationTotals(normalizedItems);
  const createdDate = String(quotation?.createdDate || quotation?.quoteDate || quotation?.createdAt || new Date().toISOString().slice(0, 10));
  const issuedDate = String(quotation?.issuedDate || quotation?.validUntil || createdDate);
  const supplyAmount = Number(quotation?.supplyAmount ?? quotation?.supply ?? totals.supply) || 0;
  const vatAmount = Number(quotation?.vatAmount ?? quotation?.vat ?? totals.vat) || 0;
  const negotiatedAmount = Number(quotation?.negotiatedAmount ?? quotation?.total ?? supplyAmount + vatAmount) || 0;
  return {
    id: quotation?.id || `QUO-${Date.now()}`,
    projectId: quotation?.projectId || project?.id || "",
    quotationNo: String(quotation?.quotationNo || quotation?.estimateNo || quotationNumber(project)),
    createdDate,
    issuedDate,
    currency: String(quotation?.currency || "KRW"),
    status: String(quotation?.status || "작성중"),
    templateId: String(quotation?.templateId || quotation?.template_id || ""),
    writer: String(quotation?.writer || currentProjectQuotationWriter(project)),
    supplyAmount,
    vatAmount,
    negotiatedAmount,
    customer: String(quotation?.customer || project?.customer || ""),
    vessel: String(quotation?.vessel || project?.vessel || ""),
    equipment: String(quotation?.equipment || project?.equipment || ""),
    title: String(quotation?.title || project?.name || "견적서"),
    note: String(quotation?.note || quotation?.quoteNote || ""),
    updatedAt: String(quotation?.updatedAt || createdDate),
    items: normalizedItems,
  };
}

function readQuotationTemplateDraftFromForm(form, { requireName = false } = {}) {
  const data = Object.fromEntries(new FormData(form).entries());
  const currentDraft = normalizeQuotationTemplate(projectState.templateModal.draft || blankQuotationTemplate());
  const name = String(data.template_name || "").trim();
  if (requireName && !name) {
    return null;
  }
  const items = String(data.default_items || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const columns = line.split("|").map((value) => value.trim());
      const legacyShape = columns.length < 6;
      const [first = "", second = "", third = "", fourth = "", fifth = "", sixth = ""] = columns;
      const category = legacyShape ? "수리항목" : first;
      const quantity = Number(legacyShape ? third || 1 : fourth || 1);
      const unitPrice = Number(legacyShape ? fourth || 0 : fifth || 0);
      return {
        category,
        lineNo: index + 1,
        code: "",
        description: legacyShape ? first : second,
        quantity,
        unit: legacyShape ? second : third,
        unitPrice,
        amount: isQuotationPricedItem({ category }) ? quantity * unitPrice : 0,
        remark: legacyShape ? fifth : sixth,
      };
    });
  const infoFields = PROJECT_TEMPLATE_INFO_FIELDS.map((field) => field.key).filter((key) => form.querySelector(`[name="info_field_${key}"]`)?.checked);
  return normalizeQuotationTemplate({
    id: String(data.template_id || ""),
    name,
    defaultText: String(data.default_text || ""),
    items: items.length ? items : [emptyQuotationItem()],
    page: {
      size: "A4",
      orientation: String(data.page_orientation || "landscape"),
      marginTop: Number(data.margin_top || 18),
      marginRight: Number(data.margin_right || 14),
      marginBottom: Number(data.margin_bottom || 18),
      marginLeft: Number(data.margin_left || 14),
    },
    styles: {
      accentColor: String(data.accent_color || "#2a6fd2"),
      headerBackground: String(data.header_background || "#eef4ff"),
      fontSize: Number(data.font_size || 11),
    },
    document: {
      title: String(data.document_title || currentDraft.document.title || "청구서"),
      logoText: String(data.logo_text || currentDraft.document.logoText || "SUNJIN"),
      logoImageUrl: String(data.logo_image_url || currentDraft.document.logoImageUrl || ""),
      logoPosition: String(data.logo_position || currentDraft.document.logoPosition || "left"),
      logoWidth: Number(data.logo_width || currentDraft.document.logoWidth || 150),
      logoHeight: Number(data.logo_height || currentDraft.document.logoHeight || 46),
      extraLogoText: String(data.extra_logo_text || currentDraft.document.extraLogoText || ""),
      extraLogoImageUrl: String(data.extra_logo_image_url || currentDraft.document.extraLogoImageUrl || ""),
      extraLogoPosition: String(data.extra_logo_position || currentDraft.document.extraLogoPosition || "right"),
      extraLogoWidth: Number(data.extra_logo_width || currentDraft.document.extraLogoWidth || 150),
      extraLogoHeight: Number(data.extra_logo_height || currentDraft.document.extraLogoHeight || 46),
      tagline: String(data.tagline || currentDraft.document.tagline || ""),
      supplierName: String(data.supplier_name || currentDraft.document.supplierName || ""),
      supplierRegistrationNo: String(data.supplier_registration_no || currentDraft.document.supplierRegistrationNo || ""),
      supplierRepresentative: String(data.supplier_representative || currentDraft.document.supplierRepresentative || ""),
      supplierAddress: String(data.supplier_address || currentDraft.document.supplierAddress || ""),
      supplierBusinessType: String(data.supplier_business_type || currentDraft.document.supplierBusinessType || ""),
      showSupplierBox: form.querySelector('[name="show_supplier_box"]') ? Boolean(form.querySelector('[name="show_supplier_box"]')?.checked) : Boolean(currentDraft.document.showSupplierBox),
      showKoreanAmount: form.querySelector('[name="show_korean_amount"]') ? Boolean(form.querySelector('[name="show_korean_amount"]')?.checked) : Boolean(currentDraft.document.showKoreanAmount),
    },
    infoFields,
    table: {
      headerVisible: Boolean(form.querySelector('[name="table_header_visible"]')?.checked),
      rowHeight: Number(data.table_row_height || 34),
    },
  });
}

function defaultQuotationForProject(project) {
  const today = new Date().toISOString().slice(0, 10);
  return normalizeQuotationDraft(
    {
      id: `QUO-${Date.now()}`,
      projectId: project?.id || "",
      quotationNo: quotationNumber(project),
      createdDate: today,
      issuedDate: today,
      currency: "KRW",
      status: "작성중",
      writer: currentProjectQuotationWriter(project),
      supplyAmount: 0,
      vatAmount: 0,
      negotiatedAmount: 0,
      note: project?.quoteNote || "",
      items: [emptyQuotationItem()],
    },
    project,
  );
}

function findProjectQuotation(quotationId) {
  return projectState.quotations.find((quotation) => quotation.id === quotationId) || projectQuotations(selectedProject()).find((quotation) => quotation.id === quotationId) || null;
}

function openProjectQuotationModal(mode, quotation = null) {
  const project = selectedProject();
  const draft = mode === "edit" && quotation ? normalizeQuotationDraft(structuredClone(quotation), project) : defaultQuotationForProject(project);
  projectState.quotationModal = {
    open: true,
    mode,
    quotationId: draft.id || "",
    dirty: false,
    draft,
    selectedItemIndexes: [],
    clipboardItems: [],
    contextMenu: { visible: false, x: 0, y: 0 },
  };
}

function closeProjectQuotationModal() {
  projectState.quotationModal = {
    open: false,
    mode: "create",
    quotationId: "",
    dirty: false,
    draft: null,
    selectedItemIndexes: [],
    clipboardItems: [],
    contextMenu: { visible: false, x: 0, y: 0 },
  };
  closeProjectQuotationPreview();
}

function normalizeProjectQuotationSelection(indexes = [], itemCount = 0) {
  return Array.from(new Set((indexes || []).map((value) => Number(value)).filter((value) => Number.isInteger(value) && value >= 0 && value < itemCount))).sort((left, right) => left - right);
}

function clearProjectQuotationItemSelection() {
  projectState.quotationModal.selectedItemIndexes = [];
}

function closeProjectQuotationContextMenu() {
  projectState.quotationModal.contextMenu = { visible: false, x: 0, y: 0 };
}

function openProjectQuotationContextMenu(x, y) {
  projectState.quotationModal.contextMenu = { visible: true, x: Math.max(8, x), y: Math.max(8, y) };
}

function closeProjectTemplateContextMenu() {
  projectState.templateModal.contextMenu = { visible: false, x: 0, y: 0, target: "" };
}

function openProjectTemplateContextMenu(x, y, target) {
  projectState.templateModal.contextMenu = { visible: true, x: Math.max(8, x), y: Math.max(8, y), target: String(target || "") };
}

function templateLogoFieldName(kind = "primary", suffix = "ImageUrl") {
  return kind === "extra" ? `extraLogo${suffix}` : `logo${suffix}`;
}

function openProjectQuotationPreview(html) {
  projectState.quotationPreview = {
    open: true,
    html: String(html || ""),
  };
}

function closeProjectQuotationPreview() {
  projectState.quotationPreview = {
    open: false,
    html: "",
  };
}

function syncProjectQuotationDraftFromForm(form = document.getElementById("project-quotation-form")) {
  if (!(form instanceof HTMLFormElement)) {
    return projectState.quotationModal.draft || null;
  }
  const draft = readQuotationDraftFromForm(form);
  projectState.quotationModal.draft = draft;
  projectState.quotationModal.selectedItemIndexes = normalizeProjectQuotationSelection(
    projectState.quotationModal.selectedItemIndexes,
    draft.items.length,
  );
  return draft;
}

function selectProjectQuotationItem(index, additive = false) {
  const draft = syncProjectQuotationDraftFromForm();
  const itemCount = draft?.items?.length || 0;
  if (!itemCount) {
    clearProjectQuotationItemSelection();
    return;
  }
  const normalizedIndex = Math.max(0, Math.min(itemCount - 1, Number(index) || 0));
  if (!additive) {
    projectState.quotationModal.selectedItemIndexes = [normalizedIndex];
    return;
  }
  const selected = new Set(projectState.quotationModal.selectedItemIndexes || []);
  if (selected.has(normalizedIndex)) {
    selected.delete(normalizedIndex);
  } else {
    selected.add(normalizedIndex);
  }
  projectState.quotationModal.selectedItemIndexes = normalizeProjectQuotationSelection(Array.from(selected), itemCount);
}

function deleteProjectQuotationItems(indexes = []) {
  const draft = syncProjectQuotationDraftFromForm();
  if (!draft) {
    return false;
  }
  const selectedIndexes = normalizeProjectQuotationSelection(indexes, draft.items.length);
  if (!selectedIndexes.length) {
    return false;
  }
  draft.items = draft.items.filter((_item, itemIndex) => !selectedIndexes.includes(itemIndex));
  if (!draft.items.length) {
    draft.items = [emptyQuotationItem()];
  }
  projectState.quotationModal.draft = normalizeQuotationDraft(draft, selectedProject());
  projectState.quotationModal.selectedItemIndexes = [];
  projectState.quotationModal.dirty = true;
  return true;
}

function copyProjectQuotationItems(indexes = [], cut = false) {
  const draft = syncProjectQuotationDraftFromForm();
  if (!draft) {
    return false;
  }
  const selectedIndexes = normalizeProjectQuotationSelection(indexes, draft.items.length);
  if (!selectedIndexes.length) {
    return false;
  }
  projectState.quotationModal.clipboardItems = selectedIndexes.map((itemIndex) => structuredClone(draft.items[itemIndex]));
  if (cut) {
    deleteProjectQuotationItems(selectedIndexes);
  }
  return true;
}

function pasteProjectQuotationItems() {
  const draft = syncProjectQuotationDraftFromForm();
  const clipboardItems = (projectState.quotationModal.clipboardItems || []).map((item) => structuredClone(item));
  if (!draft || !clipboardItems.length) {
    return false;
  }
  const selectedIndexes = normalizeProjectQuotationSelection(projectState.quotationModal.selectedItemIndexes, draft.items.length);
  const insertIndex = selectedIndexes.length ? Math.max(...selectedIndexes) + 1 : draft.items.length;
  draft.items.splice(insertIndex, 0, ...clipboardItems);
  projectState.quotationModal.draft = normalizeQuotationDraft(draft, selectedProject());
  projectState.quotationModal.selectedItemIndexes = clipboardItems.map((_item, offset) => insertIndex + offset);
  projectState.quotationModal.dirty = true;
  return true;
}

function openProjectTemplateModal() {
  const templates = loadQuotationTemplates();
  projectState.templateModal = {
    open: true,
    selectedTemplateId: templates[0]?.id || "",
    draft: templates[0] ? structuredClone(templates[0]) : blankQuotationTemplate(),
    contextMenu: { visible: false, x: 0, y: 0, target: "" },
  };
}

function closeProjectTemplateModal() {
  projectState.templateModal = {
    open: false,
    selectedTemplateId: "",
    draft: null,
    contextMenu: { visible: false, x: 0, y: 0, target: "" },
  };
}

function projectQuotations(project) {
  if (!project) {
    return [];
  }
  const saved = projectState.quotations.filter((quotation) => quotation.projectId === project.id).map((quotation) => normalizeQuotationDraft(quotation, project));
  if (saved.length) {
    return saved;
  }
  return [
    normalizeQuotationDraft(
      {
        ...defaultQuotationForProject(project),
        id: `seed-${project.id}`,
        quotationNo: project.estimateNo || quotationNumber(project),
        createdDate: project.quoteDate || "",
        issuedDate: project.quoteDate || "",
        title: project.quoteDocumentName || project.name || "견적서",
        status: project.quoteStatus || "작성중",
        writer: project.quoteManager || project.manager || "",
        updatedAt: project.quoteDate || "",
        supplyAmount: Number(project.quoteAmount || 0),
        vatAmount: Math.round(Number(project.quoteAmount || 0) * 0.1),
        negotiatedAmount: Number(project.quoteAmount || 0),
        items: [emptyQuotationItem()],
      },
      project,
    ),
  ];
}

function readQuotationDraftFromForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const items = Array.from(form.querySelectorAll("[data-quotation-item-row]")).map((row) => {
    const index = row.dataset.quotationItemRow;
    const category = String(form.querySelector(`[name="item_category_${index}"]`)?.value || "");
    const quantity = Number(form.querySelector(`[name="item_quantity_${index}"]`)?.value || 0);
    const unitPrice = Number(form.querySelector(`[name="item_unit_price_${index}"]`)?.value || 0);
    const inputAmount = Number(form.querySelector(`[name="item_amount_${index}"]`)?.value || 0);
    const item = {
      category,
      lineNo: String(form.querySelector(`[name="item_line_no_${index}"]`)?.value || ""),
      code: String(form.querySelector(`[name="item_code_${index}"]`)?.value || ""),
      description: String(form.querySelector(`[name="item_description_${index}"]`)?.value || ""),
      quantity,
      unit: String(form.querySelector(`[name="item_unit_${index}"]`)?.value || ""),
      unitPrice,
      amount: isQuotationPricedItem({ category }) && !inputAmount ? quantity * unitPrice : inputAmount,
      remark: String(form.querySelector(`[name="item_remark_${index}"]`)?.value || ""),
    };
    return normalizeQuotationItem(item);
  });
  const totals = calculateQuotationTotals(items);
  return normalizeQuotationDraft(
    {
      ...(projectState.quotationModal.draft || {}),
      quotationNo: String(data.quotation_no || ""),
      createdDate: String(data.created_date || ""),
      issuedDate: String(data.issued_date || ""),
      currency: String(data.currency || "KRW"),
      status: String(data.status || "작성중"),
      templateId: String(data.template_id || ""),
      writer: String(data.writer || ""),
      supplyAmount: totals.supply,
      vatAmount: totals.vat,
      negotiatedAmount: totals.supply,
      updatedAt: new Date().toISOString().slice(0, 10),
      items,
    },
    selectedProject(),
  );
}

function quotationTemplateForDraft(quotation) {
  const templates = loadQuotationTemplates();
  return normalizeQuotationTemplate(templates.find((template) => template.id === quotation.templateId) || templates[0] || blankQuotationTemplate());
}

function quotationItemPrintClass(item = {}) {
  const category = String(item.category || "");
  if (category === "제목") return "section-title";
  if (category === "세부제목") return "sub-title";
  if (category === "항목설명") return "description-row";
  if (category === "소계") return "subtotal-row";
  if (category === "주석제목") return "note-title";
  if (category === "주석항목") return "note-row";
  if (category === "빈칸") return "blank-row";
  return "price-row";
}

function quotationAmountText(value, currency = "KRW") {
  const amount = Number(value || 0).toLocaleString("ko-KR");
  return currency === "KRW" ? `₩${amount}` : `${escapeTextarea(currency)} ${amount}`;
}

function renderTemplateLogoMark(document = {}, kind = "primary") {
  const imageUrl = kind === "extra" ? document.extraLogoImageUrl : document.logoImageUrl;
  const text = kind === "extra" ? document.extraLogoText : document.logoText;
  const width = Number(kind === "extra" ? document.extraLogoWidth : document.logoWidth) || 150;
  const height = Number(kind === "extra" ? document.extraLogoHeight : document.logoHeight) || 46;
  const fieldName = kind === "extra" ? "extraLogoText" : "logoText";
  const className = kind === "extra" ? "project-template-extra-logo" : "project-template-brand-block";
  const logoAttrs = `data-project-template-logo="${kind}" data-project-template-context-target="logo-${kind}"`;
  if (imageUrl) {
    return `<div class="${className} image-logo" ${logoAttrs}><img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(text || "logo")}" style="width:${escapeAttribute(String(width))}px; height:${escapeAttribute(String(height))}px;" /><span contenteditable="true" data-project-template-inline-field="${fieldName}">${escapeTextarea(text || "")}</span></div>`;
  }
  return kind === "extra"
    ? `<div class="${className}" contenteditable="true" data-project-template-inline-field="${fieldName}" ${logoAttrs}>${escapeTextarea(text || "")}</div>`
    : `<div class="${className}" ${logoAttrs}><strong contenteditable="true" data-project-template-inline-field="${fieldName}">${escapeTextarea(text || "SUNJIN")}</strong><small>SHERWOOD</small></div>`;
}

function quotationPrintHtml(quotation) {
  const normalized = normalizeQuotationDraft(quotation, selectedProject());
  const template = quotationTemplateForDraft(normalized);
  const document = template.document || {};
  const project = selectedProject();
  const money = (value) => quotationAmountText(value, normalized.currency || "KRW");
  const metaRows = [
    ["일자", normalized.issuedDate || normalized.createdDate || "-"],
    ["수신", normalized.customer || project?.customer || "-"],
    ["참조", ""],
    ["선명", normalized.vessel || project?.vessel || "-"],
    ["수주번호", project?.managementNo || project?.estimateNo || "-"],
    ["SUBJECT", normalized.title || project?.name || "견적서"],
  ];
  const supplierRows = [
    ["등록번호", document.supplierRegistrationNo || "-"],
    ["상호", document.supplierName || "-"],
    ["성명", document.supplierRepresentative || "-"],
    ["주소", document.supplierAddress || "-"],
    ["업태/종목", document.supplierBusinessType || "-"],
  ];
  const tableRows = (normalized.items || []).map((item) => {
    const rowClass = quotationItemPrintClass(item);
    const showQuantity = isQuotationQuantityInputItem(item);
    const showAmount = isQuotationAmountInputItem(item);
    const blank = isQuotationBlankItem(item);
    return `
      <tr class="${rowClass}">
        <td>${blank ? "" : escapeTextarea(item.category || "")}</td>
        <td>${blank ? "" : escapeTextarea(item.lineNo || "")}</td>
        <td>${blank ? "" : escapeTextarea(item.code || "")}</td>
        <td>${blank ? "" : escapeTextarea(item.description || "")}</td>
        <td>${showQuantity ? escapeTextarea(item.quantity || "") : ""}</td>
        <td>${showQuantity ? escapeTextarea(item.unit || "") : ""}</td>
        <td>${showQuantity ? money(item.unitPrice) : ""}</td>
        <td>${showAmount ? money(item.amount) : blank ? "" : escapeTextarea(item.remark || "")}</td>
      </tr>
    `;
  }).join("");
  return `
    <!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <title>${escapeTextarea(normalized.quotationNo || document.title || "견적서")}</title>
        <style>
          @page { size: A4 ${template.page.orientation}; margin: ${template.page.marginTop}mm ${template.page.marginRight}mm ${template.page.marginBottom}mm ${template.page.marginLeft}mm; }
          body { font-family: "Pretendard", "Noto Sans KR", Arial, sans-serif; color: #111; margin: 0; font-size: ${template.styles.fontSize}px; }
          h1 { margin: 0; text-align: center; font-size: 30px; letter-spacing: 10px; font-weight: 500; }
          .doc-header { display: grid; grid-template-columns: 1fr 260px; gap: 18px; align-items: end; margin-bottom: 8px; }
          .brand { display: flex; align-items: end; gap: 12px; min-height: 72px; }
          .brand strong { color: #1f4ea3; font-size: 28px; letter-spacing: 1px; }
          .brand span { font-size: 10px; color: #111; }
          .tagline { text-align: right; font-size: 11px; margin: -4px 0 6px; }
          .top-grid { display: grid; grid-template-columns: 1fr 420px; gap: 0; border: 1px solid #111; border-bottom: 0; }
          .meta-table, .supplier-table, .item-table, .amount-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #111; padding: 6px 8px; vertical-align: middle; }
          .meta-table th { width: 86px; font-weight: 500; }
          .supplier-table th { width: 76px; font-weight: 500; }
          .supplier-label { writing-mode: vertical-rl; text-align: center; width: 28px; }
          .amount-table { border-top: 0; margin-bottom: 0; }
          .amount-table th { width: 110px; font-weight: 500; }
          .amount-table .amount-words { font-size: 15px; font-weight: 600; }
          .amount-table .amount-number { text-align: right; font-size: 16px; font-weight: 700; }
          .item-table { margin-top: 0; }
          .item-table thead th { background: ${escapeAttribute(template.styles.headerBackground)}; font-size: 13px; letter-spacing: 4px; text-align: center; }
          .item-table td { height: ${template.table.rowHeight}px; }
          .item-table td:nth-child(1), .item-table td:nth-child(2), .item-table td:nth-child(5), .item-table td:nth-child(6) { text-align: center; }
          .item-table td:nth-child(7), .item-table td:nth-child(8) { text-align: right; }
          .item-table tbody tr:nth-child(even) td { background: #dedede; }
          .section-title td, .sub-title td { font-weight: 700; font-size: 14px; }
          .description-row td, .note-row td { font-size: 11px; }
          .subtotal-row td { font-weight: 700; font-size: 14px; }
          .blank-row td { color: transparent; }
          .note { margin-top: 12px; min-height: 56px; border: 1px solid #111; padding: 10px; }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <div class="brand"><strong>${escapeTextarea(document.logoText || "")}</strong><span>${escapeTextarea(normalized.quotationNo || "")}</span></div>
          <h1>${escapeTextarea(document.title || "견적서")}</h1>
        </div>
        <p class="tagline">${escapeTextarea(document.tagline || "")}</p>
        <section class="top-grid">
          <table class="meta-table">
            ${metaRows.map(([label, value]) => `<tr><th>${escapeTextarea(label)}</th><td>${escapeTextarea(value)}</td></tr>`).join("")}
          </table>
          ${
            document.showSupplierBox
              ? `<table class="supplier-table"><tr><th class="supplier-label" rowspan="${supplierRows.length}">공급자</th><th>${escapeTextarea(supplierRows[0][0])}</th><td>${escapeTextarea(supplierRows[0][1])}</td></tr>${supplierRows.slice(1).map(([label, value]) => `<tr><th>${escapeTextarea(label)}</th><td>${escapeTextarea(value)}</td></tr>`).join("")}</table>`
              : ""
          }
        </section>
        <table class="amount-table">
          <tr>
            <th>합계금액</th>
            <td class="amount-words">${document.showKoreanAmount ? `일금 ${money(normalized.negotiatedAmount)} 정` : ""}</td>
            <td class="amount-number">${money(normalized.negotiatedAmount)}</td>
          </tr>
        </table>
        <table class="item-table">
          ${template.table.headerVisible ? "<thead><tr><th>NO</th><th>PART.NO</th><th colspan=\"2\">D E S C R I P T I O N</th><th>Q'TY</th><th>U/PRICE</th><th colspan=\"2\">AMOUNT</th></tr></thead>" : ""}
          <tbody>${tableRows}</tbody>
        </table>
        <div class="note">${escapeTextarea(normalized.note || "")}</div>
      </body>
    </html>
  `;
}

function projectOrderType(order) {
  if (typeof normalizeOrderType === "function") {
    return normalizeOrderType(order.businessType || order.requestType || "");
  }
  return order.businessType === "판매" || order.requestType === "판매" ? "판매" : "공사";
}

function isProjectOrderCandidate(order) {
  return Boolean(order && !order.deletedAt && !order.mergedInto && order.confirmed && projectOrderType(order) === "공사");
}

function projectIdForOrder(order) {
  return `PRJ-${String(order.id || Date.now()).replace(/^OR-/, "")}`;
}

function projectEstimateNoForOrder(order) {
  return `QT-${String(order.id || Date.now()).replace(/^OR-/, "")}`;
}

function projectStatusFromOrder(order) {
  const status = order.status || "";
  if (status === "공사중") {
    return "진행 중";
  }
  if (status === "준공" || status === "청구") {
    return "준공 대기";
  }
  if (status === "완공") {
    return "준공";
  }
  if (status === "발주") {
    return "공사 준비";
  }
  return order.confirmed ? "수주 확정" : "견적 상태";
}

function emptyProjectChecklist(order) {
  return [
    {
      id: `${projectIdForOrder(order)}-CHK-001`,
      checked: false,
      item: "작업 범위 확인",
      standard: "주문/견적 기준 작업 범위 확인",
      status: "미시작",
      manager: order.manager || "",
      completedAt: "",
      note: "",
    },
  ];
}

function emptyProjectReports() {
  return [
    { type: "서비스 레포트", required: true, status: "작성 필요", writer: "", date: "", documentId: "", file: "", note: "" },
    { type: "계측 및 시험 성적서", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
    { type: "점검 레포트", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
    { type: "소견서", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
  ];
}

function projectFromOrder(order, existing = {}) {
  const managementNo = order.managementNumber && order.managementNumber !== "확정 후 발급" ? order.managementNumber : existing.managementNo || "견적 상태";
  const quoteDate = order.requestDate || existing.quoteDate || new Date().toISOString().slice(0, 10);
  return {
    ...existing,
    id: existing.id || projectIdForOrder(order),
    sourceOrderId: order.id,
    estimateNo: existing.estimateNo || projectEstimateNoForOrder(order),
    managementNo,
    name: order.description || existing.name || `${order.vessel || "선박"} ${order.equipment || "장비"} 공사`,
    customer: order.customer || existing.customer || "",
    vessel: order.vessel || existing.vessel || "",
    equipment: order.equipment || existing.equipment || "",
    status: projectStatusFromOrder(order),
    manager: order.manager || existing.manager || "",
    quoteStatus: order.confirmed ? "수주 확정" : existing.quoteStatus || "견적 작성",
    quoteDate,
    quoteAmount: existing.quoteAmount || 0,
    quoteManager: order.manager || existing.quoteManager || "",
    quoteDocumentId: existing.quoteDocumentId || "",
    quoteDocumentName: existing.quoteDocumentName || "",
    partsQuote: Boolean(order.partsQuote ?? existing.partsQuote),
    repairQuote: Boolean(order.repairQuote ?? existing.repairQuote),
    quoteNote: existing.quoteNote || order.description || "",
    orderConfirmed: Boolean(order.confirmed),
    plannedStart: order.confirmationDate || existing.plannedStart || "",
    plannedEnd: existing.plannedEnd || "",
    folderCreated: order.confirmed || Boolean(existing.folderCreated),
    folderCreatedAt: existing.folderCreatedAt || (order.confirmed ? quoteDate : ""),
    folderPath: existing.folderPath || (order.confirmed ? `projects/${managementNo}` : ""),
    checklist: existing.checklist?.length ? existing.checklist : emptyProjectChecklist(order),
    progressLogs: existing.progressLogs?.length
      ? existing.progressLogs
      : [
          {
            date: quoteDate,
            status: projectStatusFromOrder(order),
            manager: order.manager || "",
            content: "주문관리 수주 확정으로 공사 항목 생성.",
            nextAction: order.confirmationDate ? "공사 준비" : "공사 예정일 등록",
            attachment: "",
          },
        ],
    reports: existing.reports?.length ? existing.reports : emptyProjectReports(),
    externalRequests: existing.externalRequests || [],
    completion: existing.completion || {
      specCreated: false,
      sealed: false,
      receivedDate: "",
      documentId: "",
      storageLocation: "",
      completedAt: "",
      note: "",
      status: "작성 전",
    },
    orderArchived: false,
    mergedIntoOrderId: "",
  };
}

function projectIndexForOrder(order, previousOrder = null) {
  const orderIds = [order?.id, previousOrder?.id].filter(Boolean);
  const managementNumbers = [order?.managementNumber, previousOrder?.managementNumber].filter((value) => value && value !== "확정 후 발급");
  return projectState.projects.findIndex(
    (project) =>
      orderIds.includes(project.sourceOrderId || project.orderId || "") ||
      managementNumbers.includes(project.managementNo || ""),
  );
}

function syncProjectFromOrder(order, previousOrder = null) {
  if (!order?.id) {
    return;
  }
  const index = projectIndexForOrder(order, previousOrder);
  if (!isProjectOrderCandidate(order)) {
    if (index >= 0) {
      projectState.projects = projectState.projects.map((project, projectIndex) =>
        projectIndex === index
          ? {
              ...project,
              sourceOrderId: project.sourceOrderId || previousOrder?.id || order.id,
              orderArchived: true,
              archivedReason: order.mergedInto ? "주문 병합" : "주문 공사 대상 해제",
              mergedIntoOrderId: order.mergedInto || "",
            }
          : project,
      );
    }
    return;
  }

  if (index >= 0) {
    projectState.projects = projectState.projects.map((project, projectIndex) => (projectIndex === index ? projectFromOrder(order, project) : project));
    return;
  }

  projectState.projects = [projectFromOrder(order), ...projectState.projects];
  projectState.selectedProjectId = projectIdForOrder(order);
}

function syncProjectsAfterOrderMerge(keepOrder, sourceOrders) {
  if (keepOrder) {
    syncProjectFromOrder(keepOrder);
  }
  const sourceIds = new Set((sourceOrders || []).map((order) => order.id));
  projectState.projects = projectState.projects.map((project) =>
    sourceIds.has(project.sourceOrderId || project.orderId || "")
      ? {
          ...project,
          orderArchived: true,
          archivedReason: "주문 병합",
          mergedIntoOrderId: keepOrder?.id || "",
        }
      : project,
  );
}

function projectBadgeKind(status) {
  if (status === "준공" || status === "완료" || status === "발송 완료" || status === "보관 완료" || status === "회신 완료") {
    return "ok";
  }
  if (status === "진행 중" || status === "레포트 작성 중" || status === "외부 의뢰 대기" || status === "준공 대기" || status === "작성 중" || status === "회신 대기") {
    return "warn";
  }
  if (status === "취소" || status === "지연") {
    return "danger";
  }
  return "neutral";
}

function projectLinkedOrder(project) {
  if (typeof orderState === "undefined") {
    return null;
  }
  return (orderState.orders || []).find((order) => {
    if (order.deletedAt || order.mergedInto || !order.confirmed || projectOrderType(order) !== "공사") {
      return false;
    }
    if (project.sourceOrderId && project.sourceOrderId === order.id) {
      return true;
    }
    return project.managementNo && project.managementNo !== "견적 상태" && project.managementNo === order.managementNumber;
  }) || null;
}

function isVisibleProject(project) {
  if (!project || project.orderArchived) {
    return false;
  }
  if (orderProjectDataLoaded) {
    return true;
  }
  return Boolean(projectLinkedOrder(project));
}

function visibleProjects() {
  return projectState.projects.filter(isVisibleProject);
}

function selectedProject() {
  if (!projectState.hasSearched) {
    return null;
  }
  const projects = filteredProjects();
  return projects.find((project) => project.id === projectState.selectedProjectId) || projects[0] || null;
}

function isDefaultProjectSearch(filters) {
  const defaultFilters = defaultProjectFilters();
  return (
    String(filters.startDate || "") === defaultFilters.startDate &&
    String(filters.endDate || "") === defaultFilters.endDate &&
    !String(filters.status || "") &&
    !String(filters.query || "").trim()
  );
}

function filteredProjects() {
  if (!projectState.hasSearched) {
    return [];
  }
  const filters = projectState.filters || defaultProjectFilters();
  const query = String(filters.query || "").trim().toLowerCase();
  const shouldApplyDateFilter = !isDefaultProjectSearch(filters);
  return visibleProjects().filter((project) => {
    if (shouldApplyDateFilter && filters.startDate && project.quoteDate < filters.startDate) {
      return false;
    }
    if (shouldApplyDateFilter && filters.endDate && project.quoteDate > filters.endDate) {
      return false;
    }
    if (filters.status && project.status !== filters.status) {
      return false;
    }
    if (query) {
      const haystack = [project.managementNo, project.estimateNo, project.customer, project.vessel, project.equipment, project.name].join(" ").toLowerCase();
      return haystack.includes(query);
    }
    return true;
  });
}

function projectSummaryBucket(status) {
  if (["견적 상태", "견적 발행", "수주 전"].includes(status)) {
    return "견적 발행";
  }
  if (["준공", "보관 완료"].includes(status)) {
    return "준공";
  }
  if (["수주 확정", "공사 준비", "진행 중", "레포트 작성 중", "외부 의뢰 대기", "준공 대기"].includes(status)) {
    return "작업중";
  }
  return "작업중";
}

function projectDocuments() {
  return visibleProjects().flatMap((project) => {
    const quoteDocument = project.quoteDocumentId
      ? [
          {
            type: "견적서",
            name: project.quoteDocumentName || "견적서",
            projectNo: project.managementNo || project.estimateNo,
            status: project.quoteStatus || "견적 상태",
            date: project.quoteDate || "",
          },
        ]
      : [];
    const reportDocuments = (project.reports || [])
      .filter((report) => report.documentId)
      .map((report) => ({
        type: report.type,
        name: report.documentId,
        projectNo: project.managementNo || project.estimateNo,
        status: report.status,
        date: report.date || project.quoteDate || "",
      }));
    const externalDocuments = (project.externalRequests || [])
      .filter((request) => request.attachment)
      .map((request) => ({
        type: "외부 의뢰 자료",
        name: request.attachment,
        projectNo: project.managementNo || project.estimateNo,
        status: request.status,
        date: request.requestDate || "",
      }));
    const completionDocument = project.completion?.documentId
      ? [
          {
            type: "수리완공사양서",
            name: project.completion.documentId,
            projectNo: project.managementNo || project.estimateNo,
            status: project.completion.status || "작성 전",
            date: project.completion.completedAt || project.completion.receivedDate || "",
          },
        ]
      : [];
    return [...quoteDocument, ...reportDocuments, ...externalDocuments, ...completionDocument];
  });
}

function renderProjectViewToggle() {
  return `
    <div class="project-view-toggle" role="group" aria-label="공사관리 보기 전환">
      <button type="button" class="project-view-button${projectState.viewMode === "project" ? " active" : ""}" data-project-view-mode="project">공사뷰</button>
      <button type="button" class="project-view-button${projectState.viewMode === "document" ? " active" : ""}" data-project-view-mode="document">문서뷰</button>
    </div>
  `;
}

function renderProjectFilters() {
  return `
    <form id="project-filter-form" class="project-filterbar">
      ${renderProjectViewToggle()}
      <label>기간 <input class="text-field" type="date" name="start_date" value="${escapeAttribute(projectState.filters.startDate)}" /></label>
      <label>~ <input class="text-field" type="date" name="end_date" value="${escapeAttribute(projectState.filters.endDate)}" /></label>
      <label>상태 <select class="text-field" name="status"><option value="">전체</option>${projectSelectOptions(PROJECT_STATUS_OPTIONS, projectState.filters.status)}</select></label>
      <label class="project-filter-query">검색 <input class="text-field" type="search" name="query" value="${escapeAttribute(projectState.filters.query)}" placeholder="관리번호 / 발주처 / 선박 / 장비 / 공사명" /></label>
      <button class="secondary-button" type="submit">조회</button>
      <button class="secondary-button" type="button" data-project-filter-reset>Clear</button>
    </form>
  `;
}

function renderProjectSummary() {
  const count = (bucket) => visibleProjects().filter((project) => projectSummaryBucket(project.status) === bucket).length;
  return `
    <section class="project-summary-grid">
      <article class="project-summary-card"><span>견적 발행</span><strong>${count("견적 발행")}</strong><small>수주 전 견적</small></article>
      <article class="project-summary-card"><span>작업중</span><strong>${count("작업중")}</strong><small>확정 후 진행</small></article>
      <article class="project-summary-card"><span>준공</span><strong>${count("준공")}</strong><small>보관 완료 포함</small></article>
    </section>
  `;
}

function renderProjectSidebar() {
  const projects = filteredProjects();
  const columns = projectListColumns();
  return `
    <aside class="project-sidebar">
      <div class="project-panel-title">
        <strong>공사 목록</strong>
        <span>${projects.length}건</span>
      </div>
      <div class="project-list-head" style="${projectListColumnStyle(columns)}">
        ${columns
          .map(
            (column) =>
              `<div class="project-list-th" draggable="true" data-project-column-field="${escapeAttribute(column.field)}" title="드래그해서 위치 변경">
                <span>${escapeTextarea(column.label)}</span>
                <i data-project-column-resizer="${escapeAttribute(column.field)}" aria-hidden="true"></i>
              </div>`,
          )
          .join("")}
      </div>
      <div class="project-list-scroll">
        <div class="project-list">
          ${
            projects.length
              ? projects
                  .map(
                    (project) => `
                      <button type="button" class="project-list-row${project.id === projectState.selectedProjectId ? " active" : ""}" style="${projectListColumnStyle(columns)}" data-project-select="${escapeAttribute(project.id)}">
                        ${columns.map((column) => renderProjectListCell(project, column.field)).join("")}
                      </button>
                    `,
                  )
                  .join("")
              : '<div class="project-empty">조회 조건에 맞는 공사가 없습니다.</div>'
          }
        </div>
      </div>
    </aside>
  `;
}

function renderProjectOverview(project) {
  return `
    <section class="project-panel">
      <div class="project-overview-grid">
        <div class="project-info-block">
          <h4>견적 정보</h4>
          <dl class="project-info-list">
            <div><dt>견적번호</dt><dd>${escapeTextarea(project.estimateNo)}</dd></div>
            <div><dt>견적 상태</dt><dd>${escapeTextarea(project.quoteStatus)}</dd></div>
            <div><dt>견적 작성일</dt><dd>${escapeTextarea(project.quoteDate)}</dd></div>
            <div><dt>수주 체크</dt><dd>${project.orderConfirmed ? "활성" : "미활성"}</dd></div>
          </dl>
        </div>
        <div class="project-info-block">
          <h4>공사 정보</h4>
          <dl class="project-info-list">
            <div><dt>관리번호</dt><dd>${escapeTextarea(project.managementNo)}</dd></div>
            <div><dt>공사명</dt><dd>${escapeTextarea(project.name)}</dd></div>
            <div><dt>발주처</dt><dd>${escapeTextarea(project.customer)}</dd></div>
            <div><dt>선박/장비</dt><dd>${escapeTextarea(project.vessel)} / ${escapeTextarea(project.equipment)}</dd></div>
            <div><dt>담당자</dt><dd>${escapeTextarea(project.manager)}</dd></div>
            <div><dt>시작 예정일</dt><dd>${escapeTextarea(project.plannedStart || "-")}</dd></div>
            <div><dt>완료 예정일</dt><dd>${escapeTextarea(project.plannedEnd || "-")}</dd></div>
            <div><dt>현재 상태</dt><dd><span class="status-badge ${projectBadgeKind(project.status)}">${escapeTextarea(project.status)}</span></dd></div>
          </dl>
        </div>
        <div class="project-info-block project-wide-block">
          <h4>공사 문서/폴더</h4>
          <dl class="project-info-list">
            <div><dt>생성 상태</dt><dd>${project.folderCreated ? "생성됨" : "미생성"}</dd></div>
            <div><dt>생성일</dt><dd>${escapeTextarea(project.folderCreatedAt || "-")}</dd></div>
            <div><dt>경로/문서 묶음</dt><dd>${escapeTextarea(project.folderPath || "-")}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  `;
}

function renderProjectEstimate(project) {
  const quotations = projectQuotations(project);
  return `
    <section class="project-panel project-quotation-panel">
      <div class="project-quotation-actions">
        <button type="button" class="secondary-button" data-project-quotation-new>신규</button>
        <button type="button" class="secondary-button" data-project-quotation-template>템플릿 관리</button>
      </div>
      <div class="project-quotation-table">
        <div class="project-quotation-head">
          <span>견적번호</span>
          <span>작성일</span>
          <span>발행일</span>
          <span>통화</span>
          <span>상태</span>
          <span>작성자</span>
          <span>공급가</span>
          <span>부가세</span>
          <span>네고가</span>
          <span>최종 수정일</span>
        </div>
        <div class="project-quotation-list">
          ${
            quotations.length
              ? quotations
                  .map(
                    (quotation) => `
                      <button type="button" class="project-quotation-row" data-project-quotation-open="${escapeAttribute(quotation.id)}">
                        <span>${escapeTextarea(quotation.quotationNo || "-")}</span>
                        <span>${escapeTextarea(quotation.createdDate || "-")}</span>
                        <span>${escapeTextarea(quotation.issuedDate || "-")}</span>
                        <span>${escapeTextarea(quotation.currency || "-")}</span>
                        <span><mark class="status-badge ${projectBadgeKind(quotation.status)}">${escapeTextarea(quotation.status || "-")}</mark></span>
                        <span>${escapeTextarea(quotation.writer || "-")}</span>
                        <span>${Number(quotation.supplyAmount || 0).toLocaleString("ko-KR")}</span>
                        <span>${Number(quotation.vatAmount || 0).toLocaleString("ko-KR")}</span>
                        <span>${Number(quotation.negotiatedAmount || 0).toLocaleString("ko-KR")}</span>
                        <span>${escapeTextarea(quotation.updatedAt || "-")}</span>
                      </button>
                    `,
                  )
                  .join("")
              : '<div class="project-empty">등록된 견적서가 없습니다.</div>'
          }
        </div>
      </div>
    </section>
  `;
}

function renderProjectQuotationModal() {
  if (!projectState.quotationModal.open) {
    return "";
  }
  const project = selectedProject();
  const quotation = normalizeQuotationDraft(projectState.quotationModal.draft || defaultQuotationForProject(project), project);
  const templates = loadQuotationTemplates();
  const selectedItemIndexes = normalizeProjectQuotationSelection(projectState.quotationModal.selectedItemIndexes, quotation.items.length);
  const clipboardReady = Boolean(projectState.quotationModal.clipboardItems?.length);
  const contextMenu = projectState.quotationModal.contextMenu || { visible: false, x: 0, y: 0 };
  return `
    <div class="project-modal-backdrop">
      <section class="project-modal project-quotation-modal" role="dialog" aria-modal="true">
        <header class="project-modal-header">
          <h3>${projectState.quotationModal.mode === "edit" ? "견적서 수정" : "견적서 작성"}</h3>
          <button type="button" class="ghost-button" data-project-quotation-close>닫기</button>
        </header>
        <form id="project-quotation-form" class="project-modal-body">
          <input type="hidden" name="title" value="${escapeAttribute(quotation.title || project?.name || "견적서")}" />
          <input type="hidden" name="quotation_no" value="${escapeAttribute(quotation.quotationNo || "")}" />
          <div class="project-quotation-context">
            <span><b>관리번호</b>${escapeTextarea(project?.managementNo || "-")}</span>
            <span><b>견적번호</b>${escapeTextarea(quotation.quotationNo || "-")}</span>
            <span><b>거래처</b>${escapeTextarea(project?.customer || quotation.customer || "-")}</span>
            <span><b>선박</b>${escapeTextarea(project?.vessel || quotation.vessel || "-")}</span>
            <span><b>장비</b>${escapeTextarea(project?.equipment || quotation.equipment || "-")}</span>
            <span><b>공사명</b>${escapeTextarea(project?.name || quotation.title || "-")}</span>
          </div>
          <div class="project-quotation-layout" style="${projectQuotationLayoutStyle()}">
            <aside class="project-quotation-form-grid">
              <label>템플릿 <select class="text-field" name="template_id" data-project-template-apply><option value="">선택 안 함</option>${templates.map((template) => `<option value="${escapeAttribute(template.id)}"${template.id === quotation.templateId ? " selected" : ""}>${escapeTextarea(template.name)}</option>`).join("")}</select></label>
              <label>작성일 <input class="text-field" type="date" name="created_date" value="${escapeAttribute(quotation.createdDate || "")}" /></label>
              <label>발행일 <input class="text-field" type="date" name="issued_date" value="${escapeAttribute(quotation.issuedDate || "")}" /></label>
              <label>통화 <select class="text-field" name="currency">${projectCurrencyOptions(quotation.currency)}</select></label>
              <label>상태 <select class="text-field" name="status">${quotationStatusOptions(quotation.status)}</select></label>
              <label>작성자 <input class="text-field" name="writer" value="${escapeAttribute(quotation.writer || "")}" /></label>
              <label>공급가 <input class="text-field" type="number" name="supply_amount" value="${escapeAttribute(String(quotation.supplyAmount || 0))}" /></label>
              <label>부가세 <input class="text-field" type="number" name="vat_amount" value="${escapeAttribute(String(quotation.vatAmount || 0))}" /></label>
              <label>네고가 <input class="text-field" type="number" name="negotiated_amount" value="${escapeAttribute(String(quotation.negotiatedAmount || 0))}" /></label>
            </aside>
            <span data-project-quotation-form-resizer title="입력 영역 폭 조절" style="display:block; min-width:8px; width:8px; cursor:col-resize; border-radius:8px; background:linear-gradient(90deg, transparent 2px, #cbd5e1 2px, #cbd5e1 6px, transparent 6px);"></span>
            <section class="project-quotation-sheet">
              <div class="project-quotation-items">
                <div class="project-quotation-item-head"><span>구분</span><span>번호</span><span>코드</span><span>내용</span><span>수량</span><span>단위</span><span>단가</span><span>금액</span><span>remark</span></div>
                ${(quotation.items || []).map((item, index) => {
                  const normalizedItem = normalizeQuotationItem(item, index);
                  const blank = isQuotationBlankItem(normalizedItem);
                  const quantityEnabled = isQuotationQuantityInputItem(normalizedItem);
                  const amountEnabled = isQuotationAmountInputItem(normalizedItem);
                  const readOnlyQuantity = quantityEnabled ? "" : " readonly";
                  const readOnlyAmount = amountEnabled ? "" : " readonly";
                  return `
                    <div class="project-quotation-item-row${selectedItemIndexes.includes(index) ? " selected" : ""}" data-quotation-item-row="${index}" data-project-quotation-item-select="${index}" title="Ctrl/Cmd+클릭 다중 선택, 우클릭 메뉴">
                      <select class="text-field" name="item_category_${index}">${quotationCategoryOptions(normalizedItem.category || "")}</select>
                      <input class="text-field" name="item_line_no_${index}" value="${blank ? "" : escapeAttribute(String(normalizedItem.lineNo || ""))}"${blank ? " readonly" : ""} />
                      <input class="text-field" name="item_code_${index}" value="${blank ? "" : escapeAttribute(normalizedItem.code || "")}"${blank ? " readonly" : ""} />
                      <input class="text-field" name="item_description_${index}" value="${blank ? "" : escapeAttribute(normalizedItem.description || "")}" data-project-quotation-description-input${blank ? " readonly" : ""} onkeydown="return handleProjectQuotationDescriptionKeydown(event)" />
                      <input class="text-field" type="number" name="item_quantity_${index}" value="${quantityEnabled ? escapeAttribute(String(normalizedItem.quantity ?? 0)) : ""}"${readOnlyQuantity} />
                      <input class="text-field" name="item_unit_${index}" value="${quantityEnabled ? escapeAttribute(normalizedItem.unit || "") : ""}"${readOnlyQuantity} />
                      <input class="text-field" type="number" name="item_unit_price_${index}" value="${quantityEnabled ? escapeAttribute(String(normalizedItem.unitPrice ?? 0)) : ""}"${readOnlyQuantity} />
                      <input class="text-field" type="number" name="item_amount_${index}" value="${amountEnabled ? escapeAttribute(String(normalizedItem.amount || (isQuotationPricedItem(normalizedItem) ? Number(normalizedItem.quantity || 0) * Number(normalizedItem.unitPrice || 0) : 0))) : ""}"${readOnlyAmount} />
                      <input class="text-field" name="item_remark_${index}" value="${blank ? "" : escapeAttribute(normalizedItem.remark || "")}"${blank ? " readonly" : ""} />
                    </div>
                  `;
                }).join("")}
              </div>
              <div class="project-quotation-item-toolbar">
                <button type="button" class="secondary-button" data-project-quotation-item-add>행 추가</button>
              </div>
            </section>
          </div>
        </form>
        ${
          contextMenu.visible
            ? `
              <div class="project-context-menu" style="left:${contextMenu.x}px; top:${contextMenu.y}px;">
                <button type="button" class="project-context-menu-button" data-project-quotation-context-action="copy">복사</button>
                <button type="button" class="project-context-menu-button" data-project-quotation-context-action="cut">잘라내기</button>
                <button type="button" class="project-context-menu-button${clipboardReady ? "" : " disabled"}" data-project-quotation-context-action="paste"${clipboardReady ? "" : " disabled"}>붙여넣기</button>
                <button type="button" class="project-context-menu-button danger" data-project-quotation-context-action="delete">삭제</button>
              </div>
            `
            : ""
        }
        <footer class="project-modal-actions">
          <button type="button" class="secondary-button" data-project-quotation-preview>미리보기</button>
          <button type="button" class="secondary-button" data-project-quotation-print>인쇄</button>
          <button type="button" class="secondary-button" data-project-quotation-save>저장</button>
          <button type="button" class="secondary-button" data-project-quotation-close>닫기</button>
        </footer>
      </section>
    </div>
  `;
}

function renderProjectQuotationPreviewModal() {
  if (!projectState.quotationPreview?.open) {
    return "";
  }
  return `
    <div class="project-modal-backdrop">
      <section class="project-modal project-quotation-preview-modal" role="dialog" aria-modal="true">
        <header class="project-modal-header">
          <h3>견적서 미리보기</h3>
          <button type="button" class="ghost-button" data-project-quotation-preview-close>닫기</button>
        </header>
        <div class="project-modal-body">
          <iframe class="project-quotation-preview-frame" title="견적서 미리보기" srcdoc="${escapeAttribute(projectState.quotationPreview.html || "")}"></iframe>
        </div>
        <footer class="project-modal-actions">
          <button type="button" class="secondary-button" data-project-quotation-preview-close>닫기</button>
        </footer>
      </section>
    </div>
  `;
}

function renderProjectTemplateInfoFieldOptions(selectedFields = []) {
  const selected = new Set(selectedFields || []);
  return PROJECT_TEMPLATE_INFO_FIELDS.map(
    (field) => `
      <label class="project-template-checkbox">
        <input type="checkbox" name="info_field_${escapeAttribute(field.key)}"${selected.has(field.key) ? " checked" : ""} />
        <span>${escapeTextarea(field.label)}</span>
      </label>
    `,
  ).join("");
}

function renderProjectTemplateFieldPalette(selectedFields = []) {
  const selected = new Set(selectedFields || []);
  return PROJECT_TEMPLATE_INFO_FIELDS.map(
    (field) => `
      <div class="project-template-field-chip${selected.has(field.key) ? " active" : ""}">
        <span>${escapeTextarea(field.label)}</span>
        <small>${selected.has(field.key) ? "매핑됨" : "대기"}</small>
      </div>
    `,
  ).join("");
}

function renderProjectTemplateCanvasPreview(template) {
  const normalized = normalizeQuotationTemplate(template);
  const infoFields = PROJECT_TEMPLATE_INFO_FIELDS.filter((field) => normalized.infoFields.includes(field.key));
  const document = normalized.document || {};
  const previewMetaRows = [
    ["일자", "2026년04월24일"],
    ["수신", "삼성중공업(주) 거제조선소 귀중"],
    ["참조", ""],
    ["선명", "삼성 T-5"],
    ["수주번호", "SH-202512-0401"],
    ["SUBJECT", "선체 외판 상가 수리 작업"],
  ];
  const supplierRows = [
    ["등록번호", document.supplierRegistrationNo || "601-81-31019"],
    ["상호", document.supplierName || "(주)선진종합"],
    ["성명", document.supplierRepresentative || "송치관"],
    ["주소", document.supplierAddress || "부산광역시 영도구 대평로41번길 3"],
    ["업태/종목", document.supplierBusinessType || "제조/선박기관 및 부품"],
  ];
  const previewRows = (normalized.items || [emptyQuotationItem()]).slice(0, 12);
  return `
    <div class="project-template-canvas${normalized.page.orientation === "portrait" ? " portrait" : ""}" data-project-template-context-target="canvas" style="
      --template-accent:${escapeAttribute(normalized.styles.accentColor)};
      --template-header-bg:${escapeAttribute(normalized.styles.headerBackground)};
      --template-font-size:${escapeAttribute(String(normalized.styles.fontSize))}px;
      --template-margin-top:${escapeAttribute(String(normalized.page.marginTop))}mm;
      --template-margin-right:${escapeAttribute(String(normalized.page.marginRight))}mm;
      --template-margin-bottom:${escapeAttribute(String(normalized.page.marginBottom))}mm;
      --template-margin-left:${escapeAttribute(String(normalized.page.marginLeft))}mm;
      --template-row-height:${escapeAttribute(String(normalized.table.rowHeight))}px;
    ">
      <div class="project-template-page">
        <div class="project-template-page-inner">
          <div class="project-template-document-head logo-primary-${escapeAttribute(document.logoPosition || "left")} logo-extra-${escapeAttribute(document.extraLogoPosition || "right")}" data-project-template-context-target="header" data-project-template-logo-empty>
            ${renderTemplateLogoMark(document, "primary")}
            <h2 contenteditable="true" data-project-template-inline-field="documentTitle">${escapeTextarea(document.title || "청구서")}</h2>
            ${renderTemplateLogoMark(document, "extra")}
          </div>
          <div class="project-template-tagline" contenteditable="true" data-project-template-inline-field="tagline" data-project-template-context-target="header">${escapeTextarea(document.tagline || "")}</div>
          <div class="project-template-preview-top">
            <div class="project-template-meta-table">
              ${previewMetaRows.map(([label, value]) => `<span class="project-template-meta-label">${escapeTextarea(label)}</span><span>${escapeTextarea(value)}</span>`).join("")}
            </div>
            ${
              document.showSupplierBox
                ? `<div class="project-template-supplier-table" data-project-template-context-target="supplier"><b>공급자</b>${supplierRows.map(([label, value]) => `<span>${escapeTextarea(label)}</span><i contenteditable="true" data-project-template-inline-field="${escapeAttribute(PROJECT_TEMPLATE_SUPPLIER_FIELD_MAP[label] || "")}">${escapeTextarea(value)}</i>`).join("")}</div>`
                : ""
            }
          </div>
          <div class="project-template-amount-line">
            <span>합계금액</span>
            <strong>${document.showKoreanAmount ? "일금사천오백육십구만육천원정" : ""}</strong>
            <b>₩45,696,000</b>
          </div>
          <div class="project-template-preview-table">
            ${
              normalized.table.headerVisible
                ? `<div class="project-template-preview-table-head"><span>NO</span><span>PART.NO</span><span>D E S C R I P T I O N</span><span>Q'TY</span><span>U/PRICE</span><span>AMOUNT</span></div>`
                : ""
            }
            ${previewRows.map((item, index) => {
              const normalizedItem = normalizeQuotationItem(item, index);
              const priced = isQuotationPricedItem(normalizedItem);
              const rowKind = quotationItemPrintClass(normalizedItem);
              return `
                <div class="project-template-preview-table-row ${rowKind}">
                  <span>${escapeTextarea(normalizedItem.category || "수리항목")}</span>
                  <span>${escapeTextarea(normalizedItem.description || "작업 내용 표시 영역")}</span>
                  <span>${priced ? escapeTextarea(String(normalizedItem.quantity || 1)) : ""}</span>
                  <span>${escapeTextarea(normalizedItem.unit || "EA")}</span>
                  <span>${priced ? escapeTextarea(String(normalizedItem.unitPrice || 0)) : ""}</span>
                  <span>${priced ? escapeTextarea(String(normalizedItem.amount || 0)) : ""}</span>
                </div>
              `;
            }).join("")}
          </div>
          <div class="project-template-preview-footer">
            <div>${escapeTextarea(normalized.defaultText || "부가세 별도 / 작업 조건 변경 시 별도 협의")}</div>
            <div>${infoFields.length}개 정보 필드 매핑</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProjectTemplateContextMenu() {
  const contextMenu = projectState.templateModal.contextMenu || { visible: false, x: 0, y: 0, target: "" };
  if (!contextMenu.visible) {
    return "";
  }
  const isLogoMenu = contextMenu.target === "logo-primary" || contextMenu.target === "logo-extra";
  if (isLogoMenu) {
    const kind = contextMenu.target.replace("logo-", "");
    return `
      <div class="project-context-menu" style="left:${contextMenu.x}px; top:${contextMenu.y}px;">
        <button type="button" class="project-context-menu-button" data-project-template-context-action="logo-change" data-project-template-logo-kind="${kind}">변경</button>
        <button type="button" class="project-context-menu-button" data-project-template-context-action="logo-resize" data-project-template-logo-kind="${kind}">크기 조절</button>
        <button type="button" class="project-context-menu-button" data-project-template-context-action="logo-move-left" data-project-template-logo-kind="${kind}">좌측 배치</button>
        <button type="button" class="project-context-menu-button" data-project-template-context-action="logo-move-center" data-project-template-logo-kind="${kind}">중앙 배치</button>
        <button type="button" class="project-context-menu-button" data-project-template-context-action="logo-move-right" data-project-template-logo-kind="${kind}">우측 배치</button>
        <button type="button" class="project-context-menu-button danger" data-project-template-context-action="logo-delete" data-project-template-logo-kind="${kind}">삭제</button>
      </div>
    `;
  }
  const headerActions = `
    <button type="button" class="project-context-menu-button" data-project-template-context-action="logo-add">새 로고</button>
    <button type="button" class="project-context-menu-button" data-project-template-context-action="header-toggle-tagline">상단 문구 추가/삭제</button>
    <button type="button" class="project-context-menu-button" data-project-template-context-action="header-reset">상단 기본값</button>
  `;
  const supplierActions = `
    <button type="button" class="project-context-menu-button" data-project-template-context-action="supplier-toggle">공급자 박스 추가/삭제</button>
    <button type="button" class="project-context-menu-button" data-project-template-context-action="supplier-reset">공급자 기본값</button>
  `;
  return `
    <div class="project-context-menu" style="left:${contextMenu.x}px; top:${contextMenu.y}px;">
      ${contextMenu.target === "supplier" ? supplierActions : headerActions}
    </div>
  `;
}

function renderProjectTemplateModal() {
  if (!projectState.templateModal.open) {
    return "";
  }
  const templates = loadQuotationTemplates();
  const draft = normalizeQuotationTemplate(projectState.templateModal.draft || blankQuotationTemplate());
  return `
    <div class="project-modal-backdrop">
      <section class="project-modal project-template-modal" role="dialog" aria-modal="true">
        <header class="project-modal-header">
          <h3>문서 양식 디자이너</h3>
          <button type="button" class="ghost-button" data-project-template-close>닫기</button>
        </header>
        <div class="project-template-layout">
          <aside class="project-template-sidebar">
            <section class="project-template-sidebar-section">
              <label>템플릿 목록
                <select class="text-field" data-project-template-picker>
                  ${templates.map((template) => `<option value="${escapeAttribute(template.id)}"${template.id === draft.id ? " selected" : ""}>${escapeTextarea(template.name || "이름 없음")}</option>`).join("")}
                  <option value="__new__"${draft.id ? "" : " selected"}>새 템플릿</option>
                </select>
              </label>
              <label>템플릿 제목
                <input class="text-field project-template-current-name" form="project-template-form" name="template_name" value="${escapeAttribute(draft.name || "")}" placeholder="템플릿 제목" />
              </label>
              <label>참조 템플릿
                <select class="text-field" data-project-template-reference>
                  <option value="">선택 안 함</option>
                  <option value="__invoice__">청구서 기본형</option>
                  ${templates.map((template) => `<option value="${escapeAttribute(template.id)}">참조: ${escapeTextarea(template.name || "이름 없음")}</option>`).join("")}
                </select>
              </label>
              <div class="project-template-orientation-toggle" role="radiogroup" aria-label="용지 방향">
                <label>
                  <input type="radio" form="project-template-form" name="page_orientation" value="landscape" data-project-template-orientation${draft.page.orientation === "landscape" ? " checked" : ""} />
                  <span>가로</span>
                </label>
                <label>
                  <input type="radio" form="project-template-form" name="page_orientation" value="portrait" data-project-template-orientation${draft.page.orientation === "portrait" ? " checked" : ""} />
                  <span>세로</span>
                </label>
              </div>
              <details class="project-template-mapping-popover">
                <summary>매핑 필드</summary>
                <div class="project-template-field-palette">
                  ${renderProjectTemplateFieldPalette(draft.infoFields)}
                </div>
              </details>
            </section>
          </aside>
          <section class="project-template-preview-pane">
            <div class="project-template-preview-header-bar">
              <div class="project-template-preview-title">
                <strong>실시간 출력 미리보기</strong>
                <small>청구서 상단 정보표, 공급자 박스, 품목표를 실제 문서 비율로 확인</small>
              </div>
              <span>${draft.page.orientation === "portrait" ? "A4 세로" : "A4 가로"}</span>
            </div>
            ${renderProjectTemplateCanvasPreview(draft)}
            ${renderProjectTemplateContextMenu()}
          </section>
          <form id="project-template-form" class="project-template-form project-template-editor">
            <input type="hidden" name="template_id" value="${escapeAttribute(draft.id || "")}" />
            <section class="project-template-section">
              <h4>여백</h4>
              <p>A4 출력 시 페이지 안쪽 여백입니다.</p>
              <div class="project-template-grid two">
                <label>상단 여백(mm) <input class="text-field" type="number" name="margin_top" value="${escapeAttribute(String(draft.page.marginTop))}" /></label>
                <label>우측 여백(mm) <input class="text-field" type="number" name="margin_right" value="${escapeAttribute(String(draft.page.marginRight))}" /></label>
                <label>하단 여백(mm) <input class="text-field" type="number" name="margin_bottom" value="${escapeAttribute(String(draft.page.marginBottom))}" /></label>
                <label>좌측 여백(mm) <input class="text-field" type="number" name="margin_left" value="${escapeAttribute(String(draft.page.marginLeft))}" /></label>
              </div>
            </section>
            <section class="project-template-section">
              <h4>품목표 스타일</h4>
              <p>테이블 헤더 색상, 행 높이, 기본 글자 크기를 조정합니다.</p>
              <div class="project-template-grid two">
                <label>강조색 <input class="text-field project-template-color" type="color" name="accent_color" value="${escapeAttribute(draft.styles.accentColor)}" /></label>
                <label>헤더 배경색 <input class="text-field project-template-color" type="color" name="header_background" value="${escapeAttribute(draft.styles.headerBackground)}" /></label>
                <label>기본 글자 크기(px) <input class="text-field" type="number" name="font_size" value="${escapeAttribute(String(draft.styles.fontSize))}" /></label>
                <label>행 높이(px) <input class="text-field" type="number" name="table_row_height" value="${escapeAttribute(String(draft.table.rowHeight))}" /></label>
              </div>
              <label class="project-template-inline-toggle">
                <input type="checkbox" name="table_header_visible"${draft.table.headerVisible ? " checked" : ""} />
                <span>내용 영역 헤더 표시</span>
              </label>
            </section>
            <section class="project-template-section">
              <h4>정보 영역 매핑</h4>
              <p>상단 정보표에 표시할 값을 선택합니다.</p>
              <div class="project-template-checkbox-grid">
                ${renderProjectTemplateInfoFieldOptions(draft.infoFields)}
              </div>
            </section>
            <section class="project-template-section">
              <h4>출력 문구와 기본 행</h4>
              <p>행은 구분 | 내용 | 단위 | 수량 | 단가 | remark 순서로 입력합니다.</p>
              <label>기본 문구 <textarea class="text-area" name="default_text">${escapeTextarea(draft.defaultText || "")}</textarea></label>
              <label>기본 항목 목록 <textarea class="text-area" name="default_items" placeholder="구분 | 내용 | 단위 | 수량 | 단가 | remark">${escapeTextarea((draft.items || []).map((item, index) => {
                const normalizedItem = normalizeQuotationItem(item, index);
                return [normalizedItem.category || "수리항목", normalizedItem.description, normalizedItem.unit, normalizedItem.quantity, normalizedItem.unitPrice, normalizedItem.remark].join(" | ");
              }).join("\\n"))}</textarea></label>
            </section>
            <div class="project-template-form-actions">
              <button type="button" class="secondary-button" data-project-template-save>저장</button>
              <button type="button" class="secondary-button" data-project-template-close>닫기</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  `;
}

function renderProjectChecklist(project) {
  return `
    <section class="project-panel project-scroll-panel">
      <table class="data-table project-table">
        <thead><tr><th>체크</th><th>항목</th><th>기준/내용</th><th>상태</th><th>담당자</th><th>완료일</th><th>비고</th></tr></thead>
        <tbody>
          ${project.checklist
            .map(
              (item) => `
                <tr data-project-checklist-row="${escapeAttribute(item.id)}">
                  <td><input type="checkbox" data-project-checklist-check="${escapeAttribute(item.id)}"${item.checked ? " checked" : ""} /></td>
                  <td>${escapeTextarea(item.item)}</td>
                  <td>${escapeTextarea(item.standard)}</td>
                  <td><select class="text-field" data-project-checklist-status="${escapeAttribute(item.id)}">${projectSelectOptions(PROJECT_CHECKLIST_STATUS_OPTIONS, item.status)}</select></td>
                  <td>${escapeTextarea(item.manager)}</td>
                  <td><input class="text-field" type="date" data-project-checklist-date="${escapeAttribute(item.id)}" value="${escapeAttribute(item.completedAt || "")}" /></td>
                  <td><input class="text-field" data-project-checklist-note="${escapeAttribute(item.id)}" value="${escapeAttribute(item.note || "")}" /></td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderProjectProgress(project) {
  return `
    <section class="project-panel project-progress-panel">
      <div class="project-table-wrap">
        <table class="data-table project-table">
          <thead><tr><th>일자</th><th>상태</th><th>담당자</th><th>진행 내용</th><th>다음 조치</th></tr></thead>
          <tbody>
            ${project.progressLogs
              .map((log) => `<tr><td>${escapeTextarea(log.date)}</td><td>${escapeTextarea(log.status)}</td><td>${escapeTextarea(log.manager)}</td><td>${escapeTextarea(log.content)}</td><td>${escapeTextarea(log.nextAction)}</td></tr>`)
              .join("")}
          </tbody>
        </table>
      </div>
      <form id="project-progress-form" class="project-form-grid">
        <input type="hidden" name="project_id" value="${escapeAttribute(project.id)}" />
        <label>일자 <input class="text-field" type="date" name="date" value="${new Date().toISOString().slice(0, 10)}" /></label>
        <label>상태 <select class="text-field" name="status">${projectSelectOptions(PROJECT_STATUS_OPTIONS, project.status)}</select></label>
        <label>진행 내용 <input class="text-field" name="content" /></label>
        <label>다음 조치 <input class="text-field" name="next_action" /></label>
        <label>첨부 <input class="text-field" name="attachment" placeholder="문서ID 또는 파일명" /></label>
        <button class="primary-button" type="submit">로그 추가</button>
      </form>
    </section>
  `;
}

function renderProjectReports(project) {
  return `
    <section class="project-panel project-scroll-panel">
      <table class="data-table project-table">
        <thead><tr><th>문서 종류</th><th>필요</th><th>작성 상태</th><th>작성자</th><th>작성일</th><th>문서ID</th><th>첨부/파일</th><th>비고</th></tr></thead>
        <tbody>
          ${project.reports
            .map(
              (report, index) => `
                <tr>
                  <td>${escapeTextarea(report.type)}</td>
                  <td><input type="checkbox" data-project-report-required="${index}"${report.required ? " checked" : ""} /></td>
                  <td><select class="text-field" data-project-report-status="${index}">${projectSelectOptions(PROJECT_REPORT_STATUS_OPTIONS, report.status)}</select></td>
                  <td><input class="text-field" data-project-report-writer="${index}" value="${escapeAttribute(report.writer || "")}" /></td>
                  <td><input class="text-field" type="date" data-project-report-date="${index}" value="${escapeAttribute(report.date || "")}" /></td>
                  <td><input class="text-field" data-project-report-document="${index}" value="${escapeAttribute(report.documentId || "")}" /></td>
                  <td><input class="text-field" data-project-report-file="${index}" value="${escapeAttribute(report.file || "")}" /></td>
                  <td><input class="text-field" data-project-report-note="${index}" value="${escapeAttribute(report.note || "")}" /></td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderProjectExternalRequests(project) {
  return `
    <section class="project-panel project-progress-panel">
      <div class="project-table-wrap">
        <table class="data-table project-table">
          <thead><tr><th>의뢰처</th><th>의뢰 내용</th><th>의뢰일</th><th>회신 예정일</th><th>회신일</th><th>상태</th><th>첨부</th></tr></thead>
          <tbody>
            ${
              project.externalRequests.length
                ? project.externalRequests
                    .map((request) => `<tr><td>${escapeTextarea(request.vendor)}</td><td>${escapeTextarea(request.content)}</td><td>${escapeTextarea(request.requestDate)}</td><td>${escapeTextarea(request.expectedReplyDate)}</td><td>${escapeTextarea(request.replyDate || "-")}</td><td>${escapeTextarea(request.status)}</td><td>${escapeTextarea(request.attachment || "-")}</td></tr>`)
                    .join("")
                : '<tr><td colspan="7" class="order-empty-cell">외부 의뢰 자료가 없습니다.</td></tr>'
            }
          </tbody>
        </table>
      </div>
      <form id="project-external-form" class="project-form-grid">
        <input type="hidden" name="project_id" value="${escapeAttribute(project.id)}" />
        <label>의뢰처 <input class="text-field" name="vendor" /></label>
        <label>의뢰 내용 <input class="text-field" name="content" /></label>
        <label>의뢰일 <input class="text-field" type="date" name="request_date" value="${new Date().toISOString().slice(0, 10)}" /></label>
        <label>회신 예정일 <input class="text-field" type="date" name="expected_reply_date" /></label>
        <label>상태 <select class="text-field" name="status">${projectSelectOptions(PROJECT_EXTERNAL_STATUS_OPTIONS, "의뢰 중")}</select></label>
        <label>비고 <input class="text-field" name="note" /></label>
        <button class="primary-button" type="submit">의뢰 추가</button>
      </form>
    </section>
  `;
}

function renderProjectCompletionDocument(project) {
  const completion = project.completion || {};
  return `
    <section class="project-panel">
      <form id="project-completion-form" class="project-form-grid project-completion-form">
        <input type="hidden" name="project_id" value="${escapeAttribute(project.id)}" />
        <label class="project-check-label">수리완공사양서 작성 <input type="checkbox" name="spec_created"${completion.specCreated ? " checked" : ""} /></label>
        <label class="project-check-label">책임자 날인 <input type="checkbox" name="sealed"${completion.sealed ? " checked" : ""} /></label>
        <label>날인 문서 수령일 <input class="text-field" type="date" name="received_date" value="${escapeAttribute(completion.receivedDate || "")}" /></label>
        <label>보관 문서ID <input class="text-field" name="document_id" value="${escapeAttribute(completion.documentId || "")}" /></label>
        <label>보관 위치 <input class="text-field" name="storage_location" value="${escapeAttribute(completion.storageLocation || "")}" /></label>
        <label>준공일 <input class="text-field" type="date" name="completed_at" value="${escapeAttribute(completion.completedAt || "")}" /></label>
        <label>상태 <select class="text-field" name="status">${projectSelectOptions(PROJECT_COMPLETION_STATUS_OPTIONS, completion.status || "작성 전")}</select></label>
        <label class="project-wide-field">비고 <textarea class="text-area" name="note">${escapeTextarea(completion.note || "")}</textarea></label>
        <button class="primary-button" type="submit">준공 문서 저장</button>
      </form>
    </section>
  `;
}

function renderProjectDetail() {
  const project = selectedProject();
  if (!project) {
    return '<section class="project-detail"><div class="project-empty">공사를 선택하세요.</div></section>';
  }
  const tabs = [
    ["overview", "개요"],
    ["estimate", "견적서"],
    ["checklist", "체크리스트"],
    ["progress", "진행 상황"],
    ["reports", "레포트"],
    ["external", "외부 의뢰"],
    ["completion", "준공 문서"],
  ];
  const tabContent =
    projectState.activeDetailTab === "estimate"
      ? renderProjectEstimate(project)
      : projectState.activeDetailTab === "checklist"
      ? renderProjectChecklist(project)
      : projectState.activeDetailTab === "progress"
        ? renderProjectProgress(project)
        : projectState.activeDetailTab === "reports"
          ? renderProjectReports(project)
          : projectState.activeDetailTab === "external"
            ? renderProjectExternalRequests(project)
            : projectState.activeDetailTab === "completion"
              ? renderProjectCompletionDocument(project)
              : renderProjectOverview(project);
  return `
    <section class="project-detail">
      <header class="project-detail-header">
        <div>
          <p class="eyebrow">${escapeTextarea(project.managementNo || project.estimateNo)}</p>
          <h3>${escapeTextarea(project.name)}</h3>
          <p>${escapeTextarea(project.customer)} · ${escapeTextarea(project.vessel)} / ${escapeTextarea(project.equipment)} · 담당 ${escapeTextarea(project.manager)}</p>
        </div>
        <span class="status-badge ${projectBadgeKind(project.status)}">${escapeTextarea(project.status)}</span>
      </header>
      <nav class="project-detail-tabs">
        ${tabs.map(([key, label]) => `<button type="button" class="project-detail-tab${projectState.activeDetailTab === key ? " active" : ""}" data-project-detail-tab="${key}">${label}</button>`).join("")}
      </nav>
      <div class="project-detail-scroll">${tabContent}</div>
    </section>
  `;
}

function renderProjectDocumentView() {
  const documents = projectDocuments();
  return `
    <section class="project-document-view">
      <div class="project-panel-title">
        <strong>공사 문서 목록</strong>
        <span>${documents.length}건</span>
      </div>
      <div class="project-document-table-wrap">
        <div class="project-document-head">
          <span>문서종류</span>
          <span>문서명</span>
          <span>공사번호</span>
          <span>상태</span>
          <span>작성일</span>
        </div>
        <div class="project-document-list">
          ${
            documents.length
              ? documents
                  .map(
                    (document) => `
                      <div class="project-document-row">
                        <span>${escapeTextarea(document.type)}</span>
                        <span>${escapeTextarea(document.name)}</span>
                        <span>${escapeTextarea(document.projectNo)}</span>
                        <span><mark class="status-badge ${projectBadgeKind(document.status)}">${escapeTextarea(document.status)}</mark></span>
                        <span>${escapeTextarea(document.date || "-")}</span>
                      </div>
                    `,
                  )
                  .join("")
              : '<div class="project-empty">등록된 공사 문서가 없습니다.</div>'
          }
        </div>
      </div>
    </section>
  `;
}

function renderProjectWorkspace() {
  if (typeof loadOrderProjectStateFromServer === "function" && !orderProjectDataLoaded && !orderProjectDataLoading) {
    void loadOrderProjectStateFromServer().then(() => {
      if (dashboardState.activeTab === "work") {
        renderProjectWorkspace();
      }
    });
  }
  projectWorkspace.innerHTML = `
    <section class="project-shell${projectState.viewMode === "document" ? " document-mode" : ""}">
      ${renderProjectFilters()}
      ${
        projectState.viewMode === "document"
          ? renderProjectDocumentView()
          : `
            ${renderProjectSummary()}
            <section class="project-layout" style="${projectPaneStyle()}">
              ${renderProjectSidebar()}
              <span class="project-pane-resizer" data-project-pane-resizer title="공사 목록 폭 조절"></span>
              ${renderProjectDetail()}
            </section>
          `
      }
    </section>
    ${renderProjectQuotationModal()}
    ${renderProjectQuotationPreviewModal()}
    ${renderProjectTemplateModal()}
  `;
}
