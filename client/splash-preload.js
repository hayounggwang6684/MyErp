const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("erpSplash", {
  onStatus: (handler) => {
    ipcRenderer.removeAllListeners("splash-status");
    ipcRenderer.on("splash-status", (_event, payload) => handler(payload));
  },
});
