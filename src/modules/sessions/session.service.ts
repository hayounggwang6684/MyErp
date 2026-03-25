import crypto from "node:crypto";
import type { DbExecutor } from "../../shared/infrastructure/persistence/postgres.js";
import { query } from "../../shared/infrastructure/persistence/postgres.js";
import type { SessionContext } from "../auth/auth.types.js";
import type { AppUser } from "../users/user.types.js";
import type { AuthenticatedSession, ChallengeKind, PendingChallenge, SessionStatus } from "./session.types.js";

function futureDate(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function mapPendingChallenge(row: {
  id: string;
  session_id: string;
  user_id: string;
  challenge_kind: ChallengeKind;
  status: "PENDING" | "VERIFIED" | "EXPIRED" | "FAILED";
  access_scope: SessionContext["accessScope"];
  device_id: string;
  mtls_verified: boolean;
  certificate_fingerprint: string;
  client_ip: string;
  user_agent: string;
  created_at: Date;
  expires_at: Date;
}) {
  return {
    sessionId: row.session_id,
    challengeId: row.id,
    challengeKind: row.challenge_kind,
    userId: row.user_id,
    context: {
      accessScope: row.access_scope,
      deviceId: row.device_id,
      mtlsVerified: row.mtls_verified,
      certificateFingerprint: row.certificate_fingerprint,
      clientIp: row.client_ip,
    },
    userAgent: row.user_agent,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    expiresAt: row.expires_at.toISOString(),
  } satisfies PendingChallenge;
}

function mapAuthenticatedSession(row: {
  id: string;
  access_scope: SessionContext["accessScope"];
  device_id: string;
  mtls_verified: boolean;
  certificate_fingerprint: string;
  client_ip: string;
  user_agent: string;
  issued_at: Date;
  expires_at: Date;
  idle_expires_at: Date;
  session_status: SessionStatus;
  user_id: string;
  employee_id: string | null;
  username: string;
  password_hash: string;
  name: string;
  department: string;
  roles: string[];
  user_status: AppUser["status"];
  failed_password_attempts: number;
  locked_until: Date | null;
  last_failed_password_at: Date | null;
}) {
  return {
    sessionId: row.id,
    user: {
      id: row.user_id,
      employeeId: row.employee_id,
      username: row.username,
      passwordHash: row.password_hash,
      name: row.name,
      department: row.department,
      roles: row.roles,
      status: row.user_status,
      failedPasswordAttempts: row.failed_password_attempts,
      lockedUntil: row.locked_until?.toISOString() || null,
      lastFailedPasswordAt: row.last_failed_password_at?.toISOString() || null,
    },
    context: {
      accessScope: row.access_scope,
      deviceId: row.device_id,
      mtlsVerified: row.mtls_verified,
      certificateFingerprint: row.certificate_fingerprint,
      clientIp: row.client_ip,
    },
    userAgent: row.user_agent,
    status: row.session_status,
    issuedAt: row.issued_at.toISOString(),
    expiresAt: row.expires_at.toISOString(),
    idleExpiresAt: row.idle_expires_at.toISOString(),
  } satisfies AuthenticatedSession;
}

export class SessionService {
  async createPendingChallenge(input: {
    userId: string;
    context: SessionContext;
    userAgent: string;
    challengeKind: ChallengeKind;
    client?: DbExecutor;
  }) {
    const executor: DbExecutor = input.client ?? { query };
    const sessionId = crypto.randomUUID();
    const challengeId = crypto.randomUUID();
    const expiresAt = futureDate(10);

    await executor.query(
      `insert into security.mfa_challenges (
         id,
         session_id,
         user_id,
         challenge_kind,
         status,
         access_scope,
         device_id,
         mtls_verified,
         certificate_fingerprint,
         client_ip,
         user_agent,
         created_at,
         expires_at,
         verified_at
       ) values ($1, $2, $3, $4, 'PENDING', $5, $6, $7, $8, $9, $10, now(), $11, null)`,
      [
        challengeId,
        sessionId,
        input.userId,
        input.challengeKind,
        input.context.accessScope,
        input.context.deviceId,
        input.context.mtlsVerified,
        input.context.certificateFingerprint,
        input.context.clientIp,
        input.userAgent,
        expiresAt,
      ],
    );

    return {
      sessionId,
      challengeId,
      challengeKind: input.challengeKind,
      userId: input.userId,
      context: input.context,
      userAgent: input.userAgent,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    } satisfies PendingChallenge;
  }

  async getPendingChallenge(sessionId: string | null | undefined, client?: DbExecutor) {
    if (!sessionId) {
      return null;
    }

    const executor: DbExecutor = client ?? { query };
    const result = await executor.query<{
      id: string;
      session_id: string;
      user_id: string;
      challenge_kind: ChallengeKind;
      status: "PENDING" | "VERIFIED" | "EXPIRED" | "FAILED";
      access_scope: SessionContext["accessScope"];
      device_id: string;
      mtls_verified: boolean;
      certificate_fingerprint: string;
      client_ip: string;
      user_agent: string;
      created_at: Date;
      expires_at: Date;
    }>(
      `select
         id,
         session_id,
         user_id,
         challenge_kind,
         status,
         access_scope,
         device_id,
         mtls_verified,
         certificate_fingerprint,
         client_ip,
         user_agent,
         created_at,
         expires_at
       from security.mfa_challenges
       where session_id = $1
         and status = 'PENDING'
       order by created_at desc
       limit 1`,
      [sessionId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    if (row.expires_at.getTime() < Date.now()) {
      await executor.query(
        `update security.mfa_challenges set status = 'EXPIRED' where session_id = $1 and status = 'PENDING'`,
        [sessionId],
      );
      return null;
    }

    return mapPendingChallenge(row);
  }

  async markChallengeFailed(sessionId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update security.mfa_challenges
       set status = 'FAILED'
       where session_id = $1 and status = 'PENDING'`,
      [sessionId],
    );
  }

  async markChallengeVerified(sessionId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update security.mfa_challenges
       set status = 'VERIFIED',
           verified_at = now()
       where session_id = $1 and status = 'PENDING'`,
      [sessionId],
    );
  }

  async createAuthenticatedSession(input: {
    sessionId?: string;
    user: AppUser;
    context: SessionContext;
    userAgent: string;
    client?: DbExecutor;
  }) {
    const executor: DbExecutor = input.client ?? { query };
    const sessionId = input.sessionId || crypto.randomUUID();
    const idleExpiresAt = futureDate(30);
    const expiresAt = futureDate(480);

    await executor.query(
      `insert into security.sessions (
         id,
         user_id,
         status,
         access_scope,
         device_id,
         mtls_verified,
         certificate_fingerprint,
         client_ip,
         user_agent,
         issued_at,
         idle_expires_at,
         expires_at,
         revoked_at
       ) values ($1, $2, 'ACTIVE', $3, $4, $5, $6, $7, $8, now(), $9, $10, null)`,
      [
        sessionId,
        input.user.id,
        input.context.accessScope,
        input.context.deviceId,
        input.context.mtlsVerified,
        input.context.certificateFingerprint,
        input.context.clientIp,
        input.userAgent,
        idleExpiresAt,
        expiresAt,
      ],
    );

    return {
      sessionId,
      user: input.user,
      context: input.context,
      userAgent: input.userAgent,
      status: "ACTIVE",
      issuedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      idleExpiresAt: idleExpiresAt.toISOString(),
    } satisfies AuthenticatedSession;
  }

  async getAuthenticatedSession(sessionId: string | null | undefined, client?: DbExecutor) {
    if (!sessionId) {
      return null;
    }

    const executor: DbExecutor = client ?? { query };
    const result = await executor.query<{
      id: string;
      access_scope: SessionContext["accessScope"];
      device_id: string;
      mtls_verified: boolean;
      certificate_fingerprint: string;
      client_ip: string;
      user_agent: string;
      issued_at: Date;
      expires_at: Date;
      idle_expires_at: Date;
      session_status: SessionStatus;
      user_id: string;
      employee_id: string | null;
      username: string;
      password_hash: string;
      name: string;
      department: string;
      roles: string[];
      user_status: AppUser["status"];
      failed_password_attempts: number;
      locked_until: Date | null;
      last_failed_password_at: Date | null;
    }>(
      `select
         s.id,
         s.access_scope,
         s.device_id,
         s.mtls_verified,
         s.certificate_fingerprint,
         s.client_ip,
         s.user_agent,
         s.issued_at,
         s.expires_at,
         s.idle_expires_at,
         s.status as session_status,
         u.id as user_id,
         u.employee_id,
         u.username,
         u.password_hash,
         u.name,
         u.department,
         u.roles,
         u.status as user_status,
         u.failed_password_attempts,
         u.locked_until,
         u.last_failed_password_at
       from security.sessions s
       join identity.users u on u.id = s.user_id
       where s.id = $1
         and s.status = 'ACTIVE'
         and s.revoked_at is null
       limit 1`,
      [sessionId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    if (row.expires_at.getTime() < Date.now()) {
      await executor.query(
        `update security.sessions
         set status = 'EXPIRED'
         where id = $1 and status = 'ACTIVE'`,
        [sessionId],
      );
      return null;
    }

    return mapAuthenticatedSession(row);
  }

  async revokeSession(sessionId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update security.sessions
       set status = 'REVOKED',
           revoked_at = now()
       where id = $1 and status = 'ACTIVE'`,
      [sessionId],
    );
    await executor.query(
      `update security.mfa_challenges
       set status = case when status = 'PENDING' then 'EXPIRED' else status end
       where session_id = $1`,
      [sessionId],
    );
  }
}

export const sessionService = new SessionService();
