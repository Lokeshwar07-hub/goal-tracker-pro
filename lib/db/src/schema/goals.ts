import { pgTable, text, serial, timestamp, integer, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  thrustArea: text("thrust_area").notNull(),
  goalTitle: text("goal_title").notNull(),
  goalDescription: text("goal_description").notNull().default(""),
  unitOfMeasurement: text("unit_of_measurement").notNull().default("numeric"),
  scoreType: text("score_type").notNull().default("higher_is_better"),
  target: real("target").notNull().default(0),
  deadline: text("deadline"),
  weightage: real("weightage").notNull().default(10),
  achievement: real("achievement"),
  progressScore: real("progress_score"),
  approvalStatus: text("approval_status").notNull().default("draft"),
  lockStatus: boolean("lock_status").notNull().default(false),
  quarter: text("quarter"),
  quarterlyUpdates: jsonb("quarterly_updates").notNull().default([]),
  comments: jsonb("comments").notNull().default([]),
  isShared: boolean("is_shared").notNull().default(false),
  sharedGoalId: integer("shared_goal_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;
