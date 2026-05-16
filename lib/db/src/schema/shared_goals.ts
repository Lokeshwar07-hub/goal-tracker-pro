import { pgTable, text, serial, timestamp, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sharedGoalsTable = pgTable("shared_goals", {
  id: serial("id").primaryKey(),
  primaryOwnerId: integer("primary_owner_id").notNull(),
  goalTitle: text("goal_title").notNull(),
  goalDescription: text("goal_description").notNull().default(""),
  thrustArea: text("thrust_area").notNull().default(""),
  target: real("target").notNull().default(0),
  unitOfMeasurement: text("unit_of_measurement").notNull().default("numeric"),
  linkedEmployeeIds: jsonb("linked_employee_ids").notNull().default([]),
  achievement: real("achievement"),
  quarter: text("quarter"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSharedGoalSchema = createInsertSchema(sharedGoalsTable).omit({ id: true, createdAt: true });
export type InsertSharedGoal = z.infer<typeof insertSharedGoalSchema>;
export type SharedGoal = typeof sharedGoalsTable.$inferSelect;
