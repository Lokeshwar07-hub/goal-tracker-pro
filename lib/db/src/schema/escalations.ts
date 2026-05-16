import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const escalationsTable = pgTable("escalations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  employeeId: integer("employee_id").notNull(),
  managerId: integer("manager_id"),
  description: text("description").notNull().default(""),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEscalationSchema = createInsertSchema(escalationsTable).omit({ id: true, createdAt: true });
export type InsertEscalation = z.infer<typeof insertEscalationSchema>;
export type Escalation = typeof escalationsTable.$inferSelect;
