import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { networkInterfaces } from "os";
import { SignalMessage } from "@shared/types";

// Get local IP address
function getLocalIpAddress(): string {
  const nets = networkInterfaces();
  let localIp = "127.0.0.1";
  
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;
    
    for (const net of interfaces) {
      // Skip over non-IPv4 and internal (loopback) addresses
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        return localIp;
      }
    }
  }
  
  return localIp;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Initialize connected clients
  const clients = new Map<string, WebSocket>();
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    clients.set(clientId, ws);
    
    console.log(`New client connected: ${clientId}`);
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as SignalMessage;
        console.log(`Received message from ${clientId}:`, parsedMessage.type);
        
        // If there's a target recipient
        if (parsedMessage.to) {
          const recipient = clients.get(parsedMessage.to);
          if (recipient && recipient.readyState === WebSocket.OPEN) {
            recipient.send(JSON.stringify({
              ...parsedMessage,
              from: clientId
            }));
          }
        } else {
          // Broadcast to all other connected clients
          clients.forEach((client, id) => {
            if (id !== clientId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                ...parsedMessage,
                from: clientId
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log(`Client disconnected: ${clientId}`);
      clients.delete(clientId);
      
      // Notify other clients about the disconnection
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'disconnect',
            payload: {},
            from: clientId
          }));
        }
      });
    });
  });
  
  // API endpoints
  
  // Get the local IP address of the server
  app.get('/api/network/ip', (req, res) => {
    const ipAddress = getLocalIpAddress();
    res.json({ ipAddress });
  });
  
  return httpServer;
}
