// @ts-nocheck
import { Router } from "express";
import { db, quartersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { CreateQuarterBody, UpdateQuarterParams, UpdateQuarterBody } from "@workspace/api-zod";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const quarters = await db.select().from(quartersTable).orderBy(quartersTable.year, quartersTable.name);
  res.json(quarters);
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateQuarterBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const d = parsed.data;
  const [q] = await db.insert(quartersTable).values({
    name: d.name,
    year: d.year,
    startDate: d.startDate instanceof Date ? d.startDate.toISOString() : d.startDate as string,
    endDate: d.endDate instanceof Date ? d.endDate.toISOString() : d.endDate as string,
    isActive: d.isActive ?? false,
    isGoalSettingOpen: d.isGoalSettingOpen ?? false,
  }).returning();
  res.status(201).json(q);
});

router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const params = UpdateQuarterParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = UpdateQuarterBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const updates: Partial<typeof quartersTable.$inferInsert> = {};
  if (body.data.isActive !== undefined) updates.isActive = body.data.isActive;
  if (body.data.isGoalSettingOpen !== undefined) updates.isGoalSettingOpen = body.data.isGoalSettingOpen;
  if (body.data.adminOverride !== undefined) updates.adminOverride = body.data.adminOverride;

  const [q] = await db.update(quartersTable).set(updates).where(eq(quartersTable.id, params.data.id)).returning();
  if (!q) { res.status(404).json({ error: "Not found" }); return; }
  res.json(q);
});

export default router;
