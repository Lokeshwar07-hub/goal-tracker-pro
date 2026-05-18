// @ts-nocheck
import { Router } from "express";
import { db, sharedGoalsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import {
  CreateSharedGoalBody,
  GetSharedGoalParams,
  UpdateSharedGoalParams,
  UpdateSharedGoalBody,
} from "@workspace/api-zod";

const router = Router();

async function formatSharedGoal(sg: typeof sharedGoalsTable.$inferSelect) {
  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, sg.primaryOwnerId)).limit(1);
  const ids = (sg.linkedEmployeeIds as number[]) || [];
  const linked = ids.length > 0
    ? await db.select().from(usersTable).where(eq(usersTable.id, ids[0]))
    : [];
  const allLinked = await Promise.all(ids.map(async (id) => {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return u?.name ?? String(id);
  }));

  return {
    ...sg,
    primaryOwnerName: owner?.name ?? null,
    linkedEmployeeNames: allLinked,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const all = await db.select().from(sharedGoalsTable);
  const formatted = await Promise.all(all.map(formatSharedGoal));
  res.json(formatted);
});

router.post("/", requireAuth, requireRole("manager", "admin"), async (req, res) => {
  const parsed = CreateSharedGoalBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const d = parsed.data;

  const [sg] = await db.insert(sharedGoalsTable).values({
    primaryOwnerId: d.primaryOwnerId,
    goalTitle: d.goalTitle,
    goalDescription: d.goalDescription,
    thrustArea: d.thrustArea ?? "",
    target: d.target,
    unitOfMeasurement: d.unitOfMeasurement,
    linkedEmployeeIds: d.linkedEmployeeIds,
    quarter: d.quarter ?? null,
  }).returning();

  res.status(201).json(await formatSharedGoal(sg));
});

router.get("/:id", requireAuth, async (req, res) => {
  const parsed = GetSharedGoalParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [sg] = await db.select().from(sharedGoalsTable).where(eq(sharedGoalsTable.id, parsed.data.id)).limit(1);
  if (!sg) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatSharedGoal(sg));
});

router.patch("/:id", requireAuth, requireRole("manager", "admin"), async (req, res) => {
  const params = UpdateSharedGoalParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = UpdateSharedGoalBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const updates: Partial<typeof sharedGoalsTable.$inferInsert> = {};
  if (body.data.achievement !== undefined) updates.achievement = body.data.achievement;
  if (body.data.linkedEmployeeIds !== undefined) updates.linkedEmployeeIds = body.data.linkedEmployeeIds;

  const [sg] = await db.update(sharedGoalsTable).set(updates).where(eq(sharedGoalsTable.id, params.data.id)).returning();
  if (!sg) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await formatSharedGoal(sg));
});

export default router;
