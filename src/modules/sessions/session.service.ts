import crypto from "node:crypto";
import type { AuthenticatedSession, PendingChallenge } from "./session.types.js";
import type { DemoUser } from "../users/user.types.js";
import type { SessionContext } from "../auth/auth.types.js";

const pendingChallenges = new Map<string, PendingChallenge>();
const authenticatedSessions = new Map<string, AuthenticatedSession>();

function futureIso(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

export class SessionService {
  createPendingChallenge(input: {
    user: DemoUser;
    context: SessionContext;
    userAgent: string;
  }): PendingChallenge {
    const sessionId = crypto.randomUUID();
    const challenge: PendingChallenge = {
      sessionId,
      challengeId: crypto.randomUUID(),
      user: input.user,
      context: input.context,
      userAgent: input.userAgent,
      status: "PENDING_MFA",
      createdAt: new Date().toISOString(),
    };

    pendingChallenges.set(sessionId, challenge);
    return challenge;
  }

  getPendingChallenge(sessionId: string | null | undefined) {
    if (!sessionId) {
      return null;
    }

    return pendingChallenges.get(sessionId) || null;
  }

  promotePendingChallenge(sessionId: string): AuthenticatedSession | null {
    const challenge = pendingChallenges.get(sessionId);
    if (!challenge) {
      return null;
    }

    pendingChallenges.delete(sessionId);

    const session: AuthenticatedSession = {
      sessionId,
      user: challenge.user,
      context: challenge.context,
      userAgent: challenge.userAgent,
      status: "AUTHENTICATED",
      issuedAt: new Date().toISOString(),
      expiresAt: futureIso(480),
      idleExpiresAt: futureIso(30),
    };

    authenticatedSessions.set(sessionId, session);
    return session;
  }

  getAuthenticatedSession(sessionId: string | null | undefined) {
    if (!sessionId) {
      return null;
    }

    return authenticatedSessions.get(sessionId) || null;
  }

  revokeSession(sessionId: string) {
    pendingChallenges.delete(sessionId);
    authenticatedSessions.delete(sessionId);
  }
}

export const sessionService = new SessionService();
