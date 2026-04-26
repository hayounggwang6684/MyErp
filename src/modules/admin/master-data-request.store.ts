import crypto from "node:crypto";
import { query, withTransaction } from "../../shared/infrastructure/persistence/postgres.js";

export type MasterDataAction = "ADD" | "UPDATE" | "DELETE";

type MasterDataRequestRow = {
  id: string;
  field: string;
  action: MasterDataAction;
  value: string;
  next_value: string;
  reason: string;
  requester_user_id: string | null;
  status: "PENDING" | "APPROVED";
  created_at: Date;
  approved_at: Date | null;
  approved_by: string | null;
};

function mapRequest(row: MasterDataRequestRow) {
  return {
    id: row.id,
    field: row.field,
    action: row.action,
    value: row.value,
    nextValue: row.next_value,
    reason: row.reason,
    requesterUserId: row.requester_user_id,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    approvedAt: row.approved_at?.toISOString() || null,
    approvedBy: row.approved_by,
  };
}

function optionTypeForField(field: string) {
  return field === "manufacturer" ? "manufacturer" : "equipment_type";
}

function requestTargetValue(row: MasterDataRequestRow) {
  return row.action === "ADD" || row.action === "UPDATE" ? row.next_value || row.value : row.value;
}

export async function createMasterDataRequest(input: {
  field: string;
  action: MasterDataAction;
  value: string;
  nextValue: string;
  reason: string;
  requesterUserId: string;
}) {
  const id = crypto.randomUUID();
  const result = await query<MasterDataRequestRow>(
    `insert into master.master_data_requests (
       id, field, action, value, next_value, reason, requester_user_id
     ) values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [id, input.field, input.action, input.value, input.nextValue, input.reason, input.requesterUserId],
  );
  return mapRequest(result.rows[0]);
}

export async function listMasterDataRequests() {
  const result = await query<MasterDataRequestRow>(
    `select *
     from master.master_data_requests
     order by case when status = 'PENDING' then 0 else 1 end, created_at desc
     limit 100`,
  );
  return result.rows.map(mapRequest);
}

export async function approveMasterDataRequest(requestId: string, adminUserId: string) {
  return withTransaction(async (client) => {
    const requestResult = await client.query<MasterDataRequestRow>(
      `select * from master.master_data_requests where id = $1 for update`,
      [requestId],
    );
    const request = requestResult.rows[0];
    if (!request) {
      return null;
    }

    const optionType = optionTypeForField(request.field);
    const targetValue = requestTargetValue(request).trim();

    if (request.action === "DELETE") {
      await client.query(
        `update master.equipment_master_options
         set status = 'DELETED', updated_by = $3, updated_at = now()
         where option_type = $1 and option_value = $2`,
        [optionType, request.value, adminUserId],
      );
    } else if (targetValue) {
      await client.query(
        `insert into master.equipment_master_options (id, option_type, option_value, created_by, updated_by)
         values ($1, $2, $3, $4, $4)
         on conflict (option_type, option_value)
         do update set status = 'ACTIVE', updated_by = $4, updated_at = now()`,
        [crypto.randomUUID(), optionType, targetValue, adminUserId],
      );

      if (request.action === "UPDATE" && request.value && request.value !== targetValue) {
        await client.query(
          `update master.equipment_master_options
           set status = 'DELETED', updated_by = $3, updated_at = now()
           where option_type = $1 and option_value = $2`,
          [optionType, request.value, adminUserId],
        );
      }
    }

    const approvedResult = await client.query<MasterDataRequestRow>(
      `update master.master_data_requests
       set status = 'APPROVED', approved_at = now(), approved_by = $2
       where id = $1
       returning *`,
      [requestId, adminUserId],
    );
    return mapRequest(approvedResult.rows[0]);
  });
}
