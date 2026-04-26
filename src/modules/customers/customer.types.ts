export type CustomerType = "SHIP_OWNER" | "GENERAL";
export type CustomerStatus = "ACTIVE" | "INACTIVE";
export type ContactRole = "OWNER" | "STAFF" | "MANAGER" | "ACCOUNTING" | "OTHER";
export type AddressType = "BUSINESS" | "BILLING" | "SITE" | "VESSEL_MANAGEMENT";
export type AssetType = "VESSEL" | "SITE_EQUIPMENT";
export type EquipmentType = string;

export type CustomerSummary = {
  id: string;
  customerNo: string;
  customerName: string;
  customerType: CustomerType;
  status: CustomerStatus;
  businessRegistrationNo: string | null;
  representativeName: string | null;
  companyPhone: string;
  companyEmail: string;
  taxCategory: string;
  bankAccount: string;
  invoiceEmail: string;
  primaryContactName: string | null;
  primaryContactPhone: string | null;
  assetCount: number;
  equipmentCount: number;
  duplicateHints: string[];
  updatedAt: string;
};

export type CustomerContact = {
  id: string;
  customerId: string;
  contactName: string;
  contactRole: ContactRole;
  departmentName: string;
  jobTitle: string;
  mobilePhone: string;
  officePhone: string;
  email: string;
  isPrimary: boolean;
  notes: string;
  updatedAt: string;
};

export type CustomerAddress = {
  id: string;
  customerId: string;
  addressType: AddressType;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  notes: string;
  updatedAt: string;
};

export type CustomerAsset = {
  id: string;
  customerId: string;
  assetName: string;
  assetType: AssetType;
  vesselType: string;
  assetCode: string;
  status: string;
  registrationNo: string;
  imoNo: string;
  locationDescription: string;
  notes: string;
  updatedAt: string;
};

export type CustomerEquipment = {
  id: string;
  assetId: string;
  customerId: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  status: string;
  serialNo: string;
  installationPosition: string;
  engineModelId: string | null;
  gearboxModelId: string | null;
  manufacturer: string;
  modelName: string;
  notes: string;
  updatedAt: string;
};

export type EngineModel = {
  id: string;
  manufacturer: string;
  modelName: string;
  engineType: string;
  fuelType: string;
  powerRating: string;
  notes: string;
  updatedAt: string;
};

export type GearboxModel = {
  id: string;
  manufacturer: string;
  modelName: string;
  gearType: string;
  gearRatio: string;
  torqueRating: string;
  notes: string;
  updatedAt: string;
};

export type EquipmentMasterOption = {
  id: string;
  optionType: string;
  optionValue: string;
};

export type FileRecord = {
  id: string;
  domain: string;
  entityType: string;
  entityId: string | null;
  originalName: string;
  storedPath: string;
  mimeType: string;
  sizeBytes: number;
  scanStatus: string;
  retentionClass: string;
  metadata: Record<string, unknown>;
  uploadedAt: string;
};

export type BusinessLicenseExtraction = {
  id: string;
  customerId: string;
  fileId: string | null;
  status: string;
  extractorName: string;
  extractedRegistrationNo: string;
  extractedCompanyName: string;
  extractedRepresentativeName: string;
  extractedAddress: string;
  extractedBusinessCategory: string;
  extractedBusinessItem: string;
  extractedOpeningDate: string;
  confirmedSnapshot: Record<string, unknown>;
  createdAt: string;
};

export type CustomerDetail = {
  customer: CustomerSummary & {
    businessCategory: string;
    businessItem: string;
    openingDate: string | null;
    notes: string;
  };
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
  assets: Array<CustomerAsset & { equipments: CustomerEquipment[] }>;
  files: FileRecord[];
  latestExtraction: BusinessLicenseExtraction | null;
};
