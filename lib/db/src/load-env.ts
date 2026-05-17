import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import {
  ensureSqliteDatabaseFile,
  getDatabaseConfig,
  isLibsqlUrl,
  resolveDatabaseUrl,
  workspaceRoot,
} from "./database-url.js";

for (const envPath of [
  path.join(workspaceRoot, ".env"),
  path.join(workspaceRoot, ".env.local"),
]) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
  }
}

if (!isLibsqlUrl(getDatabaseConfig())) {
  ensureSqliteDatabaseFile();
  process.env.DATABASE_URL = resolveDatabaseUrl();
}
