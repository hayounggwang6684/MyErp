import type { DbExecutor } from "../../shared/infrastructure/persistence/postgres.js";
import { query } from "../../shared/infrastructure/persistence/postgres.js";
import type { AppUser, UserMfaSecret, UserStatus } from "./user.types.js";

function mapUser(row: {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  roles: string[];
  status: UserStatus;
  failed_password_attempts: number;
  locked_until: Date | null;
  last_failed_password_at: Date | null;
}) {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    name: row.name,
    roles: row.roles,
    status: row.status,
    failedPasswordAttempts: row.failed_password_attempts,
    lockedUntil: row.locked_until?.toISOString() || null,
    lastFailedPasswordAt: row.last_failed_password_at?.toISOString() || null,
  } satisfies AppUser;
}

function mapMfaSecret(row: {
  id: string;
  user_id: string;
  secret_base32: string;
  status: "PENDING" | "ACTIVE" | "REVOKED";
  created_at: Date;
  verified_at: Date | null;
  last_used_at: Date | null;
}) {
  return {
    id: row.id,
    userId: row.user_id,
    secretBase32: row.secret_base32,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    verifiedAt: row.verified_at?.toISOString() || null,
    lastUsedAt: row.last_used_at?.toISOString() || null,
  } satisfies UserMfaSecret;
}

export class UserService {
  async findByUsername(username: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    const result = await executor.query<{
      id: string;
      username: string;
      password_hash: string;
      name: string;
      roles: string[];
      status: UserStatus;
      failed_password_attempts: number;
      locked_until: Date | null;
      last_failed_password_at: Date | null;
    }>(
      `select
         id,
         username,
         password_hash,
         name,
         roles,
         status,
         failed_password_attempts,
         locked_until,
         last_failed_password_at
       from identity.users
       where username = $1`,
      [username],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }

  async getById(userId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    const result = await executor.query<{
      id: string;
      username: string;
      password_hash: string;
      name: string;
      roles: string[];
      status: UserStatus;
      failed_password_attempts: number;
      locked_until: Date | null;
      last_failed_password_at: Date | null;
    }>(
      `select
         id,
         username,
         password_hash,
         name,
         roles,
         status,
         failed_password_attempts,
         locked_until,
         last_failed_password_at
       from identity.users
       where id = $1`,
      [userId],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }

  async resetPasswordFailures(userId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update identity.users
       set failed_password_attempts = 0,
           last_failed_password_at = null
       where id = $1`,
      [userId],
    );
  }

  async registerPasswordFailure(userId: string, nextCount: number, shouldLock: boolean, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update identity.users
       set failed_password_attempts = $2,
           last_failed_password_at = now(),
           status = case when $3 then 'LOCKED' else status end,
           locked_until = case when $3 then timestamp with time zone '2099-12-31T00:00:00Z' else locked_until end
       where id = $1`,
      [userId, nextCount, shouldLock],
    );
  }

  async getActiveMfaSecret(userId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    const result = await executor.query<{
      id: string;
      user_id: string;
      secret_base32: string;
      status: "PENDING" | "ACTIVE" | "REVOKED";
      created_at: Date;
      verified_at: Date | null;
      last_used_at: Date | null;
    }>(
      `select id, user_id, secret_base32, status, created_at, verified_at, last_used_at
       from identity.user_mfa_secrets
       where user_id = $1 and status = 'ACTIVE'
       order by created_at desc
       limit 1`,
      [userId],
    );

    return result.rows[0] ? mapMfaSecret(result.rows[0]) : null;
  }

  async getPendingMfaSecret(userId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    const result = await executor.query<{
      id: string;
      user_id: string;
      secret_base32: string;
      status: "PENDING" | "ACTIVE" | "REVOKED";
      created_at: Date;
      verified_at: Date | null;
      last_used_at: Date | null;
    }>(
      `select id, user_id, secret_base32, status, created_at, verified_at, last_used_at
       from identity.user_mfa_secrets
       where user_id = $1 and status = 'PENDING'
       order by created_at desc
       limit 1`,
      [userId],
    );

    return result.rows[0] ? mapMfaSecret(result.rows[0]) : null;
  }

  async replacePendingMfaSecret(userId: string, secretId: string, secretBase32: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(`update identity.user_mfa_secrets set status = 'REVOKED' where user_id = $1 and status = 'PENDING'`, [
      userId,
    ]);
    await executor.query(
      `insert into identity.user_mfa_secrets (
         id,
         user_id,
         secret_base32,
         status,
         created_at,
         verified_at,
         last_used_at
       ) values ($1, $2, $3, 'PENDING', now(), null, null)`,
      [secretId, userId, secretBase32],
    );
  }

  async activateMfaSecret(userId: string, secretId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update identity.user_mfa_secrets
       set status = case when id = $2 then 'ACTIVE' else 'REVOKED' end,
           verified_at = case when id = $2 then now() else verified_at end
       where user_id = $1 and status in ('PENDING', 'ACTIVE')`,
      [userId, secretId],
    );
  }

  async touchActiveMfaSecret(secretId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(`update identity.user_mfa_secrets set last_used_at = now() where id = $1`, [secretId]);
  }
}

export const userService = new UserService();
