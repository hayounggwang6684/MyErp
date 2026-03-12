import { createApp } from "../shared/infrastructure/http/express-app.js";
import { registerRoutes } from "./routes.js";

export function bootstrapApp() {
  const app = createApp();
  registerRoutes(app);

  return app;
}
