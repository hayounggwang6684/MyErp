import { bootstrapApp } from "./main.js";
import { env } from "./config/env.js";
import { getPostgresStatus } from "../shared/infrastructure/persistence/postgres.js";

const app = bootstrapApp();
const postgresStatus = getPostgresStatus();
const host = env.host;

app.listen(env.port, host, () => {
  console.log(`ERP demo server listening on http://${host}:${env.port}`);
  if (host === "0.0.0.0") {
    console.log("Windows test access URL: http://192.168.0.9:3000");
  }
  if (host === "127.0.0.1") {
    console.log("Cloudflare Tunnel public URL: https://sunjincmk-dev.site");
  }
  console.log(`PostgreSQL status: ${postgresStatus.message}`);
});
