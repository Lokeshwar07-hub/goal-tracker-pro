// @ts-nocheck
import { Router } from "express";
import { db, goalsTable, usersTable, quartersTable, escalationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

function computeProgress(goal: any): number | null {
  if (goal.achievement === null || goal.achievement === undefined) return null;
  const { unitOfMeasurement, scoreType, target, achievement } = goal;
  if (unitOfMeasurement === "zero_based") return achievement === 0 ? 100 : 0;
  if (target === 0) return null;
  if (scoreType === "lower_is_better") return Math.min(200, (target / achievement) * 100);
  return Math.min(200, (achievement / target) * 100);
}

// Dashboard summary
router.get("/dashboard-summary", requireAuth, async (req, res) => {
  const allGoals = await db.select().from(goalsTable);
  const allUsers = await db.select().from(usersTable);

  let myGoals = allGoals;
  if (req.user!.role === "employee") {
    myGoals = allGoals.filter((g) => g.employeeId === req.user!.id);
  } else if (req.user!.role === "manager") {
    const team = allUsers.filter((u) => u.managerId === req.user!.id);
    const teamIds = [req.user!.id, ...team.map((u) => u.id)];
    myGoals = allGoals.filter((g) => teamIds.includes(g.employeeId));
  }

  const totalGoals = myGoals.length;
  const pendingApprovals = myGoals.filter((g) => g.approvalStatus === "pending").length;
  const approvedGoals = myGoals.filter((g) => g.approvalStatus === "approved").length;
  const completedGoals = myGoals.filter((g) => {
    const updates = (g.quarterlyUpdates as any[]) || [];
    return updates.some((u: any) => u.progressStatus === "completed");
  }).length;
  const draftGoals = myGoals.filter((g) => g.approvalStatus === "draft").length;
  const rejectedGoals = myGoals.filter((g) => g.approvalStatus === "rejected").length;

  const scores = myGoals.map((g) => computeProgress(g)).filter((s) => s !== null) as number[];
  const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const quarters = await db.select().from(quartersTable);
  const activeQuarter = quarters.find((q) => q.isActive);

  const response: any = {
    totalGoals,
    pendingApprovals,
    approvedGoals,
    completedGoals,
    draftGoals,
    rejectedGoals,
    overallScore: Math.round(overallScore * 10) / 10,
    currentQuarter: activeQuarter?.name ?? null,
  };

  if (req.user!.role === "admin") {
    response.totalEmployees = allUsers.filter((u) => u.role === "employee").length;
  } else if (req.user!.role === "manager") {
    const team = allUsers.filter((u) => u.managerId === req.user!.id);
    response.teamSize = team.length;
  }

  res.json(response);
});

// Goal completion stats
router.get("/goal-completion", requireAuth, async (req, res) => {
  const { quarter, department } = req.query as { quarter?: string; department?: string };
  const allGoals = await db.select().from(goalsTable);
  const allUsers = await db.select().from(usersTable);

  // Group by department or quarter
  const deptMap = new Map<string, { total: number; completed: number }>();

  for (const goal of allGoals) {
    if (quarter && goal.quarter !== quarter) continue;
    const user = allUsers.find((u) => u.id === goal.employeeId);
    if (!user) continue;
    if (department && user.department !== department) continue;

    const dept = user.department || "Unknown";
    if (!deptMap.has(dept)) deptMap.set(dept, { total: 0, completed: 0 });
    const entry = deptMap.get(dept)!;
    entry.total++;
    const updates = (goal.quarterlyUpdates as any[]) || [];
    if (updates.some((u: any) => u.progressStatus === "completed")) entry.completed++;
  }

  const result = Array.from(deptMap.entries()).map(([label, { total, completed }]) => ({
    label,
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }));

  res.json(result);
});

// Department performance
router.get("/department-performance", requireAuth, async (req, res) => {
  const { quarter } = req.query as { quarter?: string };
  const allGoals = await db.select().from(goalsTable);
  const allUsers = await db.select().from(usersTable);

  const deptMap = new Map<string, { scores: number[]; employees: Set<number>; total: number; completed: number }>();

  for (const goal of allGoals) {
    if (quarter && goal.quarter !== quarter) continue;
    const user = allUsers.find((u) => u.id === goal.employeeId);
    if (!user) continue;
    const dept = user.department || "Unknown";
    if (!deptMap.has(dept)) deptMap.set(dept, { scores: [], employees: new Set(), total: 0, completed: 0 });
    const entry = deptMap.get(dept)!;
    entry.employees.add(goal.employeeId);
    entry.total++;
    const score = computeProgress(goal);
    if (score !== null) entry.scores.push(score);
    const updates = (goal.quarterlyUpdates as any[]) || [];
    if (updates.some((u: any) => u.progressStatus === "completed")) entry.completed++;
  }

  const result = Array.from(deptMap.entries()).map(([department, { scores, employees, total, completed }]) => ({
    department,
    avgScore: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
    totalEmployees: employees.size,
    totalGoals: total,
    completedGoals: completed,
  }));

  res.json(result);
});

// Employee scores
router.get("/employee-scores", requireAuth, async (req, res) => {
  const { quarter, department, managerId } = req.query as { quarter?: string; department?: string; managerId?: string };
  const allGoals = await db.select().from(goalsTable);
  const allUsers = await db.select().from(usersTable);

  const empMap = new Map<number, { goals: typeof goalsTable.$inferSelect[]; user: typeof usersTable.$inferSelect }>();

  for (const user of allUsers) {
    if (user.role !== "employee") continue;
    if (department && user.department !== department) continue;
    if (managerId && user.managerId !== Number(managerId)) continue;
    empMap.set(user.id, { goals: [], user });
  }

  for (const goal of allGoals) {
    if (quarter && goal.quarter !== quarter) continue;
    if (empMap.has(goal.employeeId)) {
      empMap.get(goal.employeeId)!.goals.push(goal);
    }
  }

  const result = Array.from(empMap.values()).map(({ user, goals }) => {
    const scores = goals.map((g) => computeProgress(g)).filter((s) => s !== null) as number[];
    const weights = goals.map((g) => g.weightage);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedScore = totalWeight > 0
      ? goals.reduce((acc, g, i) => {
          const s = computeProgress(g);
          return acc + (s !== null ? s * g.weightage : 0);
        }, 0) / totalWeight
      : 0;

    const manager = allUsers.find((u) => u.id === user.managerId);
    const completed = goals.filter((g) => {
      const updates = (g.quarterlyUpdates as any[]) || [];
      return updates.some((u: any) => u.progressStatus === "completed");
    }).length;

    return {
      employeeId: user.id,
      employeeName: user.name,
      department: user.department,
      managerName: manager?.name ?? null,
      weightedScore: Math.round(weightedScore * 10) / 10,
      totalGoals: goals.length,
      completedGoals: completed,
      quarter: quarter ?? null,
    };
  });

  res.json(result.sort((a, b) => b.weightedScore - a.weightedScore));
});

// Pending actions
router.get("/pending-actions", requireAuth, async (req, res) => {
  const allGoals = await db.select().from(goalsTable);
  const allUsers = await db.select().from(usersTable);

  let goals = allGoals;
  if (req.user!.role === "manager") {
    const team = allUsers.filter((u) => u.managerId === req.user!.id);
    const teamIds = team.map((u) => u.id);
    goals = allGoals.filter((g) => teamIds.includes(g.employeeId));
  } else if (req.user!.role === "employee") {
    goals = allGoals.filter((g) => g.employeeId === req.user!.id);
  }

  res.json({
    pendingSubmissions: goals.filter((g) => g.approvalStatus === "draft").length,
    pendingApprovals: goals.filter((g) => g.approvalStatus === "pending").length,
    pendingCheckIns: goals.filter((g) => g.approvalStatus === "approved" && (!(g.quarterlyUpdates as any[])?.length)).length,
    overdueGoals: goals.filter((g) => g.deadline && new Date(g.deadline) < new Date() && g.approvalStatus !== "approved").length,
  });
});

// Quarter trend
router.get("/quarter-trend", requireAuth, async (req, res) => {
  const { employeeId, department } = req.query as { employeeId?: string; department?: string };
  const allGoals = await db.select().from(goalsTable);
  const allUsers = await db.select().from(usersTable);

  let goals = allGoals;
  if (employeeId) goals = goals.filter((g) => g.employeeId === Number(employeeId));
  if (department) {
    const deptUsers = allUsers.filter((u) => u.department === department).map((u) => u.id);
    goals = goals.filter((g) => deptUsers.includes(g.employeeId));
  }

  const quarterMap = new Map<string, { scores: number[]; total: number; completed: number }>();
  for (const goal of goals) {
    if (!goal.quarter) continue;
    if (!quarterMap.has(goal.quarter)) quarterMap.set(goal.quarter, { scores: [], total: 0, completed: 0 });
    const entry = quarterMap.get(goal.quarter)!;
    entry.total++;
    const score = computeProgress(goal);
    if (score !== null) entry.scores.push(score);
    const updates = (goal.quarterlyUpdates as any[]) || [];
    if (updates.some((u: any) => u.progressStatus === "completed")) entry.completed++;
  }

  const result = Array.from(quarterMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([quarter, { scores, total, completed }]) => ({
      quarter,
      avgScore: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
      completed,
      total,
    }));

  res.json(result);
});

// UoM breakdown
router.get("/uom-breakdown", requireAuth, async (req, res) => {
  const { quarter } = req.query as { quarter?: string };
  const allGoals = await db.select().from(goalsTable);

  const uomMap = new Map<string, { count: number; scores: number[] }>();
  for (const goal of allGoals) {
    if (quarter && goal.quarter !== quarter) continue;
    const uom = goal.unitOfMeasurement;
    if (!uomMap.has(uom)) uomMap.set(uom, { count: 0, scores: [] });
    const entry = uomMap.get(uom)!;
    entry.count++;
    const score = computeProgress(goal);
    if (score !== null) entry.scores.push(score);
  }

  const result = Array.from(uomMap.entries()).map(([uom, { count, scores }]) => ({
    uom,
    count,
    avgScore: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
  }));

  res.json(result);
});

// CSV export
router.get("/reports/export", requireAuth, async (req, res) => {
  const { quarter, department, employeeId, managerId, status } = req.query as Record<string, string>;
  const allGoals = await db.select().from(goalsTable);
  const allUsers = await db.select().from(usersTable);

  let goals = allGoals;
  if (quarter) goals = goals.filter((g) => g.quarter === quarter);
  if (status) goals = goals.filter((g) => g.approvalStatus === status);
  if (employeeId) goals = goals.filter((g) => g.employeeId === Number(employeeId));
  if (department) {
    const deptIds = allUsers.filter((u) => u.department === department).map((u) => u.id);
    goals = goals.filter((g) => deptIds.includes(g.employeeId));
  }
  if (managerId) {
    const teamIds = allUsers.filter((u) => u.managerId === Number(managerId)).map((u) => u.id);
    goals = goals.filter((g) => teamIds.includes(g.employeeId));
  }

  const rows = goals.map((g) => {
    const user = allUsers.find((u) => u.id === g.employeeId);
    const score = computeProgress(g);
    return [
      g.id,
      user?.name ?? "",
      user?.department ?? "",
      g.thrustArea,
      g.goalTitle,
      g.unitOfMeasurement,
      g.target,
      g.achievement ?? "",
      score !== null ? score.toFixed(1) : "",
      g.weightage,
      g.approvalStatus,
      g.quarter ?? "",
      g.deadline ?? "",
    ].map(String).join(",");
  });

  const header = "ID,Employee,Department,ThrustArea,GoalTitle,UoM,Target,Achievement,ProgressScore,Weightage,Status,Quarter,Deadline";
  const csv = [header, ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=atomquest-report.csv");
  res.send(csv);
});

export default router;
