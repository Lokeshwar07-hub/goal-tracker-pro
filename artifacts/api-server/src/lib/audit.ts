// @ts-nocheck
import * as dbModule from "@workspace/db";

const db = (dbModule as any).db;
const auditLogsTable =
  (dbModule as any).auditLogsTable ??
  (dbModule as any).audit_logsTable;
  
export async function logAudit(params: {
  userId: number;
  role: string;
  goalId?: number;
  action: string;
  changedField?: string;
  oldValue?: string;
  newValue?: string;
}) {
  try {
    await db.insert(auditLogsTable).values({
      userId: params.userId,
      role: params.role,
      goalId: params.goalId ?? null,
      action: params.action,
      changedField: params.changedField ?? null,
      oldValue: params.oldValue ?? null,
      newValue: params.newValue ?? null,
    });
  } catch {
    // Non-critical — do not throw
  }
}
