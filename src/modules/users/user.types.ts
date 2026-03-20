export type UserStatus = "ACTIVE" | "LOCKED" | "INACTIVE" | "PENDING_APPROVAL";

export type AppUser = {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  roles: string[];
  status: UserStatus;
  failedPasswordAttempts: number;
  lockedUntil: string | null;
  lastFailedPasswordAt: string | null;
};

export type MfaSecretStatus = "PENDING" | "ACTIVE" | "REVOKED";

export type UserMfaSecret = {
  id: string;
  userId: string;
  secretBase32: string;
  status: MfaSecretStatus;
  createdAt: string;
  verifiedAt: string | null;
  lastUsedAt: string | null;
};
