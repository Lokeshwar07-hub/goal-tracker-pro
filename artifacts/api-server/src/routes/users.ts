import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import {
  ListUsersQueryParams,
  CreateUserBody,
  UpdateUserBody,
  GetUserParams,
  UpdateUserParams,
  DeleteUserParams,
} from "@workspace/api-zod";

const router = Router();

async function formatUser(user: typeof usersTable.$inferSelect) {
  let managerName: string | null = null;
  if (user.managerId) {
    const [mgr] = await db.select().from(usersTable).where(eq(usersTable.id, user.managerId)).limit(1);
    managerName = mgr?.name ?? null;
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    managerId: user.managerId,
    managerName,
    createdAt: user.createdAt,
  };
}

// Get my team — must be BEFORE /:id to avoid route shadowing
router.get("/my-team", requireAuth, requireRole("manager", "admin"), async (req, res) => {
  const team = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.managerId, req.user!.id));
  const formatted = await Promise.all(team.map(formatUser));
  res.json(formatted);
});

// List users
router.get("/", requireAuth, async (req, res) => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let query = db.select().from(usersTable).$dynamic();

  const conditions = [];
  if (params.role) conditions.push(eq(usersTable.role, params.role));
  if (params.department) conditions.push(eq(usersTable.department, params.department));
  if (params.managerId) conditions.push(eq(usersTable.managerId, Number(params.managerId)));

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const users = await query;
  const formatted = await Promise.all(users.map(formatUser));
  res.json(formatted);
});

// Create user (admin only)
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { name, email, password, role, department, managerId } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(usersTable)
    .values({ name, email: email.toLowerCase(), passwordHash, role, department, managerId: managerId ?? null })
    .returning();

  res.status(201).json(await formatUser(user));
});

// Get one user
router.get("/:id", requireAuth, async (req, res) => {
  const parsed = GetUserParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.data.id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(await formatUser(user));
});

// Update user
router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = UpdateUserParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const body = UpdateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (body.data.name !== undefined) updates.name = body.data.name;
  if (body.data.role !== undefined) updates.role = body.data.role;
  if (body.data.department !== undefined) updates.department = body.data.department;
  if (body.data.managerId !== undefined) updates.managerId = body.data.managerId ?? null;

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, parsed.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(await formatUser(user));
});

// Delete user
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = DeleteUserParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
