async function handleInvoiceClick(event) {
  const invoiceSelectButton = event.target.closest("[data-invoice-select]");
  if (invoiceSelectButton) {
    invoiceState.selectedInvoiceId = invoiceSelectButton.dataset.invoiceSelect || "";
    invoiceState.notice = "청구 상세를 불러왔습니다.";
    renderInvoiceWorkspace();
    return true;
  }

  const invoiceDetailTab = event.target.closest("[data-invoice-detail-tab]");
  if (invoiceDetailTab) {
    invoiceState.activeDetailTab = invoiceDetailTab.dataset.invoiceDetailTab || "info";
    renderInvoiceWorkspace();
    return true;
  }

  const invoiceFilterReset = event.target.closest("[data-invoice-filter-reset]");
  if (invoiceFilterReset) {
    invoiceState.filters = { startDate: "", endDate: "", status: "", customer: "", query: "" };
    invoiceState.notice = "청구 조회 조건을 초기화했습니다.";
    renderInvoiceWorkspace();
    return true;
  }

  const invoiceDocumentPick = event.target.closest("[data-invoice-document-pick]");
  if (invoiceDocumentPick) {
    const container = invoiceDocumentPick.closest("#invoice-document-form");
    if (container) {
      const invoiceId = container.querySelector('[name="invoice_id"]')?.value || "";
      const result = await window.erpClient.selectDocumentFile();
      if (!result.canceled && result.file) {
        const uploadResult = await window.erpClient.uploadFile({
          domain: "invoice",
          entity_type: "invoice_document",
          entity_id: invoiceId,
          original_name: result.file.originalName || "document",
          mime_type: result.file.mimeType || "application/octet-stream",
          size_bytes: result.file.sizeBytes || 0,
          sha256: result.file.sha256 || "",
          content_base64: result.file.contentBase64 || "",
          upload_note: `invoices/${invoiceId || "draft"}/${result.file.originalName || "document"}`,
        });
        container.querySelector('[name="attachment_path"]').value = result.file.path || "";
        container.querySelector('[name="attachment_name"]').value = result.file.originalName || "";
        container.querySelector('[name="file_id"]').value = uploadResult.data?.id || "";
        container.querySelector('[name="attachment_label"]').value = result.file.originalName || result.file.path || "선택된 파일 없음";
      }
    }
    return true;
  }

  const invoiceDocumentAdd = event.target.closest("[data-invoice-document-add]");
  if (invoiceDocumentAdd) {
    const container = invoiceDocumentAdd.closest("#invoice-document-form");
    if (container) {
      const invoiceId = container.querySelector('[name="invoice_id"]')?.value || "";
      const invoice = invoiceState.invoices.find((item) => item.id === invoiceId);
      const typeCode = container.querySelector('[name="document_type"]')?.value || "ETC";
      const documentName = String(container.querySelector('[name="document_name"]')?.value || "").trim();
      if (!invoice || !typeCode || !documentName) {
        await showAppMessage("문서 종류와 문서명을 입력하세요.");
        return true;
      }
      const type = invoiceDocumentType(typeCode);
      const documents = invoice.documents || [];
      const nextDocument = {
        id: nextInvoiceDocumentId(invoice.id, typeCode, documents),
        typeCode,
        typeLabel: type.label,
        name: documentName,
        target: container.querySelector('[name="attachment_path"]')?.value || "",
        fileName: container.querySelector('[name="attachment_name"]')?.value || "",
        fileId: container.querySelector('[name="file_id"]')?.value || "",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      invoiceState.invoices = invoiceState.invoices.map((item) => (item.id === invoice.id ? { ...item, documents: [...documents, nextDocument] } : item));
      invoiceState.notice = `${nextDocument.id} 문서가 추가되었습니다.`;
      renderInvoiceWorkspace();
    }
    return true;
  }

  return false;
}

async function handleInvoiceFormSubmit(form) {
  if (form.id === "invoice-filter-form") {
    const data = Object.fromEntries(new FormData(form).entries());
    invoiceState.filters = {
      startDate: String(data.start_date || ""),
      endDate: String(data.end_date || ""),
      status: String(data.status || ""),
      customer: String(data.customer || ""),
      query: String(data.query || ""),
    };
    invoiceState.notice = "청구 목록을 조회했습니다.";
    renderInvoiceWorkspace();
    return true;
  }

  if (form.id === "invoice-payment-form") {
    const data = Object.fromEntries(new FormData(form).entries());
    const invoiceId = String(data.invoice_id || "");
    const amount = Number(data.amount || 0);
    if (!invoiceId || amount <= 0) {
      await showAppMessage("입금액을 입력하세요.");
      return true;
    }
    invoiceState.invoices = invoiceState.invoices.map((invoice) => {
      if (invoice.id !== invoiceId) {
        return invoice;
      }
      const nextPayments = [
        ...(invoice.payments || []),
        {
          id: `PAY-${String((invoice.payments || []).length + 1).padStart(3, "0")}`,
          paidAt: String(data.paid_at || new Date().toISOString().slice(0, 10)),
          amount,
          method: String(data.method || "계좌이체"),
          payer: String(data.payer || ""),
          handler: "시연 사용자",
          note: String(data.note || ""),
        },
      ];
      const nextInvoice = { ...invoice, payments: nextPayments };
      return { ...nextInvoice, status: calculateInvoicePaymentStatus(nextInvoice) };
    });
    invoiceState.notice = "수금 내역을 등록했습니다.";
    renderInvoiceWorkspace();
    return true;
  }

  if (form.id === "invoice-memo-form") {
    const data = Object.fromEntries(new FormData(form).entries());
    const invoiceId = String(data.invoice_id || "");
    invoiceState.invoices = invoiceState.invoices.map((invoice) => (invoice.id === invoiceId ? { ...invoice, memo: String(data.memo || "") } : invoice));
    invoiceState.notice = "청구 메모를 저장했습니다.";
    renderInvoiceWorkspace();
    return true;
  }

  return false;
}
