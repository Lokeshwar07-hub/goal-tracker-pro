import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const escalationsTable = sqliteTable("escalations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  employeeId: integer("employee_id").notNull(),
  managerId: integer("manager_id"),
  description: text("description").notNull().default(""),
  resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const insertEscalationSchema = createInsertSchema(escalationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEscalation = z.infer<typeof insertEscalationSchema>;
export type Escalation = typeof escalationsTable.$inferSelect;
