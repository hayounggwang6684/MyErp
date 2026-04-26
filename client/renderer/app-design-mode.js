const DESIGN_MODE_WORKSPACE = "";
const DESIGN_LAYOUT_STORAGE_PREFIX = "erp-design-layout";
const DESIGN_LAYOUT_SCHEMA_VERSION = 3;

function designLayoutStorageKey(workspaceKey) {
  return `${DESIGN_LAYOUT_STORAGE_PREFIX}:${workspaceKey}`;
}

function isDesignModeEnabled(workspaceKey) {
  return DESIGN_MODE_WORKSPACE === workspaceKey;
}

function loadDesignLayout(workspaceKey) {
  try {
    const layout = JSON.parse(localStorage.getItem(designLayoutStorageKey(workspaceKey)) || "{}");
    if (Object.keys(layout).length && layout._meta?.schemaVersion !== DESIGN_LAYOUT_SCHEMA_VERSION) {
      localStorage.removeItem(designLayoutStorageKey(workspaceKey));
      return {};
    }
    return layout;
  } catch {
    return {};
  }
}

function saveDesignLayout(workspaceKey, layout) {
  localStorage.setItem(designLayoutStorageKey(workspaceKey), JSON.stringify(layout));
}

function resetDesignLayout(workspaceKey) {
  localStorage.removeItem(designLayoutStorageKey(workspaceKey));
  if (workspaceKey === "orders" && dashboardState.activeTab === "orders") {
    renderOrderWorkspace();
  }
}

window.__resetDesignLayout = resetDesignLayout;

function designContainerFor(element, rootElement) {
  const parentEditable = element.parentElement?.closest("[data-design-id]");
  return parentEditable || rootElement;
}

function designRectRelativeTo(element, rootElement) {
  const elementRect = element.getBoundingClientRect();
  const containerRect = designContainerFor(element, rootElement).getBoundingClientRect();
  return {
    x: Math.round(elementRect.left - containerRect.left),
    y: Math.round(elementRect.top - containerRect.top),
    width: Math.round(elementRect.width),
    height: Math.round(elementRect.height),
  };
}

function designRootSize(rootElement) {
  const rect = rootElement.getBoundingClientRect();
  return {
    width: Math.max(1, Math.round(rect.width)),
    height: Math.max(1, Math.round(rect.height)),
  };
}

function normalizeDesignLayout(workspaceKey, rootElement, layout) {
  const rootSize = designRootSize(rootElement);
  if (!layout._meta) {
    layout._meta = { ...rootSize, schemaVersion: DESIGN_LAYOUT_SCHEMA_VERSION };
    saveDesignLayout(workspaceKey, layout);
  }
  return {
    layout,
    scaleX: rootSize.width / Math.max(1, layout._meta.width || rootSize.width),
    scaleY: rootSize.height / Math.max(1, layout._meta.height || rootSize.height),
    rootSize,
  };
}

function captureDefaultDesignLayout(rootElement) {
  const layout = { _meta: { ...designRootSize(rootElement), schemaVersion: DESIGN_LAYOUT_SCHEMA_VERSION } };
  for (const element of rootElement.querySelectorAll("[data-design-id]")) {
    layout[element.dataset.designId] = designRectRelativeTo(element, rootElement);
  }
  return layout;
}

function prepareDesignEditables(rootElement) {
  for (const element of rootElement.querySelectorAll("[data-design-id]")) {
    element.classList.add("design-editable");
    if (!element.querySelector(":scope > .design-resize-handle")) {
      element.insertAdjacentHTML("beforeend", '<span class="design-resize-handle" aria-hidden="true"></span>');
    }
  }
}

function applyDesignLayout(workspaceKey, rootElement, layout = loadDesignLayout(workspaceKey)) {
  const { scaleX, scaleY } = normalizeDesignLayout(workspaceKey, rootElement, layout);
  for (const element of rootElement.querySelectorAll("[data-design-id]")) {
    const rect = layout[element.dataset.designId];
    if (!rect || rect.width < 20 || rect.height < 20) {
      continue;
    }
    element.classList.toggle("design-deleted", Boolean(rect.deleted));
    element.style.left = `${Math.round(rect.x * scaleX)}px`;
    element.style.top = `${Math.round(rect.y * scaleY)}px`;
    element.style.width = `${Math.round(rect.width * scaleX)}px`;
    element.style.height = `${Math.round(rect.height * scaleY)}px`;
  }
}

function saveDesignElementLayout(workspaceKey, rootElement, element) {
  const layout = loadDesignLayout(workspaceKey);
  const { scaleX, scaleY, rootSize } = normalizeDesignLayout(workspaceKey, rootElement, layout);
  const rect = designRectRelativeTo(element, rootElement);
  const previous = layout[element.dataset.designId] || {};
  layout._meta = { ...rootSize, schemaVersion: DESIGN_LAYOUT_SCHEMA_VERSION };
  layout[element.dataset.designId] = {
    ...previous,
    x: Math.round(rect.x / scaleX),
    y: Math.round(rect.y / scaleY),
    width: Math.round(rect.width / scaleX),
    height: Math.round(rect.height / scaleY),
  };
  saveDesignLayout(workspaceKey, layout);
}

function updateDesignLabel(workspaceKey, rootElement, labelElement, nextText) {
  const layout = loadDesignLayout(workspaceKey);
  layout._labels = layout._labels || {};
  const previous = layout._labels[labelElement.dataset.designLabelId] || {};
  layout._labels[labelElement.dataset.designLabelId] = {
    ...previous,
    text: nextText,
  };
  labelElement.textContent = nextText;
  labelElement.classList.remove("design-label-deleted");
  saveDesignLayout(workspaceKey, layout);
}

function toggleDesignLabelDeleteMark(workspaceKey, rootElement, labelElement) {
  const layout = loadDesignLayout(workspaceKey);
  layout._labels = layout._labels || {};
  const previous = layout._labels[labelElement.dataset.designLabelId] || {};
  const deleted = !previous.deleted;
  layout._labels[labelElement.dataset.designLabelId] = {
    ...previous,
    text: previous.text || labelElement.textContent,
    deleted,
  };
  labelElement.classList.toggle("design-label-deleted", deleted);
  saveDesignLayout(workspaceKey, layout);
}

function toggleDesignDeleteMark(workspaceKey, rootElement, element) {
  const layout = loadDesignLayout(workspaceKey);
  const { scaleX, scaleY, rootSize } = normalizeDesignLayout(workspaceKey, rootElement, layout);
  const rect = designRectRelativeTo(element, rootElement);
  const previous = layout[element.dataset.designId] || {};
  const deleted = !previous.deleted;
  layout._meta = { ...rootSize, schemaVersion: DESIGN_LAYOUT_SCHEMA_VERSION };
  layout[element.dataset.designId] = {
    ...previous,
    x: previous.x ?? Math.round(rect.x / scaleX),
    y: previous.y ?? Math.round(rect.y / scaleY),
    width: previous.width ?? Math.round(rect.width / scaleX),
    height: previous.height ?? Math.round(rect.height / scaleY),
    deleted,
  };
  element.classList.toggle("design-deleted", deleted);
  saveDesignLayout(workspaceKey, layout);
}

function applyDesignLabels(workspaceKey, rootElement, layout = loadDesignLayout(workspaceKey)) {
  const labels = layout._labels || {};
  for (const labelElement of rootElement.querySelectorAll("[data-design-label-id]")) {
    const labelState = labels[labelElement.dataset.designLabelId];
    labelElement.classList.toggle("design-label-deleted", Boolean(labelState?.deleted));
    if (labelState?.text) {
      labelElement.textContent = labelState.text;
    }
  }
}

function designLabelMarkup(labelId, text) {
  return `<span class="design-label" data-design-label-id="${escapeAttribute(labelId)}">${escapeTextarea(text)}</span>`;
}

function isInteractiveDesignTarget(target) {
  return Boolean(target.closest("input, textarea, select, button, a, table, [contenteditable='true']"));
}

function clampDesignValue(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function startDesignEdit(event, workspaceKey, rootElement) {
  if (!rootElement.classList.contains("design-mode")) {
    return;
  }
  const resizeHandle = event.target.closest(".design-resize-handle");
  const element = (resizeHandle || event.target).closest("[data-design-id]");
  if (!element || !rootElement.contains(element)) {
    return;
  }
  if (!resizeHandle && isInteractiveDesignTarget(event.target)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  rootElement.querySelectorAll(".design-selected").forEach((item) => item.classList.remove("design-selected"));
  element.classList.add("design-selected");

  const startRect = designRectRelativeTo(element, rootElement);
  const containerRect = designContainerFor(element, rootElement).getBoundingClientRect();
  const startX = event.clientX;
  const startY = event.clientY;
  const mode = resizeHandle ? "resize" : "drag";

  function moveDesignElement(moveEvent) {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;
    if (mode === "resize") {
      const maxWidth = containerRect.width - startRect.x;
      const maxHeight = containerRect.height - startRect.y;
      element.style.width = `${clampDesignValue(startRect.width + dx, 180, maxWidth)}px`;
      element.style.height = `${clampDesignValue(startRect.height + dy, 120, maxHeight)}px`;
      return;
    }
    element.style.left = `${clampDesignValue(startRect.x + dx, 0, containerRect.width - startRect.width)}px`;
    element.style.top = `${clampDesignValue(startRect.y + dy, 0, containerRect.height - startRect.height)}px`;
  }

  function stopDesignElement() {
    window.removeEventListener("mousemove", moveDesignElement);
    window.removeEventListener("mouseup", stopDesignElement);
    saveDesignElementLayout(workspaceKey, rootElement, element);
  }

  window.addEventListener("mousemove", moveDesignElement);
  window.addEventListener("mouseup", stopDesignElement);
}

function handleDesignContextMenu(event, workspaceKey, rootElement) {
  if (!rootElement.classList.contains("design-mode")) {
    return;
  }
  const element = event.target.closest("[data-design-id]");
  if (!element || !rootElement.contains(element)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  rootElement.querySelectorAll(".design-selected").forEach((item) => item.classList.remove("design-selected"));
  element.classList.add("design-selected");

  const labelElement = event.target.closest("[data-design-label-id]") || element.querySelector("[data-design-label-id]");
  showDesignContextMenu(event.clientX, event.clientY, workspaceKey, rootElement, element, labelElement);
}

function closeDesignContextMenu(rootElement) {
  rootElement.querySelector(".design-context-menu")?.remove();
}

function showDesignContextMenu(x, y, workspaceKey, rootElement, element, labelElement) {
  closeDesignContextMenu(rootElement);
  const menu = document.createElement("div");
  menu.className = "design-context-menu";
  menu.style.left = `${x - rootElement.getBoundingClientRect().left}px`;
  menu.style.top = `${y - rootElement.getBoundingClientRect().top}px`;
  menu.innerHTML = `
    <button type="button" data-design-action="edit-label"${labelElement ? "" : " disabled"}>수정</button>
    <button type="button" data-design-action="toggle-delete">${labelElement?.classList.contains("design-label-deleted") || element.classList.contains("design-deleted") ? "삭제 표시 해제" : "삭제 표시"}</button>
  `;
  menu.addEventListener("click", async (clickEvent) => {
    const actionButton = clickEvent.target.closest("[data-design-action]");
    if (!actionButton || actionButton.disabled) {
      return;
    }
    clickEvent.stopPropagation();
    const action = actionButton.dataset.designAction;
    if (action === "edit-label" && labelElement) {
      const nextText = await requestAppPrompt("라벨 이름 입력", labelElement.textContent.trim(), "디자인 라벨 수정");
      if (nextText !== null) {
        updateDesignLabel(workspaceKey, rootElement, labelElement, nextText.trim());
      }
    }
    if (action === "toggle-delete") {
      if (labelElement) {
        toggleDesignLabelDeleteMark(workspaceKey, rootElement, labelElement);
      } else {
        toggleDesignDeleteMark(workspaceKey, rootElement, element);
      }
    }
    closeDesignContextMenu(rootElement);
  });
  rootElement.appendChild(menu);
}

function initDesignModeForWorkspace(workspaceKey, rootElement) {
  if (!rootElement || !isDesignModeEnabled(workspaceKey)) {
    rootElement?.classList.remove("design-mode");
    return;
  }

  let layout = loadDesignLayout(workspaceKey);
  if (!Object.keys(layout).length) {
    layout = captureDefaultDesignLayout(rootElement);
    saveDesignLayout(workspaceKey, layout);
  }

  rootElement.classList.add("design-mode");
  prepareDesignEditables(rootElement);
  applyDesignLayout(workspaceKey, rootElement, layout);
  applyDesignLabels(workspaceKey, rootElement, layout);

  if (rootElement.dataset.designModeInitialized === "true") {
    return;
  }
  rootElement.dataset.designModeInitialized = "true";
  rootElement.addEventListener("mousedown", (event) => startDesignEdit(event, workspaceKey, rootElement));
  rootElement.addEventListener("contextmenu", (event) => handleDesignContextMenu(event, workspaceKey, rootElement));
  rootElement.addEventListener("click", () => closeDesignContextMenu(rootElement));
  window.addEventListener("resize", () => {
    if (dashboardState.activeTab === workspaceKey && rootElement.classList.contains("design-mode")) {
      applyDesignLayout(workspaceKey, rootElement);
      applyDesignLabels(workspaceKey, rootElement);
    }
  });
}
