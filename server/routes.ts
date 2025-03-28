import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { networkInterfaces } from "os";
import { 
  SignalMessage, 
  DeviceInfo, 
  NetworkScanResult, 
  DiscoveryMessage 
} from "@shared/types";
import { log } from "./vite";
import dgram from "dgram";
import ip from "ip";

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
  
  // Get discovered devices
  app.get('/api/devices', async (req, res) => {
    try {
      const activeDevices = await storage.getActiveDevicesOnNetwork();
      res.json(activeDevices);
    } catch (error) {
      console.error('Error getting active devices:', error);
      res.status(500).json({ error: 'Failed to get active devices' });
    }
  });
  
  // Handle device discovery
  const discoveryPort = 8912; // Port for UDP discovery
  const broadcastAddress = ip.subnet(getLocalIpAddress(), '255.255.255.0').broadcastAddress;
  
  // Create UDP socket for device discovery
  const discoverySocket = dgram.createSocket('udp4');
  
  discoverySocket.on('error', (err) => {
    log(`Discovery socket error: ${err.message}`, 'discovery');
    discoverySocket.close();
  });
  
  discoverySocket.on('message', async (message, rinfo) => {
    try {
      const discoveryMessage = JSON.parse(message.toString()) as DiscoveryMessage;
      log(`Discovery message from ${rinfo.address}: ${discoveryMessage.action}`, 'discovery');
      
      // Update or create device information in the database
      if (discoveryMessage.action === 'announce') {
        const { device } = discoveryMessage;
        
        // Check if device exists
        let existingDevice = await storage.getDeviceByDeviceId(device.id);
        
        if (existingDevice) {
          // Update device status and last seen timestamp
          await storage.updateDeviceStatus(existingDevice.id, true);
          await storage.updateDeviceLastSeen(existingDevice.id, device.ipAddress, device.port);
        } else {
          // Create new device
          await storage.createDevice({
            deviceId: device.id,
            name: device.name,
            model: device.model || 'Unknown',
            platform: device.platform || 'Unknown',
            ipAddress: device.ipAddress,
            port: device.port,
            isActive: true,
            userId: 1, // Default user ID for now
            lastSeen: new Date(),
          });
        }
        
        // Send acknowledgment
        const ackMessage: DiscoveryMessage = {
          action: 'acknowledge',
          device: {
            id: 'server',
            name: 'CamX Server',
            ipAddress: getLocalIpAddress(),
            port: '5000'
          }
        };
        
        const ackBuffer = Buffer.from(JSON.stringify(ackMessage));
        discoverySocket.send(ackBuffer, 0, ackBuffer.length, rinfo.port, rinfo.address, (err) => {
          if (err) log(`Error sending acknowledgment: ${err.message}`, 'discovery');
        });
      }
      
      // Broadcast device list to all connected WebSocket clients
      const activeDevices = await storage.getActiveDevicesOnNetwork();
      const scanResult: NetworkScanResult = {
        devices: activeDevices,
        timestamp: new Date().toISOString()
      };
      
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'discovery-response',
            payload: scanResult,
            from: 'server'
          }));
        }
      });
    } catch (error) {
      log(`Error processing discovery message: ${error}`, 'discovery');
    }
  });
  
  // Bind discovery socket
  discoverySocket.bind(discoveryPort, () => {
    discoverySocket.setBroadcast(true);
    log(`Device discovery service running on port ${discoveryPort}`, 'discovery');
  });
  
  // Scan for devices on the network
  app.post('/api/devices/scan', (req, res) => {
    try {
      const scanMessage: DiscoveryMessage = {
        action: 'scan',
        device: {
          id: 'server',
          name: 'CamX Server',
          ipAddress: getLocalIpAddress(),
          port: '5000'
        }
      };
      
      const scanBuffer = Buffer.from(JSON.stringify(scanMessage));
      discoverySocket.send(scanBuffer, 0, scanBuffer.length, discoveryPort, broadcastAddress, (err) => {
        if (err) {
          log(`Error broadcasting scan message: ${err.message}`, 'discovery');
          res.status(500).json({ error: 'Failed to scan for devices' });
        } else {
          log(`Broadcast scan message sent to ${broadcastAddress}:${discoveryPort}`, 'discovery');
          res.json({ success: true, message: 'Network scan initiated' });
        }
      });
    } catch (error) {
      log(`Error initiating device scan: ${error}`, 'discovery');
      res.status(500).json({ error: 'Failed to scan for devices' });
    }
  });
  
  // Update WebSocket handler to support discovery messages
  wss.on('connection', (ws) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    clients.set(clientId, ws);
    
    log(`New client connected: ${clientId}`, 'websocket');
    
    // Handle messages from clients
    ws.on('message', async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as SignalMessage;
        log(`Received message from ${clientId}: ${parsedMessage.type}`, 'websocket');
        
        // Handle different message types
        if (parsedMessage.type === 'discovery') {
          // Handle device discovery requests from clients
          const activeDevices = await storage.getActiveDevicesOnNetwork();
          const scanResult: NetworkScanResult = {
            devices: activeDevices,
            timestamp: new Date().toISOString()
          };
          
          ws.send(JSON.stringify({
            type: 'discovery-response',
            payload: scanResult,
            from: 'server'
          }));
          
          // Also initiate a network scan
          const scanMessage: DiscoveryMessage = {
            action: 'scan',
            device: {
              id: 'server',
              name: 'CamX Server',
              ipAddress: getLocalIpAddress(),
              port: '5000'
            }
          };
          
          const scanBuffer = Buffer.from(JSON.stringify(scanMessage));
          discoverySocket.send(scanBuffer, 0, scanBuffer.length, discoveryPort, broadcastAddress);
        } else if (parsedMessage.to) {
          // If there's a target recipient
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
        log(`Error parsing WebSocket message: ${error}`, 'websocket');
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      log(`Client disconnected: ${clientId}`, 'websocket');
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
    
    // Send initial device list to the newly connected client
    storage.getActiveDevicesOnNetwork().then((activeDevices) => {
      const scanResult: NetworkScanResult = {
        devices: activeDevices,
        timestamp: new Date().toISOString()
      };
      
      ws.send(JSON.stringify({
        type: 'discovery-response',
        payload: scanResult,
        from: 'server'
      }));
    }).catch((error) => {
      log(`Error getting active devices for new client: ${error}`, 'websocket');
    });
  });
  
  return httpServer;
}
