import "./load-env.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { closeDb, db } from "./index.js";
import {
  usersTable,
  departmentsTable,
  quartersTable,
  goalsTable,
} from "./schema/index.js";

const DEMO_PASSWORD = "password123";

async function seed() {
  const [existing] = await db.select().from(usersTable).limit(1);
  if (existing) {
    console.log("Database already has users — seed skipped.");
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [engineering] = await db
    .insert(departmentsTable)
    .values({ name: "Engineering" })
    .returning();

  const [admin] = await db
    .insert(usersTable)
    .values({
      name: "System Admin",
      email: "admin@atomquest.com",
      passwordHash,
      role: "admin",
      department: "Engineering",
    })
    .returning();

  const [manager] = await db
    .insert(usersTable)
    .values({
      name: "Raj Patel",
      email: "raj.patel@atomquest.com",
      passwordHash,
      role: "manager",
      department: "Engineering",
    })
    .returning();

  await db
    .update(departmentsTable)
    .set({ headId: manager.id })
    .where(eq(departmentsTable.id, engineering.id));

  const [employee] = await db
    .insert(usersTable)
    .values({
      name: "Sarah Johnson",
      email: "sarah.johnson@atomquest.com",
      passwordHash,
      role: "employee",
      department: "Engineering",
      managerId: manager.id,
    })
    .returning();

  await db.insert(quartersTable).values({
    name: "Q2",
    year: 2026,
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    isActive: true,
    isGoalSettingOpen: true,
  });

  await db.insert(goalsTable).values([
    {
      employeeId: employee.id,
      thrustArea: "Product",
      goalTitle: "Launch goal-tracking dashboard",
      goalDescription: "Deliver MVP dashboard for team goal visibility.",
      unitOfMeasurement: "percentage",
      scoreType: "higher_is_better",
      target: 100,
      weightage: 40,
      approvalStatus: "approved",
      quarter: "Q2 2026",
    },
    {
      employeeId: employee.id,
      thrustArea: "Learning",
      goalTitle: "Complete leadership training",
      goalDescription: "Finish assigned modules by end of quarter.",
      unitOfMeasurement: "numeric",
      scoreType: "higher_is_better",
      target: 5,
      weightage: 20,
      approvalStatus: "approved",
      quarter: "Q2 2026",
    },
  ]);

  console.log("Seed complete. Demo logins (password: password123):");
  console.log(`  Admin:    ${admin.email}`);
  console.log(`  Manager:  ${manager.email}`);
  console.log(`  Employee: ${employee.email}`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
