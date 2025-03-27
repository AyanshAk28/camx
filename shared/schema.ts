import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// No need for a database table in this application, but we need to keep
// the users table for compatibility with the existing code structure

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define video settings schema
export const videoSettingsSchema = z.object({
  resolution: z.string(),
  frameRate: z.string(),
  autoFocus: z.boolean(),
  videoStabilization: z.boolean(),
  mirrorVideo: z.boolean(),
  lowLightEnhancement: z.boolean(),
});

export type VideoSettings = z.infer<typeof videoSettingsSchema>;

// Define connection options schema
export const connectionOptionsSchema = z.object({
  method: z.enum(["wifi", "usb"]),
  ipAddress: z.string().optional(),
  port: z.string().optional(),
});

export type ConnectionOptions = z.infer<typeof connectionOptionsSchema>;
