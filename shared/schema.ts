import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User accounts (for authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Device table for tracking known phone cameras
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  deviceId: text("device_id").notNull().unique(),
  model: text("model"),
  platform: text("platform").notNull(), // "android", "ios", etc.
  ipAddress: text("ip_address"),
  port: text("port"),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const devicesRelations = relations(devices, ({ one }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
}));

export const insertDeviceSchema = createInsertSchema(devices).pick({
  name: true,
  deviceId: true,
  model: true,
  platform: true,
  ipAddress: true,
  port: true,
  userId: true,
  isActive: true,
  lastSeen: true,
});

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;

// Connection history for analytics and troubleshooting
export const connectionHistory = pgTable("connection_history", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  connectionType: text("connection_type").notNull(), // "wifi", "usb"
  ipAddress: text("ip_address"),
  port: text("port"),
  resolution: text("resolution"),
  frameRate: text("frame_rate"),
  successful: boolean("successful").default(true).notNull(),
  errorMessage: text("error_message"),
});

export const connectionHistoryRelations = relations(connectionHistory, ({ one }) => ({
  device: one(devices, {
    fields: [connectionHistory.deviceId],
    references: [devices.id],
  }),
}));

export const insertConnectionHistorySchema = createInsertSchema(connectionHistory).pick({
  deviceId: true,
  startTime: true,
  connectionType: true,
  ipAddress: true,
  port: true,
  resolution: true,
  frameRate: true,
  successful: true,
  errorMessage: true,
});

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
