async function handleProjectClick(event) {
  const logoEmptyArea = event.target.closest("[data-project-template-logo-empty]");
  if (
    logoEmptyArea &&
    projectState.templateModal.open &&
    !event.target.closest("[data-project-template-logo]") &&
    !event.target.closest("[contenteditable=\"true\"]") &&
    !event.target.closest(".project-context-menu")
  ) {
    const selectedLogo = await selectProjectTemplateLogoFile();
    if (selectedLogo) {
      const draft = normalizeQuotationTemplate(projectState.templateModal.draft || blankQuotationTemplate());
      const useExtra = Boolean(draft.document.logoImageUrl || draft.document.logoText);
      const kind = useExtra ? "extra" : "primary";
      draft.document[templateLogoFieldName(kind, "ImageUrl")] = selectedLogo.dataUrl;
      draft.document[templateLogoFieldName(kind, "Text")] = selectedLogo.name;
      draft.document[templateLogoFieldName(kind, "Position")] = kind === "extra" ? "right" : "left";
      draft.document[templateLogoFieldName(kind, "Width")] = draft.document[templateLogoFieldName(kind, "Width")] || 150;
      draft.document[templateLogoFieldName(kind, "Height")] = draft.document[templateLogoFieldName(kind, "Height")] || 46;
      projectState.templateModal.draft = normalizeQuotationTemplate(draft);
      closeProjectTemplateContextMenu();
      renderProjectWorkspace();
    }
    return true;
  }

  const templateContextActionButton = event.target.closest("[data-project-template-context-action]");
  if (templateContextActionButton) {
    const action = templateContextActionButton.dataset.projectTemplateContextAction || "";
    const logoKind = templateContextActionButton.dataset.projectTemplateLogoKind || "extra";
    const draft = normalizeQuotationTemplate(projectState.templateModal.draft || blankQuotationTemplate());
    if (action === "logo-add" || action === "logo-change") {
      const kind = action === "logo-change" ? logoKind : draft.document.logoImageUrl ? "extra" : "primary";
      const selectedLogo = await selectProjectTemplateLogoFile();
      if (selectedLogo) {
        draft.document[templateLogoFieldName(kind, "ImageUrl")] = selectedLogo.dataUrl;
        draft.document[templateLogoFieldName(kind, "Text")] = selectedLogo.name;
        draft.document[templateLogoFieldName(kind, "Position")] = draft.document[templateLogoFieldName(kind, "Position")] || (kind === "extra" ? "right" : "left");
        draft.document[templateLogoFieldName(kind, "Width")] = draft.document[templateLogoFieldName(kind, "Width")] || 150;
        draft.document[templateLogoFieldName(kind, "Height")] = draft.document[templateLogoFieldName(kind, "Height")] || 46;
      }
    } else if (action === "logo-delete") {
      draft.document[templateLogoFieldName(logoKind, "ImageUrl")] = "";
      draft.document[templateLogoFieldName(logoKind, "Text")] = "";
    } else if (action === "logo-resize") {
      const currentWidth = draft.document[templateLogoFieldName(logoKind, "Width")] || 150;
      const currentHeight = draft.document[templateLogoFieldName(logoKind, "Height")] || 46;
      const value = await requestAppPrompt("로고 크기를 가로x세로(px) 형식으로 입력하세요.", `${currentWidth}x${currentHeight}`, "로고 크기");
      const match = String(value || "").match(/(\d+)\s*[xX, ]\s*(\d+)/);
      if (match) {
        draft.document[templateLogoFieldName(logoKind, "Width")] = Number(match[1]);
        draft.document[templateLogoFieldName(logoKind, "Height")] = Number(match[2]);
      }
    } else if (action.startsWith("logo-move-")) {
      draft.document[templateLogoFieldName(logoKind, "Position")] = action.replace("logo-move-", "");
    } else if (action === "header-toggle-tagline") {
      draft.document.tagline = draft.document.tagline ? "" : "고객의 마음으로 일하는 욕·해상용 엔진/부속 공급, 수리전문점";
    } else if (action === "header-reset") {
      const base = blankQuotationTemplate().document;
      draft.document.logoText = base.logoText;
      draft.document.logoImageUrl = "";
      draft.document.logoPosition = base.logoPosition;
      draft.document.extraLogoText = base.extraLogoText;
      draft.document.extraLogoImageUrl = "";
      draft.document.extraLogoPosition = base.extraLogoPosition;
      draft.document.tagline = base.tagline;
    } else if (action === "supplier-toggle") {
      draft.document.showSupplierBox = !draft.document.showSupplierBox;
    } else if (action === "supplier-reset") {
      const base = blankQuotationTemplate().document;
      draft.document.showSupplierBox = true;
      draft.document.supplierName = base.supplierName;
      draft.document.supplierRegistrationNo = base.supplierRegistrationNo;
      draft.document.supplierRepresentative = base.supplierRepresentative;
      draft.document.supplierAddress = base.supplierAddress;
      draft.document.supplierBusinessType = base.supplierBusinessType;
    }
    projectState.templateModal.draft = normalizeQuotationTemplate(draft);
    closeProjectTemplateContextMenu();
    renderProjectWorkspace();
    return true;
  }

  if (projectState.templateModal.contextMenu?.visible && !event.target.closest(".project-context-menu")) {
    closeProjectTemplateContextMenu();
    renderProjectWorkspace();
    return true;
  }

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
      draft.quotationNo = quotationNumber(selectedProject());
    }
    const exists = projectState.quotations.some((quotation) => quotation.id === draft.id);
    const savedQuotations = exists ? projectState.quotations.map((quotation) => (quotation.id === draft.id ? draft : quotation)) : [...projectState.quotations, draft];
    saveProjectQuotations(savedQuotations);
    projectState.quotationModal.draft = draft;
    projectState.quotationModal.dirty = false;
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

  const templatePresetButton = event.target.closest("[data-project-template-preset]");
  if (templatePresetButton) {
    const preset = templatePresetButton.dataset.projectTemplatePreset || "";
    projectState.templateModal.draft = preset === "invoice" ? invoiceQuotationTemplatePreset() : blankQuotationTemplate();
    projectState.templateModal.selectedTemplateId = "";
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
    projectState.filters = defaultProjectFilters();
    projectState.hasSearched = false;
    renderProjectWorkspace();
    return true;
  }

  return false;
}

function selectProjectTemplateLogoFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
    input.style.position = "fixed";
    input.style.left = "-9999px";
    input.style.top = "0";

    const cleanup = () => {
      input.remove();
      window.removeEventListener("focus", handleWindowFocus, true);
    };
    const finish = (value) => {
      cleanup();
      resolve(value);
    };
    const handleWindowFocus = () => {
      setTimeout(() => {
        if (!input.files?.length) {
          finish(null);
        }
      }, 300);
    };

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        finish(null);
        return;
      }
      if (!String(file.type || "").startsWith("image/")) {
        showAppMessage("이미지 파일을 선택하세요.");
        finish(null);
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        finish({ dataUrl: String(reader.result || ""), name: file.name.replace(/\.[^.]+$/, "") || "LOGO" });
      });
      reader.addEventListener("error", () => {
        showAppMessage("로고 이미지를 읽지 못했습니다.");
        finish(null);
      });
      reader.readAsDataURL(file);
    });

    document.body.appendChild(input);
    window.addEventListener("focus", handleWindowFocus, true);
    input.click();
  });
}

function handleProjectQuotationDescriptionKeydown(event) {
  if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
    return true;
  }
  const input = event.target.closest("[data-project-quotation-description-input]");
  const form = document.getElementById("project-quotation-form");
  if (!(input instanceof HTMLInputElement) || !(form instanceof HTMLFormElement)) {
    return true;
  }
  event.preventDefault();
  const match = input.name.match(/_(\d+)$/);
  const index = match ? Number(match[1]) : -1;
  if (index < 0) {
    return false;
  }
  const draft = readQuotationDraftFromForm(form);
  const insertIndex = Math.min(index + 1, draft.items.length);
  draft.items.splice(insertIndex, 0, emptyQuotationItem());
  projectState.quotationModal.draft = normalizeQuotationDraft(draft, selectedProject());
  projectState.quotationModal.selectedItemIndexes = [insertIndex];
  projectState.quotationModal.dirty = true;
  renderProjectWorkspace();
  setTimeout(() => {
    const nextInput = document.querySelector(`[name="item_description_${insertIndex}"]`);
    if (nextInput instanceof HTMLInputElement) {
      nextInput.focus();
      nextInput.select();
    }
  }, 0);
  return false;
}

function handleProjectQuotationGridKeydown(event) {
  const navigationKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (!navigationKeys.includes(event.key) || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey || event.isComposing) {
    return true;
  }
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.matches("input, select, textarea")) {
    return true;
  }
  const row = target.closest("[data-quotation-item-row]");
  const grid = target.closest(".project-quotation-items");
  if (!row || !grid) {
    return true;
  }
  const rows = Array.from(grid.querySelectorAll("[data-quotation-item-row]"));
  const rowIndex = rows.indexOf(row);
  const cells = Array.from(row.querySelectorAll("select.text-field, input.text-field, textarea.text-field")).filter((cell) => !cell.disabled);
  const columnIndex = cells.indexOf(target);
  if (rowIndex < 0 || columnIndex < 0) {
    return true;
  }
  const nextRowIndex = event.key === "ArrowUp" ? rowIndex - 1 : event.key === "ArrowDown" ? rowIndex + 1 : rowIndex;
  const nextColumnIndex = event.key === "ArrowLeft" ? columnIndex - 1 : event.key === "ArrowRight" ? columnIndex + 1 : columnIndex;
  const nextRow = rows[nextRowIndex];
  if (!nextRow) {
    return true;
  }
  const nextCells = Array.from(nextRow.querySelectorAll("select.text-field, input.text-field, textarea.text-field")).filter((cell) => !cell.disabled);
  const nextCell = nextCells[Math.max(0, Math.min(nextColumnIndex, nextCells.length - 1))];
  if (!nextCell) {
    return true;
  }
  event.preventDefault();
  nextCell.focus();
  nextCell.select?.();
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
  const templateTarget = event.target.closest("[data-project-template-context-target]");
  if (templateTarget && projectState.templateModal.open) {
    event.preventDefault();
    const target = templateTarget.dataset.projectTemplateContextTarget || "header";
    openProjectTemplateContextMenu(event.clientX, event.clientY, target === "supplier" ? "supplier" : "header");
    renderProjectWorkspace();
    return true;
  }

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
    projectState.hasSearched = true;
    projectState.selectedProjectId = filteredProjects()[0]?.id || "";
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
  const orientationToggle = event.target.closest("[data-project-template-orientation]");
  if (orientationToggle) {
    const form = document.getElementById("project-template-form");
    const draft = form instanceof HTMLFormElement ? readQuotationTemplateDraftFromForm(form) : normalizeQuotationTemplate(projectState.templateModal.draft || blankQuotationTemplate());
    draft.page.orientation = String(orientationToggle.value || "landscape");
    projectState.templateModal.draft = normalizeQuotationTemplate(draft);
    closeProjectTemplateContextMenu();
    renderProjectWorkspace();
    return true;
  }

  const templatePicker = event.target.closest("[data-project-template-picker]");
  if (templatePicker) {
    const templateId = templatePicker.value || "";
    const template = templateId === "__new__" ? null : loadQuotationTemplates().find((item) => item.id === templateId);
    projectState.templateModal.draft = template ? structuredClone(template) : blankQuotationTemplate();
    projectState.templateModal.selectedTemplateId = template?.id || "";
    renderProjectWorkspace();
    return true;
  }

  const templateReference = event.target.closest("[data-project-template-reference]");
  if (templateReference) {
    const referenceId = templateReference.value || "";
    const form = document.getElementById("project-template-form");
    const currentName =
      form instanceof HTMLFormElement
        ? String(new FormData(form).get("template_name") || "").trim()
        : String(projectState.templateModal.draft?.name || "").trim();
    const source =
      referenceId === "__invoice__"
        ? invoiceQuotationTemplatePreset()
        : loadQuotationTemplates().find((item) => item.id === referenceId);
    const draft = source ? structuredClone(source) : blankQuotationTemplate();
    draft.id = "";
    draft.name = currentName || "";
    projectState.templateModal.draft = normalizeQuotationTemplate(draft);
    projectState.templateModal.selectedTemplateId = "";
    renderProjectWorkspace();
    return true;
  }

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
    if (form instanceof HTMLFormElement) {
      const draft = readQuotationDraftFromForm(form);
      if (template) {
        draft.templateId = template.id;
        draft.note = template.defaultText || draft.note;
        draft.items = structuredClone(template.items?.length ? template.items : draft.items?.length ? draft.items : [emptyQuotationItem()]);
      } else {
        draft.templateId = "";
      }
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
  const inlineTemplateField = event.target.closest("[data-project-template-inline-field]");
  if (inlineTemplateField) {
    const field = inlineTemplateField.dataset.projectTemplateInlineField || "";
    const value = String(inlineTemplateField.textContent || "").trim();
    const draft = normalizeQuotationTemplate(projectState.templateModal.draft || blankQuotationTemplate());
    const templateDocument = { ...draft.document };
    if (field === "documentTitle") {
      templateDocument.title = value;
    } else if (field === "logoText") {
      templateDocument.logoText = value;
    } else if (field === "extraLogoText") {
      templateDocument.extraLogoText = value;
    } else if (field === "tagline") {
      templateDocument.tagline = value;
    } else if (field === "supplierRegistrationNo") {
      templateDocument.supplierRegistrationNo = value;
    } else if (field === "supplierName") {
      templateDocument.supplierName = value;
    } else if (field === "supplierRepresentative") {
      templateDocument.supplierRepresentative = value;
    } else if (field === "supplierAddress") {
      templateDocument.supplierAddress = value;
    } else if (field === "supplierBusinessType") {
      templateDocument.supplierBusinessType = value;
    }
    const formFieldNameByTemplateField = {
      logoText: "logo_text",
      extraLogoText: "extra_logo_text",
      tagline: "tagline",
      supplierRegistrationNo: "supplier_registration_no",
      supplierName: "supplier_name",
      supplierRepresentative: "supplier_representative",
      supplierAddress: "supplier_address",
      supplierBusinessType: "supplier_business_type",
    };
    const form = document.getElementById("project-template-form");
    const formFieldName = formFieldNameByTemplateField[field];
    if (form instanceof HTMLFormElement && formFieldName && form.elements[formFieldName]) {
      form.elements[formFieldName].value = value;
    }
    projectState.templateModal.draft = normalizeQuotationTemplate({ ...draft, document: templateDocument });
    return true;
  }

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
      const category = String(form?.querySelector(`[name="item_category_${index}"]`)?.value || "");
      if (!isQuotationQuantityInputItem({ category })) {
        return true;
      }
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

  const quotationFormResizer = event.target.closest("[data-project-quotation-form-resizer]");
  if (quotationFormResizer) {
    event.preventDefault();
    event.stopPropagation();
    const layout = quotationFormResizer.closest(".project-quotation-layout");
    if (!(layout instanceof HTMLElement)) {
      return true;
    }
    const rect = layout.getBoundingClientRect();
    const currentWidth = loadProjectQuotationFormWidth() || layout.querySelector(".project-quotation-form-grid")?.getBoundingClientRect().width || rect.width * 0.17;
    const startX = event.clientX;
    const maxWidth = Math.max(220, rect.width - 420);

    function resizeQuotationForm(moveEvent) {
      const nextWidth = Math.min(maxWidth, Math.max(132, currentWidth + moveEvent.clientX - startX));
      saveProjectQuotationFormWidth(nextWidth);
      layout.style.gridTemplateColumns = `${nextWidth}px 8px minmax(0, 1fr)`;
    }

    function stopResizeQuotationForm() {
      window.removeEventListener("mousemove", resizeQuotationForm);
      window.removeEventListener("mouseup", stopResizeQuotationForm);
    }

    window.addEventListener("mousemove", resizeQuotationForm);
    window.addEventListener("mouseup", stopResizeQuotationForm);
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
