import { Router } from "express";
import { db, auditLogsTable, usersTable, goalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { ListAuditLogsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", requireAuth, requireRole("manager", "admin"), async (req, res) => {
  const parsed = ListAuditLogsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let all = await db.select().from(auditLogsTable);

  if (params.userId) all = all.filter((l) => l.userId === Number(params.userId));
  if (params.goalId) all = all.filter((l) => l.goalId === Number(params.goalId));
  if (params.action) all = all.filter((l) => l.action === params.action);
  if (params.from) all = all.filter((l) => new Date(l.timestamp) >= new Date(params.from!));
  if (params.to) all = all.filter((l) => new Date(l.timestamp) <= new Date(params.to!));

  // Sort newest first
  all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Enrich with user names and goal titles
  const enriched = await Promise.all(
    all.map(async (log) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, log.userId)).limit(1);
      let goalTitle: string | null = null;
      if (log.goalId) {
        const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, log.goalId)).limit(1);
        goalTitle = goal?.goalTitle ?? null;
      }
      return { ...log, userName: user?.name ?? null, goalTitle };
    })
  );

  res.json(enriched);
});

export default router;
