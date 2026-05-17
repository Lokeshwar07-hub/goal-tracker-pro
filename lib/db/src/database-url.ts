import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
export const workspaceRoot = path.resolve(moduleDir, "../../..");

const defaultRelativePath = path.join("data", "atomquest.db");

/** Absolute filesystem path to the SQLite database file. */
export function getDefaultSqliteFilePath(): string {
  return path.join(workspaceRoot, defaultRelativePath);
}

function normalizeEnvDatabaseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("libsql://")) {
    return trimmed;
  }

  let filePath = trimmed;
  if (filePath.startsWith("file:")) {
    filePath = filePath.slice("file:".length);
    // file:///C:/... → C:/...
    if (filePath.startsWith("//")) {
      filePath = filePath.slice(2);
    }
  }

  filePath = decodeURIComponent(filePath);

  if (!path.isAbsolute(filePath)) {
    filePath = path.resolve(workspaceRoot, filePath);
  }

  return path.normalize(filePath);
}

/** Raw config: libsql URL or absolute SQLite file path. */
export function getDatabaseConfig(): string {
  const fromEnv = process.env.DATABASE_URL?.trim();
  if (!fromEnv) {
    return getDefaultSqliteFilePath();
  }
  return normalizeEnvDatabaseUrl(fromEnv);
}

export function isLibsqlUrl(config: string): boolean {
  return config.startsWith("libsql://");
}

/** Absolute SQLite path (throws if config is remote libsql). */
export function resolveSqliteFilePath(): string {
  const config = getDatabaseConfig();
  if (isLibsqlUrl(config)) {
    throw new Error("resolveSqliteFilePath() called with a libsql:// URL");
  }
  return config;
}

/** URL for drizzle-kit (local file or remote libsql). */
export function resolveDatabaseUrl(): string {
  const config = getDatabaseConfig();
  if (isLibsqlUrl(config)) {
    return config;
  }
  const posixPath = resolveSqliteFilePath().replace(/\\/g, "/");
  return `file:${posixPath}`;
}

export function ensureDatabaseDirectory(filePath: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

/**
 * Ensures the data directory exists and the SQLite file can be opened.
 * Creates an empty database file when missing.
 */
export function ensureSqliteDatabaseFile(): string {
  const filePath = resolveSqliteFilePath();
  ensureDatabaseDirectory(filePath);

  if (!existsSync(filePath)) {
    const sqlite = new Database(filePath);
    sqlite.close();
  }

  return filePath;
}
