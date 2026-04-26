async function handleOrderClick(event) {
  const orderContextAction = event.target.closest("[data-order-context-action]");
  if (orderContextAction) {
    const action = orderContextAction.dataset.orderContextAction || "";
    const contextOrderId = orderState.contextMenu?.orderId || "";
    closeOrderContextMenu();
    renderOrderWorkspace();
    if (action === "merge") {
      await handleMergeSelectedOrders();
    } else if (action === "delete") {
      const targetIds = orderDeleteSelectionIds(contextOrderId);
      await deleteOrders(targetIds);
    }
    return true;
  }

  if (orderState.contextMenu?.visible && !event.target.closest(".order-context-menu")) {
    closeOrderContextMenu();
    renderOrderWorkspace();
    return true;
  }

  const documentDetailClose = event.target.closest("[data-order-document-detail-close]");
  if (documentDetailClose) {
    orderState.documentDetail = { visible: false, orderId: "", typeCode: "" };
    renderOrderWorkspace();
    return true;
  }

  const documentPickButton = event.target.closest("[data-order-document-pick]");
  if (documentPickButton) {
    const container = documentPickButton.closest("#order-document-form");
    if (container) {
      await handlePickOrderDocumentFile(container);
    }
    return true;
  }

  const documentAddButton = event.target.closest("[data-order-document-add]");
  if (documentAddButton) {
    const container = documentAddButton.closest("#order-document-form");
    if (container) {
      handleAddOrderDocument(container);
    }
    return true;
  }

  const documentOpenAddButton = event.target.closest("[data-order-document-open-add]");
  if (documentOpenAddButton) {
    orderState.documentAddPanelOpen = true;
    orderState.documentDraft = emptyOrderDocumentDraft();
    renderOrderWorkspace();
    return true;
  }

  const documentCancelAddButton = event.target.closest("[data-order-document-cancel-add]");
  if (documentCancelAddButton) {
    orderState.documentAddPanelOpen = false;
    orderState.documentDraft = emptyOrderDocumentDraft();
    renderOrderWorkspace();
    return true;
  }

  const orderComboButton = event.target.closest("[data-order-combo-open]");
  if (orderComboButton) {
    const fieldName = orderComboButton.dataset.orderComboOpen || "";
    const input = orderComboButton.closest(".order-combo-wrap")?.querySelector("input");
    if (input instanceof HTMLInputElement) {
      input.focus();
      if (fieldName === "customer") {
        await searchOrderCustomers(input.value || "");
        return true;
      }
      if (fieldName === "vessel") {
        openOrderVesselLookup(input.value || "");
        return true;
      }
      if (fieldName === "equipment") {
        openOrderEquipmentLookup(input.value || "");
        return true;
      }
      try {
        input.showPicker?.();
      } catch {
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      }
    }
    return true;
  }

  const orderCustomerPick = event.target.closest("[data-order-customer-pick]");
  if (orderCustomerPick) {
    await selectOrderCustomer(orderCustomerPick.dataset.orderCustomerPick || "");
    return true;
  }

  const vesselPick = event.target.closest("[data-order-vessel-pick]");
  if (vesselPick) {
    selectOrderVessel(vesselPick.dataset.orderVesselPick || "");
    return true;
  }

  const equipmentPick = event.target.closest("[data-order-equipment-pick]");
  if (equipmentPick) {
    selectOrderEquipment(equipmentPick.dataset.orderEquipmentPick || "");
    return true;
  }

  const orderSelectRow = event.target.closest("[data-order-select]");
  if (orderSelectRow) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return true;
    }
    const orderId = orderSelectRow.dataset.orderSelect;
    if (event.ctrlKey || event.metaKey) {
      const selectedIds = new Set(orderState.multiSelectedOrderIds || []);
      if (!selectedIds.size && orderState.selectedOrderId && orderState.selectedOrderId !== orderId && activeOrderById(orderState.selectedOrderId)) {
        selectedIds.add(orderState.selectedOrderId);
      }
      if (selectedIds.has(orderId)) {
        selectedIds.delete(orderId);
      } else {
        selectedIds.add(orderId);
      }
      orderState.multiSelectedOrderIds = Array.from(selectedIds);
      orderState.notice = orderState.multiSelectedOrderIds.length >= 2 ? `${orderState.multiSelectedOrderIds.length}개 주문 선택. 우클릭으로 합치기 가능.` : "주문 다중 선택 상태입니다.";
      closeOrderContextMenu();
      renderOrderWorkspace();
      return true;
    }
    orderState.multiSelectedOrderIds = [];
    orderState.selectedOrderId = orderId;
    orderState.draft = {};
    orderState.documentAddPanelOpen = false;
    orderState.documentDraft = emptyOrderDocumentDraft();
    resetOrderLookupFilterCache("");
    orderState.customerLookup = { query: "", candidates: [], selectedCustomerId: "", selectedCustomer: null, activeIndex: 0 };
    orderState.notice = "요청 상세를 불러왔습니다.";
    renderOrderWorkspace();
    return true;
  }

  const orderResetButton = event.target.closest("[data-order-new]");
  if (orderResetButton) {
    if (!(await confirmCustomerInlineEditBeforeLeave())) {
      return true;
    }
    orderState.selectedOrderId = null;
    orderState.multiSelectedOrderIds = [];
    orderState.draft = { confirmationDate: new Date().toISOString().slice(0, 10) };
    orderState.documentAddPanelOpen = false;
    orderState.documentDraft = emptyOrderDocumentDraft();
    resetOrderLookupFilterCache("");
    orderState.customerLookup = { query: "", candidates: [], selectedCustomerId: "", selectedCustomer: null, activeIndex: 0 };
    orderState.vesselLookup = { open: false, query: "", activeIndex: 0, awaitingSelection: false };
    orderState.equipmentLookup = { open: false, query: "", activeIndex: 0, awaitingSelection: false };
    orderState.notice = "신규 주문 입력 상태입니다.";
    closeOrderContextMenu();
    await showAppMessage("신규 주문을 등록하세요.");
    renderOrderWorkspace();
    focusOrderInput("[data-order-customer-search]");
    return true;
  }

  const orderSearchResetButton = event.target.closest("[data-order-search-reset]");
  if (orderSearchResetButton) {
    orderState.filters = defaultOrderFilters();
    orderState.hasSearched = false;
    orderState.selectedOrderId = null;
    orderState.multiSelectedOrderIds = [];
    closeOrderContextMenu();
    orderState.notice = "기간 조회 조건을 초기화했습니다.";
    renderOrderWorkspace();
    return true;
  }

  const orderFilterToggle = event.target.closest("[data-order-filter-toggle]");
  if (orderFilterToggle) {
    const field = orderFilterToggle.dataset.orderFilterToggle || "";
    orderState.filters.activeColumn = orderState.filters.activeColumn === field ? "" : field;
    renderOrderWorkspace();
    return true;
  }

  const orderFilterOption = event.target.closest("[data-order-filter-value]");
  if (orderFilterOption) {
    const field = orderFilterOption.dataset.orderFilterField || "";
    const value = orderFilterOption.dataset.orderFilterValue || "";
    orderState.filters.columns = {
      ...(orderState.filters.columns || {}),
      [field]: value,
    };
    if (!value) {
      delete orderState.filters.columns[field];
    }
    orderState.filters.activeColumn = "";
    orderState.hasSearched = true;
    orderState.notice = "헤더 필터를 적용했습니다.";
    renderOrderWorkspace();
    return true;
  }

  return Boolean(event.target.closest("[data-order-column-resizer]"));
}

async function handleOrderDoubleClick(event) {
  const documentRow = event.target.closest("[data-order-document-open]");
  if (!documentRow) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  const orderId = documentRow.dataset.orderDocumentOrder || "";
  const documentId = documentRow.dataset.orderDocumentId || "";
  const order = orderById(orderId);
  const doc = orderDocumentsFor(order).find((item) => item.id === documentId) || {
    target: documentRow.dataset.orderDocumentOpen || "",
    internalTab: documentRow.dataset.orderDocumentInternal || "",
  };
  await openOrderDocument(doc);
  return true;
}

async function openOrderDocument(doc) {
  if (doc?.target || doc?.filePath || doc?.attachmentPath) {
    return openExternalDocument(doc);
  }
  if (doc?.internalTab) {
    return openInternalDocument(doc);
  }
  await showAppMessage("문서를 열 수 없습니다.");
  return false;
}

async function openExternalDocument(doc) {
  const target = doc.target || doc.filePath || doc.attachmentPath || "";
  if (!target) {
    await showAppMessage("문서를 열 수 없습니다.");
    return false;
  }
  try {
    await window.erpClient.openDocument(target);
    return true;
  } catch (error) {
    await showAppMessage(error.message || "문서를 열 수 없습니다.");
    return false;
  }
}

async function openInternalDocument(doc) {
  const tabKey = doc.internalTab || "";
  if (!tabKey) {
    await showAppMessage("문서를 열 수 없습니다.");
    return false;
  }
  openWorkspaceTab(tabKey);
  renderDashboardTabs();
  renderActiveTab();
  await showAppMessage(`${doc.typeLabel || doc.name || "문서"} 화면으로 이동했습니다.`);
  return true;
}

async function handleOrderKeydown(event) {
  const vesselInput = event.target.closest("[data-order-vessel-input]");
  if (vesselInput instanceof HTMLInputElement) {
    return handleOrderAssetLookupKeydown(event, "vessel", vesselInput);
  }

  const equipmentInput = event.target.closest("[data-order-equipment-input]");
  if (equipmentInput instanceof HTMLInputElement) {
    return handleOrderAssetLookupKeydown(event, "equipment", equipmentInput);
  }

  const customerInput = event.target.closest("[data-order-customer-search]");
  if (!(customerInput instanceof HTMLInputElement)) {
    return false;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const candidates = orderState.customerLookup.candidates;
    if (!candidates.length) {
      if (event.key === "ArrowDown" && customerInput.value.trim()) {
        event.preventDefault();
        await searchOrderCustomers(customerInput.value);
      }
      return true;
    }
    event.preventDefault();
    const delta = event.key === "ArrowDown" ? 1 : -1;
    orderState.customerLookup.activeIndex = (orderState.customerLookup.activeIndex + delta + candidates.length) % candidates.length;
    readOrderFormDraft();
    renderOrderWorkspace();
    focusOrderInput("[data-order-customer-search]");
    return true;
  }

  if (event.key !== "Enter") {
    return false;
  }

  event.preventDefault();
  const candidates = orderState.customerLookup.candidates;
  if (candidates.length) {
    const active = candidates[orderState.customerLookup.activeIndex] || candidates[0];
    await selectOrderCustomer(active.id);
    return true;
  }

  await searchOrderCustomers(customerInput.value);
  return true;
}

function handleOrderAssetLookupKeydown(event, kind, input) {
  const state = kind === "vessel" ? orderState.vesselLookup : orderState.equipmentLookup;
  const selector = kind === "vessel" ? "[data-order-vessel-input]" : "[data-order-equipment-input]";
  if (event.key === "Escape") {
    state.open = false;
    state.awaitingSelection = false;
    readOrderFormDraft();
    renderOrderWorkspace();
    focusOrderInput(selector);
    return true;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    readOrderFormDraft();
    state.open = true;
    state.query = input.value || "";
    state.awaitingSelection = false;
    const items = kind === "vessel" ? orderFilteredVesselOptions(state.query) : orderFilteredEquipmentOptions(state.query, orderState.draft.vessel || "");
    if (items.length) {
      const delta = event.key === "ArrowDown" ? 1 : -1;
      state.activeIndex = (state.activeIndex + delta + items.length) % items.length;
    } else {
      state.activeIndex = 0;
    }
    renderOrderWorkspace();
    focusOrderInput(selector);
    scrollActiveOrderLookupOption(selector);
    return true;
  }

  if (event.key !== "Enter") {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  readOrderFormDraft();
  const nextQuery = input.value || "";
  const wasOpen = Boolean(state.open);
  const queryChanged = state.query !== nextQuery;
  state.open = true;
  state.query = nextQuery;
  const items = kind === "vessel" ? orderFilteredVesselOptions(state.query) : orderFilteredEquipmentOptions(state.query, orderState.draft.vessel || "");
  if (!items.length) {
    state.activeIndex = 0;
    state.awaitingSelection = true;
    orderState.notice = kind === "vessel" ? "등록된 선박이 없습니다." : "등록된 엔진/장비가 없습니다.";
    renderOrderWorkspace();
    focusOrderInput(selector);
    return true;
  }
  if (!wasOpen || queryChanged || state.awaitingSelection) {
    state.activeIndex = Math.max(0, Math.min(state.activeIndex || 0, items.length - 1));
    state.awaitingSelection = true;
    renderOrderWorkspace();
    focusOrderInput(selector);
    scrollActiveOrderLookupOption(selector);
    return true;
  }
  state.awaitingSelection = false;
  const active = items[state.activeIndex] || items[0];
  if (kind === "vessel") {
    selectOrderVessel(active.id || "");
  } else {
    selectOrderEquipment(active.id || "");
  }
  return true;
}

function scrollActiveOrderLookupOption(selector) {
  requestAnimationFrame(() => {
    const input = orderWorkspace.querySelector(selector);
    const active = input?.closest(".order-combo-wrap")?.querySelector(".order-lookup-option.active");
    active?.scrollIntoView({ block: "nearest" });
  });
}

function handleOrderContextMenu(event) {
  const orderSelectRow = event.target.closest("[data-order-select]");
  if (orderSelectRow) {
    const orderId = orderSelectRow.dataset.orderSelect || "";
    const selectedIds = orderMergeSelectionIds(orderId);
    if (selectedIds.length >= 2) {
      event.preventDefault();
      orderState.contextMenu = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        actionType: "merge",
        orderId,
      };
      renderOrderWorkspace();
      return true;
    }
    if (activeOrderById(orderId)) {
      event.preventDefault();
      orderState.selectedOrderId = orderId;
      orderState.multiSelectedOrderIds = [];
      orderState.contextMenu = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        actionType: "delete",
        orderId,
      };
      renderOrderWorkspace();
      return true;
    }
  }

  const orderDocumentRow = event.target.closest("[data-order-document-detail]");
  if (!orderDocumentRow) {
    return false;
  }

  event.preventDefault();
  orderState.documentDetail = {
    visible: true,
    orderId: orderDocumentRow.dataset.orderDocumentOrder || "",
    typeCode: orderDocumentRow.dataset.orderDocumentDetail || "",
  };
  renderOrderWorkspace();
  return true;
}

function openOrderVesselLookup(query = "") {
  readOrderFormDraft();
  orderState.vesselLookup = { open: true, query, activeIndex: 0, awaitingSelection: true };
  orderState.equipmentLookup = { open: false, query: "", activeIndex: 0, awaitingSelection: false };
  if (!orderFilteredVesselOptions(query).length) {
    orderState.notice = "등록된 선박이 없습니다.";
  }
  renderOrderWorkspace();
  focusOrderInput("[data-order-vessel-input]");
}

function openOrderEquipmentLookup(query = "") {
  readOrderFormDraft();
  orderState.equipmentLookup = { open: true, query, activeIndex: 0, awaitingSelection: true };
  orderState.vesselLookup = { open: false, query: "", activeIndex: 0, awaitingSelection: false };
  if (!orderFilteredEquipmentOptions(query, orderState.draft.vessel || "").length) {
    orderState.notice = "등록된 엔진/장비가 없습니다.";
  }
  renderOrderWorkspace();
  focusOrderInput("[data-order-equipment-input]");
}

function selectOrderVessel(assetId) {
  if (!assetId) {
    return;
  }
  readOrderFormDraft();
  const vessel = orderVesselOptions().find((asset) => asset.id === assetId);
  if (!vessel) {
    orderState.notice = "선박을 찾을 수 없습니다.";
    renderOrderWorkspace();
    return;
  }
  orderState.draft = {
    ...orderState.draft,
    vessel: vessel.assetName || "",
    assetId: vessel.id || "",
    equipment: "",
    equipmentId: "",
  };
  orderState.vesselLookup = { open: false, query: "", activeIndex: 0, awaitingSelection: false };
  orderState.equipmentLookup = { open: false, query: "", activeIndex: 0, awaitingSelection: false };
  orderState.notice = "선박 선택 완료. 엔진/장비 선택 가능.";
  renderOrderWorkspace();
  focusOrderInput("[data-order-equipment-input]");
}

function selectOrderEquipment(equipmentId) {
  if (!equipmentId) {
    return;
  }
  readOrderFormDraft();
  const equipment = orderEquipmentOptions(orderState.draft.vessel || "").find((item) => item.id === equipmentId);
  if (!equipment) {
    orderState.notice = "엔진/장비를 찾을 수 없습니다.";
    renderOrderWorkspace();
    return;
  }
  const displayName = orderEquipmentDisplayName(equipment);
  const draft = {
    ...orderState.draft,
    equipment: displayName,
    equipmentId: equipment.id || "",
  };
  if (!String(draft.description || "").trim()) {
    draft.description = orderEquipmentOrderName(equipment);
  }
  orderState.draft = draft;
  orderState.equipmentLookup = { open: false, query: "", activeIndex: 0, awaitingSelection: false };
  orderState.notice = "엔진/장비 선택 완료.";
  renderOrderWorkspace();
  focusOrderInput("[data-order-type-select]");
}

function parseOrderDateInput(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return new Date(new Date().toISOString().slice(0, 10));
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? new Date(new Date().toISOString().slice(0, 10)) : date;
}

function formatOrderDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysInOrderMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function addOrderMonths(date, delta) {
  const day = date.getDate();
  const targetMonth = date.getMonth() + delta;
  const target = new Date(date.getFullYear(), targetMonth, 1);
  target.setDate(Math.min(day, daysInOrderMonth(target.getFullYear(), target.getMonth())));
  return target;
}

function addOrderYears(date, delta) {
  const target = new Date(date.getFullYear() + delta, date.getMonth(), 1);
  target.setDate(Math.min(date.getDate(), daysInOrderMonth(target.getFullYear(), target.getMonth())));
  return target;
}

function handleOrderWheel(event) {
  const dateInput = event.target.closest("[data-order-confirmation-date]");
  if (!(dateInput instanceof HTMLInputElement) || document.activeElement !== dateInput) {
    return false;
  }
  event.preventDefault();
  event.stopPropagation();
  const direction = event.deltaY < 0 ? 1 : -1;
  let nextDate = parseOrderDateInput(dateInput.value);
  if (event.altKey) {
    nextDate = addOrderYears(nextDate, direction);
  } else if (event.shiftKey) {
    nextDate = addOrderMonths(nextDate, direction);
  } else {
    nextDate.setDate(nextDate.getDate() + direction);
  }
  dateInput.value = formatOrderDate(nextDate);
  const form = dateInput.closest("#order-form");
  if (form instanceof HTMLFormElement) {
    updateOrderPreviewFromForm(form);
  }
  return true;
}

function handleOrderMouseDown(event) {
  const paneResizer = event.target.closest("[data-order-pane-resizer]");
  if (paneResizer) {
    event.preventDefault();
    event.stopPropagation();
    const body = paneResizer.closest(".order-erp-body");
    if (!(body instanceof HTMLElement)) {
      return true;
    }
    const rect = body.getBoundingClientRect();
    const currentWidth = loadOrderListPaneWidth() || body.querySelector(".order-list-panel")?.getBoundingClientRect().width || rect.width * 0.58;

    function resizePane(moveEvent) {
      const maxWidth = Math.max(420, rect.width - 380);
      const nextWidth = Math.min(maxWidth, Math.max(420, currentWidth + moveEvent.clientX - rect.left - currentWidth));
      saveOrderListPaneWidth(nextWidth);
      body.style.gridTemplateColumns = `${nextWidth}px 8px minmax(360px, 1fr)`;
    }

    function stopResizePane() {
      window.removeEventListener("mousemove", resizePane);
      window.removeEventListener("mouseup", stopResizePane);
    }

    window.addEventListener("mousemove", resizePane);
    window.addEventListener("mouseup", stopResizePane);
    return true;
  }

  const resizer = event.target.closest("[data-order-column-resizer]");
  if (!resizer) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  const index = Number(resizer.dataset.orderColumnResizer);
  const widths = loadOrderColumnWidths();
  const startX = event.clientX;
  const startWidth = widths[index] || DEFAULT_ORDER_COLUMN_WIDTHS[index] || 80;

  function resizeColumn(moveEvent) {
    const nextWidths = [...widths];
    nextWidths[index] = Math.max(46, startWidth + moveEvent.clientX - startX);
    saveOrderColumnWidths(nextWidths);
    const nextTemplate = orderColumnTemplate(nextWidths);
    dashboardMainPane.querySelectorAll(".order-list-grid-head, .order-table-row").forEach((row) => {
      row.style.gridTemplateColumns = nextTemplate;
    });
  }

  function stopResize() {
    window.removeEventListener("mousemove", resizeColumn);
    window.removeEventListener("mouseup", stopResize);
  }

  window.addEventListener("mousemove", resizeColumn);
  window.addEventListener("mouseup", stopResize);
  return true;
}

function handleOrderDragStart(event) {
  const column = event.target.closest("[data-order-column-field]");
  if (!column) {
    return false;
  }
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", `order:${column.dataset.orderColumnField || ""}`);
  column.classList.add("dragging");
  return true;
}

function handleOrderDragOver(event) {
  const column = event.target.closest("[data-order-column-field]");
  if (!column) {
    return false;
  }
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  return true;
}

function handleOrderDrop(event) {
  const column = event.target.closest("[data-order-column-field]");
  if (!column) {
    return false;
  }
  const data = event.dataTransfer?.getData("text/plain") || "";
  if (!data.startsWith("order:")) {
    return false;
  }
  event.preventDefault();
  const sourceField = data.slice("order:".length);
  const targetField = column.dataset.orderColumnField || "";
  if (moveOrderColumn(sourceField, targetField)) {
    renderOrderWorkspace();
  }
  return true;
}

function handleOrderDragEnd() {
  dashboardMainPane.querySelectorAll("[data-order-column-field].dragging").forEach((column) => column.classList.remove("dragging"));
}

async function handleOrderFormSubmit(form) {
  if (form.id === "order-search-form") {
    const data = Object.fromEntries(new FormData(form).entries());
    orderState.filters = {
      startDate: String(data.start_date || ""),
      endDate: String(data.end_date || ""),
      query: String(data.query || ""),
      columns: orderState.filters.columns || {},
    };
    orderState.hasSearched = true;
    orderState.multiSelectedOrderIds = [];
    closeOrderContextMenu();
    orderState.notice = "기간별 주문을 조회했습니다.";
    renderOrderWorkspace();
    return true;
  }

  if (form.id === "order-form") {
    const order = orderFromForm(form);
    const isExisting = Boolean(order.id);
    const nextId = order.id || nextOrderIdForDate(order.requestDate, orderState.orders);
    const previousOrder = isExisting ? orderState.orders.find((item) => item.id === order.id) || null : null;
    const nextOrder = {
      ...(previousOrder || {}),
      ...order,
      id: nextId,
      documents: previousOrder?.documents || order.documents || [],
      mergeHistory: previousOrder?.mergeHistory || order.mergeHistory || [],
      mergedOrderRecords: previousOrder?.mergedOrderRecords || order.mergedOrderRecords || [],
    };
    if (!isExisting) {
      nextOrder.status = "견적";
    }
    nextOrder.status = orderStatusFor(nextOrder);
    nextOrder.managementNumber = assignManagementNumber(nextOrder, orderState.orders);

    if (!window.erpClient?.saveOrder) {
      orderState.draft = nextOrder;
      orderState.notice = "서버 저장 기능을 사용할 수 없습니다. 주문이 저장되지 않았습니다.";
      renderOrderWorkspace();
      await showAppMessage("서버 저장 기능을 사용할 수 없어 주문이 저장되지 않았습니다.");
      focusOrderInput("[name='description']");
      return true;
    }

    try {
      const serverResult = await window.erpClient.saveOrder(nextOrder.id, nextOrder);
      applyOrderProjectServerData(serverResult?.data || {});
    } catch (error) {
      orderState.draft = nextOrder;
      orderState.notice = `서버 저장 실패. 주문이 저장되지 않았습니다. ${error?.message || ""}`.trim();
      renderOrderWorkspace();
      await showAppMessage(orderState.notice);
      focusOrderInput("[name='description']");
      return true;
    }

    orderState.selectedOrderId = nextOrder.id;
    orderState.multiSelectedOrderIds = [];
    orderState.hasSearched = true;
    ensureOrderVisibleInList(nextOrder);
    orderState.draft = {};
    orderState.notice =
      nextOrder.confirmed && nextOrder.businessType === "공사" && !nextOrder.confirmationDate
        ? "서버 저장 완료. 공사 예정일 미등록 알림 유지."
        : isExisting
          ? "서버에 주문 변경을 저장했습니다."
          : "서버에 신규 주문을 저장했습니다.";
    renderOrderWorkspace();
    return true;
  }

  if (form.id === "order-document-form") {
    handleAddOrderDocument(form);
    return true;
  }

  return false;
}

function handleOrderInput(event) {
  const documentContainer = event.target.closest("#order-document-form");
  if (documentContainer) {
    readOrderDocumentDraft(documentContainer);
    return true;
  }

  const vesselInput = event.target.closest("[data-order-vessel-input]");
  if (vesselInput instanceof HTMLInputElement) {
    const form = vesselInput.closest("#order-form");
    const assetIdInput = form?.querySelector('[name="asset_id"]');
    const equipmentInput = form?.querySelector('[name="equipment"]');
    const equipmentIdInput = form?.querySelector('[name="equipment_id"]');
    if (assetIdInput instanceof HTMLInputElement) {
      assetIdInput.value = "";
    }
    if (equipmentInput instanceof HTMLInputElement) {
      equipmentInput.value = "";
    }
    if (equipmentIdInput instanceof HTMLInputElement) {
      equipmentIdInput.value = "";
    }
    orderState.vesselLookup.query = vesselInput.value || "";
    orderState.vesselLookup.awaitingSelection = true;
    orderState.equipmentLookup = { open: false, query: "", activeIndex: 0, awaitingSelection: false };
    return false;
  }

  const equipmentInput = event.target.closest("[data-order-equipment-input]");
  if (equipmentInput instanceof HTMLInputElement) {
    const form = equipmentInput.closest("#order-form");
    const equipmentIdInput = form?.querySelector('[name="equipment_id"]');
    if (equipmentIdInput instanceof HTMLInputElement) {
      equipmentIdInput.value = "";
    }
    orderState.equipmentLookup.query = equipmentInput.value || "";
    orderState.equipmentLookup.awaitingSelection = true;
    return false;
  }

  const form = event.target.closest("#order-form");
  if (form instanceof HTMLFormElement) {
    updateOrderPreviewFromForm(form);
    return true;
  }

  return false;
}

function handleOrderChange(event) {
  const documentContainer = event.target.closest("#order-document-form");
  if (documentContainer) {
    readOrderDocumentDraft(documentContainer);
    return true;
  }

  const form = event.target.closest("#order-form");
  if (!(form instanceof HTMLFormElement)) {
    return false;
  }

  const confirmedInput = event.target.closest("[name='confirmed']");
  if (confirmedInput instanceof HTMLInputElement && confirmedInput.checked) {
    const status = form.querySelector("[name='order_status']");
    if (status instanceof HTMLSelectElement && status.value === "견적") {
      status.value = "발주";
    }
    readOrderFormDraft();
    renderOrderWorkspace();
    return true;
  }

  if (event.target.closest("[data-order-type-select]")) {
    readOrderFormDraft();
    orderState.draft.status = "견적";
    renderOrderWorkspace();
    focusOrderInput("[name='description']");
    return true;
  }

  if (event.target.closest("[data-order-vessel-input]")) {
    readOrderFormDraft();
    renderOrderWorkspace();
    return true;
  }

  updateOrderPreviewFromForm(form);
  return true;
}
