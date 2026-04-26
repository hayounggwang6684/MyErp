const INVOICE_STATUS_OPTIONS = ["청구 대기", "청구서 작성", "세금계산서 발행 대기", "발행 완료", "수금 대기", "부분 수금", "수금 완료", "연체", "보류", "취소"];
const INVOICE_DOCUMENT_TYPES = [
  { code: "BIL", label: "청구서" },
  { code: "TAX", label: "세금계산서" },
  { code: "STM", label: "거래명세서" },
  { code: "PAY", label: "입금확인증" },
  { code: "ETC", label: "기타" },
];

var invoiceState = {
  selectedInvoiceId: "INV-2026-001",
  activeDetailTab: "info",
  notice: "공사/판매/납품 청구와 수금 상태를 관리합니다.",
  filters: {
    startDate: "",
    endDate: "",
    status: "",
    customer: "",
    query: "",
  },
  invoices: [
    {
      id: "INV-2026-001",
      type: "공사",
      sourceType: "PROJECT",
      sourceId: "PRJ-2026-001",
      sourceNo: "SH-2026-001-T",
      customer: "태성해운",
      title: "TS BLUE Main Engine 진동 점검 청구",
      supplyAmount: 4200000,
      vatAmount: 420000,
      invoiceDate: "2026-04-18",
      dueDate: "2026-04-30",
      taxInvoiceNo: "TAX-2026-001",
      taxStatus: "발행 완료",
      status: "부분 수금",
      manager: "김태성",
      payments: [
        { id: "PAY-001", paidAt: "2026-04-20", amount: 2000000, method: "계좌이체", payer: "태성해운", handler: "시연 사용자", note: "선입금" },
      ],
      documents: [
        { id: "INV-2026-001-BIL-001", typeCode: "BIL", typeLabel: "청구서", name: "태성해운 청구서", target: "", fileName: "", createdAt: "2026-04-18" },
      ],
      memo: "잔금은 준공 문서 확인 후 입금 예정.",
    },
    {
      id: "INV-2026-002",
      type: "판매",
      sourceType: "SALE",
      sourceId: "OR-2026-002",
      sourceNo: "SH-2026-001-S",
      customer: "남해플랜트서비스",
      title: "감속기 소모품 납품 청구",
      supplyAmount: 1800000,
      vatAmount: 180000,
      invoiceDate: "2026-04-12",
      dueDate: "2026-04-19",
      taxInvoiceNo: "",
      taxStatus: "발행 대기",
      status: "연체",
      manager: "박경수",
      payments: [],
      documents: [],
      memo: "발주처 세금계산서 발행 요청 대기.",
    },
    {
      id: "INV-2026-003",
      type: "납품",
      sourceType: "DELIVERY",
      sourceId: "OR-2026-003",
      sourceNo: "SH-2026-002-S",
      customer: "영광기업",
      title: "발전기 부품 납품 청구",
      supplyAmount: 900000,
      vatAmount: 90000,
      invoiceDate: "2026-04-15",
      dueDate: "2026-04-25",
      taxInvoiceNo: "",
      taxStatus: "미작성",
      status: "청구 대기",
      manager: "이현우",
      payments: [],
      documents: [],
      memo: "",
    },
  ],
};

function invoiceTotal(invoice) {
  return Number(invoice.supplyAmount || 0) + Number(invoice.vatAmount || 0);
}

function invoicePaidTotal(invoice) {
  return (invoice.payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

function calculateInvoicePaymentStatus(invoice) {
  const total = invoiceTotal(invoice);
  const paid = invoicePaidTotal(invoice);
  const today = new Date().toISOString().slice(0, 10);
  if (paid >= total && total > 0) {
    return "수금 완료";
  }
  if (paid > 0) {
    return "부분 수금";
  }
  if (invoice.dueDate && invoice.dueDate < today) {
    return "연체";
  }
  if (invoice.status === "발행 완료") {
    return "수금 대기";
  }
  return invoice.status || "청구 대기";
}

function invoiceBadgeKind(status) {
  if (status === "수금 완료" || status === "발행 완료") {
    return "ok";
  }
  if (status === "연체" || status === "취소") {
    return "danger";
  }
  if (status === "부분 수금" || status === "수금 대기" || status === "세금계산서 발행 대기") {
    return "warn";
  }
  return "neutral";
}

function invoiceDocumentType(typeCode) {
  return INVOICE_DOCUMENT_TYPES.find((type) => type.code === typeCode) || INVOICE_DOCUMENT_TYPES[INVOICE_DOCUMENT_TYPES.length - 1];
}

function invoiceSelectOptions(options, selectedValue = "") {
  return options.map((option) => `<option value="${escapeAttribute(option)}"${option === selectedValue ? " selected" : ""}>${escapeTextarea(option)}</option>`).join("");
}

function invoiceDocumentTypeOptions(selectedCode = "BIL") {
  return INVOICE_DOCUMENT_TYPES.map(
    (type) => `<option value="${escapeAttribute(type.code)}"${type.code === selectedCode ? " selected" : ""}>${escapeTextarea(type.label)}</option>`,
  ).join("");
}

function selectedInvoice() {
  return invoiceState.invoices.find((invoice) => invoice.id === invoiceState.selectedInvoiceId) || invoiceState.invoices[0] || null;
}

function filteredInvoices() {
  const query = String(invoiceState.filters.query || "").trim().toLowerCase();
  const customer = String(invoiceState.filters.customer || "").trim().toLowerCase();
  return invoiceState.invoices.filter((invoice) => {
    const status = calculateInvoicePaymentStatus(invoice);
    if (invoiceState.filters.startDate && invoice.invoiceDate < invoiceState.filters.startDate) {
      return false;
    }
    if (invoiceState.filters.endDate && invoice.invoiceDate > invoiceState.filters.endDate) {
      return false;
    }
    if (invoiceState.filters.status && status !== invoiceState.filters.status) {
      return false;
    }
    if (customer && !String(invoice.customer || "").toLowerCase().includes(customer)) {
      return false;
    }
    if (query) {
      const haystack = [invoice.id, invoice.sourceNo, invoice.title, invoice.customer, invoice.taxInvoiceNo].join(" ").toLowerCase();
      return haystack.includes(query);
    }
    return true;
  });
}

function renderInvoiceFilters() {
  return `
    <form id="invoice-filter-form" class="invoice-filterbar">
      <label>기간 <input class="text-field" type="date" name="start_date" value="${escapeAttribute(invoiceState.filters.startDate)}" /></label>
      <label>~ <input class="text-field" type="date" name="end_date" value="${escapeAttribute(invoiceState.filters.endDate)}" /></label>
      <label>상태 <select class="text-field" name="status"><option value="">전체</option>${invoiceSelectOptions(INVOICE_STATUS_OPTIONS, invoiceState.filters.status)}</select></label>
      <label>거래처 <input class="text-field" name="customer" value="${escapeAttribute(invoiceState.filters.customer)}" /></label>
      <label class="invoice-filter-query">검색어 <input class="text-field" type="search" name="query" value="${escapeAttribute(invoiceState.filters.query)}" placeholder="관리번호 / 주문명 / 거래처 / 세금계산서" /></label>
      <button class="secondary-button" type="submit">조회</button>
      <button class="secondary-button" type="button" data-invoice-filter-reset>초기화</button>
    </form>
  `;
}

function renderInvoiceSummary() {
  const invoices = invoiceState.invoices.map((invoice) => ({ ...invoice, computedStatus: calculateInvoicePaymentStatus(invoice) }));
  const waiting = invoices.filter((invoice) => invoice.computedStatus === "청구 대기").length;
  const issued = invoices.filter((invoice) => invoice.taxStatus === "발행 완료").length;
  const receivable = invoices.filter((invoice) => invoicePaidTotal(invoice) < invoiceTotal(invoice)).reduce((sum, invoice) => sum + invoiceTotal(invoice) - invoicePaidTotal(invoice), 0);
  const overdue = invoices.filter((invoice) => invoice.computedStatus === "연체").length;
  return `
    <section class="invoice-summary-grid">
      <article class="invoice-summary-card"><span>청구 대기</span><strong>${waiting}</strong><small>청구서 작성 필요</small></article>
      <article class="invoice-summary-card"><span>발행 완료</span><strong>${issued}</strong><small>세금계산서 기준</small></article>
      <article class="invoice-summary-card"><span>미수금</span><strong>${formatWon(receivable)}</strong><small>부분 수금 포함</small></article>
      <article class="invoice-summary-card"><span>연체</span><strong>${overdue}</strong><small>예정일 경과</small></article>
    </section>
  `;
}

function renderInvoiceList() {
  const invoices = filteredInvoices();
  return `
    <section class="invoice-list-panel">
      <div class="invoice-panel-title">
        <strong>청구 목록</strong>
        <span>${invoices.length}건</span>
      </div>
      <div class="invoice-list">
        <div class="invoice-list-head">
          <span>청구번호</span><span>구분</span><span>거래처</span><span>원거래</span><span>청구금액</span><span>수금상태</span><span>청구일</span><span>예정일</span>
        </div>
        ${
          invoices.length
            ? invoices
                .map((invoice) => {
                  const status = calculateInvoicePaymentStatus(invoice);
                  return `
                    <button type="button" class="invoice-list-row${invoice.id === invoiceState.selectedInvoiceId ? " active" : ""}" data-invoice-select="${escapeAttribute(invoice.id)}">
                      <span>${escapeTextarea(invoice.id)}</span>
                      <span>${escapeTextarea(invoice.type)}</span>
                      <span>${escapeTextarea(invoice.customer)}</span>
                      <span>${escapeTextarea(invoice.sourceNo)}</span>
                      <span>${formatWon(invoiceTotal(invoice))}</span>
                      <span><mark class="status-badge ${invoiceBadgeKind(status)}">${escapeTextarea(status)}</mark></span>
                      <span>${escapeTextarea(invoice.invoiceDate)}</span>
                      <span>${escapeTextarea(invoice.dueDate)}</span>
                    </button>
                  `;
                })
                .join("")
            : '<div class="invoice-empty">조회 조건에 맞는 청구 건이 없습니다.</div>'
        }
      </div>
    </section>
  `;
}

function renderInvoiceInfo(invoice) {
  const status = calculateInvoicePaymentStatus(invoice);
  return `
    <section class="invoice-panel">
      <div class="invoice-form-grid">
        <label>청구번호 <input class="text-field" value="${escapeAttribute(invoice.id)}" readonly /></label>
        <label>구분 <input class="text-field" value="${escapeAttribute(invoice.type)}" readonly /></label>
        <label>원거래 번호 <input class="text-field" value="${escapeAttribute(invoice.sourceNo)}" readonly /></label>
        <label>거래처 <input class="text-field" value="${escapeAttribute(invoice.customer)}" readonly /></label>
        <label class="invoice-wide-field">청구명 <input class="text-field" value="${escapeAttribute(invoice.title)}" readonly /></label>
        <label>공급가액 <input class="text-field" value="${escapeAttribute(formatWon(invoice.supplyAmount))}" readonly /></label>
        <label>부가세 <input class="text-field" value="${escapeAttribute(formatWon(invoice.vatAmount))}" readonly /></label>
        <label>합계금액 <input class="text-field" value="${escapeAttribute(formatWon(invoiceTotal(invoice)))}" readonly /></label>
        <label>청구일 <input class="text-field" type="date" value="${escapeAttribute(invoice.invoiceDate)}" readonly /></label>
        <label>수금 예정일 <input class="text-field" type="date" value="${escapeAttribute(invoice.dueDate)}" readonly /></label>
        <label>세금계산서 번호 <input class="text-field" value="${escapeAttribute(invoice.taxInvoiceNo || "-")}" readonly /></label>
        <label>세금계산서 상태 <input class="text-field" value="${escapeAttribute(invoice.taxStatus)}" readonly /></label>
        <label>청구 상태 <input class="text-field" value="${escapeAttribute(invoice.status)}" readonly /></label>
        <label>담당자 <input class="text-field" value="${escapeAttribute(invoice.manager)}" readonly /></label>
      </div>
      <div class="invoice-status-strip">
        <span class="status-badge ${invoiceBadgeKind(invoice.taxStatus)}">세금계산서 ${escapeTextarea(invoice.taxStatus)}</span>
        <span class="status-badge ${invoiceBadgeKind(status)}">수금 ${escapeTextarea(status)}</span>
        <span class="status-badge neutral">미수 ${escapeTextarea(formatWon(Math.max(0, invoiceTotal(invoice) - invoicePaidTotal(invoice))))}</span>
      </div>
    </section>
  `;
}

function renderInvoicePayments(invoice) {
  return `
    <section class="invoice-panel invoice-payment-panel">
      <div class="invoice-payment-summary">
        <span>청구 합계 <strong>${formatWon(invoiceTotal(invoice))}</strong></span>
        <span>수금 합계 <strong>${formatWon(invoicePaidTotal(invoice))}</strong></span>
        <span>잔액 <strong>${formatWon(Math.max(0, invoiceTotal(invoice) - invoicePaidTotal(invoice)))}</strong></span>
      </div>
      <div class="invoice-table-wrap">
        <table class="data-table invoice-table">
          <thead><tr><th>입금일</th><th>입금액</th><th>입금수단</th><th>입금자명</th><th>처리자</th><th>비고</th></tr></thead>
          <tbody>
            ${
              invoice.payments?.length
                ? invoice.payments
                    .map(
                      (payment) => `<tr><td>${escapeTextarea(payment.paidAt)}</td><td>${formatWon(payment.amount)}</td><td>${escapeTextarea(payment.method)}</td><td>${escapeTextarea(payment.payer)}</td><td>${escapeTextarea(payment.handler)}</td><td>${escapeTextarea(payment.note || "-")}</td></tr>`,
                    )
                    .join("")
                : '<tr><td colspan="6" class="order-empty-cell">등록된 수금 내역이 없습니다.</td></tr>'
            }
          </tbody>
        </table>
      </div>
      <form id="invoice-payment-form" class="invoice-compact-form">
        <input type="hidden" name="invoice_id" value="${escapeAttribute(invoice.id)}" />
        <label>입금일 <input class="text-field" type="date" name="paid_at" value="${new Date().toISOString().slice(0, 10)}" /></label>
        <label>입금액 <input class="text-field" type="number" name="amount" min="0" step="1000" /></label>
        <label>입금수단 <select class="text-field" name="method">${invoiceSelectOptions(["계좌이체", "현금", "기타"], "계좌이체")}</select></label>
        <label>입금자명 <input class="text-field" name="payer" value="${escapeAttribute(invoice.customer)}" /></label>
        <label>비고 <input class="text-field" name="note" /></label>
        <button class="primary-button" type="submit">수금 등록</button>
      </form>
    </section>
  `;
}

function nextInvoiceDocumentId(invoiceId, typeCode, documents) {
  const prefix = `${invoiceId}-${typeCode}-`;
  const maxSequence = documents
    .filter((doc) => String(doc.id || "").startsWith(prefix))
    .reduce((max, doc) => {
      const sequence = Number(String(doc.id || "").slice(prefix.length));
      return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
    }, 0);
  return `${prefix}${String(maxSequence + 1).padStart(3, "0")}`;
}

function renderInvoiceDocuments(invoice) {
  return `
    <section class="invoice-panel invoice-document-panel">
      <div class="invoice-table-wrap">
        <table class="data-table invoice-table">
          <thead><tr><th>문서종류</th><th>문서명</th><th>문서ID</th><th>등록일</th></tr></thead>
          <tbody>
            ${
              invoice.documents?.length
                ? invoice.documents
                    .map((doc) => `<tr><td>${escapeTextarea(doc.typeLabel || invoiceDocumentType(doc.typeCode).label)}</td><td>${escapeTextarea(doc.name)}${doc.fileName ? ` <small>${escapeTextarea(doc.fileName)}</small>` : ""}</td><td>${escapeTextarea(doc.id)}</td><td>${escapeTextarea(doc.createdAt || "-")}</td></tr>`)
                    .join("")
                : '<tr><td colspan="4" class="order-empty-cell">등록된 문서가 없습니다.</td></tr>'
            }
          </tbody>
        </table>
      </div>
      <section id="invoice-document-form" class="invoice-document-form">
        <input type="hidden" name="invoice_id" value="${escapeAttribute(invoice.id)}" />
        <input type="hidden" name="attachment_path" value="" />
        <input type="hidden" name="attachment_name" value="" />
        <input type="hidden" name="file_id" value="" />
        <div class="invoice-document-form-head">
          <strong>문서 추가</strong>
          <button type="button" class="secondary-button" data-invoice-document-add>문서 추가</button>
        </div>
        <div class="invoice-document-add-row">
          <label>문서 종류 <select class="text-field" name="document_type">${invoiceDocumentTypeOptions()}</select></label>
          <label>문서명 <input class="text-field" name="document_name" placeholder="문서명" /></label>
          <label>첨부파일
            <span class="invoice-document-file-field">
              <input class="text-field" name="attachment_label" value="선택된 파일 없음" readonly />
              <button type="button" class="secondary-button" data-invoice-document-pick>파일 선택</button>
            </span>
          </label>
        </div>
      </section>
    </section>
  `;
}

function renderInvoiceMemo(invoice) {
  return `
    <section class="invoice-panel">
      <form id="invoice-memo-form" class="invoice-memo-form">
        <input type="hidden" name="invoice_id" value="${escapeAttribute(invoice.id)}" />
        <label>메모 <textarea class="text-area" name="memo" placeholder="입금 지연 사유, 재발행 요청, 내부 확인사항">${escapeTextarea(invoice.memo || "")}</textarea></label>
        <button class="primary-button" type="submit">메모 저장</button>
      </form>
    </section>
  `;
}

function renderInvoiceDetail() {
  const invoice = selectedInvoice();
  if (!invoice) {
    return '<section class="invoice-detail-panel"><div class="invoice-empty">청구 건을 선택하세요.</div></section>';
  }
  const status = calculateInvoicePaymentStatus(invoice);
  const tabContent =
    invoiceState.activeDetailTab === "payments"
      ? renderInvoicePayments(invoice)
      : invoiceState.activeDetailTab === "documents"
        ? renderInvoiceDocuments(invoice)
        : invoiceState.activeDetailTab === "memo"
          ? renderInvoiceMemo(invoice)
          : renderInvoiceInfo(invoice);
  const tabs = [
    ["info", "청구 정보"],
    ["payments", "수금 내역"],
    ["documents", "문서"],
    ["memo", "메모"],
  ];
  return `
    <section class="invoice-detail-panel">
      <header class="invoice-detail-header">
        <div>
          <p class="eyebrow">${escapeTextarea(invoice.type)} 청구</p>
          <h3>${escapeTextarea(invoice.title)}</h3>
          <p>${escapeTextarea(invoice.customer)} · ${escapeTextarea(invoice.sourceNo)} · 담당 ${escapeTextarea(invoice.manager)}</p>
        </div>
        <span class="status-badge ${invoiceBadgeKind(status)}">${escapeTextarea(status)}</span>
      </header>
      <nav class="invoice-detail-tabs">
        ${tabs.map(([key, label]) => `<button type="button" class="invoice-detail-tab${invoiceState.activeDetailTab === key ? " active" : ""}" data-invoice-detail-tab="${key}">${label}</button>`).join("")}
      </nav>
      <div class="invoice-detail-scroll">${tabContent}</div>
    </section>
  `;
}

function renderInvoiceWorkspace() {
  invoiceWorkspace.innerHTML = `
    <section class="invoice-shell">
      ${renderInvoiceFilters()}
      ${renderInvoiceSummary()}
      <div class="message info invoice-notice">${escapeTextarea(invoiceState.notice)}</div>
      <section class="invoice-layout">
        ${renderInvoiceList()}
        ${renderInvoiceDetail()}
      </section>
    </section>
  `;
}
