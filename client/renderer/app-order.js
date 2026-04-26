const ORDER_COLUMN_WIDTH_STORAGE_KEY = "erp-order-list-column-widths";
const ORDER_LIST_PANE_WIDTH_STORAGE_KEY = "erp-order-list-pane-width";
const ORDER_COLUMN_ORDER_STORAGE_KEY = "erp-order-list-column-order";
const ORDER_CUSTOMER_SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const ORDER_LOOKUP_CACHE_MAX = 40;
const DEFAULT_ORDER_COLUMN_WIDTHS = [92, 132, 116, 82, 58, 220, 96, 112, 128];
const ORDER_TYPES = ["공사", "판매"];
const ORDER_STATUS_STAGES = {
  공사: ["견적", "발주", "공사중", "준공", "청구", "완공"],
  판매: ["견적", "발주", "미입고", "입고", "출고", "납품", "청구", "완료"],
};
const ORDER_LIST_COLUMNS = [
  { field: "requestDate", label: "주문일" },
  { field: "customer", label: "거래처" },
  { field: "vessel", label: "선박" },
  { field: "businessType", label: "구분" },
  { field: "confirmed", label: "수주" },
  { field: "description", label: "주문명" },
  { field: "status", label: "상태" },
  { field: "id", label: "주문ID" },
  { field: "managementNumber", label: "공사ID" },
];

function currentOrderMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const format = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  return {
    startDate: format(start),
    endDate: format(end),
  };
}

function parseOrderSequenceId(value = "") {
  const normalized = String(value || "").trim();
  const match = normalized.match(/^OR-(\d{4})-(\d{3,})$/);
  if (!match) {
    return null;
  }
  return {
    raw: normalized,
    year: match[1],
    sequence: Number(match[2]),
  };
}

function nextOrderIdForDate(requestDate = "", orders = []) {
  const year = String(requestDate || new Date().toISOString().slice(0, 10)).slice(0, 4);
  let maxSequence = 0;
  for (const order of orders || []) {
    const parsed = parseOrderSequenceId(order?.id || "");
    if (parsed && parsed.year === year) {
      maxSequence = Math.max(maxSequence, parsed.sequence);
    }
  }
  return `OR-${year}-${String(maxSequence + 1).padStart(3, "0")}`;
}

function dedupeOrdersById(orders = []) {
  const seen = new Set();
  const unique = [];
  for (const order of orders || []) {
    const id = String(order?.id || "").trim();
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    unique.push(order);
  }
  return unique;
}

function defaultOrderFilters() {
  return {
    ...currentOrderMonthRange(),
    query: "",
    columns: {},
    activeColumn: "",
  };
}

let orderState = {
  notice: "요청 접수부터 확정 관리번호 발급까지 시연 상태로 관리합니다.",
  selectedOrderId: null,
  multiSelectedOrderIds: [],
  mergeHistory: [],
  contextMenu: {
    visible: false,
    x: 0,
    y: 0,
    actionType: "",
    orderId: "",
  },
  hasSearched: false,
  activePageTab: "order-registration",
  detailTab: "order",
  customerLookup: {
    query: "",
    candidates: [],
    selectedCustomerId: "",
    selectedCustomer: null,
    activeIndex: 0,
  },
  vesselLookup: {
    open: false,
    query: "",
    activeIndex: 0,
    awaitingSelection: false,
  },
  equipmentLookup: {
    open: false,
    query: "",
    activeIndex: 0,
    awaitingSelection: false,
  },
  documentDetail: {
    visible: false,
    orderId: "",
    typeCode: "",
  },
  documentAddPanelOpen: false,
  documentDraft: {
    documentType: "PO",
    documentName: "",
    attachmentPath: "",
    attachmentName: "",
    fileId: "",
    notes: "",
  },
  filters: {
    ...currentOrderMonthRange(),
    query: "",
    columns: {},
    activeColumn: "",
  },
  draft: {},
  orders: [
    {
      id: "OR-2026-001",
      requestDate: "2026-04-12",
      customer: "태성해운",
      customerId: "",
      manager: "김태성",
      vessel: "TS BLUE",
      assetId: "",
      equipment: "Main Engine",
      equipmentId: "",
      requestChannel: "이메일",
      requestType: "공사",
      urgent: true,
      description: "메인 엔진 진동 점검 및 관련 부품 견적 요청",
      partsQuote: true,
      repairQuote: true,
      noEstimate: false,
      confirmed: false,
      confirmationDate: "",
      confirmationBasis: "이메일",
      businessType: "공사",
      status: "견적",
      managementNumber: "확정 후 발급",
      documents: [],
    },
    {
      id: "OR-2026-002",
      requestDate: "2026-04-11",
      customer: "남해플랜트서비스",
      customerId: "",
      manager: "박경수",
      vessel: "PLANT-02",
      assetId: "",
      equipment: "Gearbox",
      equipmentId: "",
      requestChannel: "전화",
      requestType: "판매",
      urgent: false,
      description: "감속기 소모품 납품 요청",
      partsQuote: true,
      repairQuote: false,
      noEstimate: true,
      confirmed: true,
      confirmationDate: "2026-04-12",
      confirmationBasis: "발주서",
      businessType: "판매",
      status: "납품",
      managementNumber: "SH-2026-001-S",
      documents: [
        {
          id: "OR-2026-002-PO-001",
          typeCode: "PO",
          typeLabel: "발주서",
          name: "남해플랜트서비스 발주 확인",
          target: "",
          fileName: "",
          internalTab: "orders",
          createdAt: "2026-04-12",
        },
      ],
    },
  ],
};

let orderProjectDataLoaded = false;
let orderProjectDataLoading = false;
let orderCustomerSearchSequence = 0;
const orderCustomerSearchCache = new Map();
const orderCustomerSearchRequests = new Map();
const orderLookupFilterCache = {
  customerId: "",
  vessels: new Map(),
  equipment: new Map(),
};

function normalizeOrderLookupQuery(value = "") {
  return String(value || "").trim().toLowerCase();
}

function rememberOrderLookupCache(map, key, value) {
  if (map.size >= ORDER_LOOKUP_CACHE_MAX) {
    map.delete(map.keys().next().value);
  }
  map.set(key, value);
  return value;
}

function resetOrderLookupFilterCache(customerId = "") {
  const normalizedCustomerId = String(customerId || "");
  if (orderLookupFilterCache.customerId === normalizedCustomerId) {
    return;
  }
  orderLookupFilterCache.customerId = normalizedCustomerId;
  orderLookupFilterCache.vessels.clear();
  orderLookupFilterCache.equipment.clear();
}

function readOrderCustomerSearchCache(query) {
  const cached = orderCustomerSearchCache.get(query);
  if (!cached || Date.now() - cached.createdAt > ORDER_CUSTOMER_SEARCH_CACHE_TTL_MS) {
    orderCustomerSearchCache.delete(query);
    return null;
  }
  return cached.customers;
}

function writeOrderCustomerSearchCache(query, customers) {
  rememberOrderLookupCache(orderCustomerSearchCache, query, {
    createdAt: Date.now(),
    customers,
  });
}

function applyOrderProjectServerData(data = {}) {
  if (Array.isArray(data.orders)) {
    const repaired = repairDuplicateManagementNumbers(data.orders);
    orderState.orders = dedupeOrdersById(repaired.orders);
    if (repaired.changed) {
      orderState.notice = `중복 공사ID ${repaired.changed}건 자동 보정.`;
    }
  }
  if (Array.isArray(data.projects) && typeof projectState !== "undefined") {
    projectState.projects = data.projects;
    if (projectState.selectedProjectId && !projectState.projects.some((project) => project.id === projectState.selectedProjectId)) {
      projectState.selectedProjectId = projectState.projects[0]?.id || "";
    }
  }
  if (data.order?.id) {
    orderState.selectedOrderId = data.order.id;
  }
}

async function loadOrderProjectStateFromServer({ force = false } = {}) {
  if (orderProjectDataLoading || (orderProjectDataLoaded && !force) || !window.erpClient?.listOrders) {
    return false;
  }
  orderProjectDataLoading = true;
  try {
    const [ordersResult, projectsResult] = await Promise.all([
      window.erpClient.listOrders(),
      window.erpClient.listProjects ? window.erpClient.listProjects() : Promise.resolve({ data: [] }),
    ]);
    applyOrderProjectServerData({
      orders: ordersResult?.data || [],
      projects: projectsResult?.data || [],
    });
    orderProjectDataLoaded = true;
    return true;
  } catch (error) {
    orderState.notice = "서버 주문/공사 데이터를 불러오지 못해 임시 상태로 표시합니다.";
    orderProjectDataLoaded = true;
    return false;
  } finally {
    orderProjectDataLoading = false;
  }
}

function orderStatusBadgeKind(status) {
  if (status === "완공" || status === "완료" || status === "납품") {
    return "ok";
  }
  if (status === "견적" || status === "발주" || status === "미입고" || status === "공사중") {
    return "warn";
  }
  return "neutral";
}

function normalizeOrderType(value) {
  if (value === "판매" || value === "일반 판매" || value === "납품 요청") {
    return "판매";
  }
  return "공사";
}

function orderStatusOptions(orderType) {
  return ORDER_STATUS_STAGES[normalizeOrderType(orderType)] || ORDER_STATUS_STAGES.공사;
}

function orderScopeLabel(order) {
  const scopes = [];
  if (order.partsQuote) {
    scopes.push("부품");
  }
  if (order.repairQuote) {
    scopes.push("수리");
  }
  if (order.noEstimate) {
    scopes.push("견적 없음");
  }
  return scopes.length ? scopes.join(" + ") : "요청 확인";
}

function orderStatusFor(order) {
  const stages = orderStatusOptions(order.businessType || order.requestType);
  return stages.includes(order.status) ? order.status : "견적";
}

function parseManagementNumber(value) {
  const normalized = String(value || "").trim();
  const match = normalized.match(/^([A-Z]+)-(\d{4})-(\d{3})-([A-Z])$/);
  if (!match) {
    return null;
  }
  return {
    raw: normalized,
    prefix: match[1],
    year: match[2],
    sequence: Number(match[3]),
    suffix: match[4],
  };
}

function managementYearForOrder(order) {
  return String(order.confirmationDate || order.requestDate || new Date().toISOString()).slice(0, 4);
}

function managementSuffixForOrder(order) {
  return normalizeOrderType(order.businessType || order.requestType) === "공사" ? "T" : "S";
}

function collectUsedManagementNumbers(orders, excludeOrderId = "") {
  const used = new Map();
  for (const order of orders || []) {
    if (!order || order.id === excludeOrderId) {
      continue;
    }
    const parsed = parseManagementNumber(order.managementNumber);
    if (parsed) {
      used.set(parsed.raw, { ...parsed, orderId: order.id });
    }
  }
  return used;
}

function nextManagementNumber({ year, type, orders, excludeOrderId = "" }) {
  let maxSequence = 0;
  for (const order of orders || []) {
    if (!order || order.id === excludeOrderId) {
      continue;
    }
    const parsed = parseManagementNumber(order.managementNumber);
    if (parsed && parsed.year === String(year) && parsed.suffix === String(type)) {
      maxSequence = Math.max(maxSequence, parsed.sequence);
    }
  }
  return `SH-${year}-${String(maxSequence + 1).padStart(3, "0")}-${type}`;
}

function assignManagementNumber(order, orders) {
  const parsedCurrent = parseManagementNumber(order.managementNumber);
  const used = collectUsedManagementNumbers(orders, order.id);
  if (!order.confirmed) {
    return parsedCurrent ? parsedCurrent.raw : "확정 후 발급";
  }
  const year = managementYearForOrder(order);
  const suffix = managementSuffixForOrder(order);
  if (parsedCurrent && parsedCurrent.year === year && parsedCurrent.suffix === suffix && !used.has(parsedCurrent.raw)) {
    return parsedCurrent.raw;
  }
  return nextManagementNumber({ year, type: suffix, orders, excludeOrderId: order.id });
}

function repairDuplicateManagementNumbers(orders) {
  const seen = new Set();
  let changed = 0;
  const repaired = (orders || []).map((order) => ({ ...order }));
  for (const order of repaired) {
    if (!order) {
      continue;
    }
    const parsed = parseManagementNumber(order.managementNumber);
    if (!parsed) {
      if (!order.confirmed) {
        continue;
      }
      const nextValue = assignManagementNumber(order, repaired);
      if (nextValue !== order.managementNumber) {
        order.managementNumber = nextValue;
        changed += 1;
      }
      continue;
    }
    if (seen.has(parsed.raw)) {
      order.managementNumber = assignManagementNumber({ ...order, managementNumber: "" }, repaired);
      changed += 1;
      continue;
    }
    const canonical = assignManagementNumber(order, repaired);
    if (canonical !== order.managementNumber) {
      order.managementNumber = canonical;
      changed += 1;
    }
    const parsedCanonical = parseManagementNumber(order.managementNumber);
    if (parsedCanonical) {
      seen.add(parsedCanonical.raw);
    }
  }
  return { orders: repaired, changed };
}

function orderManagementNumberFor(order) {
  return assignManagementNumber(order, orderState.orders);
}

function orderFromForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const orderType = normalizeOrderType(data.request_type || data.business_type || "공사");
  const order = {
    id: data.order_id || "",
    requestDate: data.request_date || new Date().toISOString().slice(0, 10),
    customer: data.customer || "",
    customerId: data.customer_id || orderState.customerLookup.selectedCustomerId || "",
    shipOwner: data.ship_owner || data.customer || "",
    manager: data.manager || "",
    buyerType: data.buyer_type || "국내",
    vessel: data.vessel || "",
    assetId: data.asset_id || "",
    equipment: data.equipment || "",
    equipmentId: data.equipment_id || "",
    requestChannel: data.request_channel || "이메일",
    requestType: orderType,
    urgent: Boolean(data.urgent),
    description: data.description || "",
    orderSummary: data.order_summary || "",
    notes: data.notes || "",
    partsQuote: Boolean(data.parts_quote),
    repairQuote: Boolean(data.repair_quote),
    noEstimate: Boolean(data.no_estimate),
    confirmed: Boolean(data.confirmed),
    confirmationDate: data.confirmation_date || "",
    confirmationBasis: data.confirmation_basis || "발주서",
    businessType: orderType,
    status: data.order_status || "견적",
  };
  if (order.confirmed && order.status === "견적") {
    order.status = "발주";
  }
  order.status = orderStatusFor(order);
  order.managementNumber = orderManagementNumberFor(order);
  return order;
}

function filteredOrders() {
  if (!orderState.hasSearched) {
    return [];
  }
  const start = orderState.filters.startDate || "";
  const end = orderState.filters.endDate || "";
  const query = String(orderState.filters.query || "").trim().toLowerCase();
  const columnFilters = orderState.filters.columns || {};
  return orderState.orders.filter((order) => !order.mergedInto && !order.deletedAt).filter((order) => {
    const date = order.requestDate || "";
    const values = orderListValues(order);
    const matchesDate = (!start || date >= start) && (!end || date <= end);
    const matchesQuery = !query || values.some((value) => value.toLowerCase().includes(query));
    const matchesColumns = Object.entries(columnFilters).every(([field, value]) => {
      const normalizedValue = String(value || "").trim().toLowerCase();
      return !normalizedValue || String(orderListValue(order, field)).toLowerCase().includes(normalizedValue);
    });
    return matchesDate && matchesQuery && matchesColumns;
  });
}

async function deleteOrders(orderIds = []) {
  const targets = Array.from(new Set((orderIds || []).map((id) => activeOrderById(id)).filter(Boolean).map((order) => order.id)));
  if (!targets.length) {
    return false;
  }

  const confirmed = await requestAppConfirm(
    targets.length === 1 ? "이 주문을 삭제할까요?" : `선택한 ${targets.length}개 주문을 삭제할까요?`,
    "주문 삭제",
  );
  if (!confirmed) {
    return false;
  }

  if (window.erpClient?.deleteOrder) {
    try {
      for (const orderId of targets) {
        const result = await window.erpClient.deleteOrder(orderId);
        applyOrderProjectServerData(result?.data || {});
      }
    } catch (error) {
      await showAppMessage(error.message || "주문을 삭제하지 못했습니다.");
      return false;
    }
  } else {
    orderState.orders = orderState.orders.map((order) =>
      targets.includes(order.id)
        ? { ...order, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString().slice(0, 10) }
        : order,
    );
    if (typeof projectState !== "undefined") {
      projectState.projects = (projectState.projects || []).map((project) =>
        targets.includes(project.sourceOrderId || "") ? { ...project, orderArchived: true, archivedReason: "주문 삭제" } : project,
      );
    }
  }

  if (targets.includes(orderState.selectedOrderId)) {
    orderState.selectedOrderId = filteredOrders()[0]?.id || null;
    orderState.draft = {};
  }
  orderState.multiSelectedOrderIds = [];
  orderState.documentAddPanelOpen = false;
  orderState.documentDraft = emptyOrderDocumentDraft();
  orderState.notice = "주문을 삭제했습니다.";
  closeOrderContextMenu();
  renderOrderWorkspace();
  await showAppMessage("주문을 삭제했습니다.");
  return true;
}

function ensureOrderVisibleInList(order) {
  if (!order?.id || !orderState.hasSearched) {
    return;
  }
  const visible = filteredOrders().some((item) => item.id === order.id);
  if (visible) {
    return;
  }
  orderState.filters = {
    ...currentOrderMonthRange(),
    query: "",
    columns: {},
    activeColumn: "",
  };
}

function orderListValue(order, field) {
  const mapping = {
    requestDate: order.requestDate || "",
    customer: order.customer || "",
    vessel: order.vessel || "",
    businessType: order.businessType || "",
    confirmed: order.confirmed ? "Y" : "",
    description: order.description || order.requestType || "",
    status: order.status || "",
    id: order.id || "",
    managementNumber: order.managementNumber && order.managementNumber !== "확정 후 발급" ? order.managementNumber : "",
  };
  return mapping[field] || "";
}

function orderListValues(order) {
  return ORDER_LIST_COLUMNS.map((column) => String(orderListValue(order, column.field)));
}

function orderListColumns() {
  try {
    const savedFields = JSON.parse(localStorage.getItem(ORDER_COLUMN_ORDER_STORAGE_KEY) || "[]");
    const validFields = new Set(ORDER_LIST_COLUMNS.map((column) => column.field));
    const savedColumns = savedFields
      .filter((field) => validFields.has(field))
      .map((field) => ORDER_LIST_COLUMNS.find((column) => column.field === field));
    const missingColumns = ORDER_LIST_COLUMNS.filter((column) => !savedFields.includes(column.field));
    return [...savedColumns, ...missingColumns];
  } catch {
    return [...ORDER_LIST_COLUMNS];
  }
}

function saveOrderColumnOrder(columns) {
  localStorage.setItem(ORDER_COLUMN_ORDER_STORAGE_KEY, JSON.stringify(columns.map((column) => column.field)));
}

function moveOrderColumn(sourceField, targetField) {
  if (!sourceField || !targetField || sourceField === targetField) {
    return false;
  }
  const columns = orderListColumns();
  const sourceIndex = columns.findIndex((column) => column.field === sourceField);
  const targetIndex = columns.findIndex((column) => column.field === targetField);
  if (sourceIndex < 0 || targetIndex < 0) {
    return false;
  }
  const [moved] = columns.splice(sourceIndex, 1);
  columns.splice(targetIndex, 0, moved);
  saveOrderColumnOrder(columns);
  return true;
}

function orderColumnFilterOptions(field) {
  return [
    ...new Set(
      orderState.orders
        .filter((order) => !order.mergedInto)
        .map((order) => String(orderListValue(order, field)))
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "ko"));
}

function renderOrderColumnFilterMenu(column) {
  if (orderState.filters.activeColumn !== column.field) {
    return "";
  }
  const current = orderState.filters.columns?.[column.field] || "";
  const options = orderColumnFilterOptions(column.field);
  return `
    <div class="order-filter-menu">
      <button type="button" class="order-filter-option${!current ? " active" : ""}" data-order-filter-value="" data-order-filter-field="${escapeAttribute(column.field)}">전체</button>
      ${
        options.length
          ? options
              .map(
                (value) =>
                  `<button type="button" class="order-filter-option${value === current ? " active" : ""}" data-order-filter-value="${escapeAttribute(value)}" data-order-filter-field="${escapeAttribute(column.field)}">${escapeTextarea(value)}</button>`,
              )
              .join("")
          : '<div class="order-filter-empty">선택값 없음</div>'
      }
    </div>
  `;
}

function orderCustomerName(customer) {
  return customer?.customer?.customerName || customer?.customerName || customer?.name || "";
}

function orderCustomerSummary(customer) {
  const contact = customer?.primaryContactName || customer?.customer?.primaryContactName || "";
  const customerNo = customer?.customerNo || customer?.customer?.customerNo || "";
  return [customerNo, contact].filter(Boolean).join(" · ");
}

function selectedOrderCustomer() {
  return orderState.customerLookup.selectedCustomer;
}

function orderVesselOptions() {
  return (selectedOrderCustomer()?.assets || []).filter((asset) => asset.assetType === "VESSEL" || asset.assetName);
}

function selectedOrderVesselAsset(vesselName = "") {
  if (!String(vesselName || "").trim()) {
    return null;
  }
  const vessels = orderVesselOptions();
  return vessels.find((asset) => asset.assetName === vesselName) || null;
}

function orderVesselAssetByName(vesselName = "") {
  return orderVesselOptions().find((asset) => asset.assetName === vesselName) || null;
}

function orderEquipmentOptions(vesselName = "") {
  const vessel = selectedOrderVesselAsset(vesselName);
  return vessel?.equipments || [];
}

function orderEquipmentTypeLabel(value = "") {
  if (typeof equipmentTypeLabel === "function") {
    return equipmentTypeLabel(value);
  }
  return String(value || "");
}

function orderEquipmentUnitLabel(equipment) {
  return equipment?.equipmentName || equipment?.unitNo || equipment?.serialNo || equipment?.installationPosition || "";
}

function orderEquipmentDisplayName(equipment) {
  if (!equipment) {
    return "";
  }
  const makerModel = [equipment.manufacturer, equipment.modelName].filter(Boolean).join(" ");
  return [makerModel, equipment.equipmentName || equipment.installationPosition].filter(Boolean).join(" / ") || "-";
}

function orderEquipmentOrderName(equipment) {
  if (!equipment) {
    return "";
  }
  const parts = [
    orderEquipmentUnitLabel(equipment),
    orderEquipmentTypeLabel(equipment.equipmentType || ""),
    [equipment.manufacturer, equipment.modelName].filter(Boolean).join(" "),
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean);
  return parts.filter((part, index) => parts.findIndex((item) => item.toLowerCase() === part.toLowerCase()) === index).join(" ");
}

function orderEquipmentByName(vesselName = "", equipmentName = "") {
  const name = String(equipmentName || "");
  return (
    orderEquipmentOptions(vesselName).find((equipment) =>
      [orderEquipmentDisplayName(equipment), orderEquipmentOrderName(equipment), equipment.equipmentName || "", equipment.modelName || "", equipment.installationPosition || ""].includes(name),
    ) || null
  );
}

function orderFilteredVesselOptions(query = "") {
  const normalizedQuery = normalizeOrderLookupQuery(query);
  const cacheKey = normalizedQuery;
  const cached = orderLookupFilterCache.vessels.get(cacheKey);
  if (cached) {
    return cached;
  }
  return rememberOrderLookupCache(orderLookupFilterCache.vessels, cacheKey, orderVesselOptions().filter((asset) => {
    const values = [asset.assetName, asset.imoNo, asset.vesselType].map((value) => String(value || "").toLowerCase());
    return !normalizedQuery || values.some((value) => value.includes(normalizedQuery));
  }));
}

function orderFilteredEquipmentOptions(query = "", vesselName = "") {
  const normalizedQuery = normalizeOrderLookupQuery(query);
  const normalizedVesselName = String(vesselName || "").trim();
  const cacheKey = `${normalizedVesselName}::${normalizedQuery}`;
  const cached = orderLookupFilterCache.equipment.get(cacheKey);
  if (cached) {
    return cached;
  }
  return rememberOrderLookupCache(orderLookupFilterCache.equipment, cacheKey, orderEquipmentOptions(normalizedVesselName).filter((equipment) => {
    const values = [
      orderEquipmentDisplayName(equipment),
      orderEquipmentOrderName(equipment),
      equipment.equipmentType,
      equipment.equipmentName,
      equipment.manufacturer,
      equipment.modelName,
      equipment.serialNo,
      equipment.installationPosition,
    ].map((value) => String(value || "").toLowerCase());
    return !normalizedQuery || values.some((value) => value.includes(normalizedQuery));
  }));
}

function renderOrderAssetDropdown(kind, items) {
  const state = kind === "vessel" ? orderState.vesselLookup : orderState.equipmentLookup;
  if (!state.open) {
    return "";
  }
  if (!items.length) {
    return `<div class="order-lookup-menu" role="listbox"><div class="order-lookup-empty">${kind === "vessel" ? "등록된 선박이 없습니다." : "등록된 엔진/장비가 없습니다."}</div></div>`;
  }
  return `
    <div class="order-lookup-menu" role="listbox">
      ${items
        .map((item, index) => {
          const label = kind === "vessel" ? item.assetName || "-" : orderEquipmentDisplayName(item);
          const summary =
            kind === "vessel"
              ? [item.imoNo, item.vesselType].filter(Boolean).join(" / ")
              : [orderEquipmentTypeLabel(item.equipmentType), item.serialNo].filter(Boolean).join(" / ");
          return `
            <button
              type="button"
              class="order-lookup-option${index === state.activeIndex ? " active" : ""}"
              data-order-${kind}-pick="${escapeAttribute(item.id || "")}"
              role="option"
            >
              <strong>${escapeTextarea(label)}</strong>
              <span>${escapeTextarea(summary || (kind === "vessel" ? "선박 정보" : "장비 정보"))}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function orderReferencesCustomer(customerId, customerName = "") {
  return orderState.orders.some((order) => (customerId && order.customerId === customerId) || (customerName && order.customer === customerName));
}

function orderReferencesAsset(assetId, assetName = "") {
  return orderState.orders.some((order) => (assetId && order.assetId === assetId) || (assetName && order.vessel === assetName));
}

function orderReferencesEquipment(equipmentId, equipmentName = "") {
  return orderState.orders.some((order) => (equipmentId && order.equipmentId === equipmentId) || (equipmentName && order.equipment === equipmentName));
}

function syncOrdersAfterCustomerChange({
  customerId = "",
  customerName = "",
  customerMatchName = "",
  assetId = "",
  assetName = "",
  assetMatchName = "",
  equipmentId = "",
  equipmentName = "",
  equipmentMatchName = "",
}) {
  orderState.orders = orderState.orders.map((order) => {
    const nextOrder = { ...order };
    if ((customerId && nextOrder.customerId === customerId) || (customerMatchName && nextOrder.customer === customerMatchName) || (customerName && nextOrder.customer === customerName)) {
      nextOrder.customerId = customerId || nextOrder.customerId || "";
      if (customerName) {
        nextOrder.customer = customerName;
        nextOrder.shipOwner = customerName;
      }
    }
    if ((assetId && nextOrder.assetId === assetId) || (assetMatchName && nextOrder.vessel === assetMatchName) || (assetName && nextOrder.vessel === assetName)) {
      nextOrder.assetId = assetId || nextOrder.assetId || "";
      if (assetName) {
        nextOrder.vessel = assetName;
      }
    }
    if ((equipmentId && nextOrder.equipmentId === equipmentId) || (equipmentMatchName && nextOrder.equipment === equipmentMatchName) || (equipmentName && nextOrder.equipment === equipmentName)) {
      nextOrder.equipmentId = equipmentId || nextOrder.equipmentId || "";
      if (equipmentName) {
        nextOrder.equipment = equipmentName;
      }
    }
    return nextOrder;
  });
}

function orderContactOptions() {
  return selectedOrderCustomer()?.contacts || [];
}

function orderPrimaryContactName(customer) {
  const contacts = customer?.contacts || [];
  return contacts.find((contact) => contact.isPrimary)?.contactName || customer?.customer?.primaryContactName || customer?.primaryContactName || contacts[0]?.contactName || "";
}

function readOrderFormDraft() {
  const form = document.getElementById("order-form");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }
  orderState.draft = orderFromForm(form);
}

function focusOrderInput(selector) {
  requestAnimationFrame(() => {
    setTimeout(() => {
      const input = orderWorkspace.querySelector(selector);
      if (input instanceof HTMLElement) {
        input.focus();
        if (input instanceof HTMLInputElement) {
          input.select?.();
        }
        positionOrderLookupMenus();
      }
    }, 0);
  });
}

function positionOrderLookupMenus() {
  orderWorkspace.querySelectorAll(".order-combo-wrap").forEach((wrap) => {
    const menu = wrap.querySelector(".order-lookup-menu");
    const input = wrap.querySelector("input");
    if (!(menu instanceof HTMLElement) || !(input instanceof HTMLElement)) {
      return;
    }
    const rect = input.getBoundingClientRect();
    menu.style.setProperty("--order-lookup-top", `${Math.round(rect.bottom + 4)}px`);
    menu.style.setProperty("--order-lookup-left", `${Math.round(rect.left)}px`);
    menu.style.setProperty("--order-lookup-width", `${Math.max(220, Math.round(rect.width))}px`);
  });
}

function renderOrderCustomerDropdown() {
  const { candidates, query } = orderState.customerLookup;
  if (!query || !candidates.length) {
    return "";
  }

  return `
    <div class="order-lookup-menu" role="listbox">
      ${candidates
        .map(
          (customer, index) => `
            <button
              type="button"
              class="order-lookup-option${index === orderState.customerLookup.activeIndex ? " active" : ""}"
              data-order-customer-pick="${escapeAttribute(customer.id)}"
              role="option"
            >
              <strong>${escapeTextarea(orderCustomerName(customer) || "-")}</strong>
              <span>${escapeTextarea(orderCustomerSummary(customer) || "고객 정보")}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderOrderVesselDropdown(currentVessel = "") {
  return renderOrderAssetDropdown("vessel", orderFilteredVesselOptions(orderState.vesselLookup.query || currentVessel));
}

function renderOrderEquipmentDropdown(currentVessel = "", currentEquipment = "") {
  return renderOrderAssetDropdown("equipment", orderFilteredEquipmentOptions(orderState.equipmentLookup.query || currentEquipment, currentVessel));
}

function renderOrderVesselDatalist(vesselName) {
  return `
    <datalist id="order-manager-options">
      ${orderContactOptions()
        .map((contact) => `<option value="${escapeAttribute(contact.contactName || "")}">${escapeTextarea([contact.jobTitle, contact.mobilePhone, contact.email].filter(Boolean).join(" / "))}</option>`)
        .join("")}
    </datalist>
    <datalist id="order-ship-owner-options">
      ${[...new Set([orderCustomerName(selectedOrderCustomer()), ...orderState.orders.map((order) => order.shipOwner || order.customer)].filter(Boolean))]
        .map((name) => `<option value="${escapeAttribute(name)}"></option>`)
        .join("")}
    </datalist>
    <datalist id="order-vessel-options">
      ${orderVesselOptions()
        .map((asset) => `<option value="${escapeAttribute(asset.assetName || "")}">${escapeTextarea([asset.imoNo, asset.vesselType].filter(Boolean).join(" / "))}</option>`)
        .join("")}
    </datalist>
    <datalist id="order-equipment-options">
      ${orderEquipmentOptions(vesselName)
        .map((equipment) => `<option value="${escapeAttribute(orderEquipmentDisplayName(equipment))}">${escapeTextarea([equipment.equipmentType, equipment.serialNo].filter(Boolean).join(" / "))}</option>`)
        .join("")}
    </datalist>
  `;
}

function renderOrderSearchBar() {
  return `
    <form id="order-search-form" class="order-searchbar">
      <label>기간 <input class="text-field" type="date" name="start_date" value="${escapeAttribute(orderState.filters.startDate)}" /></label>
      <label>~ <input class="text-field" type="date" name="end_date" value="${escapeAttribute(orderState.filters.endDate)}" /></label>
      <label class="order-search-keyword">검색 <input class="text-field" type="search" name="query" value="${escapeAttribute(orderState.filters.query || "")}" placeholder="거래처 / 선박 / 주문명 / ID" /></label>
      <button class="secondary-button" type="submit">조회</button>
      <button class="secondary-button" type="button" data-order-new>신규</button>
      <button class="secondary-button" type="button" data-order-search-reset>Clear</button>
    </form>
  `;
}

function renderOrderListGrid() {
  const orders = filteredOrders();
  const multiSelectedIds = new Set(orderState.multiSelectedOrderIds || []);
  const columns = orderListColumns();
  const rows = orders
    .map((order) => {
      const isMultiSelected = multiSelectedIds.has(order.id);
      const isPrimarySelected = order.id === orderState.selectedOrderId;
      const isSelected = isPrimarySelected || isMultiSelected;
      return `
        <div class="order-table-row${isSelected ? " selected" : ""}${isPrimarySelected ? " active" : ""}${isMultiSelected ? " multi-selected" : ""}" style="${orderColumnStyle()}" data-order-select="${order.id}" aria-pressed="${isSelected ? "true" : "false"}">
          ${columns.map((column) => renderOrderListCell(order, column.field)).join("")}
        </div>
      `;
    })
    .join("");
  return `
    <section class="order-grid-panel order-list-panel">
      <div class="order-grid-titlebar">
        <strong>주문 목록</strong>
        <span>${orders.length}건</span>
      </div>
      <div class="order-table-wrap">
        <div class="order-list-grid">
          <div class="order-list-grid-head" style="${orderColumnStyle()}">
            ${columns.map(
              (column, index) => `
                <div class="order-resizable-th" draggable="true" data-order-column-field="${escapeAttribute(column.field)}" title="드래그해서 위치 변경">
                  <button type="button" class="order-header-filter${orderState.filters.columns?.[column.field] ? " active" : ""}" data-order-filter-toggle="${escapeAttribute(column.field)}">
                    <span>${escapeTextarea(column.label)}</span>
                    <span aria-hidden="true">▾</span>
                  </button>
                  ${renderOrderColumnFilterMenu(column)}
                  <span class="order-column-resizer" data-order-column-resizer="${index}"></span>
                </div>
              `,
            ).join("")}
          </div>
          <div class="order-list-grid-body">
            ${rows || '<div class="order-empty-cell">기간 내 주문이 없습니다.</div>'}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderOrderListCell(order, field) {
  if (field === "status") {
    return `<span><span class="status-badge ${orderStatusBadgeKind(order.status)}">${escapeTextarea(order.status || "-")}</span></span>`;
  }
  return `<span>${escapeTextarea(orderListValue(order, field) || (field === "confirmed" ? "" : "-"))}</span>`;
}

function orderSelectOptions(options, value) {
  return options
    .map((option) => `<option value="${escapeAttribute(option)}"${option === value ? " selected" : ""}>${option}</option>`)
    .join("");
}

function loadOrderColumnWidths() {
  try {
    const widths = JSON.parse(localStorage.getItem(ORDER_COLUMN_WIDTH_STORAGE_KEY) || "[]");
    return DEFAULT_ORDER_COLUMN_WIDTHS.map((width, index) => {
      const nextWidth = Number(widths[index]);
      return Number.isFinite(nextWidth) && nextWidth >= 46 ? nextWidth : width;
    });
  } catch {
    return [...DEFAULT_ORDER_COLUMN_WIDTHS];
  }
}

function saveOrderColumnWidths(widths) {
  localStorage.setItem(ORDER_COLUMN_WIDTH_STORAGE_KEY, JSON.stringify(widths));
}

function orderColumnTemplate(widths = loadOrderColumnWidths()) {
  return widths.map((width) => `${width}px`).join(" ");
}

function orderColumnStyle() {
  return `grid-template-columns: ${orderColumnTemplate()};`;
}

function loadOrderListPaneWidth() {
  const width = Number(localStorage.getItem(ORDER_LIST_PANE_WIDTH_STORAGE_KEY) || "");
  return Number.isFinite(width) && width >= 420 ? width : 0;
}

function saveOrderListPaneWidth(width) {
  if (!Number.isFinite(width) || width < 420) {
    localStorage.removeItem(ORDER_LIST_PANE_WIDTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(ORDER_LIST_PANE_WIDTH_STORAGE_KEY, String(Math.round(width)));
}

function orderPaneStyle() {
  const width = loadOrderListPaneWidth();
  return width ? `grid-template-columns: ${width}px 8px minmax(360px, 1fr);` : "";
}


function renderOrderDetailPanel(order) {
  const today = new Date().toISOString().slice(0, 10);
  const current = {
    id: "",
    requestDate: today,
    customer: "",
    shipOwner: "",
    manager: "",
    buyerType: "국내",
    vessel: "",
    equipment: "",
    requestChannel: "이메일",
    requestType: "공사",
    urgent: false,
    description: "",
    orderSummary: "",
    notes: "",
    partsQuote: false,
    repairQuote: false,
    noEstimate: false,
    confirmed: false,
    confirmationDate: "",
    confirmationBasis: "발주서",
    businessType: "공사",
    status: "견적",
    ...order,
      ...orderState.draft,
  };
  const currentAsset = current.assetId
    ? orderVesselOptions().find((asset) => asset.id === current.assetId) || null
    : current.id
      ? orderVesselAssetByName(current.vessel)
      : null;
  const currentEquipment = current.equipmentId
    ? orderEquipmentOptions(current.vessel).find((equipment) => equipment.id === current.equipmentId) || null
    : current.id && current.equipment
      ? orderEquipmentByName(current.vessel, current.equipment)
      : null;
  if (currentEquipment) {
    current.equipment = orderEquipmentDisplayName(currentEquipment);
  }
  current.requestType = normalizeOrderType(current.requestType || current.businessType);
  current.businessType = normalizeOrderType(current.businessType || current.requestType);
  current.status = orderStatusFor(current);
  const scheduleLabel = current.requestType === "공사" ? "예정일" : "확정일";
  const scheduleWarning =
    current.confirmed && current.requestType === "공사" && !current.confirmationDate
      ? '<div class="order-inline-warning">예정일 미등록. 마지막 등록자에게 공사 날짜 등록 알림 유지.</div>'
      : "";

  return `
    <form id="order-form" class="order-detail-form">
      <input type="hidden" name="order_id" value="${escapeAttribute(current.id)}" />
      <input type="hidden" name="customer_id" value="${escapeAttribute(current.customerId || orderState.customerLookup.selectedCustomerId || "")}" />
      <input type="hidden" name="asset_id" value="${escapeAttribute(current.assetId || currentAsset?.id || "")}" />
      <input type="hidden" name="equipment_id" value="${escapeAttribute(current.equipmentId || currentEquipment?.id || "")}" />
      <div class="order-form-columns">
        <section class="order-form-main">
          <div class="order-compact-grid">
            <label class="order-lookup-field">매출처 <span class="order-combo-wrap"><input class="text-field" name="customer" data-order-customer-search data-order-combo-input value="${escapeAttribute(current.customer)}" autocomplete="off" /><button type="button" class="order-combo-button" data-order-combo-open="customer" aria-label="매출처 목록 열기">▾</button>${renderOrderCustomerDropdown()}</span></label>
            <label>선사 <span class="order-combo-wrap"><input class="text-field" name="ship_owner" list="order-ship-owner-options" data-order-combo-input value="${escapeAttribute(current.shipOwner || current.customer)}" /><button type="button" class="order-combo-button" data-order-combo-open="ship_owner" aria-label="선사 목록 열기">▾</button></span></label>
            <label class="order-lookup-field">선박 <span class="order-combo-wrap"><input class="text-field" name="vessel" data-order-vessel-input data-order-combo-input value="${escapeAttribute(current.vessel)}" autocomplete="off" /><button type="button" class="order-combo-button" data-order-combo-open="vessel" aria-label="선박 목록 열기">▾</button>${renderOrderVesselDropdown(current.vessel)}</span></label>
            <label class="order-lookup-field">엔진 <span class="order-combo-wrap"><input class="text-field" name="equipment" data-order-equipment-input data-order-combo-input value="${escapeAttribute(current.equipment)}" autocomplete="off" /><button type="button" class="order-combo-button" data-order-combo-open="equipment" aria-label="엔진 목록 열기">▾</button>${renderOrderEquipmentDropdown(current.vessel, current.equipment)}</span></label>
            <label>주문구분 <select class="text-field" name="request_type" data-order-type-select>${orderSelectOptions(ORDER_TYPES, current.requestType)}</select></label>
            <label>주문명 <input class="text-field" name="description" value="${escapeAttribute(current.description)}" /></label>
            <label>주문상태 <select class="text-field" name="order_status">${orderSelectOptions(orderStatusOptions(current.requestType), current.status)}</select></label>
            <label>설명 <input class="text-field" name="order_summary" value="${escapeAttribute(current.orderSummary || "")}" /></label>
            <label>주문담당자 <input class="text-field" name="manager" list="order-manager-options" value="${escapeAttribute(current.manager)}" /></label>
            <label>발주처 구분 <select class="text-field" name="buyer_type">${orderSelectOptions(["국내", "해외"], current.buyerType || "국내")}</select></label>
            <label class="order-check-field">수주 <input type="checkbox" name="confirmed"${current.confirmed ? " checked" : ""} /></label>
            <label>${scheduleLabel} <input class="text-field" type="date" name="confirmation_date" value="${escapeAttribute(current.confirmationDate || today)}" data-order-confirmation-date title="휠: 일 변경, Shift+휠: 월 변경, Option+휠: 연도 변경" /></label>
            ${scheduleWarning}
            <label class="order-wide-field">비고 <textarea class="text-area" name="notes">${escapeTextarea(current.notes || "")}</textarea></label>
            <label>등록일시 <input class="text-field" value="${escapeAttribute(current.requestDate)}" readonly /></label>
            <label>등록자 <input class="text-field" value="시연 사용자" readonly /></label>
            <label>수정일시 <input class="text-field" value="${escapeAttribute(today)}" readonly /></label>
            <label>수정자 <input class="text-field" value="-" readonly /></label>
          </div>
          <input type="hidden" name="request_date" value="${escapeAttribute(current.requestDate)}" />
          <input type="hidden" name="request_channel" value="${escapeAttribute(current.requestChannel)}" />
          <input type="hidden" name="confirmation_basis" value="${escapeAttribute(current.confirmationBasis)}" />
          <input type="hidden" name="business_type" value="${escapeAttribute(current.requestType)}" />
          <input type="hidden" name="parts_quote" value="${current.partsQuote ? "on" : ""}" />
          <input type="hidden" name="repair_quote" value="${current.repairQuote ? "on" : ""}" />
          <input type="hidden" name="no_estimate" value="${current.noEstimate ? "on" : ""}" />
          ${renderOrderVesselDatalist(current.vessel)}
          <div class="order-form-actions">
            <button class="primary-button" type="submit">저장</button>
          </div>
        </section>
        ${renderOrderDocuments(current)}
      </div>
    </form>
  `;
}

function renderOrderRightPanel(order) {
  return `
    <section class="order-grid-panel order-detail-panel">
      <div class="order-detail-tabs">
        <button type="button" class="order-detail-tab active">주문 내역</button>
      </div>
      <div class="order-detail-scroll">
        ${renderOrderDetailPanel(order)}
      </div>
      ${renderOrderDocumentDetailDialog()}
    </section>
  `;
}

function renderOrderDocumentDetailDialog() {
  if (!orderState.documentDetail.visible) {
    return "";
  }
  const order = orderState.orders.find((item) => item.id === orderState.documentDetail.orderId) || {};
  const type = orderDocumentType(orderState.documentDetail.typeCode);
  const documents = orderDocumentsFor(order).filter((doc) => doc.typeCode === orderState.documentDetail.typeCode);
  return `
    <div class="order-document-dialog-backdrop">
      <section class="order-document-dialog">
        <div class="order-document-dialog-head">
          <strong>${escapeTextarea(type.label)} 문서 목록</strong>
          <button type="button" class="ghost-button" data-order-document-detail-close>닫기</button>
        </div>
        <div class="order-document-dialog-body">
          <table class="data-table order-document-table">
            <thead>
              <tr>
                <th>문서ID</th>
                <th>문서명</th>
                <th>첨부</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              ${
                documents.length
                  ? documents
                      .map(
                        (doc) =>
                          `<tr class="order-document-row" ${orderDocumentTargetAttrs(doc, order.id || "")} title="더블 클릭해서 문서 열기"><td>${escapeTextarea(doc.id)}</td><td>${escapeTextarea(doc.name)}</td><td>${escapeTextarea(doc.fileName || (doc.internalTab ? "ERP 기능" : "첨부 없음"))}</td><td>${escapeTextarea(doc.createdAt || "-")}</td></tr>`,
                      )
                      .join("")
                  : '<tr><td colspan="4" class="order-empty-cell">등록된 문서가 없습니다.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function renderOrderContextMenu() {
  if (!orderState.contextMenu?.visible) {
    return "";
  }
  const canMerge = orderState.contextMenu.actionType === "merge";
  const canDelete = orderState.contextMenu.actionType === "delete";
  return `
    <div class="order-context-menu" style="left: ${orderState.contextMenu.x}px; top: ${orderState.contextMenu.y}px;" role="menu">
      ${canMerge ? '<button type="button" data-order-context-action="merge" role="menuitem">합치기</button>' : ""}
      ${canDelete ? '<button type="button" data-order-context-action="delete" role="menuitem" class="danger">삭제</button>' : ""}
    </div>
  `;
}

function closeOrderContextMenu() {
  orderState.contextMenu = {
    visible: false,
    x: 0,
    y: 0,
    actionType: "",
    orderId: "",
  };
}

function orderById(orderId) {
  return orderState.orders.find((order) => order.id === orderId);
}

function activeOrderById(orderId) {
  const order = orderById(orderId);
  return order && !order.mergedInto && !order.deletedAt ? order : null;
}

function orderMergeSelectionIds(contextOrderId = "") {
  const selectedIds = new Set((orderState.multiSelectedOrderIds || []).filter((id) => activeOrderById(id)));
  if (orderState.selectedOrderId && activeOrderById(orderState.selectedOrderId)) {
    selectedIds.add(orderState.selectedOrderId);
  }
  if (contextOrderId && !selectedIds.has(contextOrderId)) {
    return [];
  }
  return Array.from(selectedIds);
}

function orderDeleteSelectionIds(contextOrderId = "") {
  if (!contextOrderId) {
    return [];
  }
  const selectedIds = new Set((orderState.multiSelectedOrderIds || []).filter((id) => activeOrderById(id)));
  if (orderState.selectedOrderId && activeOrderById(orderState.selectedOrderId)) {
    selectedIds.add(orderState.selectedOrderId);
  }
  if (selectedIds.has(contextOrderId)) {
    return Array.from(selectedIds);
  }
  return activeOrderById(contextOrderId) ? [contextOrderId] : [];
}

function orderMergePreview(keepOrderId, selectedIds) {
  const keepOrder = activeOrderById(keepOrderId);
  const sourceOrders = selectedIds.filter((id) => id !== keepOrderId).map((id) => activeOrderById(id)).filter(Boolean);
  if (!keepOrder) {
    return {
      keepOrder: null,
      sourceOrders: [],
      documents: [],
      idMappings: [],
    };
  }
  return {
    keepOrder,
    sourceOrders,
    ...mergeOrderDocumentsForKeepOrder(keepOrder.id, orderDocumentsFor(keepOrder), sourceOrders),
  };
}

function showOrderMergeDialog(selectedIds) {
  return new Promise((resolve) => {
    const selectedOrders = selectedIds.map((id) => activeOrderById(id)).filter(Boolean);
    const dialog = document.createElement("div");
    dialog.className = "app-dialog-backdrop";
    dialog.setAttribute("role", "presentation");

    const panel = document.createElement("section");
    panel.className = "app-dialog order-merge-dialog";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");

    const title = document.createElement("h2");
    title.className = "app-dialog-title";
    title.textContent = "주문 합치기";

    const message = document.createElement("p");
    message.className = "app-dialog-message";
    message.textContent = "남길 주문을 선택하세요. 나머지 주문의 문서와 이력은 남길 주문으로 이동합니다.";

    const list = document.createElement("div");
    list.className = "order-merge-list";
    for (const order of selectedOrders) {
      const label = document.createElement("label");
      label.className = "order-merge-option";
      label.innerHTML = `
        <input type="radio" name="order_merge_keep" value="${escapeAttribute(order.id)}" />
        <span class="order-merge-main">
          <strong>${escapeTextarea(order.id || "-")}</strong>
          <small>${escapeTextarea(order.description || order.requestType || "주문명 없음")}</small>
        </span>
        <span>${escapeTextarea(order.customer || "-")}</span>
        <span>${escapeTextarea(order.vessel || "-")}</span>
        <span><span class="status-badge ${orderStatusBadgeKind(order.status)}">${escapeTextarea(order.status || "-")}</span></span>
        <span>${orderDocumentsFor(order).length}건</span>
      `;
      list.appendChild(label);
    }

    const summary = document.createElement("p");
    summary.className = "order-merge-summary";
    summary.textContent = "남길 주문을 선택하면 병합 대상과 문서 ID 변경 미리보기가 표시됩니다.";

    const preview = document.createElement("div");
    preview.className = "order-merge-preview";

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
      return panel.querySelector('input[name="order_merge_keep"]:checked')?.value || "";
    }

    function renderPreviewRows(idMappings) {
      if (!idMappings.length) {
        return '<div class="order-merge-preview-empty">이동할 문서가 없습니다.</div>';
      }
      return `
        <div class="order-merge-preview-head">
          <span>원본 주문</span>
          <span>원본 문서ID</span>
          <span>새 문서ID</span>
          <span>문서명</span>
          <span>종류</span>
        </div>
        <div class="order-merge-preview-scroll">
          ${idMappings
            .map(
              (mapping) => `
                <div class="order-merge-preview-row">
                  <span>${escapeTextarea(mapping.sourceOrderId || "-")}</span>
                  <span>${escapeTextarea(mapping.oldDocumentId || "-")}</span>
                  <span>${escapeTextarea(mapping.newDocumentId || "-")}</span>
                  <span>${escapeTextarea(mapping.documentName || "-")}</span>
                  <span>${escapeTextarea(mapping.typeLabel || mapping.typeCode || "-")}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      `;
    }

    function updatePreview() {
      const keepId = selectedKeepId();
      const { keepOrder, sourceOrders, idMappings } = orderMergePreview(keepId, selectedIds);
      confirmButton.disabled = !keepOrder;
      if (!keepOrder) {
        summary.textContent = "남길 주문을 선택하면 병합 대상과 문서 ID 변경 미리보기가 표시됩니다.";
        preview.innerHTML = "";
        return;
      }
      const movedDocumentCount = sourceOrders.reduce((sum, order) => sum + orderDocumentsFor(order).length, 0);
      summary.textContent = `선택한 주문들을 ${keepOrder.id} / ${keepOrder.description || "주문명 없음"}(으)로 합칩니다. 병합 대상 ${sourceOrders.length}건, 이동 문서 ${movedDocumentCount}건.`;
      preview.innerHTML = renderPreviewRows(idMappings);
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        cleanup(null);
      }
    }

    list.addEventListener("change", updatePreview);
    cancelButton.addEventListener("click", () => cleanup(null));
    confirmButton.addEventListener("click", async () => {
      const keepId = selectedKeepId();
      const keepOrder = activeOrderById(keepId);
      if (!keepOrder) {
        return;
      }
      const ok = await requestAppConfirm(`선택한 주문들을 ${keepOrder.id} / ${keepOrder.description || "주문명 없음"}(으)로 합칠까요?`, "합치기 확인");
      cleanup(ok ? keepId : null);
    });

    panel.append(title, message, list, summary, preview, actions);
    dialog.appendChild(panel);
    document.body.appendChild(dialog);
    document.addEventListener("keydown", handleKeydown);
    panel.querySelector("input")?.focus();
  });
}

function mergeOrders({ keepOrderId, mergeOrderIds }) {
  const keepOrder = activeOrderById(keepOrderId);
  const sourceOrders = mergeOrderIds.map((id) => activeOrderById(id)).filter(Boolean);
  if (!keepOrder || !sourceOrders.length) {
    return null;
  }

  const mergedAt = new Date().toISOString();
  const user = dashboardState.session?.data?.user?.username || dashboardState.session?.data?.user?.displayName || "시연 사용자";
  const mergeResult = mergeOrderDocumentsForKeepOrder(keepOrder.id, orderDocumentsFor(keepOrder), sourceOrders);
  const history = {
    mergedAt,
    user,
    keepOrderId: keepOrder.id,
    keepOrderName: keepOrder.description || "",
    mergedOrderIds: sourceOrders.map((order) => order.id),
    movedDocumentIds: mergeResult.idMappings.map((mapping) => mapping.newDocumentId),
    documentIdMappings: mergeResult.idMappings,
    mergedOrderNotes: sourceOrders.map((order) => ({ orderId: order.id, notes: order.notes || order.description || "" })),
  };
  const mergedOrderRecords = sourceOrders.map((order) => ({
    orderId: order.id,
    customer: order.customer || "",
    vessel: order.vessel || "",
    equipment: order.equipment || "",
    status: order.status || "",
    notes: order.notes || order.description || "",
    documents: orderDocumentsFor(order),
    history: order.mergeHistory || [],
  }));

  orderState.orders = orderState.orders.map((order) => {
    if (order.id === keepOrder.id) {
      return {
        ...order,
        documents: mergeResult.documents,
        mergeHistory: [history, ...(order.mergeHistory || [])],
        mergedOrderRecords: [...(order.mergedOrderRecords || []), ...mergedOrderRecords],
      };
    }
    if (sourceOrders.some((sourceOrder) => sourceOrder.id === order.id)) {
      return {
        ...order,
        mergedInto: keepOrder.id,
        mergedAt,
        mergedBy: user,
      };
    }
    return order;
  });

  if (typeof syncProjectsAfterOrderMerge === "function") {
    syncProjectsAfterOrderMerge(keepOrder, sourceOrders);
  }

  orderState.mergeHistory = [history, ...(orderState.mergeHistory || [])];
  orderState.multiSelectedOrderIds = [];
  orderState.selectedOrderId = keepOrder.id;
  orderState.draft = {};
  orderState.documentAddPanelOpen = false;
  orderState.documentDraft = emptyOrderDocumentDraft();
  orderState.notice = "주문을 합쳤습니다.";
  return {
    history,
    keepOrder: activeOrderById(keepOrder.id),
    sourceOrders,
    mergeOrderIds: sourceOrders.map((order) => order.id),
  };
}

async function handleMergeSelectedOrders() {
  const selectedIds = orderMergeSelectionIds();
  if (selectedIds.length < 2) {
    await showAppMessage("2개 이상 선택해야 합칠 수 있습니다.");
    return;
  }

  const keepOrderId = await showOrderMergeDialog(selectedIds);
  if (!keepOrderId) {
    return;
  }

  const mergeOrderIds = selectedIds.filter((id) => id !== keepOrderId);
  const mergeResult = mergeOrders({ keepOrderId, mergeOrderIds });
  if (mergeResult && window.erpClient?.mergeOrders) {
    try {
      const serverResult = await window.erpClient.mergeOrders({
        keepOrderId,
        mergeOrderIds,
        documents: mergeResult.keepOrder?.documents || [],
        mergeHistory: mergeResult.keepOrder?.mergeHistory || [],
        mergedOrderRecords: mergeResult.keepOrder?.mergedOrderRecords || [],
      });
      applyOrderProjectServerData(serverResult?.data || {});
      orderState.notice = "주문을 합치고 서버에 저장했습니다.";
    } catch (error) {
      orderState.notice = "주문은 화면에 합쳤지만 서버 저장은 실패했습니다.";
    }
  }
  closeOrderContextMenu();
  renderOrderWorkspace();
  if (mergeResult) {
    await showAppMessage("주문을 합쳤습니다.");
  }
}

function renderOrderWorkspace() {
  if (!orderProjectDataLoaded && !orderProjectDataLoading) {
    void loadOrderProjectStateFromServer().then((loaded) => {
      if (loaded && dashboardState.activeTab === "orders") {
        renderOrderWorkspace();
      }
    });
  }
  const selectedOrder = orderState.orders.find((order) => order.id === orderState.selectedOrderId) || {};
  orderWorkspace.innerHTML = `
    <section class="order-erp-shell">
      ${renderOrderSearchBar()}
      <section class="order-erp-body" style="${orderPaneStyle()}">
        ${renderOrderListGrid()}
        <span class="order-pane-resizer" data-order-pane-resizer title="주문 목록 폭 조절"></span>
        ${renderOrderRightPanel(selectedOrder)}
      </section>
      ${renderOrderContextMenu()}
    </section>
  `;
  initDesignModeForWorkspace("orders", orderWorkspace);
  positionOrderLookupMenus();
}

async function searchOrderCustomers(query) {
  const normalizedQuery = String(query || "").trim();
  if (!normalizedQuery) {
    orderState.customerLookup = {
      ...orderState.customerLookup,
      query: "",
      candidates: [],
      activeIndex: 0,
    };
    renderOrderWorkspace();
    return;
  }

  readOrderFormDraft();
  const cachedCustomers = readOrderCustomerSearchCache(normalizedQuery);
  orderState.customerLookup = {
    ...orderState.customerLookup,
    query: normalizedQuery,
    activeIndex: 0,
    ...(cachedCustomers ? { candidates: cachedCustomers } : {}),
  };
  if (cachedCustomers) {
    orderState.notice = cachedCustomers.length ? "매출처 후보를 불러왔습니다. 선택 후 Enter." : "매출처 검색 결과가 없습니다.";
    renderOrderWorkspace();
    focusOrderInput("[data-order-customer-search]");
    return;
  }

  const searchSequence = ++orderCustomerSearchSequence;
  try {
    const pendingRequest = orderCustomerSearchRequests.get(normalizedQuery) || window.erpClient.listCustomers(normalizedQuery);
    orderCustomerSearchRequests.set(normalizedQuery, pendingRequest);
    const result = await pendingRequest;
    const customers = result.data || [];
    writeOrderCustomerSearchCache(normalizedQuery, customers);
    if (searchSequence !== orderCustomerSearchSequence || orderState.customerLookup.query !== normalizedQuery) {
      return;
    }
    orderState.customerLookup.candidates = customers;
    orderState.notice = orderState.customerLookup.candidates.length
      ? "매출처 후보를 불러왔습니다. 선택 후 Enter."
      : "매출처 검색 결과가 없습니다.";
  } catch (error) {
    if (searchSequence !== orderCustomerSearchSequence || orderState.customerLookup.query !== normalizedQuery) {
      return;
    }
    orderState.customerLookup.candidates = [];
    orderState.notice = error.message || "매출처 검색 실패.";
  } finally {
    if (orderCustomerSearchRequests.get(normalizedQuery)) {
      orderCustomerSearchRequests.delete(normalizedQuery);
    }
  }

  renderOrderWorkspace();
  focusOrderInput("[data-order-customer-search]");
}

async function selectOrderCustomer(customerId) {
  if (!customerId) {
    return;
  }

  readOrderFormDraft();
  try {
    const result = await window.erpClient.getCustomer(customerId);
    const detail = result.data;
    const customerName = orderCustomerName(detail);
    const managerName = orderPrimaryContactName(detail);
    resetOrderLookupFilterCache(customerId);
    orderState.customerLookup = {
      query: "",
      candidates: [],
      selectedCustomerId: customerId,
      selectedCustomer: detail,
      activeIndex: 0,
    };
    orderState.draft = {
      ...orderState.draft,
      customerId,
      customer: customerName,
      shipOwner: customerName,
      manager: managerName,
      vessel: "",
      equipment: "",
      assetId: "",
      equipmentId: "",
    };
    orderState.vesselLookup = { open: false, query: "", activeIndex: 0, awaitingSelection: false };
    orderState.equipmentLookup = { open: false, query: "", activeIndex: 0, awaitingSelection: false };
    orderState.notice = "매출처/선사/주문담당자 인식 완료. 선박과 엔진 선택 가능.";
  } catch (error) {
    orderState.notice = error.message || "매출처 상세를 불러오지 못했습니다.";
  }

  renderOrderWorkspace();
  focusOrderInput("[data-order-vessel-input]");
}

function updateOrderPreviewFromForm(form) {
  const order = orderFromForm(form);
  orderState.draft = order;
  const preview = document.getElementById("order-management-preview");
  const status = document.getElementById("order-preview-status");
  const scope = document.getElementById("order-preview-scope");
  const kind = document.getElementById("order-preview-kind");
  if (preview) {
    preview.textContent = order.managementNumber;
  }
  if (status) {
    status.textContent = order.status;
  }
  if (scope) {
    scope.textContent = orderScopeLabel(order);
  }
  if (kind) {
    kind.textContent = order.businessType;
  }
}
