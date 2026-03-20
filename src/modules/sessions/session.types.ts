import type { SessionContext } from "../auth/auth.types.js";
import type { AppUser } from "../users/user.types.js";

export type ChallengeKind = "LOGIN_MFA" | "MFA_ENROLLMENT";
export type ChallengeStatus = "PENDING" | "VERIFIED" | "EXPIRED" | "FAILED";
export type SessionStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

export type PendingChallenge = {
  sessionId: string;
  challengeId: string;
  challengeKind: ChallengeKind;
  userId: string;
  context: SessionContext;
  userAgent: string;
  status: ChallengeStatus;
  createdAt: string;
  expiresAt: string;
};

export type AuthenticatedSession = {
  sessionId: string;
  user: AppUser;
  context: SessionContext;
  userAgent: string;
  status: SessionStatus;
  issuedAt: string;
  expiresAt: string;
  idleExpiresAt: string;
};
