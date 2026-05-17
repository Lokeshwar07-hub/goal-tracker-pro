import { createClient } from "@libsql/client";
import Database from "better-sqlite3";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema/index.js";
import {
  ensureSqliteDatabaseFile,
  getDatabaseConfig,
  isLibsqlUrl,
} from "./database-url.js";

let sqliteDb: Database.Database | null = null;
let libsqlClient: ReturnType<typeof createClient> | null = null;

function createDatabase() {
  const config = getDatabaseConfig();

  if (isLibsqlUrl(config)) {
    libsqlClient = createClient({
      url: config,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return drizzleLibsql(libsqlClient, { schema });
  }

  const filePath = ensureSqliteDatabaseFile();
  sqliteDb = new Database(filePath);
  sqliteDb.pragma("journal_mode = WAL");
  sqliteDb.pragma("foreign_keys = ON");
  return drizzleSqlite(sqliteDb, { schema });
}

export const db = createDatabase();

export function closeDb(): void {
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }
  if (libsqlClient) {
    libsqlClient.close();
    libsqlClient = null;
  }
}
