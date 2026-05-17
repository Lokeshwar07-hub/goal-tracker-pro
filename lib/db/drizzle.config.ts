import "./src/load-env.ts";
import { defineConfig } from "drizzle-kit";
import { resolveDatabaseUrl } from "./src/database-url.ts";

export default defineConfig({
  schema: [
    "./src/schema/users.ts",
    "./src/schema/goals.ts",
    "./src/schema/shared_goals.ts",
    "./src/schema/quarters.ts",
    "./src/schema/notifications.ts",
    "./src/schema/audit_logs.ts",
    "./src/schema/departments.ts",
    "./src/schema/escalations.ts",
  ],
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    // Absolute file: URL — required on Windows (no relative ./data paths)
    url: resolveDatabaseUrl(),
  },
});
