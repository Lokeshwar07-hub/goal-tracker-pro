import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goalsTable = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  lockStatus: integer("lock_status", { mode: "boolean" }).notNull().default(false),
  quarter: text("quarter"),
  quarterlyUpdates: text("quarterly_updates", { mode: "json" })
    .notNull()
    .$type<unknown[]>()
    .default([]),
  comments: text("comments", { mode: "json" })
    .notNull()
    .$type<unknown[]>()
    .default([]),
  isShared: integer("is_shared", { mode: "boolean" }).notNull().default(false),
  sharedGoalId: integer("shared_goal_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const insertGoalSchema = createInsertSchema(goalsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;
