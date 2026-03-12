import type { DemoUser } from "../users/user.types.js";
import type { SessionContext } from "../auth/auth.types.js";

export type PendingChallenge = {
  sessionId: string;
  challengeId: string;
  user: DemoUser;
  context: SessionContext;
  userAgent: string;
  status: "PENDING_MFA";
  createdAt: string;
};

export type AuthenticatedSession = {
  sessionId: string;
  user: DemoUser;
  context: SessionContext;
  userAgent: string;
  status: "AUTHENTICATED";
  issuedAt: string;
  expiresAt: string;
  idleExpiresAt: string;
};
