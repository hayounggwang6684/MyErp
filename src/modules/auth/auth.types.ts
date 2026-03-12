export type LoginInput = {
  username: string;
  password: string;
  deviceId: string;
  userAgent: string;
};

export type SessionContext = {
  mtlsVerified: boolean;
  certificateFingerprint: string;
  accessScope: "EXTERNAL" | "LOCAL_ADMIN";
  deviceId: string;
};
