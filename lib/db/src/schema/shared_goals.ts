import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sharedGoalsTable = sqliteTable("shared_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  primaryOwnerId: integer("primary_owner_id").notNull(),
  goalTitle: text("goal_title").notNull(),
  goalDescription: text("goal_description").notNull().default(""),
  thrustArea: text("thrust_area").notNull().default(""),
  target: real("target").notNull().default(0),
  unitOfMeasurement: text("unit_of_measurement").notNull().default("numeric"),
  linkedEmployeeIds: text("linked_employee_ids", { mode: "json" })
    .notNull()
    .$type<number[]>()
    .default([]),
  achievement: real("achievement"),
  quarter: text("quarter"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const insertSharedGoalSchema = createInsertSchema(sharedGoalsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertSharedGoal = z.infer<typeof insertSharedGoalSchema>;
export type SharedGoal = typeof sharedGoalsTable.$inferSelect;
