import type { DbExecutor } from "../../shared/infrastructure/persistence/postgres.js";
import { query } from "../../shared/infrastructure/persistence/postgres.js";
import type { AppUser, EmployeeRecord, UserMfaSecret, UserStatus } from "./user.types.js";

function mapUser(row: {
  id: string;
  employee_id: string | null;
  username: string;
  password_hash: string;
  name: string;
  department: string;
  roles: string[];
  status: UserStatus;
  failed_password_attempts: number;
  locked_until: Date | null;
  last_failed_password_at: Date | null;
}) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    username: row.username,
    passwordHash: row.password_hash,
    name: row.name,
    department: row.department,
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
  async listSecurityOverview(client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    const result = await executor.query<{
      id: string;
      employee_id: string | null;
      username: string;
      name: string;
      department: string;
      roles: string[];
      status: UserStatus;
      failed_password_attempts: number;
      locked_until: Date | null;
      employee_name: string | null;
      employee_job_title: string | null;
      employee_contact: string | null;
      employee_work_status: string | null;
      employee_assigned_work_count: number | null;
      has_active_mfa: boolean;
      active_mfa_verified_at: Date | null;
      active_mfa_last_used_at: Date | null;
    }>(
      `select
         u.id,
         u.employee_id,
         u.username,
         u.name,
         coalesce(e.department, u.department) as department,
         u.roles,
         u.status,
         u.failed_password_attempts,
         u.locked_until,
         e.name as employee_name,
         e.job_title as employee_job_title,
         e.contact as employee_contact,
         e.work_status as employee_work_status,
         e.assigned_work_count as employee_assigned_work_count,
         exists(
           select 1
           from identity.user_mfa_secrets s
           where s.user_id = u.id and s.status = 'ACTIVE'
         ) as has_active_mfa,
         (
           select s.verified_at
           from identity.user_mfa_secrets s
           where s.user_id = u.id and s.status = 'ACTIVE'
           order by s.created_at desc
           limit 1
         ) as active_mfa_verified_at,
         (
           select s.last_used_at
           from identity.user_mfa_secrets s
           where s.user_id = u.id and s.status = 'ACTIVE'
           order by s.created_at desc
           limit 1
         ) as active_mfa_last_used_at
       from identity.users u
       left join identity.employees e on e.id = u.employee_id
       order by u.username`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      employeeId: row.employee_id,
      username: row.username,
      name: row.name,
      department: row.department,
      roles: row.roles,
      status: row.status,
      failedPasswordAttempts: row.failed_password_attempts,
      lockedUntil: row.locked_until?.toISOString() || null,
      hasActiveMfa: row.has_active_mfa,
      activeMfaVerifiedAt: row.active_mfa_verified_at?.toISOString() || null,
      activeMfaLastUsedAt: row.active_mfa_last_used_at?.toISOString() || null,
      employee: {
        name: row.employee_name || row.name,
        jobTitle: row.employee_job_title || "미지정",
        contact: row.employee_contact || "",
        workStatus: row.employee_work_status || "업무 대기",
        assignedWorkCount: row.employee_assigned_work_count ?? 0,
      },
    }));
  }

  async listEmployees(client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    const result = await executor.query<{
      id: string;
      employee_no: string;
      name: string;
      department: string;
      job_title: string;
      contact: string;
      work_status: string;
      assigned_work_count: number;
      linked_username: string | null;
      linked_user_status: UserStatus | null;
    }>(
      `select
         e.id,
         e.employee_no,
         e.name,
         e.department,
         e.job_title,
         e.contact,
         e.work_status,
         e.assigned_work_count,
         u.username as linked_username,
         u.status as linked_user_status
       from identity.employees e
       left join identity.users u on u.employee_id = e.id
       order by e.employee_no`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      employeeNo: row.employee_no,
      name: row.name,
      department: row.department,
      jobTitle: row.job_title,
      contact: row.contact,
      workStatus: row.work_status,
      assignedWorkCount: row.assigned_work_count,
      linkedUsername: row.linked_username,
      linkedUserStatus: row.linked_user_status,
    } satisfies EmployeeRecord));
  }

  async findByUsername(username: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    const result = await executor.query<{
      id: string;
      employee_id: string | null;
      username: string;
      password_hash: string;
      name: string;
      department: string;
      roles: string[];
      status: UserStatus;
      failed_password_attempts: number;
      locked_until: Date | null;
      last_failed_password_at: Date | null;
    }>(
      `select
         id,
         employee_id,
         username,
         password_hash,
         name,
         department,
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
      employee_id: string | null;
      username: string;
      password_hash: string;
      name: string;
      department: string;
      roles: string[];
      status: UserStatus;
      failed_password_attempts: number;
      locked_until: Date | null;
      last_failed_password_at: Date | null;
    }>(
      `select
         id,
         employee_id,
         username,
         password_hash,
         name,
         department,
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

  async updateEmployee(
    employeeId: string,
    input: {
      department?: string;
      jobTitle?: string;
      contact?: string;
      workStatus?: string;
      assignedWorkCount?: number;
    },
    client?: DbExecutor,
  ) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update identity.employees
       set department = coalesce($2, department),
           job_title = coalesce($3, job_title),
           contact = coalesce($4, contact),
           work_status = coalesce($5, work_status),
           assigned_work_count = coalesce($6, assigned_work_count),
           updated_at = now()
       where id = $1`,
      [
        employeeId,
        input.department ?? null,
        input.jobTitle ?? null,
        input.contact ?? null,
        input.workStatus ?? null,
        input.assignedWorkCount ?? null,
      ],
    );
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

  async unlockAccount(userId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update identity.users
       set status = 'ACTIVE',
           failed_password_attempts = 0,
           locked_until = null,
           last_failed_password_at = null
       where id = $1`,
      [userId],
    );
  }

  async updateRoles(userId: string, roles: string[], client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update identity.users
       set roles = $2,
           updated_at = now()
       where id = $1`,
      [userId, roles],
    );
  }

  async updateStatus(userId: string, status: Extract<UserStatus, "ACTIVE" | "INACTIVE">, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update identity.users
       set status = $2,
           updated_at = now()
       where id = $1`,
      [userId, status],
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

  async revokeAllMfaSecrets(userId: string, client?: DbExecutor) {
    const executor: DbExecutor = client ?? { query };
    await executor.query(
      `update identity.user_mfa_secrets
       set status = 'REVOKED'
       where user_id = $1
         and status in ('PENDING', 'ACTIVE')`,
      [userId],
    );
  }
}

export const userService = new UserService();
