import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quartersTable = pgTable("quarters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  isGoalSettingOpen: boolean("is_goal_setting_open").notNull().default(false),
  adminOverride: boolean("admin_override").notNull().default(false),
});

export const insertQuarterSchema = createInsertSchema(quartersTable).omit({ id: true });
export type InsertQuarter = z.infer<typeof insertQuarterSchema>;
export type Quarter = typeof quartersTable.$inferSelect;
