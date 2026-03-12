import { env } from "../../../app/config/env.js";

export function getPostgresStatus() {
  if (!env.databaseUrl) {
    return {
      enabled: false,
      message: "DATABASE_URL not set. Running in demo memory mode.",
    };
  }

  return {
    enabled: true,
    message: "DATABASE_URL configured. PostgreSQL integration can be added next.",
  };
}

export async function connectPostgres() {
  return getPostgresStatus();
}
