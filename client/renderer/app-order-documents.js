const ORDER_DOCUMENT_TYPES = [
  { code: "PO", label: "발주서", internalTab: "orders" },
  { code: "QUO", label: "견적서", internalTab: "orders" },
  { code: "SRV", label: "서비스 레포트", internalTab: "work" },
  { code: "TST", label: "계측 및 시험 성적서", internalTab: "work" },
  { code: "INS", label: "점검 레포트", internalTab: "work" },
  { code: "OPN", label: "소견서", internalTab: "work" },
  { code: "CMP", label: "수리완공사양서", internalTab: "work" },
  { code: "ETC", label: "기타", internalTab: "" },
];

function orderDocumentType(typeCode) {
  return ORDER_DOCUMENT_TYPES.find((type) => type.code === typeCode) || ORDER_DOCUMENT_TYPES[ORDER_DOCUMENT_TYPES.length - 1];
}

function orderDocumentTypeOptions(selectedCode = "PO") {
  return ORDER_DOCUMENT_TYPES.map(
    (type) => `<option value="${escapeAttribute(type.code)}"${type.code === selectedCode ? " selected" : ""}>${escapeTextarea(type.label)}</option>`,
  ).join("");
}

function orderDocumentsFor(order) {
  return order?.documents || [];
}

function latestOrderDocuments(order) {
  const latestByType = new Map();
  for (const doc of orderDocumentsFor(order)) {
    latestByType.set(doc.typeCode, doc);
  }
  return [...latestByType.values()];
}

function nextOrderDocumentId(orderId, typeCode, documents) {
  const prefix = `${orderId}-${typeCode}-`;
  const maxSequence = documents
    .filter((doc) => String(doc.id || "").startsWith(prefix))
    .reduce((max, doc) => {
      const sequence = Number(String(doc.id || "").slice(prefix.length));
      return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
    }, 0);
  return `${prefix}${String(maxSequence + 1).padStart(3, "0")}`;
}

function orderDocumentSequence(orderId, typeCode, documentId) {
  const prefix = `${orderId}-${typeCode}-`;
  if (!String(documentId || "").startsWith(prefix)) {
    return 0;
  }
  const sequence = Number(String(documentId || "").slice(prefix.length));
  return Number.isFinite(sequence) ? sequence : 0;
}

function mergeOrderDocumentsForKeepOrder(keepOrderId, keepDocuments, sourceOrders) {
  const typeSequences = new Map();
  for (const doc of keepDocuments || []) {
    const typeCode = doc.typeCode || "ETC";
    typeSequences.set(typeCode, Math.max(typeSequences.get(typeCode) || 0, orderDocumentSequence(keepOrderId, typeCode, doc.id)));
  }

  const mergedDocuments = [...(keepDocuments || [])];
  const idMappings = [];
  for (const sourceOrder of sourceOrders || []) {
    for (const doc of orderDocumentsFor(sourceOrder)) {
      const typeCode = doc.typeCode || "ETC";
      const type = orderDocumentType(typeCode);
      const nextSequence = (typeSequences.get(typeCode) || 0) + 1;
      typeSequences.set(typeCode, nextSequence);
      const newDocumentId = `${keepOrderId}-${typeCode}-${String(nextSequence).padStart(3, "0")}`;
      mergedDocuments.push({
        ...doc,
        id: newDocumentId,
      });
      idMappings.push({
        sourceOrderId: sourceOrder.id || "",
        oldDocumentId: doc.id || "",
        newDocumentId,
        documentName: doc.name || "",
        typeCode,
        typeLabel: doc.typeLabel || type.label,
      });
    }
  }

  return {
    documents: mergedDocuments,
    idMappings,
  };
}

function emptyOrderDocumentDraft() {
  return {
    documentType: "PO",
    documentName: "",
    attachmentPath: "",
    attachmentName: "",
    fileId: "",
    notes: "",
  };
}

function readOrderDocumentDraft(container) {
  orderState.documentDraft = {
    documentType: container.querySelector('[name="document_type"]')?.value || "PO",
    documentName: container.querySelector('[name="document_name"]')?.value || "",
    attachmentPath: container.querySelector('[name="attachment_path"]')?.value || "",
    attachmentName: container.querySelector('[name="attachment_name"]')?.value || "",
    fileId: container.querySelector('[name="file_id"]')?.value || "",
    notes: container.querySelector('[name="document_notes"]')?.value || "",
  };
}

async function handlePickOrderDocumentFile(container) {
  const orderIdField = container.querySelector('[name="order_id"]');
  const attachmentPathField = container.querySelector('[name="attachment_path"]');
  const attachmentNameField = container.querySelector('[name="attachment_name"]');
  const fileIdField = container.querySelector('[name="file_id"]');
  const attachmentLabelField = container.querySelector('[name="attachment_label"]');
  const orderId = orderIdField?.value || "";
  const result = await window.erpClient.selectDocumentFile();
  if (result.canceled || !result.file) {
    return;
  }

  const uploadResult = await window.erpClient.uploadFile({
    domain: "order",
    entity_type: "order_document",
    entity_id: orderId,
    original_name: result.file.originalName || "document",
    mime_type: result.file.mimeType || "application/octet-stream",
    size_bytes: result.file.sizeBytes || 0,
    sha256: result.file.sha256 || "",
    content_base64: result.file.contentBase64 || "",
    upload_note: `orders/${orderId || "draft"}/${result.file.originalName || "document"}`,
  });

  if (attachmentPathField) {
    attachmentPathField.value = result.file.path || "";
  }
  if (attachmentNameField) {
    attachmentNameField.value = result.file.originalName || "";
  }
  if (fileIdField) {
    fileIdField.value = uploadResult.data?.id || "";
  }
  if (attachmentLabelField) {
    attachmentLabelField.value = result.file.originalName || result.file.path || "선택된 파일 없음";
  }
  readOrderDocumentDraft(container);
}

function handleAddOrderDocument(container) {
  readOrderDocumentDraft(container);
  const orderId = container.querySelector('[name="order_id"]')?.value || "";
  const typeCode = container.querySelector('[name="document_type"]')?.value || "ETC";
  const documentName = String(container.querySelector('[name="document_name"]')?.value || "").trim();
  const attachmentPath = container.querySelector('[name="attachment_path"]')?.value || "";
  const attachmentName = container.querySelector('[name="attachment_name"]')?.value || "";
  const fileId = container.querySelector('[name="file_id"]')?.value || "";
  const type = orderDocumentType(typeCode);
  const order = orderState.orders.find((item) => item.id === orderId);
  if (!order) {
    showAppMessage("주문 저장 후 문서를 등록하세요.");
    return;
  }
  if (!typeCode || !documentName) {
    showAppMessage("문서 종류와 문서명을 입력하세요.");
    return;
  }

  const documents = orderDocumentsFor(order);
  const nextDocument = {
    id: nextOrderDocumentId(orderId, typeCode, documents),
    typeCode,
    typeLabel: type.label,
    name: documentName,
    target: attachmentPath,
    fileName: attachmentName,
    fileId,
    notes: String(container.querySelector('[name="document_notes"]')?.value || ""),
    internalTab: attachmentPath ? "" : type.internalTab,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  orderState.orders = orderState.orders.map((item) =>
    item.id === orderId
      ? {
          ...item,
          documents: [...documents, nextDocument],
        }
      : item,
  );
  orderState.notice = `${nextDocument.id} 문서가 추가되었습니다.`;
  orderState.documentAddPanelOpen = false;
  orderState.documentDraft = emptyOrderDocumentDraft();
  renderOrderWorkspace();
}

function orderDocumentTargetAttrs(doc, orderId = "") {
  return `data-order-document-open="${escapeAttribute(doc.target || "")}" data-order-document-internal="${escapeAttribute(doc.internalTab || "")}" data-order-document-id="${escapeAttribute(doc.id || "")}" data-order-document-order="${escapeAttribute(orderId || "")}"`;
}

function renderOrderDocuments(order) {
  const documents = latestOrderDocuments(order);
  return `
    <section class="order-doc-panel">
      <div class="order-doc-title">문서 목록</div>
      <div class="order-document-grid">
        <div class="order-document-head">
          <span>문서종류</span>
          <span>문서명</span>
          <span>문서ID</span>
        </div>
        <div class="order-document-list">
          ${
            documents.length
              ? documents
                  .map(
                    (doc) =>
                      `<button type="button" class="order-document-row" ${orderDocumentTargetAttrs(doc, order.id || "")} data-order-document-detail="${escapeAttribute(doc.typeCode)}" title="더블 클릭해서 문서 열기 / 우클릭 상세"><span>${escapeTextarea(doc.typeLabel || orderDocumentType(doc.typeCode).label)}</span><span>${escapeTextarea(doc.name)}</span><span>${escapeTextarea(doc.id)}</span></button>`,
                  )
                  .join("")
              : '<div class="order-document-empty">등록된 문서가 없습니다.</div>'
          }
        </div>
        ${renderOrderDocumentCreatePanel(order)}
      </div>
    </section>
  `;
}

function renderOrderDocumentCreatePanel(order) {
  const draft = orderState.documentDraft || emptyOrderDocumentDraft();
  if (!orderState.documentAddPanelOpen) {
    return `
      <section class="order-document-form">
        <button type="button" class="secondary-button order-document-add-trigger" data-order-document-open-add>문서 추가</button>
      </section>
    `;
  }
  return `
    <section id="order-document-form" class="order-document-form order-document-add-panel">
      <input type="hidden" name="order_id" value="${escapeAttribute(order.id || "")}" />
      <input type="hidden" name="attachment_path" value="${escapeAttribute(draft.attachmentPath || "")}" />
      <input type="hidden" name="attachment_name" value="${escapeAttribute(draft.attachmentName || "")}" />
      <input type="hidden" name="file_id" value="${escapeAttribute(draft.fileId || "")}" />
      <div class="order-document-add-panel-head">
        <strong>문서 추가</strong>
        <button type="button" class="ghost-button" data-order-document-cancel-add>취소</button>
      </div>
      ${order.id ? "" : '<p class="order-document-add-notice">주문 저장 후 문서를 등록할 수 있습니다. 먼저 주문 정보를 저장하세요.</p>'}
      <div class="order-document-add-form">
        <label>문서 종류 <select class="text-field" name="document_type">${orderDocumentTypeOptions(draft.documentType || "PO")}</select></label>
        <label>문서명 <input class="text-field" name="document_name" value="${escapeAttribute(draft.documentName || "")}" placeholder="문서명" /></label>
        <label class="order-document-file-row">첨부파일
          <span class="order-document-file-field">
            <input class="text-field" name="attachment_label" value="${escapeAttribute(draft.attachmentName || "선택된 파일 없음")}" readonly />
            <button type="button" class="secondary-button" data-order-document-pick>파일 선택</button>
          </span>
        </label>
        <label class="order-document-note-row">비고 <textarea class="text-area" name="document_notes" placeholder="문서 설명 또는 내부 메모">${escapeTextarea(draft.notes || "")}</textarea></label>
      </div>
      <div class="order-document-panel-actions">
        <button type="button" class="primary-button" data-order-document-add ${order.id ? "" : "disabled"}>저장</button>
        <button type="button" class="secondary-button" data-order-document-cancel-add>취소</button>
      </div>
    </section>
  `;
}
