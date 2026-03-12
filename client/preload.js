const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("erpClient", {
  getConfig: () => ipcRenderer.invoke("config:get"),
  saveConfig: (payload) => ipcRenderer.invoke("config:save", payload),
  login: (payload) => ipcRenderer.invoke("auth:login", payload),
  verifyMfa: (payload) => ipcRenderer.invoke("auth:verify-mfa", payload),
  logout: () => ipcRenderer.invoke("auth:logout"),
  getSession: () => ipcRenderer.invoke("session:get"),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  onUpdateStatus: (handler) => {
    ipcRenderer.removeAllListeners("update-status");
    ipcRenderer.on("update-status", (_event, payload) => handler(payload));
  },
});
