// @ts-nocheck
import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { ListNotificationsQueryParams, MarkNotificationReadParams } from "@workspace/api-zod";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const parsed = ListNotificationsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let all = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, req.user!.id));

  if (params.unreadOnly) {
    all = all.filter((n) => !n.isRead);
  }

  // Sort newest first
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(all);
});

router.post("/:id/read", requireAuth, async (req, res) => {
  const parsed = MarkNotificationReadParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [n] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, parsed.data.id), eq(notificationsTable.userId, req.user!.id)))
    .returning();

  if (!n) { res.status(404).json({ error: "Not found" }); return; }
  res.json(n);
});

router.post("/read-all", requireAuth, async (req, res) => {
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, req.user!.id));
  res.json({ success: true });
});

export default router;
