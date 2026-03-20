import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { env } from "../../../app/config/env.js";

let pool: Pool | null = null;

export type DbExecutor = {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
};

function createPool() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new Pool({
    connectionString: env.databaseUrl,
  });
}

function getPool() {
  if (!pool) {
    pool = createPool();
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function getPostgresStatus() {
  if (!env.databaseUrl) {
    return {
      enabled: false,
      message: "DATABASE_URL not set. PostgreSQL-backed auth is unavailable.",
    };
  }

  return {
    enabled: true,
    message: "DATABASE_URL configured. PostgreSQL-backed auth is enabled.",
  };
}

export async function connectPostgres() {
  if (!env.databaseUrl) {
    return getPostgresStatus();
  }

  const client = await getPool().connect();
  try {
    await client.query("select 1");
    return getPostgresStatus();
  } finally {
    client.release();
  }
}

export async function closePostgres() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}

export type { PoolClient, QueryResult, QueryResultRow };
