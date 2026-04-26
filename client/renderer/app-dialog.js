function closeAppDialog(dialog, cleanup) {
  dialog.remove();
  cleanup?.();
}

function showAppDialog({ title = "알림", message = "", mode = "alert", defaultValue = "", confirmLabel = "확인", cancelLabel = "취소" }) {
  return new Promise((resolve) => {
    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.createElement("div");
    dialog.className = "app-dialog-backdrop";
    dialog.setAttribute("role", "presentation");

    const panel = document.createElement("section");
    panel.className = "app-dialog";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "app-dialog-title");

    const titleElement = document.createElement("h2");
    titleElement.id = "app-dialog-title";
    titleElement.className = "app-dialog-title";
    titleElement.textContent = title;

    const messageElement = document.createElement("p");
    messageElement.className = "app-dialog-message";
    messageElement.textContent = message;

    const actions = document.createElement("div");
    actions.className = "app-dialog-actions";

    let input = null;
    if (mode === "prompt") {
      input = document.createElement("input");
      input.className = "text-field app-dialog-input";
      input.value = defaultValue;
      input.setAttribute("aria-label", title);
    }

    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.className = "primary-button";
    confirmButton.textContent = confirmLabel;

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "secondary-button";
    cancelButton.textContent = cancelLabel;

    const cleanup = () => {
      document.removeEventListener("keydown", handleKeydown);
      previousActiveElement?.focus?.();
    };
    const finish = (value) => {
      closeAppDialog(dialog, cleanup);
      resolve(value);
    };

    function handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        finish(mode === "confirm" ? false : mode === "prompt" ? null : true);
      }
      if (event.key === "Enter" && mode !== "alert") {
        event.preventDefault();
        event.stopPropagation();
        finish(mode === "prompt" ? input.value : true);
      }
    }

    confirmButton.addEventListener("click", () => {
      finish(mode === "prompt" ? input.value : true);
    });
    cancelButton.addEventListener("click", () => {
      finish(mode === "confirm" ? false : null);
    });

    panel.append(titleElement, messageElement);
    if (input) {
      panel.appendChild(input);
    }
    if (mode !== "alert") {
      actions.append(cancelButton, confirmButton);
    } else {
      actions.appendChild(confirmButton);
    }
    panel.appendChild(actions);
    dialog.appendChild(panel);
    document.body.appendChild(dialog);
    document.addEventListener("keydown", handleKeydown);
    (input || confirmButton).focus();
    if (input) {
      input.select();
    }
  });
}

function showAppMessage(message, title = "알림") {
  return showAppDialog({ title, message, mode: "alert" });
}

function requestAppConfirm(message, title = "확인") {
  return showAppDialog({ title, message, mode: "confirm" });
}

function requestAppPrompt(message, defaultValue = "", title = "입력") {
  return showAppDialog({ title, message, mode: "prompt", defaultValue });
}
