export type AssetHistoryEntry = {
  id: string;
  sequence: number;
  date: string;
  content: string;
  cost: string;
};

export type PhysicalAssetRecord = {
  id: string;
  purpose: string;
  name: string;
  purchaseSource: string;
  purchasePrice: string;
  auditCycle: string;
  auditHistory: AssetHistoryEntry[];
  repairHistory: AssetHistoryEntry[];
  state: "ok" | "warn" | "neutral";
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeRecord = {
  id: string;
  category: string;
  content: string;
  hashtags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
};

export type AssetWorkspaceSummary = {
  physicalAssetCount: number;
  expiringSoonCount: number;
  inspectionDueCount: number;
  knowledgeCount: number;
};

export type AssetWorkspacePayload = {
  summary: AssetWorkspaceSummary;
  physicalAssets: PhysicalAssetRecord[];
  knowledgeRecords: KnowledgeRecord[];
};
