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
  | "LOGOUT";

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
}

export const auditService = new AuditService();
