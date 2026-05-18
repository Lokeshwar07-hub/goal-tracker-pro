// @ts-nocheck
import { Router } from "express";
import { db, goalsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { logAudit } from "../lib/audit.js";
import { createNotification } from "../lib/notify.js";
import {
  ListGoalsQueryParams,
  CreateGoalBody,
  GetGoalParams,
  UpdateGoalParams,
  UpdateGoalBody,
  DeleteGoalParams,
  SubmitGoalParams,
  ApproveGoalParams,
  ApproveGoalBody,
  RejectGoalParams,
  RejectGoalBody,
  ReturnGoalParams,
  ReturnGoalBody,
  UnlockGoalParams,
  AddQuarterlyUpdateParams,
  AddQuarterlyUpdateBody,
  AddGoalCommentParams,
  AddGoalCommentBody,
} from "@workspace/api-zod";

const router = Router();

function computeProgress(goal: {
  unitOfMeasurement: string;
  scoreType: string;
  target: number;
  achievement: number | null;
  deadline: string | null;
}): number | null {
  if (goal.achievement === null || goal.achievement === undefined) return null;
  const { unitOfMeasurement, scoreType, target, achievement } = goal;

  if (unitOfMeasurement === "zero_based") {
    return achievement === 0 ? 100 : 0;
  }
  if (unitOfMeasurement === "timeline") {
    if (!goal.deadline) return null;
    const deadlineMs = new Date(goal.deadline).getTime();
    const nowMs = Date.now();
    const pct = Math.max(0, Math.min(100, ((deadlineMs - nowMs) / (deadlineMs - Date.now())) * 100));
    return achievement > 0 ? 100 : pct;
  }
  if (target === 0) return null;
  if (scoreType === "lower_is_better") {
    return Math.min(200, (target / achievement) * 100);
  }
  return Math.min(200, (achievement / target) * 100);
}

async function formatGoal(goal: typeof goalsTable.$inferSelect) {
  const [employee] = await db.select().from(usersTable).where(eq(usersTable.id, goal.employeeId)).limit(1);
  return {
    ...goal,
    employeeName: employee?.name ?? null,
    progressScore: computeProgress(goal),
  };
}

// List goals
router.get("/", requireAuth, async (req, res) => {
  const parsed = ListGoalsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let allGoals = await db.select().from(goalsTable);

  // Role-based filtering
  if (req.user!.role === "employee") {
    allGoals = allGoals.filter((g) => g.employeeId === req.user!.id);
  } else if (req.user!.role === "manager") {
    const team = await db.select().from(usersTable).where(eq(usersTable.managerId, req.user!.id));
    const teamIds = [req.user!.id, ...team.map((u) => u.id)];
    allGoals = allGoals.filter((g) => teamIds.includes(g.employeeId));
  }

  if (params.employeeId) allGoals = allGoals.filter((g) => g.employeeId === Number(params.employeeId));
  if (params.status) allGoals = allGoals.filter((g) => g.approvalStatus === params.status);
  if (params.approvalStatus) allGoals = allGoals.filter((g) => g.approvalStatus === params.approvalStatus);
  if (params.quarter) allGoals = allGoals.filter((g) => g.quarter === params.quarter);
  if (params.thrustArea) allGoals = allGoals.filter((g) => g.thrustArea === params.thrustArea);

  if (params.department) {
    const deptUsers = await db.select().from(usersTable).where(eq(usersTable.department, params.department));
    const deptIds = deptUsers.map((u) => u.id);
    allGoals = allGoals.filter((g) => deptIds.includes(g.employeeId));
  }

  const formatted = await Promise.all(allGoals.map(formatGoal));
  res.json(formatted);
});

// Create goal
router.post("/", requireAuth, async (req, res) => {
  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }
  const d = parsed.data;

  const [goal] = await db
    .insert(goalsTable)
    .values({
      employeeId: req.user!.id,
      thrustArea: d.thrustArea,
      goalTitle: d.goalTitle,
      goalDescription: d.goalDescription,
      unitOfMeasurement: d.unitOfMeasurement,
      scoreType: d.scoreType ?? "higher_is_better",
      target: d.target,
      deadline: d.deadline ? d.deadline.toISOString() : null,
      weightage: d.weightage,
      achievement: null,
      approvalStatus: "draft",
      lockStatus: false,
      quarter: d.quarter ?? null,
      quarterlyUpdates: [],
      comments: [],
      isShared: false,
      sharedGoalId: null,
    })
    .returning();

  await logAudit({ userId: req.user!.id, role: req.user!.role, goalId: goal.id, action: "goal_created", changedField: "approvalStatus", newValue: "draft" });
  res.status(201).json(await formatGoal(goal));
});

// Get one goal
router.get("/:id", requireAuth, async (req, res) => {
  const parsed = GetGoalParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, parsed.data.id)).limit(1);
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }

  // Access control
  if (req.user!.role === "employee" && goal.employeeId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  res.json(await formatGoal(goal));
});

// Update goal (draft only, or manager inline edit)
router.patch("/:id", requireAuth, async (req, res) => {
  const params = UpdateGoalParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = UpdateGoalBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, params.data.id)).limit(1);
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }

  if (req.user!.role === "employee") {
    if (goal.employeeId !== req.user!.id) { res.status(403).json({ error: "Forbidden" }); return; }
    if (goal.approvalStatus !== "draft" && goal.approvalStatus !== "returned") {
      res.status(400).json({ error: "Only draft or returned goals can be edited" }); return;
    }
    if (goal.lockStatus) { res.status(400).json({ error: "Goal is locked" }); return; }
  }

  const updates: Partial<typeof goalsTable.$inferInsert> = {};
  const d = body.data;
  if (d.thrustArea !== undefined) updates.thrustArea = d.thrustArea;
  if (d.goalTitle !== undefined) updates.goalTitle = d.goalTitle;
  if (d.goalDescription !== undefined) updates.goalDescription = d.goalDescription;
  if (d.unitOfMeasurement !== undefined) updates.unitOfMeasurement = d.unitOfMeasurement;
  if (d.scoreType !== undefined) updates.scoreType = d.scoreType;
  if (d.target !== undefined) updates.target = d.target;
  if (d.deadline !== undefined) updates.deadline = d.deadline ? (d.deadline instanceof Date ? d.deadline.toISOString() : d.deadline as string) : null;
  if (d.weightage !== undefined) updates.weightage = d.weightage;
  if (d.achievement !== undefined) updates.achievement = d.achievement;

  const [updated] = await db.update(goalsTable).set(updates).where(eq(goalsTable.id, goal.id)).returning();
  await logAudit({ userId: req.user!.id, role: req.user!.role, goalId: goal.id, action: "goal_updated" });
  res.json(await formatGoal(updated));
});

// Delete goal (draft only)
router.delete("/:id", requireAuth, async (req, res) => {
  const parsed = DeleteGoalParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, parsed.data.id)).limit(1);
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }
  if (goal.employeeId !== req.user!.id && req.user!.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  if (goal.approvalStatus !== "draft") { res.status(400).json({ error: "Only draft goals can be deleted" }); return; }

  await db.delete(goalsTable).where(eq(goalsTable.id, goal.id));
  await logAudit({ userId: req.user!.id, role: req.user!.role, goalId: goal.id, action: "goal_deleted" });
  res.status(204).send();
});

// Submit goal
router.post("/:id/submit", requireAuth, async (req, res) => {
  const parsed = SubmitGoalParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, parsed.data.id)).limit(1);
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }
  if (goal.employeeId !== req.user!.id) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!["draft", "returned"].includes(goal.approvalStatus)) {
    res.status(400).json({ error: "Only draft or returned goals can be submitted" }); return;
  }

  const [updated] = await db.update(goalsTable)
    .set({ approvalStatus: "pending" })
    .where(eq(goalsTable.id, goal.id))
    .returning();

  await logAudit({ userId: req.user!.id, role: req.user!.role, goalId: goal.id, action: "goal_submitted", changedField: "approvalStatus", oldValue: goal.approvalStatus, newValue: "pending" });

  // Notify manager
  const [emp] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  if (emp?.managerId) {
    await createNotification({ userId: emp.managerId, type: "goal_submitted", title: "New Goal Submitted", message: `${emp.name} submitted goal: "${goal.goalTitle}" for approval.`, relatedGoalId: goal.id });
  }

  res.json(await formatGoal(updated));
});

// Approve goal
router.post("/:id/approve", requireAuth, requireRole("manager", "admin"), async (req, res) => {
  const params = ApproveGoalParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = ApproveGoalBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, params.data.id)).limit(1);
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }

  const updates: Partial<typeof goalsTable.$inferInsert> = {
    approvalStatus: "approved",
    lockStatus: true,
  };
  if (body.data.targetOverride !== null && body.data.targetOverride !== undefined) updates.target = body.data.targetOverride;
  if (body.data.weightageOverride !== null && body.data.weightageOverride !== undefined) updates.weightage = body.data.weightageOverride;

  // Add manager comment
  const existing = (goal.comments as any[]) || [];
  existing.push({ id: Date.now(), authorId: req.user!.id, authorName: req.user!.name, role: req.user!.role, text: body.data.comment, createdAt: new Date().toISOString() });
  updates.comments = existing;

  const [updated] = await db.update(goalsTable).set(updates).where(eq(goalsTable.id, goal.id)).returning();
  await logAudit({ userId: req.user!.id, role: req.user!.role, goalId: goal.id, action: "goal_approved", changedField: "approvalStatus", oldValue: "pending", newValue: "approved" });
  await createNotification({ userId: goal.employeeId, type: "goal_approved", title: "Goal Approved", message: `Your goal "${goal.goalTitle}" has been approved.`, relatedGoalId: goal.id });

  res.json(await formatGoal(updated));
});

// Reject goal
router.post("/:id/reject", requireAuth, requireRole("manager", "admin"), async (req, res) => {
  const params = RejectGoalParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = RejectGoalBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, params.data.id)).limit(1);
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }

  const existing = (goal.comments as any[]) || [];
  existing.push({ id: Date.now(), authorId: req.user!.id, authorName: req.user!.name, role: req.user!.role, text: body.data.comment, createdAt: new Date().toISOString() });

  const [updated] = await db.update(goalsTable).set({ approvalStatus: "rejected", comments: existing }).where(eq(goalsTable.id, goal.id)).returning();
  await logAudit({ userId: req.user!.id, role: req.user!.role, goalId: goal.id, action: "goal_rejected", changedField: "approvalStatus", oldValue: "pending", newValue: "rejected" });
  await createNotification({ userId: goal.employeeId, type: "goal_rejected", title: "Goal Rejected", message: `Your goal "${goal.goalTitle}" was rejected. Reason: ${body.data.comment}`, relatedGoalId: goal.id });

  res.json(await formatGoal(updated));
});

// Return goal for rework
router.post("/:id/return", requireAuth, requireRole("manager", "admin"), async (req, res) => {
  const params = ReturnGoalParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = ReturnGoalBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, params.data.id)).limit(1);
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }

  const existing = (goal.comments as any[]) || [];
  existing.push({ id: Date.now(), authorId: req.user!.id, authorName: req.user!.name, role: req.user!.role, text: body.data.comment, createdAt: new Date().toISOString() });

  const [updated] = await db.update(goalsTable).set({ approvalStatus: "returned", lockStatus: false, comments: existing }).where(eq(goalsTable.id, goal.id)).returning();
  await logAudit({ userId: req.user!.id, role: req.user!.role, goalId: goal.id, action: "goal_returned", changedField: "approvalStatus", oldValue: "pending", newValue: "returned" });
  await createNotification({ userId: goal.employeeId, type: "goal_returned", title: "Goal Returned for Rework", message: `Your goal "${goal.goalTitle}" needs revision. Feedback: ${body.data.comment}`, relatedGoalId: goal.id });

  res.json(await formatGoal(updated));
});

// Unlock goal (admin)
router.post("/:id/unlock", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = UnlockGoalParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, parsed.data.id)).limit(1);
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }

  const [updated] = await db.update(goalsTable).set({ lockStatus: false }).where(eq(goalsTable.id, goal.id)).returning();
  await logAudit({ userId: req.user!.id, role: req.user!.role, goalId: goal.id, action: "goal_unlocked", changedField: "lockStatus", oldValue: "true", newValue: "false" });
  res.json(await formatGoal(updated));
});

// Quarterly update
router.post("/:id/quarterly-update", requireAuth, async (req, res) => {
  const params = AddQuarterlyUpdateParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = AddQuarterlyUpdateBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, params.data.id)).limit(1);
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }

  const existing = (goal.quarterlyUpdates as any[]) || [];
  const idx = existing.findIndex((u: any) => u.quarter === body.data.quarter);
  const progressScore = computeProgress({ ...goal, achievement: body.data.achievement });
  const entry = { quarter: body.data.quarter, achievement: body.data.achievement, progressStatus: body.data.progressStatus, progressScore, managerComment: null, updatedAt: new Date().toISOString() };

  if (idx >= 0) existing[idx] = entry;
  else existing.push(entry);

  const [updated] = await db.update(goalsTable).set({ quarterlyUpdates: existing, achievement: body.data.achievement, progressScore }).where(eq(goalsTable.id, goal.id)).returning();
  await logAudit({ userId: req.user!.id, role: req.user!.role, goalId: goal.id, action: "quarterly_update", changedField: "achievement", newValue: String(body.data.achievement) });
  res.json(await formatGoal(updated));
});

// Add comment
router.post("/:id/comments", requireAuth, async (req, res) => {
  const params = AddGoalCommentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = AddGoalCommentBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [goal] = await db.select().from(goalsTable).where(eq(goalsTable.id, params.data.id)).limit(1);
  if (!goal) { res.status(404).json({ error: "Goal not found" }); return; }

  const existing = (goal.comments as any[]) || [];
  existing.push({ id: Date.now(), authorId: req.user!.id, authorName: req.user!.name, role: req.user!.role, text: body.data.text, createdAt: new Date().toISOString() });

  const [updated] = await db.update(goalsTable).set({ comments: existing }).where(eq(goalsTable.id, goal.id)).returning();
  res.json(await formatGoal(updated));
});

export default router;
