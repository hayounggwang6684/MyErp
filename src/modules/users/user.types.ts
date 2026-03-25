export type UserStatus = "ACTIVE" | "LOCKED" | "INACTIVE" | "PENDING_APPROVAL";

export type AppUser = {
  id: string;
  employeeId: string | null;
  username: string;
  passwordHash: string;
  name: string;
  department: string;
  roles: string[];
  status: UserStatus;
  failedPasswordAttempts: number;
  lockedUntil: string | null;
  lastFailedPasswordAt: string | null;
};

export type EmployeeRecord = {
  id: string;
  employeeNo: string;
  name: string;
  department: string;
  jobTitle: string;
  contact: string;
  workStatus: string;
  assignedWorkCount: number;
  linkedUsername: string | null;
  linkedUserStatus: UserStatus | null;
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
