import "./load-env.js";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import {
  ensureSqliteDatabaseFile,
  getDatabaseConfig,
  isLibsqlUrl,
} from "./database-url.js";

const config = getDatabaseConfig();

try {
  if (isLibsqlUrl(config)) {
    const client = createClient({
      url: config,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    await client.execute("SELECT 1");
    client.close();
    console.log("Database OK (Turso / libSQL remote)");
  } else {
    const filePath = ensureSqliteDatabaseFile();
    const sqlite = new Database(filePath);
    sqlite.prepare("SELECT 1").get();
    sqlite.close();
    console.log(`Database OK (${filePath})`);
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Database error: ${message}`);
  process.exit(1);
}
