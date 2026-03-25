import crypto from "node:crypto";
import type { DbExecutor } from "../../shared/infrastructure/persistence/postgres.js";
import { query } from "../../shared/infrastructure/persistence/postgres.js";

export type AuthEventType =
  | "LOGIN_SUCCEEDED"
  | "LOGIN_FAILED"
  | "ACCOUNT_LOCKED"
  | "MFA_CHALLENGE_CREATED"
  | "MFA_VERIFIED"
  | "MFA_ENROLLMENT_STARTED"
  | "MFA_ENROLLMENT_VERIFIED"
  | "LOGOUT"
  | "ADMIN_ACCOUNT_UNLOCKED"
  | "ADMIN_MFA_RESET"
  | "ADMIN_ROLES_UPDATED"
  | "ADMIN_USER_STATUS_UPDATED"
  | "ADMIN_EMPLOYEE_UPDATED";

export class AuditService {
  async recordAuthEvent(input: {
    userId?: string | null;
    usernameSnapshot?: string | null;
    eventType: AuthEventType;
    accessScope: string;
    deviceId: string;
    clientIp: string;
    certificateFingerprint: string;
    success: boolean;
    reasonCode?: string | null;
    client?: DbExecutor;
  }) {
    const executor: DbExecutor = input.client ?? { query };
    await executor.query(
      `insert into audit.auth_events (
         event_id,
         user_id,
         username_snapshot,
         event_type,
         access_scope,
         device_id,
         client_ip,
         certificate_fingerprint,
         success,
         reason_code,
         created_at
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())`,
      [
        crypto.randomUUID(),
        input.userId || null,
        input.usernameSnapshot || null,
        input.eventType,
        input.accessScope,
        input.deviceId,
        input.clientIp,
        input.certificateFingerprint,
        input.success,
        input.reasonCode || null,
      ],
    );
  }

  async listRecentAuthEvents(
    input:
      | number
      | {
          limit?: number;
          username?: string;
          eventType?: string;
          success?: boolean;
          dateFrom?: string;
          dateTo?: string;
          client?: DbExecutor;
        } = 50,
    client?: DbExecutor,
  ) {
    const options =
      typeof input === "number"
        ? {
            limit: input,
            client,
          }
        : input;
    const executor: DbExecutor = options.client ?? client ?? { query };
    const safeLimit = Math.max(1, Math.min(options.limit ?? 50, 200));
    const values: Array<string | number | boolean> = [];
    const conditions: string[] = [];

    if (options.username) {
      values.push(options.username);
      conditions.push(`username_snapshot = $${values.length}`);
    }

    if (options.eventType) {
      values.push(options.eventType);
      conditions.push(`event_type = $${values.length}`);
    }

    if (typeof options.success === "boolean") {
      values.push(options.success);
      conditions.push(`success = $${values.length}`);
    }

    if (options.dateFrom) {
      values.push(options.dateFrom);
      conditions.push(`created_at >= $${values.length}::timestamptz`);
    }

    if (options.dateTo) {
      values.push(options.dateTo);
      conditions.push(`created_at <= $${values.length}::timestamptz`);
    }

    values.push(safeLimit);
    const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
    const result = await executor.query<{
      event_id: string;
      user_id: string | null;
      username_snapshot: string | null;
      event_type: AuthEventType;
      access_scope: string;
      device_id: string;
      client_ip: string;
      certificate_fingerprint: string;
      success: boolean;
      reason_code: string | null;
      created_at: Date;
    }>(
      `select
         event_id,
         user_id,
         username_snapshot,
         event_type,
         access_scope,
         device_id,
         client_ip,
         certificate_fingerprint,
         success,
         reason_code,
         created_at
       from audit.auth_events
       ${whereClause}
       order by created_at desc
       limit $${values.length}`,
      values,
    );

    return result.rows.map((row) => ({
      eventId: row.event_id,
      userId: row.user_id,
      usernameSnapshot: row.username_snapshot,
      eventType: row.event_type,
      accessScope: row.access_scope,
      deviceId: row.device_id,
      clientIp: row.client_ip,
      certificateFingerprint: row.certificate_fingerprint,
      success: row.success,
      reasonCode: row.reason_code,
      createdAt: row.created_at.toISOString(),
    }));
  }
}

export const auditService = new AuditService();
