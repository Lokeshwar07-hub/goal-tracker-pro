import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../middlewares/auth.js";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      managerId: user.managerId,
      managerName: null,
      createdAt: user.createdAt,
    },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.id))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  let managerName: string | null = null;
  if (user.managerId) {
    const [mgr] = await db.select().from(usersTable).where(eq(usersTable.id, user.managerId)).limit(1);
    managerName = mgr?.name ?? null;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    managerId: user.managerId,
    managerName,
    createdAt: user.createdAt,
  });
});

export default router;
