import { 
  users, type User, type InsertUser,
  devices, type Device, type InsertDevice,
  connectionHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Expanded interface with CRUD methods for devices and connection tracking
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Device methods
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceByDeviceId(deviceId: string): Promise<Device | undefined>;
  getDevicesByUser(userId: number): Promise<Device[]>;
  getActiveDevicesOnNetwork(): Promise<Device[]>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDeviceStatus(id: number, isActive: boolean): Promise<Device | undefined>;
  updateDeviceLastSeen(id: number, ipAddress?: string, port?: string): Promise<Device | undefined>;
  
  // Connection history methods
  createConnectionHistory(connectionData: any): Promise<any>;
  updateConnectionEnd(id: number, successful: boolean, errorMessage?: string): Promise<any>;
  getConnectionHistoryByDevice(deviceId: number, limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Device methods
  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }
  
  async getDeviceByDeviceId(deviceId: string): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.deviceId, deviceId));
    return device;
  }
  
  async getDevicesByUser(userId: number): Promise<Device[]> {
    return await db.select().from(devices).where(eq(devices.userId, userId));
  }
  
  async getActiveDevicesOnNetwork(): Promise<Device[]> {
    return await db.select().from(devices).where(eq(devices.isActive, true));
  }
  
  async createDevice(device: InsertDevice): Promise<Device> {
    const [newDevice] = await db
      .insert(devices)
      .values(device)
      .returning();
    return newDevice;
  }
  
  async updateDeviceStatus(id: number, isActive: boolean): Promise<Device | undefined> {
    const [updatedDevice] = await db
      .update(devices)
      .set({ isActive, lastSeen: new Date() })
      .where(eq(devices.id, id))
      .returning();
    return updatedDevice;
  }
  
  async updateDeviceLastSeen(id: number, ipAddress?: string, port?: string): Promise<Device | undefined> {
    const updateData: Partial<Device> = { 
      lastSeen: new Date() 
    };
    
    if (ipAddress) {
      updateData.ipAddress = ipAddress;
    }
    
    if (port) {
      updateData.port = port;
    }
    
    const [updatedDevice] = await db
      .update(devices)
      .set(updateData)
      .where(eq(devices.id, id))
      .returning();
    return updatedDevice;
  }
  
  // Connection history methods
  async createConnectionHistory(connectionData: any): Promise<any> {
    const [newConnection] = await db
      .insert(connectionHistory)
      .values(connectionData)
      .returning();
    return newConnection;
  }
  
  async updateConnectionEnd(id: number, successful: boolean, errorMessage?: string): Promise<any> {
    const updateData: any = { 
      endTime: new Date(),
      successful
    };
    
    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }
    
    const [updatedConnection] = await db
      .update(connectionHistory)
      .set(updateData)
      .where(eq(connectionHistory.id, id))
      .returning();
    return updatedConnection;
  }
  
  async getConnectionHistoryByDevice(deviceId: number, limit: number = 10): Promise<any[]> {
    return await db
      .select()
      .from(connectionHistory)
      .where(eq(connectionHistory.deviceId, deviceId))
      .orderBy(desc(connectionHistory.startTime))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
