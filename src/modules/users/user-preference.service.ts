import { query } from "../../shared/infrastructure/persistence/postgres.js";

export type DashboardDensity = "COMFORTABLE" | "COMPACT";
export type PreferenceAccessScope = "AUTO" | "INTERNAL" | "EXTERNAL";

export type UserPreference = {
  userId: string;
  defaultDashboardTab: string;
  dashboardDensity: DashboardDensity;
  showRememberedUsername: boolean;
  testAccessScope: PreferenceAccessScope;
  assetPhysicalColumnWidths?: Record<string, number>;
  updatedAt: string;
};

const DEFAULT_PREFERENCE = {
  defaultDashboardTab: "orders",
  dashboardDensity: "COMFORTABLE" as DashboardDensity,
  showRememberedUsername: true,
  testAccessScope: "AUTO" as PreferenceAccessScope,
  assetPhysicalColumnWidths: {} as Record<string, number>,
};

function sanitizeDashboardTab(value: unknown) {
  const allowed = new Set(["customers", "orders", "work", "assets", "inventory", "staff", "settings"]);
  const candidate = String(value || DEFAULT_PREFERENCE.defaultDashboardTab);
  return allowed.has(candidate) ? candidate : DEFAULT_PREFERENCE.defaultDashboardTab;
}

function sanitizeDensity(value: unknown) {
  return value === "COMPACT" ? "COMPACT" : "COMFORTABLE";
}

function sanitizeAccessScope(value: unknown) {
  return value === "INTERNAL" || value === "EXTERNAL" ? value : "AUTO";
}

function mapRow(row: {
  user_id: string;
  default_dashboard_tab: string;
  dashboard_density: DashboardDensity;
  show_remembered_username: boolean;
  test_access_scope: PreferenceAccessScope;
  asset_physical_column_widths?: Record<string, number> | null;
  updated_at: Date;
}): UserPreference {
  return {
    userId: row.user_id,
    defaultDashboardTab: row.default_dashboard_tab,
    dashboardDensity: row.dashboard_density,
    showRememberedUsername: row.show_remembered_username,
    testAccessScope: row.test_access_scope,
    assetPhysicalColumnWidths: typeof row.asset_physical_column_widths === "object" && row.asset_physical_column_widths ? row.asset_physical_column_widths : {},
    updatedAt: row.updated_at.toISOString(),
  };
}

function sanitizeColumnWidths(value: unknown) {
  if (!value || typeof value !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, width]) => ({ key, width: Number(width || 0) }))
      .filter((entry) => Number.isFinite(entry.width) && entry.width >= 60 && entry.width <= 1200)
      .map((entry) => [entry.key, entry.width]),
  );
}

export class UserPreferenceService {
  private async ensureColumns() {
    await query(`alter table identity.user_preferences add column if not exists asset_physical_column_widths jsonb not null default '{}'::jsonb`);
  }

  async getOrCreate(userId: string) {
    await this.ensureColumns();
    const existing = await query<{
      user_id: string;
      default_dashboard_tab: string;
      dashboard_density: DashboardDensity;
      show_remembered_username: boolean;
      test_access_scope: PreferenceAccessScope;
      asset_physical_column_widths?: Record<string, number> | null;
      updated_at: Date;
    }>(
      `select user_id,
              default_dashboard_tab,
              dashboard_density,
              show_remembered_username,
              test_access_scope,
              asset_physical_column_widths,
              updated_at
         from identity.user_preferences
        where user_id = $1`,
      [userId],
    );

    if (existing.rows[0]) {
      return mapRow(existing.rows[0]);
    }

    const inserted = await query<{
      user_id: string;
      default_dashboard_tab: string;
      dashboard_density: DashboardDensity;
      show_remembered_username: boolean;
      test_access_scope: PreferenceAccessScope;
      asset_physical_column_widths?: Record<string, number> | null;
      updated_at: Date;
    }>(
      `insert into identity.user_preferences (
         user_id,
         default_dashboard_tab,
         dashboard_density,
         show_remembered_username,
         test_access_scope,
         asset_physical_column_widths,
         updated_at
       ) values ($1, $2, $3, $4, $5, $6::jsonb, now())
       returning user_id,
                 default_dashboard_tab,
                 dashboard_density,
                 show_remembered_username,
                 test_access_scope,
                 asset_physical_column_widths,
                 updated_at`,
      [
        userId,
        DEFAULT_PREFERENCE.defaultDashboardTab,
        DEFAULT_PREFERENCE.dashboardDensity,
        DEFAULT_PREFERENCE.showRememberedUsername,
        DEFAULT_PREFERENCE.testAccessScope,
        JSON.stringify(DEFAULT_PREFERENCE.assetPhysicalColumnWidths),
      ],
    );

    return mapRow(inserted.rows[0]);
  }

  async update(userId: string, input: Partial<UserPreference>) {
    await this.ensureColumns();
    const updated = await query<{
      user_id: string;
      default_dashboard_tab: string;
      dashboard_density: DashboardDensity;
      show_remembered_username: boolean;
      test_access_scope: PreferenceAccessScope;
      asset_physical_column_widths?: Record<string, number> | null;
      updated_at: Date;
    }>(
      `insert into identity.user_preferences (
         user_id,
         default_dashboard_tab,
         dashboard_density,
         show_remembered_username,
         test_access_scope,
         asset_physical_column_widths,
         updated_at
       ) values ($1, $2, $3, $4, $5, $6::jsonb, now())
       on conflict (user_id) do update
          set default_dashboard_tab = excluded.default_dashboard_tab,
              dashboard_density = excluded.dashboard_density,
              show_remembered_username = excluded.show_remembered_username,
              test_access_scope = excluded.test_access_scope,
              asset_physical_column_widths = excluded.asset_physical_column_widths,
              updated_at = now()
       returning user_id,
                 default_dashboard_tab,
                 dashboard_density,
                 show_remembered_username,
                 test_access_scope,
                 asset_physical_column_widths,
                 updated_at`,
      [
        userId,
        sanitizeDashboardTab(input.defaultDashboardTab),
        sanitizeDensity(input.dashboardDensity),
        Boolean(input.showRememberedUsername),
        sanitizeAccessScope(input.testAccessScope),
        JSON.stringify(sanitizeColumnWidths(input.assetPhysicalColumnWidths)),
      ],
    );

    return mapRow(updated.rows[0]);
  }
}

export const userPreferenceService = new UserPreferenceService();
