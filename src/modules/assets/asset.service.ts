import crypto from "node:crypto";
import { query, withTransaction, type DbExecutor } from "../../shared/infrastructure/persistence/postgres.js";
import type { AssetHistoryEntry, AssetWorkspacePayload, KnowledgeRecord, PhysicalAssetRecord } from "./asset.types.js";

const ASSET_PREFIX = "SJJH";
const PURPOSE_CODES = ["COM", "CAT", "CUM", "VOL", "DOO", "SCA", "MIT"] as const;

function text(value: unknown, fallback = "") {
  return String(value ?? fallback).trim();
}

function moneyText(value: unknown) {
  const normalized = String(value ?? "").replace(/,/g, "").trim();
  if (!normalized) {
    return "";
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return normalized;
  }
  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(2).replace(/\.00$/, "");
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

function normalizedPurpose(value: unknown) {
  const candidate = text(value, "COM").toUpperCase();
  return PURPOSE_CODES.includes(candidate as (typeof PURPOSE_CODES)[number]) ? candidate : "COM";
}

function parseAssetPurposeFromId(value: unknown) {
  const [, purpose = ""] = text(value).split("-");
  return normalizedPurpose(purpose);
}

function normalizeHistoryInput(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => ({
      date: text((entry as Record<string, unknown>)?.date),
      content: text((entry as Record<string, unknown>)?.content),
      cost: moneyText((entry as Record<string, unknown>)?.cost),
    }))
    .filter((entry) => entry.date || entry.content || entry.cost);
}

function normalizeHashtags(value: unknown) {
  const items = Array.isArray(value) ? value : String(value ?? "").split(/[,\s]+/);
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const item of items) {
    const tag = text(item).replace(/^#+/, "");
    if (!tag || seen.has(tag.toLowerCase())) {
      continue;
    }
    seen.add(tag.toLowerCase());
    tags.push(tag);
  }
  return tags;
}

function isMissingAssetSchemaError(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  return code === "42P01" || code === "3F000";
}

function parseMonthsFromCycle(value: unknown) {
  const cycle = text(value);
  if (!cycle) {
    return 0;
  }
  if (cycle.includes("월간")) {
    return 1;
  }
  if (cycle.includes("분기")) {
    return 3;
  }
  if (cycle.includes("반기")) {
    return 6;
  }
  if (cycle.includes("연간") || cycle.includes("년")) {
    return 12;
  }
  const monthMatch = cycle.match(/(\d+)\s*개월/);
  if (monthMatch) {
    return Number(monthMatch[1]);
  }
  const dayMatch = cycle.match(/(\d+)\s*일/);
  if (dayMatch) {
    return Math.max(1, Math.round(Number(dayMatch[1]) / 30));
  }
  return 0;
}

function addMonthsSafe(dateValue: Date, months: number) {
  const source = new Date(Date.UTC(dateValue.getUTCFullYear(), dateValue.getUTCMonth(), dateValue.getUTCDate()));
  const targetYear = source.getUTCFullYear() + Math.floor((source.getUTCMonth() + months) / 12);
  const targetMonth = (source.getUTCMonth() + months) % 12;
  const safeMonth = targetMonth < 0 ? targetMonth + 12 : targetMonth;
  const lastDay = new Date(Date.UTC(targetYear, safeMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, safeMonth, Math.min(source.getUTCDate(), lastDay)));
}

function latestHistory(history: AssetHistoryEntry[]) {
  return [...history].sort((left, right) => String(left.date || "").localeCompare(String(right.date || ""))).pop() || null;
}

function inferAssetState(auditHistory: AssetHistoryEntry[], auditCycle: string) {
  const latest = latestHistory(auditHistory);
  if (!latest?.date || !auditCycle) {
    return "neutral";
  }
  const months = parseMonthsFromCycle(auditCycle);
  if (!months) {
    return "neutral";
  }
  const nextDue = addMonthsSafe(new Date(`${latest.date}T00:00:00Z`), months);
  const diffDays = Math.ceil((nextDue.getTime() - Date.now()) / 86400000);
  if (diffDays <= 14) {
    return "warn";
  }
  return "ok";
}

function mapPhysicalAsset(row: Record<string, unknown>, auditHistory: AssetHistoryEntry[], repairHistory: AssetHistoryEntry[]): PhysicalAssetRecord {
  const auditCycle = text(row.audit_cycle);
  return {
    id: text(row.id),
    purpose: normalizedPurpose(row.purpose_code),
    name: text(row.asset_name),
    purchaseSource: text(row.purchase_source),
    purchasePrice: moneyText(row.purchase_price),
    auditCycle,
    auditHistory,
    repairHistory,
    state: inferAssetState(auditHistory, auditCycle),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : text(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : text(row.updated_at),
  };
}

function mapKnowledgeRecord(row: Record<string, unknown>): KnowledgeRecord {
  return {
    id: text(row.id),
    category: text(row.category),
    content: text(row.content),
    hashtags: Array.isArray(row.hashtags) ? row.hashtags.map((item) => text(item)).filter(Boolean) : normalizeHashtags(row.hashtags),
    author: text(row.author),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : text(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : text(row.updated_at),
  };
}

function historyEntryFromRow(row: Record<string, unknown>): AssetHistoryEntry {
  return {
    id: text(row.id),
    sequence: Number(row.sequence_no || 0),
    date: isoDate(row.history_date),
    content: text(row.content),
    cost: moneyText(row.cost_amount),
  };
}

export class AssetService {
  private async ensureTables(client: DbExecutor) {
    await client.query(`create schema if not exists asset`);
    await client.query(`
      create table if not exists asset.physical_assets (
        id text primary key,
        purpose_code text not null,
        usage_name text not null default '',
        asset_name text not null default '',
        purchase_source text not null default '',
        purchase_price numeric(14, 2) not null default 0,
        audit_cycle text not null default '',
        deleted_at timestamptz null,
        deleted_by text null references identity.users(id) on delete set null,
        created_at timestamptz not null default now(),
        created_by text null references identity.users(id) on delete set null,
        updated_at timestamptz not null default now(),
        updated_by text null references identity.users(id) on delete set null
      )
    `);
    await client.query(`
      create table if not exists asset.asset_audit_history (
        id text primary key,
        asset_id text not null references asset.physical_assets(id) on delete cascade,
        sequence_no integer not null default 1,
        history_date date null,
        content text not null default '',
        cost_amount numeric(14, 2) not null default 0,
        created_at timestamptz not null default now(),
        created_by text null references identity.users(id) on delete set null,
        updated_at timestamptz not null default now(),
        updated_by text null references identity.users(id) on delete set null
      )
    `);
    await client.query(`
      create table if not exists asset.asset_repair_history (
        id text primary key,
        asset_id text not null references asset.physical_assets(id) on delete cascade,
        sequence_no integer not null default 1,
        history_date date null,
        content text not null default '',
        cost_amount numeric(14, 2) not null default 0,
        created_at timestamptz not null default now(),
        created_by text null references identity.users(id) on delete set null,
        updated_at timestamptz not null default now(),
        updated_by text null references identity.users(id) on delete set null
      )
    `);
    await client.query(`
      create table if not exists asset.knowledge_records (
        id text primary key,
        category text not null default '일반',
        content text not null default '',
        hashtags text[] not null default '{}'::text[],
        author text not null default '',
        deleted_at timestamptz null,
        deleted_by text null references identity.users(id) on delete set null,
        created_at timestamptz not null default now(),
        created_by text null references identity.users(id) on delete set null,
        updated_at timestamptz not null default now(),
        updated_by text null references identity.users(id) on delete set null
      )
    `);
    await client.query(`alter table asset.knowledge_records add column if not exists hashtags text[] not null default '{}'::text[]`);
    await client.query(`create index if not exists idx_asset_physical_assets_deleted on asset.physical_assets(deleted_at, purpose_code, updated_at desc)`);
    await client.query(`create index if not exists idx_asset_audit_history_asset on asset.asset_audit_history(asset_id, sequence_no)`);
    await client.query(`create index if not exists idx_asset_repair_history_asset on asset.asset_repair_history(asset_id, sequence_no)`);
    await client.query(`create index if not exists idx_asset_knowledge_records_deleted on asset.knowledge_records(deleted_at, category, updated_at desc)`);
  }

  private async nextPhysicalAssetId(purposeCode: string, client: DbExecutor) {
    const result = await client.query<{ id: string }>(
      `select id
         from asset.physical_assets
        where purpose_code = $1`,
      [purposeCode],
    );
    const maxSequence = result.rows
      .map((row) => Number(String(row.id).split("-").pop() || 0))
      .filter((value) => Number.isFinite(value))
      .reduce((max, value) => Math.max(max, value), 0);
    return `${ASSET_PREFIX}-${purposeCode}-${String(maxSequence + 1).padStart(3, "0")}`;
  }

  private async resolvePhysicalAssetId(inputId: string, purposeCode: string, client: DbExecutor) {
    if (!inputId) {
      return this.nextPhysicalAssetId(purposeCode, client);
    }
    const result = await client.query<{ id: string; purpose_code: string }>(
      `select id, purpose_code
         from asset.physical_assets
        where id = $1
          and deleted_at is null`,
      [inputId],
    );
    const existing = result.rows[0];
    if (existing && normalizedPurpose(existing.purpose_code) !== purposeCode) {
      return this.nextPhysicalAssetId(purposeCode, client);
    }
    if (!existing && parseAssetPurposeFromId(inputId) !== purposeCode) {
      return this.nextPhysicalAssetId(purposeCode, client);
    }
    return inputId;
  }

  private async nextKnowledgeId(client: DbExecutor) {
    const result = await client.query<{ id: string }>(`select id from asset.knowledge_records`);
    const year = new Date().getFullYear();
    const maxSequence = result.rows
      .map((row) => {
        const match = String(row.id).match(/^KN-(\d{4})-(\d{3})$/);
        return match && Number(match[1]) === year ? Number(match[2]) : 0;
      })
      .reduce((max, value) => Math.max(max, value), 0);
    return `KN-${year}-${String(maxSequence + 1).padStart(3, "0")}`;
  }

  private async loadPhysicalAssetsWith(client: DbExecutor) {
    const [assetsResult, auditResult, repairResult] = await Promise.all([
      client.query<Record<string, unknown>>(
        `select *
           from asset.physical_assets
          where deleted_at is null
          order by updated_at desc, id asc`,
      ),
      client.query<Record<string, unknown>>(
        `select h.*
           from asset.asset_audit_history h
           join asset.physical_assets a
             on a.id = h.asset_id
            and a.deleted_at is null
          order by asset_id asc, sequence_no asc, created_at asc`,
      ),
      client.query<Record<string, unknown>>(
        `select h.*
           from asset.asset_repair_history h
           join asset.physical_assets a
             on a.id = h.asset_id
            and a.deleted_at is null
          order by asset_id asc, sequence_no asc, created_at asc`,
      ),
    ]);
    const auditMap = new Map<string, AssetHistoryEntry[]>();
    for (const row of auditResult.rows) {
      const list = auditMap.get(text(row.asset_id)) || [];
      list.push(historyEntryFromRow(row));
      auditMap.set(text(row.asset_id), list);
    }
    const repairMap = new Map<string, AssetHistoryEntry[]>();
    for (const row of repairResult.rows) {
      const list = repairMap.get(text(row.asset_id)) || [];
      list.push(historyEntryFromRow(row));
      repairMap.set(text(row.asset_id), list);
    }
    return assetsResult.rows.map((row) => mapPhysicalAsset(row, auditMap.get(text(row.id)) || [], repairMap.get(text(row.id)) || []));
  }

  private async loadKnowledgeRecordsWith(client: DbExecutor) {
    const result = await client.query<Record<string, unknown>>(
      `select *
         from asset.knowledge_records
        where deleted_at is null
        order by category asc, updated_at desc, id asc`,
    );
    return result.rows.map(mapKnowledgeRecord);
  }

  private buildSummary(physicalAssets: PhysicalAssetRecord[], knowledgeRecords: KnowledgeRecord[]): AssetWorkspacePayload["summary"] {
    let expiringSoonCount = 0;
    let inspectionDueCount = 0;
    const today = new Date();
    for (const asset of physicalAssets) {
      const latest = latestHistory(asset.auditHistory);
      const months = parseMonthsFromCycle(asset.auditCycle);
      if (!latest?.date || !months) {
        continue;
      }
      const dueDate = addMonthsSafe(new Date(`${latest.date}T00:00:00Z`), months);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
      if (diffDays <= 30) {
        expiringSoonCount += 1;
      }
      if (diffDays <= 7) {
        inspectionDueCount += 1;
      }
    }
    return {
      physicalAssetCount: physicalAssets.length,
      expiringSoonCount,
      inspectionDueCount,
      knowledgeCount: knowledgeRecords.length,
    };
  }

  async getWorkspace(): Promise<AssetWorkspacePayload> {
    try {
      return await this.getWorkspaceWith({ query });
    } catch (error) {
      if (!isMissingAssetSchemaError(error)) {
        throw error;
      }
      return withTransaction(async (client) => {
        await this.ensureTables(client);
        return this.getWorkspaceWith(client);
      });
    }
  }

  async savePhysicalAsset(input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      await this.ensureTables(client);
      const purpose = normalizedPurpose(input.purpose);
      const previousAssetId = text(input.id);
      const assetId = await this.resolvePhysicalAssetId(previousAssetId, purpose, client);
      await client.query(
        `insert into asset.physical_assets (
           id, purpose_code, usage_name, asset_name, purchase_source, purchase_price, audit_cycle, created_by, updated_by
         ) values (
           $1, $2, $3, $4, $5, $6::numeric, $7, $8, $8
         )
         on conflict (id) do update
            set purpose_code = excluded.purpose_code,
                usage_name = excluded.usage_name,
                asset_name = excluded.asset_name,
                purchase_source = excluded.purchase_source,
                purchase_price = excluded.purchase_price,
                audit_cycle = excluded.audit_cycle,
                deleted_at = null,
                deleted_by = null,
                updated_at = now(),
                updated_by = excluded.updated_by`,
        [
          assetId,
          purpose,
          purpose,
          text(input.name),
          text(input.purchaseSource),
          moneyText(input.purchasePrice) || "0",
          text(input.auditCycle),
          actorUserId,
        ],
      );

      await client.query(`delete from asset.asset_audit_history where asset_id = $1`, [assetId]);
      for (const [index, entry] of normalizeHistoryInput(input.auditHistory).entries()) {
        await client.query(
          `insert into asset.asset_audit_history (
             id, asset_id, sequence_no, history_date, content, cost_amount, created_by, updated_by
           ) values ($1, $2, $3, $4::date, $5, $6::numeric, $7, $7)`,
          [
            crypto.randomUUID(),
            assetId,
            index + 1,
            text(entry.date) || null,
            text(entry.content),
            moneyText(entry.cost) || "0",
            actorUserId,
          ],
        );
      }

      await client.query(`delete from asset.asset_repair_history where asset_id = $1`, [assetId]);
      for (const [index, entry] of normalizeHistoryInput(input.repairHistory).entries()) {
        await client.query(
          `insert into asset.asset_repair_history (
             id, asset_id, sequence_no, history_date, content, cost_amount, created_by, updated_by
           ) values ($1, $2, $3, $4::date, $5, $6::numeric, $7, $7)`,
          [
            crypto.randomUUID(),
            assetId,
            index + 1,
            text(entry.date) || null,
            text(entry.content),
            moneyText(entry.cost) || "0",
            actorUserId,
          ],
        );
      }

      if (previousAssetId && previousAssetId !== assetId) {
        await client.query(
          `update asset.physical_assets
              set deleted_at = now(),
                  deleted_by = $2,
                  updated_at = now(),
                  updated_by = $2
            where id = $1`,
          [previousAssetId, actorUserId],
        );
      }

      return this.getWorkspaceWith(client);
    });
  }

  async deletePhysicalAsset(assetId: string, actorUserId: string) {
    return withTransaction(async (client) => {
      await this.ensureTables(client);
      await client.query(
        `update asset.physical_assets
            set deleted_at = now(),
                deleted_by = $2,
                updated_at = now(),
                updated_by = $2
          where id = $1`,
        [text(assetId), actorUserId],
      );
      return this.getWorkspaceWith(client);
    });
  }

  async saveKnowledgeRecord(input: Record<string, unknown>, actorUserId: string) {
    return withTransaction(async (client) => {
      await this.ensureTables(client);
      const recordId = text(input.id) || (await this.nextKnowledgeId(client));
      const hashtags = normalizeHashtags(input.hashtags ?? input.tags ?? input.hashtagText);
      await client.query(
        `insert into asset.knowledge_records (
           id, category, content, hashtags, author, created_by, updated_by
         ) values ($1, $2, $3, $4::text[], $5, $6, $6)
         on conflict (id) do update
            set category = excluded.category,
                content = excluded.content,
                hashtags = excluded.hashtags,
                author = excluded.author,
                deleted_at = null,
                deleted_by = null,
                updated_at = now(),
                updated_by = excluded.updated_by`,
        [recordId, text(input.category, "일반"), text(input.content), hashtags, text(input.author), actorUserId],
      );
      return this.getWorkspaceWith(client);
    });
  }

  async deleteKnowledgeRecord(recordId: string, actorUserId: string) {
    return withTransaction(async (client) => {
      await this.ensureTables(client);
      await client.query(
        `update asset.knowledge_records
            set deleted_at = now(),
                deleted_by = $2,
                updated_at = now(),
                updated_by = $2
          where id = $1`,
        [text(recordId), actorUserId],
      );
      return this.getWorkspaceWith(client);
    });
  }

  private async getWorkspaceWith(client: DbExecutor): Promise<AssetWorkspacePayload> {
    const [physicalAssets, knowledgeRecords] = await Promise.all([this.loadPhysicalAssetsWith(client), this.loadKnowledgeRecordsWith(client)]);
    return {
      summary: this.buildSummary(physicalAssets, knowledgeRecords),
      physicalAssets,
      knowledgeRecords,
    };
  }
}

export const assetService = new AssetService();
