import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quartersTable = sqliteTable("quarters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  isGoalSettingOpen: integer("is_goal_setting_open", { mode: "boolean" })
    .notNull()
    .default(false),
  adminOverride: integer("admin_override", { mode: "boolean" })
    .notNull()
    .default(false),
});

export const insertQuarterSchema = createInsertSchema(quartersTable).omit({
  id: true,
});
export type InsertQuarter = z.infer<typeof insertQuarterSchema>;
export type Quarter = typeof quartersTable.$inferSelect;
