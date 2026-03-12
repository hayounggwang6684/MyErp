import { bootstrapApp } from "./main.js";
import { env } from "./config/env.js";
import { getPostgresStatus } from "../shared/infrastructure/persistence/postgres.js";

const app = bootstrapApp();
const postgresStatus = getPostgresStatus();
const host = "127.0.0.1";

app.listen(env.port, host, () => {
  console.log(`ERP demo server listening on http://${host}:${env.port}`);
  console.log(`PostgreSQL status: ${postgresStatus.message}`);
});
