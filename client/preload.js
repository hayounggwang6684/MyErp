const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("erpClient", {
  getAppVersion: () => ipcRenderer.invoke("app:version"),
  getAccessScope: () => ipcRenderer.invoke("auth:access-scope"),
  login: (payload) => ipcRenderer.invoke("auth:login", payload),
  verifyMfa: (payload) => ipcRenderer.invoke("auth:verify-mfa", payload),
  startMfaEnrollment: () => ipcRenderer.invoke("auth:mfa-enrollment:start"),
  getMfaEnrollmentStatus: () => ipcRenderer.invoke("auth:mfa-enrollment:status"),
  verifyMfaEnrollment: (payload) => ipcRenderer.invoke("auth:mfa-enrollment:verify", payload),
  logout: () => ipcRenderer.invoke("auth:logout"),
  getSession: () => ipcRenderer.invoke("session:get"),
  getPreference: () => ipcRenderer.invoke("preference:get"),
  savePreference: (payload) => ipcRenderer.invoke("preference:save", payload),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  onUpdateStatus: (handler) => {
    ipcRenderer.removeAllListeners("update-status");
    ipcRenderer.on("update-status", (_event, payload) => handler(payload));
  },
});
