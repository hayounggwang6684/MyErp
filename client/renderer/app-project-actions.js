async function handleProjectClick(event) {
  const quotationContextActionButton = event.target.closest("[data-project-quotation-context-action]");
  if (quotationContextActionButton) {
    const action = quotationContextActionButton.dataset.projectQuotationContextAction || "";
    if (action === "copy") {
      copyProjectQuotationItems(projectState.quotationModal.selectedItemIndexes || []);
    } else if (action === "cut") {
      copyProjectQuotationItems(projectState.quotationModal.selectedItemIndexes || [], true);
    } else if (action === "paste") {
      if (!pasteProjectQuotationItems()) {
        closeProjectQuotationContextMenu();
        renderProjectWorkspace();
        await showAppMessage("붙여넣을 항목이 없습니다.");
        return true;
      }
    } else if (action === "delete") {
      deleteProjectQuotationItems(projectState.quotationModal.selectedItemIndexes || []);
    }
    closeProjectQuotationContextMenu();
    renderProjectWorkspace();
    return true;
  }

  const quotationItemRow = event.target.closest("[data-project-quotation-item-select]");
  if (projectState.quotationModal.contextMenu?.visible && !event.target.closest(".project-context-menu")) {
    closeProjectQuotationContextMenu();
    if (!quotationItemRow) {
      renderProjectWorkspace();
      return true;
    }
  }

  if (quotationItemRow) {
    const index = Number(quotationItemRow.dataset.projectQuotationItemSelect);
    const additive = Boolean(event.ctrlKey || event.metaKey);
    const interactiveField = event.target.closest("input, select, textarea");
    if (interactiveField && !additive) {
      projectState.quotationModal.selectedItemIndexes = [index];
      return false;
    }
    selectProjectQuotationItem(index, additive);
    renderProjectWorkspace();
    return !interactiveField;
  }

  const quotationNewButton = event.target.closest("[data-project-quotation-new]");
  if (quotationNewButton) {
    openProjectQuotationModal("create");
    renderProjectWorkspace();
    return true;
  }

  const quotationTemplateButton = event.target.closest("[data-project-quotation-template]");
  if (quotationTemplateButton) {
    openProjectTemplateModal();
    renderProjectWorkspace();
    return true;
  }

  const quotationItemAddButton = event.target.closest("[data-project-quotation-item-add]");
  if (quotationItemAddButton) {
    const form = document.getElementById("project-quotation-form");
    if (form instanceof HTMLFormElement) {
      projectState.quotationModal.draft = readQuotationDraftFromForm(form);
      projectState.quotationModal.draft.items.push(emptyQuotationItem());
      projectState.quotationModal.selectedItemIndexes = [projectState.quotationModal.draft.items.length - 1];
      projectState.quotationModal.dirty = true;
      closeProjectQuotationContextMenu();
      renderProjectWorkspace();
    }
    return true;
  }

  const quotationSaveButton = event.target.closest("[data-project-quotation-save]");
  if (quotationSaveButton) {
    const form = document.getElementById("project-quotation-form");
    if (!(form instanceof HTMLFormElement)) {
      return true;
    }
    const draft = readQuotationDraftFromForm(form);
    if (!draft.quotationNo.trim()) {
      await showAppMessage("견적번호를 입력하세요.");
      return true;
    }
    const exists = projectState.quotations.some((quotation) => quotation.id === draft.id);
    saveProjectQuotations(exists ? projectState.quotations.map((quotation) => (quotation.id === draft.id ? draft : quotation)) : [...projectState.quotations, draft]);
    closeProjectQuotationModal();
    renderProjectWorkspace();
    await showAppMessage("견적서를 저장했습니다.");
    return true;
  }

  const quotationPrintButton = event.target.closest("[data-project-quotation-print]");
  if (quotationPrintButton) {
    const form = document.getElementById("project-quotation-form");
    if (!(form instanceof HTMLFormElement)) {
      return true;
    }
    try {
      const draft = readQuotationDraftFromForm(form);
      await window.erpClient.printHtml({ html: quotationPrintHtml(draft) });
    } catch (error) {
      await showAppMessage(error.message || "견적서를 인쇄하지 못했습니다.");
    }
    return true;
  }

  const quotationPreviewButton = event.target.closest("[data-project-quotation-preview]");
  if (quotationPreviewButton) {
    const form = document.getElementById("project-quotation-form");
    if (!(form instanceof HTMLFormElement)) {
      return true;
    }
    const draft = readQuotationDraftFromForm(form);
    openProjectQuotationPreview(quotationPrintHtml(draft));
    renderProjectWorkspace();
    return true;
  }

  const quotationPreviewCloseButton = event.target.closest("[data-project-quotation-preview-close]");
  if (quotationPreviewCloseButton) {
    closeProjectQuotationPreview();
    renderProjectWorkspace();
    return true;
  }

  const quotationCloseButton = event.target.closest("[data-project-quotation-close]");
  if (quotationCloseButton) {
    if (projectState.quotationModal.dirty) {
      const confirmed = await requestAppConfirm("변경사항을 저장하지 않고 닫을까요?");
      if (!confirmed) {
        return true;
      }
    }
    closeProjectQuotationModal();
    renderProjectWorkspace();
    return true;
  }

  const templateNewButton = event.target.closest("[data-project-template-new]");
  if (templateNewButton) {
    projectState.templateModal.draft = blankQuotationTemplate();
    renderProjectWorkspace();
    return true;
  }

  const templateSelectButton = event.target.closest("[data-project-template-select]");
  if (templateSelectButton) {
    const template = loadQuotationTemplates().find((item) => item.id === templateSelectButton.dataset.projectTemplateSelect);
    projectState.templateModal.draft = template ? structuredClone(template) : blankQuotationTemplate();
    projectState.templateModal.selectedTemplateId = template?.id || "";
    renderProjectWorkspace();
    return true;
  }

  const templateSaveButton = event.target.closest("[data-project-template-save]");
  if (templateSaveButton) {
    const form = document.getElementById("project-template-form");
    if (!(form instanceof HTMLFormElement)) {
      return true;
    }
    const draft = readQuotationTemplateDraftFromForm(form, { requireName: true });
    if (!draft) {
      await showAppMessage("템플릿명을 입력하세요.");
      return true;
    }
    const saved = saveQuotationTemplate(draft);
    projectState.templateModal.draft = saved;
    projectState.templateModal.selectedTemplateId = saved.id;
    renderProjectWorkspace();
    await showAppMessage("템플릿을 저장했습니다.");
    return true;
  }

  const templateCloseButton = event.target.closest("[data-project-template-close]");
  if (templateCloseButton) {
    closeProjectTemplateModal();
    renderProjectWorkspace();
    return true;
  }

  const projectSelectButton = event.target.closest("[data-project-select]");
  if (projectSelectButton) {
    projectState.selectedProjectId = projectSelectButton.dataset.projectSelect || "";
    projectState.activeDetailTab = "overview";
    renderProjectWorkspace();
    return true;
  }

  const projectViewButton = event.target.closest("[data-project-view-mode]");
  if (projectViewButton) {
    projectState.viewMode = projectViewButton.dataset.projectViewMode || "project";
    renderProjectWorkspace();
    return true;
  }

  const projectDetailTab = event.target.closest("[data-project-detail-tab]");
  if (projectDetailTab) {
    projectState.activeDetailTab = projectDetailTab.dataset.projectDetailTab || "overview";
    renderProjectWorkspace();
    return true;
  }

  const projectFilterReset = event.target.closest("[data-project-filter-reset]");
  if (projectFilterReset) {
    projectState.filters = { startDate: "", endDate: "", status: "", manager: "", query: "" };
    renderProjectWorkspace();
    return true;
  }

  return false;
}

async function handleProjectDoubleClick(event) {
  const quotationRow = event.target.closest("[data-project-quotation-open]");
  if (!quotationRow) {
    return false;
  }
  const quotation = findProjectQuotation(quotationRow.dataset.projectQuotationOpen || "");
  if (quotation) {
    openProjectQuotationModal("edit", quotation);
    renderProjectWorkspace();
  }
  return true;
}

function handleProjectContextMenu(event) {
  const quotationItemRow = event.target.closest("[data-project-quotation-item-select]");
  if (!quotationItemRow) {
    return false;
  }
  event.preventDefault();
  const index = Number(quotationItemRow.dataset.projectQuotationItemSelect);
  const currentSelection = normalizeProjectQuotationSelection(
    projectState.quotationModal.selectedItemIndexes,
    projectState.quotationModal.draft?.items?.length || Number.MAX_SAFE_INTEGER,
  );
  if (!currentSelection.includes(index)) {
    selectProjectQuotationItem(index, Boolean(event.ctrlKey || event.metaKey));
  }
  openProjectQuotationContextMenu(event.clientX, event.clientY);
  renderProjectWorkspace();
  return true;
}

async function handleProjectFormSubmit(form) {
  if (form.id === "project-quotation-form" || form.id === "project-template-form") {
    return true;
  }

  if (form.id === "project-filter-form") {
    const data = Object.fromEntries(new FormData(form).entries());
    projectState.filters = {
      startDate: String(data.start_date || ""),
      endDate: String(data.end_date || ""),
      status: String(data.status || ""),
      manager: "",
      query: String(data.query || ""),
    };
    renderProjectWorkspace();
    return true;
  }

  if (form.id === "project-progress-form") {
    const data = Object.fromEntries(new FormData(form).entries());
    const projectId = String(data.project_id || "");
    const content = String(data.content || "").trim();
    if (!content) {
      await showAppMessage("진행 내용을 입력하세요.");
      return true;
    }
    projectState.projects = projectState.projects.map((project) => {
      if (project.id !== projectId) {
        return project;
      }
      const nextStatus = String(data.status || project.status);
      return {
        ...project,
        status: nextStatus,
        progressLogs: [
          {
            date: String(data.date || new Date().toISOString().slice(0, 10)),
            status: nextStatus,
            manager: project.manager,
            content,
            nextAction: String(data.next_action || ""),
            attachment: String(data.attachment || ""),
          },
          ...project.progressLogs,
        ],
      };
    });
    renderProjectWorkspace();
    return true;
  }

  if (form.id === "project-external-form") {
    const data = Object.fromEntries(new FormData(form).entries());
    const projectId = String(data.project_id || "");
    const vendor = String(data.vendor || "").trim();
    const content = String(data.content || "").trim();
    if (!vendor || !content) {
      await showAppMessage("의뢰처와 의뢰 내용을 입력하세요.");
      return true;
    }
    projectState.projects = projectState.projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            status: String(data.status || "") === "회신 대기" ? "외부 의뢰 대기" : project.status,
            externalRequests: [
              ...project.externalRequests,
              {
                vendor,
                content,
                requestDate: String(data.request_date || new Date().toISOString().slice(0, 10)),
                expectedReplyDate: String(data.expected_reply_date || ""),
                replyDate: "",
                status: String(data.status || "의뢰 중"),
                attachment: "",
                note: String(data.note || ""),
              },
            ],
          }
        : project,
    );
    renderProjectWorkspace();
    return true;
  }

  if (form.id === "project-completion-form") {
    const data = Object.fromEntries(new FormData(form).entries());
    const projectId = String(data.project_id || "");
    const completionStatus = String(data.status || "작성 전");
    projectState.projects = projectState.projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            status: completionStatus === "보관 완료" ? "준공" : project.status,
            completion: {
              specCreated: data.spec_created === "on",
              sealed: data.sealed === "on",
              receivedDate: String(data.received_date || ""),
              documentId: String(data.document_id || ""),
              storageLocation: String(data.storage_location || ""),
              completedAt: String(data.completed_at || ""),
              note: String(data.note || ""),
              status: completionStatus,
            },
          }
        : project,
    );
    renderProjectWorkspace();
    return true;
  }

  return false;
}

function handleProjectChange(event) {
  if (event.target.closest("#project-template-form")) {
    const form = document.getElementById("project-template-form");
    if (form instanceof HTMLFormElement) {
      projectState.templateModal.draft = readQuotationTemplateDraftFromForm(form);
      renderProjectWorkspace();
    }
    return true;
  }

  const templateSelect = event.target.closest("[data-project-template-apply]");
  if (templateSelect) {
    const form = document.getElementById("project-quotation-form");
    const template = loadQuotationTemplates().find((item) => item.id === templateSelect.value);
    if (form instanceof HTMLFormElement && template) {
      const draft = readQuotationDraftFromForm(form);
      draft.templateId = template.id;
      draft.note = template.defaultText || draft.note;
      draft.items = structuredClone(template.items?.length ? template.items : [emptyQuotationItem()]);
      projectState.quotationModal.draft = draft;
      projectState.quotationModal.dirty = true;
      renderProjectWorkspace();
    }
    return true;
  }

  if (event.target.closest("#project-quotation-form")) {
    const form = document.getElementById("project-quotation-form");
    if (form instanceof HTMLFormElement) {
      projectState.quotationModal.draft = readQuotationDraftFromForm(form);
      projectState.quotationModal.dirty = true;
    }
    return true;
  }

  const checklistCheck = event.target.closest("[data-project-checklist-check]");
  const checklistStatus = event.target.closest("[data-project-checklist-status]");
  const checklistDate = event.target.closest("[data-project-checklist-date]");
  const checklistNote = event.target.closest("[data-project-checklist-note]");
  if (checklistCheck || checklistStatus || checklistDate || checklistNote) {
    const itemId =
      checklistCheck?.dataset.projectChecklistCheck ||
      checklistStatus?.dataset.projectChecklistStatus ||
      checklistDate?.dataset.projectChecklistDate ||
      checklistNote?.dataset.projectChecklistNote ||
      "";
    projectState.projects = projectState.projects.map((project) =>
      project.id === projectState.selectedProjectId
        ? {
            ...project,
            checklist: project.checklist.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    checked: checklistCheck ? Boolean(checklistCheck.checked) : item.checked,
                    status: checklistStatus ? checklistStatus.value : item.status,
                    completedAt: checklistDate ? checklistDate.value : item.completedAt,
                    note: checklistNote ? checklistNote.value : item.note,
                  }
                : item,
            ),
          }
        : project,
    );
    return true;
  }

  const reportTarget = event.target.closest("[data-project-report-required], [data-project-report-status], [data-project-report-writer], [data-project-report-date], [data-project-report-document], [data-project-report-file], [data-project-report-note]");
  if (reportTarget) {
    const index = Number(
      reportTarget.dataset.projectReportRequired ??
        reportTarget.dataset.projectReportStatus ??
        reportTarget.dataset.projectReportWriter ??
        reportTarget.dataset.projectReportDate ??
        reportTarget.dataset.projectReportDocument ??
        reportTarget.dataset.projectReportFile ??
        reportTarget.dataset.projectReportNote,
    );
    projectState.projects = projectState.projects.map((project) =>
      project.id === projectState.selectedProjectId
        ? {
            ...project,
            status: reportTarget.dataset.projectReportStatus && ["작성 중", "검토 중"].includes(reportTarget.value) ? "레포트 작성 중" : project.status,
            reports: project.reports.map((report, reportIndex) =>
              reportIndex === index
                ? {
                    ...report,
                    required: reportTarget.dataset.projectReportRequired !== undefined ? Boolean(reportTarget.checked) : report.required,
                    status: reportTarget.dataset.projectReportStatus !== undefined ? reportTarget.value : report.status,
                    writer: reportTarget.dataset.projectReportWriter !== undefined ? reportTarget.value : report.writer,
                    date: reportTarget.dataset.projectReportDate !== undefined ? reportTarget.value : report.date,
                    documentId: reportTarget.dataset.projectReportDocument !== undefined ? reportTarget.value : report.documentId,
                    file: reportTarget.dataset.projectReportFile !== undefined ? reportTarget.value : report.file,
                    note: reportTarget.dataset.projectReportNote !== undefined ? reportTarget.value : report.note,
                  }
                : report,
            ),
          }
        : project,
    );
    return true;
  }

  return false;
}

function handleProjectInput(event) {
  if (event.target.closest("#project-template-form")) {
    const form = document.getElementById("project-template-form");
    if (form instanceof HTMLFormElement) {
      projectState.templateModal.draft = readQuotationTemplateDraftFromForm(form);
      renderProjectWorkspace();
    }
    return true;
  }

  if (!event.target.closest("#project-quotation-form")) {
    return false;
  }
  const quantityInput = event.target.closest("[name^=\"item_quantity_\"]");
  const unitPriceInput = event.target.closest("[name^=\"item_unit_price_\"]");
  const amountInputTarget = event.target.closest("[name^=\"item_amount_\"]");
  if (quantityInput || unitPriceInput || amountInputTarget) {
    const source = quantityInput || unitPriceInput || amountInputTarget;
    const match = source.name.match(/_(\d+)$/);
    const index = match ? Number(match[1]) : -1;
    if (index >= 0 && !amountInputTarget) {
      const form = document.getElementById("project-quotation-form");
      const quantity = Number(form?.querySelector(`[name="item_quantity_${index}"]`)?.value || 0);
      const unitPrice = Number(form?.querySelector(`[name="item_unit_price_${index}"]`)?.value || 0);
      const amountInput = form?.querySelector(`[name="item_amount_${index}"]`);
      if (amountInput instanceof HTMLInputElement) {
        amountInput.value = String(quantity * unitPrice);
      }
    }
  }
  const form = document.getElementById("project-quotation-form");
  if (form instanceof HTMLFormElement) {
    const draft = readQuotationDraftFromForm(form);
    projectState.quotationModal.draft = draft;
    const supplyInput = form.querySelector('[name="supply_amount"]');
    const vatInput = form.querySelector('[name="vat_amount"]');
    const negotiatedInput = form.querySelector('[name="negotiated_amount"]');
    if (supplyInput instanceof HTMLInputElement) supplyInput.value = String(draft.supplyAmount || 0);
    if (vatInput instanceof HTMLInputElement) vatInput.value = String(draft.vatAmount || 0);
    if (negotiatedInput instanceof HTMLInputElement) negotiatedInput.value = String(draft.negotiatedAmount || 0);
    projectState.quotationModal.dirty = true;
  }
  return true;
}

function handleProjectMouseDown(event) {
  const columnResizer = event.target.closest("[data-project-column-resizer]");
  if (columnResizer) {
    event.preventDefault();
    event.stopPropagation();
    const field = columnResizer.dataset.projectColumnResizer || "";
    const column = projectListColumns().find((item) => item.field === field);
    if (!column) {
      return true;
    }
    const widths = loadProjectColumnWidths();
    const startX = event.clientX;
    const startWidth = projectColumnWidth(column, widths);

    function resizeColumn(moveEvent) {
      const nextWidths = {
        ...widths,
        [field]: Math.max(64, startWidth + moveEvent.clientX - startX),
      };
      saveProjectColumnWidths(nextWidths);
      const nextTemplate = projectListColumnTemplate(projectListColumns(), nextWidths);
      dashboardMainPane.querySelectorAll(".project-list-head, .project-list-row").forEach((row) => {
        row.style.gridTemplateColumns = nextTemplate;
      });
    }

    function stopResizeColumn() {
      window.removeEventListener("mousemove", resizeColumn);
      window.removeEventListener("mouseup", stopResizeColumn);
    }

    window.addEventListener("mousemove", resizeColumn);
    window.addEventListener("mouseup", stopResizeColumn);
    return true;
  }

  const paneResizer = event.target.closest("[data-project-pane-resizer]");
  if (!paneResizer) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  const body = paneResizer.closest(".project-layout");
  if (!(body instanceof HTMLElement)) {
    return true;
  }
  const rect = body.getBoundingClientRect();
  const currentWidth = loadProjectListPaneWidth() || body.querySelector(".project-sidebar")?.getBoundingClientRect().width || rect.width * 0.64;

  function resizePane(moveEvent) {
    const maxWidth = Math.max(520, rect.width - 300);
    const nextWidth = Math.min(maxWidth, Math.max(520, currentWidth + moveEvent.clientX - rect.left - currentWidth));
    saveProjectListPaneWidth(nextWidth);
    body.style.gridTemplateColumns = `${nextWidth}px 8px minmax(300px, 1fr)`;
  }

  function stopResizePane() {
    window.removeEventListener("mousemove", resizePane);
    window.removeEventListener("mouseup", stopResizePane);
  }

  window.addEventListener("mousemove", resizePane);
  window.addEventListener("mouseup", stopResizePane);
  return true;
}

function handleProjectDragStart(event) {
  if (event.target.closest("[data-project-column-resizer]")) {
    return false;
  }
  const column = event.target.closest("[data-project-column-field]");
  if (!column) {
    return false;
  }
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", `project:${column.dataset.projectColumnField || ""}`);
  column.classList.add("dragging");
  return true;
}

function handleProjectDragOver(event) {
  const column = event.target.closest("[data-project-column-field]");
  if (!column) {
    return false;
  }
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  return true;
}

function handleProjectDrop(event) {
  const column = event.target.closest("[data-project-column-field]");
  if (!column) {
    return false;
  }
  const data = event.dataTransfer?.getData("text/plain") || "";
  if (!data.startsWith("project:")) {
    return false;
  }
  event.preventDefault();
  const sourceField = data.slice("project:".length);
  const targetField = column.dataset.projectColumnField || "";
  if (moveProjectColumn(sourceField, targetField)) {
    renderProjectWorkspace();
  }
  return true;
}

function handleProjectDragEnd() {
  dashboardMainPane.querySelectorAll("[data-project-column-field].dragging").forEach((column) => column.classList.remove("dragging"));
}
