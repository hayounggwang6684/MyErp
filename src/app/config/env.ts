const DEFAULT_PORT = 3000;

function parsePort(value: string | undefined): number {
  if (!value) {
    return DEFAULT_PORT;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
}

export const env = {
  port: parsePort(process.env.PORT),
  sessionSecret: process.env.SESSION_SECRET || "change-me-for-production",
  databaseUrl: process.env.DATABASE_URL || "",
} as const;
