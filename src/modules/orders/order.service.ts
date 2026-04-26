import crypto from "node:crypto";
import { query, withTransaction, type DbExecutor } from "../../shared/infrastructure/persistence/postgres.js";

type OrderRecord = Record<string, unknown>;
type ProjectRecord = Record<string, unknown>;
let orderSchemaColumnsReady = false;
let orderSchemaColumnsPromise: Promise<void> | null = null;

function text(value: unknown, fallback = "") {
  return String(value ?? fallback).trim();
}

function bool(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "Y" || value === "1" || value === 1;
}

function dateText(value: unknown) {
  const normalized = text(value);
  return normalized || null;
}

function isoDate(value: unknown) {
  if (!value) {
    return "";
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function normalizeOrderType(value: unknown) {
  const normalized = text(value, "공사");
  return normalized === "판매" || normalized === "일반 판매" || normalized === "납품 요청" ? "판매" : "공사";
}

function orderIdFrom(value: unknown) {
  const normalized = text(value);
  return normalized || `OR-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8)}`;
}

function projectIdForOrder(orderId: string) {
  return `PRJ-${orderId.replace(/^OR-/, "")}`;
}

function estimateNoForOrder(orderId: string) {
  return `QT-${orderId.replace(/^OR-/, "")}`;
}

function projectStatusFromOrder(order: OrderRecord) {
  const status = text(order.status);
  if (status === "공사중") {
    return "진행 중";
  }
  if (status === "준공" || status === "청구") {
    return "준공 대기";
  }
  if (status === "완공") {
    return "준공";
  }
  if (status === "발주") {
    return "공사 준비";
  }
  return bool(order.confirmed) ? "수주 확정" : "견적 상태";
}

function parseManagementNumber(value: unknown) {
  const normalized = text(value);
  const match = normalized.match(/^([A-Z]+)-(\d{4})-(\d{3})-([A-Z])$/);
  if (!match) {
    return null;
  }
  return {
    raw: normalized,
    prefix: match[1],
    year: match[2],
    sequence: Number(match[3]),
    suffix: match[4],
  };
}

function managementYearForOrder(order: OrderRecord) {
  return String(order.confirmationDate || order.confirmation_date || order.requestDate || order.request_date || new Date().toISOString()).slice(0, 4);
}

function managementSuffixForOrder(order: OrderRecord) {
  return normalizeOrderType(order.businessType || order.business_type || order.requestType || order.request_type) === "공사" ? "T" : "S";
}

function collectUsedManagementNumbers(orders: OrderRecord[], excludeOrderId = "") {
  const used = new Map<string, { raw: string; year: string; sequence: number; suffix: string; orderId: string }>();
  for (const order of orders) {
    if (!order || text(order.id) === excludeOrderId) {
      continue;
    }
    const parsed = parseManagementNumber(order.managementNumber || order.management_number);
    if (parsed) {
      used.set(parsed.raw, { ...parsed, orderId: text(order.id) });
    }
  }
  return used;
}

function nextManagementNumber({ year, type, orders, excludeOrderId = "" }: { year: string; type: string; orders: OrderRecord[]; excludeOrderId?: string }) {
  let maxSequence = 0;
  for (const order of orders) {
    if (!order || text(order.id) === excludeOrderId) {
      continue;
    }
    const parsed = parseManagementNumber(order.managementNumber || order.management_number);
    if (parsed && parsed.year === String(year) && parsed.suffix === String(type)) {
      maxSequence = Math.max(maxSequence, parsed.sequence);
    }
  }
  return `SH-${year}-${String(maxSequence + 1).padStart(3, "0")}-${type}`;
}

function assignManagementNumber(order: OrderRecord, orders: OrderRecord[]) {
  const current = parseManagementNumber(order.managementNumber || order.management_number);
  const confirmed = bool(order.confirmed);
  if (!confirmed) {
    return current ? current.raw : "확정 후 발급";
  }
  const year = managementYearForOrder(order);
  const suffix = managementSuffixForOrder(order);
  const used = collectUsedManagementNumbers(orders, text(order.id));
  if (current && current.year === year && current.suffix === suffix && !used.has(current.raw)) {
    return current.raw;
  }
  return nextManagementNumber({ year, type: suffix, orders, excludeOrderId: text(order.id) });
}

function repairDuplicateManagementNumbers(orders: OrderRecord[]) {
  const seen = new Set<string>();
  const changed: Array<{ orderId: string; previous: string; next: string }> = [];
  const repaired = orders.map((order) => ({ ...order }));
  for (const order of repaired) {
    const current = text(order.managementNumber || order.management_number);
    const parsed = parseManagementNumber(current);
    if (!parsed) {
      if (!bool(order.confirmed)) {
        continue;
      }
      const nextValue = assignManagementNumber(order, repaired);
      if (nextValue !== current) {
        order.managementNumber = nextValue;
        order.management_number = nextValue;
        changed.push({ orderId: text(order.id), previous: current, next: nextValue });
      }
      continue;
    }
    if (seen.has(parsed.raw)) {
      const nextValue = assignManagementNumber({ ...order, managementNumber: "", management_number: "" }, repaired);
      order.managementNumber = nextValue;
      order.management_number = nextValue;
      changed.push({ orderId: text(order.id), previous: current, next: nextValue });
      const nextParsed = parseManagementNumber(nextValue);
      if (nextParsed) {
        seen.add(nextParsed.raw);
      }
      continue;
    }
    const canonical = assignManagementNumber(order, repaired);
    if (canonical !== current) {
      order.managementNumber = canonical;
      order.management_number = canonical;
      changed.push({ orderId: text(order.id), previous: current, next: canonical });
    }
    const parsedCanonical = parseManagementNumber(order.managementNumber || order.management_number);
    if (parsedCanonical) {
      seen.add(parsedCanonical.raw);
    }
  }
  return { orders: repaired, changed };
}

function isProjectOrder(order: OrderRecord) {
  return (
    !order.deletedAt &&
    !text(order.mergedInto || order.merged_into_order_id) &&
    bool(order.confirmed) &&
    normalizeOrderType(order.businessType || order.business_type || order.requestType || order.request_type) === "공사"
  );
}

function mapOrder(row: Record<string, unknown>): OrderRecord {
  return {
    id: row.id,
    requestDate: isoDate(row.request_date),
    customerId: row.customer_id || "",
    customer: row.customer_name || "",
    shipOwner: row.ship_owner || row.customer_name || "",
    manager: row.manager || "",
    buyerType: row.buyer_type || "국내",
    assetId: row.asset_id || "",
    vessel: row.vessel_name || "",
    equipmentId: row.equipment_id || "",
    equipment: row.equipment_name || "",
    requestChannel: row.request_channel || "이메일",
    requestType: row.request_type || "공사",
    urgent: row.urgent,
    description: row.description || "",
    orderSummary: row.order_summary || row.description || "",
    notes: row.notes || "",
    partsQuote: row.parts_quote,
    repairQuote: row.repair_quote,
    noEstimate: row.no_estimate,
    confirmed: row.confirmed,
    confirmationDate: isoDate(row.confirmation_date),
    confirmationBasis: row.confirmation_basis || "발주서",
    businessType: row.business_type || "공사",
    status: row.status || "견적",
    managementNumber: row.management_number || "확정 후 발급",
    documents: Array.isArray(row.documents_json) ? row.documents_json : [],
    mergeHistory: Array.isArray(row.merge_history_json) ? row.merge_history_json : [],
    mergedOrderRecords: Array.isArray(row.merged_order_records_json) ? row.merged_order_records_json : [],
    mergedInto: row.merged_into_order_id || "",
    mergedAt: row.merged_at instanceof Date ? row.merged_at.toISOString() : row.merged_at || "",
    deletedAt: row.deleted_at instanceof Date ? row.deleted_at.toISOString() : row.deleted_at || "",
  };
}

function mapProject(row: Record<string, unknown>): ProjectRecord {
  return {
    id: row.id,
    sourceOrderId: row.source_order_id || "",
    estimateNo: row.estimate_no || "",
    managementNo: row.management_no || "",
    name: row.project_name || "",
    customer: row.customer_name || "",
    vessel: row.vessel_name || "",
    equipment: row.equipment_name || "",
    status: row.status || "견적 상태",
    manager: row.manager || "",
    quoteStatus: row.quote_status || "견적 작성",
    quoteDate: isoDate(row.quote_date),
    quoteAmount: Number(row.quote_amount || 0),
    quoteManager: row.quote_manager || "",
    quoteDocumentId: row.quote_document_id || "",
    quoteDocumentName: row.quote_document_name || "",
    partsQuote: row.parts_quote,
    repairQuote: row.repair_quote,
    quoteNote: row.quote_note || "",
    orderConfirmed: row.order_confirmed,
    plannedStart: isoDate(row.planned_start),
    plannedEnd: isoDate(row.planned_end),
    folderCreated: row.folder_created,
    folderCreatedAt: isoDate(row.folder_created_at),
    folderPath: row.folder_path || "",
    checklist: Array.isArray(row.checklist_json) ? row.checklist_json : [],
    progressLogs: Array.isArray(row.progress_logs_json) ? row.progress_logs_json : [],
    reports: Array.isArray(row.reports_json) ? row.reports_json : [],
    externalRequests: Array.isArray(row.external_requests_json) ? row.external_requests_json : [],
    completion: row.completion_json && typeof row.completion_json === "object" ? row.completion_json : {},
    orderArchived: row.order_archived,
    archivedReason: row.archived_reason || "",
    mergedIntoOrderId: row.merged_into_order_id || "",
  };
}

export class OrderService {
  private async ensureOrderSchemaColumns() {
    if (orderSchemaColumnsReady) {
      return;
    }

    if (!orderSchemaColumnsPromise) {
      orderSchemaColumnsPromise = (async () => {
        await query(`alter table sales.orders add column if not exists order_summary text null`);
        await query(`alter table sales.orders add column if not exists notes text null`);
        await query(`alter table sales.orders add column if not exists deleted_at timestamptz null`);
        await query(`alter table sales.orders add column if not exists deleted_by text null`);
      })()
        .then(() => {
          orderSchemaColumnsReady = true;
        })
        .finally(() => {
          orderSchemaColumnsPromise = null;
        });
    }

    await orderSchemaColumnsPromise;
  }

  async listOrders() {
    await this.ensureOrderSchemaColumns();
    return withTransaction(async (client) => {
      await this.repairDuplicateManagementNumbersInDb(client);
      return this.listOrdersWith(client);
    });
  }

  async listProjects() {
    await this.ensureOrderSchemaColumns();
    return withTransaction(async (client) => {
      await this.repairDuplicateManagementNumbersInDb(client);
      return this.listProjectsWith(client);
    });
  }

  async saveOrder(input: OrderRecord, actorUserId: string) {
    await this.ensureOrderSchemaColumns();
    return withTransaction(async (client) => {
      const savedOrder = await this.upsertOrder(input, actorUserId, client);
      const project = await this.syncProjectForOrder(savedOrder, actorUserId, client);
      await this.repairDuplicateManagementNumbersInDb(client);
      const orderRow = await client.query(`select * from sales.orders where id = $1`, [text(savedOrder.id)]);
      const order = orderRow.rows[0] ? mapOrder(orderRow.rows[0]) : savedOrder;
      return {
        order,
        project,
        orders: await this.listOrdersWith(client),
        projects: await this.listProjectsWith(client),
      };
    });
  }

  async mergeOrders(input: { keepOrderId?: string; mergeOrderIds?: string[]; documents?: unknown[]; mergeHistory?: unknown; mergedOrderRecords?: unknown[] }, actorUserId: string) {
    const keepOrderId = text(input.keepOrderId);
    const mergeOrderIds = (input.mergeOrderIds || []).map((id) => text(id)).filter(Boolean);
    if (!keepOrderId || !mergeOrderIds.length) {
      throw new Error("MERGE_ORDER_REQUIRED");
    }

    return withTransaction(async (client) => {
      await client.query(
        `update sales.orders
         set documents_json = $2::jsonb,
             merge_history_json = coalesce($3::jsonb, '[]'::jsonb),
             merged_order_records_json = coalesce($4::jsonb, '[]'::jsonb),
             updated_at = now(),
             updated_by = $5
         where id = $1`,
        [
          keepOrderId,
          JSON.stringify(input.documents || []),
          JSON.stringify(Array.isArray(input.mergeHistory) ? input.mergeHistory : input.mergeHistory ? [input.mergeHistory] : []),
          JSON.stringify(input.mergedOrderRecords || []),
          actorUserId,
        ],
      );

      await client.query(
        `update sales.orders
         set merged_into_order_id = $2,
             merged_at = now(),
             merged_by = $3,
             updated_at = now(),
             updated_by = $3
         where id = any($1::text[])`,
        [mergeOrderIds, keepOrderId, actorUserId],
      );

      await client.query(
        `update project.projects
         set order_archived = true,
             archived_reason = '주문 병합',
             merged_into_order_id = $2,
             updated_at = now(),
             updated_by = $3
         where source_order_id = any($1::text[])`,
        [mergeOrderIds, keepOrderId, actorUserId],
      );

      const keepBeforeRepairResult = await client.query(`select * from sales.orders where id = $1`, [keepOrderId]);
      const keepOrderBeforeRepair = keepBeforeRepairResult.rows[0] ? mapOrder(keepBeforeRepairResult.rows[0]) : null;
      if (keepOrderBeforeRepair) {
        await this.syncProjectForOrder(keepOrderBeforeRepair, actorUserId, client);
      }
      await this.repairDuplicateManagementNumbersInDb(client);
      const keepResult = await client.query(`select * from sales.orders where id = $1`, [keepOrderId]);
      const keepOrder = keepResult.rows[0] ? mapOrder(keepResult.rows[0]) : null;

      return {
        order: keepOrder,
        orders: await this.listOrdersWith(client),
        projects: await this.listProjectsWith(client),
      };
    });
  }

  async deleteOrder(orderId: string, actorUserId: string) {
    const normalizedOrderId = text(orderId);
    if (!normalizedOrderId) {
      throw new Error("ORDER_DELETE_REQUIRED");
    }

    await this.ensureOrderSchemaColumns();
    return withTransaction(async (client) => {
      await client.query(
        `update sales.orders
         set deleted_at = now(),
             deleted_by = $2,
             updated_at = now(),
             updated_by = $2
         where id = $1`,
        [normalizedOrderId, actorUserId],
      );

      await client.query(
        `update project.projects
         set order_archived = true,
             archived_reason = '주문 삭제',
             updated_at = now(),
             updated_by = $2
         where source_order_id = $1`,
        [normalizedOrderId, actorUserId],
      );

      await this.repairDuplicateManagementNumbersInDb(client);

      return {
        orders: await this.listOrdersWith(client),
        projects: await this.listProjectsWith(client),
      };
    });
  }

  private async listOrdersWith(client: DbExecutor) {
    const result = await client.query(`select * from sales.orders where deleted_at is null order by request_date desc, updated_at desc`);
    return result.rows.map(mapOrder);
  }

  private async listProjectsWith(client: DbExecutor) {
    const result = await client.query(`
      select p.*
      from project.projects p
      join sales.orders o on o.id = p.source_order_id
      where p.order_archived = false
        and o.deleted_at is null
        and o.merged_into_order_id is null
        and o.confirmed = true
        and o.business_type = '공사'
      order by p.quote_date desc nulls last, p.updated_at desc
    `);
    return result.rows.map(mapProject);
  }

  private async upsertOrder(input: OrderRecord, actorUserId: string, client: DbExecutor) {
    const orderId = orderIdFrom(input.id);
    const requestType = normalizeOrderType(input.requestType || input.request_type || input.businessType || input.business_type);
    const existingRows = (await client.query(`select * from sales.orders order by request_date desc, updated_at desc`)).rows.map(mapOrder);
    const candidateOrder = {
      ...input,
      id: orderId,
      requestType,
      businessType: requestType,
      confirmed: bool(input.confirmed),
      confirmationDate: dateText(input.confirmationDate || input.confirmation_date) || "",
      requestDate: dateText(input.requestDate || input.request_date) || new Date().toISOString().slice(0, 10),
      managementNumber: text(input.managementNumber || input.management_number, "확정 후 발급"),
      mergedInto: "",
    };
    const assignedManagementNumber = assignManagementNumber(candidateOrder, existingRows);
    const result = await client.query(
      `insert into sales.orders (
         id, request_date, customer_id, customer_name, ship_owner, manager, buyer_type, asset_id, vessel_name,
         equipment_id, equipment_name, request_channel, request_type, urgent, description, order_summary, notes, parts_quote,
         repair_quote, no_estimate, confirmed, confirmation_date, confirmation_basis, business_type,
         status, management_number, documents_json, merge_history_json, merged_order_records_json, created_by, updated_by
       )
       values (
         $1, coalesce($2::date, current_date), nullif($3, ''), $4, $5, $6, $7, nullif($8, ''), $9,
         nullif($10, ''), $11, $12, $13, $14, $15, $16, $17,
         $18, $19, $20, $21, $22::date, $23,
         $24, $25, $26, $27::jsonb, $28::jsonb, $29::jsonb, $30, $30
       )
       on conflict (id) do update set
         request_date = excluded.request_date,
         customer_id = excluded.customer_id,
         customer_name = excluded.customer_name,
         ship_owner = excluded.ship_owner,
         manager = excluded.manager,
         buyer_type = excluded.buyer_type,
         asset_id = excluded.asset_id,
         vessel_name = excluded.vessel_name,
         equipment_id = excluded.equipment_id,
         equipment_name = excluded.equipment_name,
         request_channel = excluded.request_channel,
         request_type = excluded.request_type,
         urgent = excluded.urgent,
         description = excluded.description,
         order_summary = excluded.order_summary,
         notes = excluded.notes,
         parts_quote = excluded.parts_quote,
         repair_quote = excluded.repair_quote,
         no_estimate = excluded.no_estimate,
         confirmed = excluded.confirmed,
         confirmation_date = excluded.confirmation_date,
         confirmation_basis = excluded.confirmation_basis,
         business_type = excluded.business_type,
         status = excluded.status,
         management_number = excluded.management_number,
         documents_json = excluded.documents_json,
         merge_history_json = excluded.merge_history_json,
         merged_order_records_json = excluded.merged_order_records_json,
         updated_at = now(),
         updated_by = excluded.updated_by
       returning *`,
      [
        orderId,
        dateText(input.requestDate || input.request_date),
        text(input.customerId || input.customer_id),
        text(input.customer || input.customer_name),
        text(input.shipOwner || input.ship_owner || input.customer || input.customer_name),
        text(input.manager),
        text(input.buyerType || input.buyer_type, "국내"),
        text(input.assetId || input.asset_id),
        text(input.vessel || input.vessel_name),
        text(input.equipmentId || input.equipment_id),
        text(input.equipment || input.equipment_name),
        text(input.requestChannel || input.request_channel, "이메일"),
        requestType,
        bool(input.urgent),
        text(input.description),
        text(input.orderSummary || input.order_summary),
        text(input.notes),
        bool(input.partsQuote || input.parts_quote),
        bool(input.repairQuote || input.repair_quote),
        bool(input.noEstimate || input.no_estimate),
        bool(input.confirmed),
        dateText(input.confirmationDate || input.confirmation_date),
        text(input.confirmationBasis || input.confirmation_basis, "발주서"),
        requestType,
        text(input.status, "견적"),
        assignedManagementNumber,
        JSON.stringify(input.documents || []),
        JSON.stringify(input.mergeHistory || []),
        JSON.stringify(input.mergedOrderRecords || []),
        actorUserId,
      ],
    );
    return mapOrder(result.rows[0]);
  }

  private async repairDuplicateManagementNumbersInDb(client: DbExecutor) {
    const rows = (await client.query(`select * from sales.orders order by request_date asc nulls first, created_at asc nulls first, updated_at asc nulls first, id asc`)).rows.map(mapOrder);
    const repaired = repairDuplicateManagementNumbers(rows);
    if (!repaired.changed.length) {
      return;
    }
    for (const change of repaired.changed) {
      const order = repaired.orders.find((item) => text(item.id) === change.orderId);
      if (!order) {
        continue;
      }
      await client.query(
        `update sales.orders
         set management_number = $2,
             updated_at = now()
         where id = $1`,
        [change.orderId, change.next],
      );
      await client.query(
        `update project.projects
         set management_no = $2,
             folder_path = case when order_confirmed then $3 else folder_path end,
             updated_at = now()
         where source_order_id = $1`,
        [change.orderId, change.next, bool(order.confirmed) ? `projects/${change.next}` : ""],
      );
    }
  }

  private async syncProjectForOrder(order: OrderRecord, actorUserId: string, client: DbExecutor) {
    if (!isProjectOrder(order)) {
      await client.query(
        `update project.projects
         set order_archived = true,
             archived_reason = '주문 공사 대상 해제',
             merged_into_order_id = $2,
             updated_at = now(),
             updated_by = $3
         where source_order_id = $1`,
        [order.id, text(order.mergedInto), actorUserId],
      );
      return null;
    }

    const projectId = projectIdForOrder(text(order.id));
    const managementNo = text(order.managementNumber, "견적 상태");
    const quoteDate = dateText(order.requestDate);
    const result = await client.query(
      `insert into project.projects (
         id, source_order_id, estimate_no, management_no, project_name, customer_name, vessel_name,
         equipment_name, status, manager, quote_status, quote_date, quote_manager, parts_quote,
         repair_quote, quote_note, order_confirmed, planned_start, folder_created, folder_created_at,
         folder_path, checklist_json, progress_logs_json, reports_json, completion_json, order_archived,
         created_by, updated_by
       )
       values (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12::date, $13, $14,
         $15, $16, $17, $18::date, $19, $20::date,
         $21, $22::jsonb, $23::jsonb, $24::jsonb, $25::jsonb, false,
         $26, $26
       )
       on conflict (source_order_id) do update set
         management_no = excluded.management_no,
         project_name = excluded.project_name,
         customer_name = excluded.customer_name,
         vessel_name = excluded.vessel_name,
         equipment_name = excluded.equipment_name,
         status = excluded.status,
         manager = excluded.manager,
         quote_status = excluded.quote_status,
         quote_date = excluded.quote_date,
         quote_manager = excluded.quote_manager,
         parts_quote = excluded.parts_quote,
         repair_quote = excluded.repair_quote,
         quote_note = excluded.quote_note,
         order_confirmed = excluded.order_confirmed,
         planned_start = excluded.planned_start,
         folder_created = excluded.folder_created,
         folder_created_at = excluded.folder_created_at,
         folder_path = excluded.folder_path,
         order_archived = false,
         archived_reason = '',
         merged_into_order_id = '',
         updated_at = now(),
         updated_by = excluded.updated_by
       returning *`,
      [
        projectId,
        order.id,
        estimateNoForOrder(text(order.id)),
        managementNo,
        text(order.description) || `${text(order.vessel)} ${text(order.equipment)} 공사`,
        text(order.customer),
        text(order.vessel),
        text(order.equipment),
        projectStatusFromOrder(order),
        text(order.manager),
        bool(order.confirmed) ? "수주 확정" : "견적 작성",
        quoteDate,
        text(order.manager),
        bool(order.partsQuote),
        bool(order.repairQuote),
        text(order.description),
        bool(order.confirmed),
        dateText(order.confirmationDate),
        bool(order.confirmed),
        bool(order.confirmed) ? quoteDate : null,
        bool(order.confirmed) ? `projects/${managementNo}` : "",
        JSON.stringify([
          {
            id: `${projectId}-CHK-001`,
            checked: false,
            item: "작업 범위 확인",
            standard: "주문/견적 기준 작업 범위 확인",
            status: "미시작",
            manager: text(order.manager),
            completedAt: "",
            note: "",
          },
        ]),
        JSON.stringify([
          {
            date: text(order.requestDate),
            status: projectStatusFromOrder(order),
            manager: text(order.manager),
            content: "주문관리 수주 확정으로 공사 항목 생성.",
            nextAction: text(order.confirmationDate) ? "공사 준비" : "공사 예정일 등록",
            attachment: "",
          },
        ]),
        JSON.stringify([
          { type: "서비스 레포트", required: true, status: "작성 필요", writer: "", date: "", documentId: "", file: "", note: "" },
          { type: "계측 및 시험 성적서", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
          { type: "점검 레포트", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
          { type: "소견서", required: false, status: "요청 없음", writer: "", date: "", documentId: "", file: "", note: "" },
        ]),
        JSON.stringify({ specCreated: false, sealed: false, receivedDate: "", documentId: "", storageLocation: "", completedAt: "", note: "", status: "작성 전" }),
        actorUserId,
      ],
    );
    return mapProject(result.rows[0]);
  }
}

export const orderService = new OrderService();
