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
  listCustomers: (search) => ipcRenderer.invoke("customers:list", search),
  getCustomer: (customerId) => ipcRenderer.invoke("customers:get", customerId),
  createCustomer: (payload) => ipcRenderer.invoke("customers:create", payload),
  addCustomerContact: (customerId, payload) => ipcRenderer.invoke("customers:add-contact", customerId, payload),
  addCustomerAddress: (customerId, payload) => ipcRenderer.invoke("customers:add-address", customerId, payload),
  addCustomerAsset: (customerId, payload) => ipcRenderer.invoke("customers:add-asset", customerId, payload),
  addAssetEquipment: (assetId, payload) => ipcRenderer.invoke("customers:add-equipment", assetId, payload),
  listEngineModels: (search) => ipcRenderer.invoke("customers:list-engine-models", search),
  createEngineModel: (payload) => ipcRenderer.invoke("customers:create-engine-model", payload),
  listGearboxModels: (search) => ipcRenderer.invoke("customers:list-gearbox-models", search),
  createGearboxModel: (payload) => ipcRenderer.invoke("customers:create-gearbox-model", payload),
  uploadFile: (payload) => ipcRenderer.invoke("customers:upload-file", payload),
  linkFile: (fileId, payload) => ipcRenderer.invoke("customers:link-file", fileId, payload),
  extractBusinessLicense: (customerId, payload) => ipcRenderer.invoke("customers:extract-business-license", customerId, payload),
  getPreference: () => ipcRenderer.invoke("preference:get"),
  savePreference: (payload) => ipcRenderer.invoke("preference:save", payload),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  onUpdateStatus: (handler) => {
    ipcRenderer.removeAllListeners("update-status");
    ipcRenderer.on("update-status", (_event, payload) => handler(payload));
  },
});
