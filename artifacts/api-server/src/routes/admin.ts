// @ts-nocheck
import { Router } from "express";
import { db, departmentsTable, escalationsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { CreateDepartmentBody } from "@workspace/api-zod";

const router = Router();

// Departments
router.get("/departments", requireAuth, async (req, res) => {
  const depts = await db.select().from(departmentsTable);
  const enriched = await Promise.all(
    depts.map(async (d) => {
      let headName: string | null = null;
      if (d.headId) {
        const [u] = await db.select().from(usersTable).where(eq(usersTable.id, d.headId)).limit(1);
        headName = u?.name ?? null;
      }
      return { ...d, headName };
    })
  );
  res.json(enriched);
});

router.post("/departments", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateDepartmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }
  const [dept] = await db.insert(departmentsTable).values({ name: parsed.data.name, headId: parsed.data.headId ?? null }).returning();
  res.status(201).json({ ...dept, headName: null });
});

// Escalations
router.get("/escalations", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  const all = await db.select().from(escalationsTable).orderBy(escalationsTable.createdAt);
  const enriched = await Promise.all(
    all.map(async (e) => {
      const [emp] = await db.select().from(usersTable).where(eq(usersTable.id, e.employeeId)).limit(1);
      let managerName: string | null = null;
      if (e.managerId) {
        const [mgr] = await db.select().from(usersTable).where(eq(usersTable.id, e.managerId)).limit(1);
        managerName = mgr?.name ?? null;
      }
      return { ...e, employeeName: emp?.name ?? null, managerName };
    })
  );
  res.json(enriched);
});

export default router;
