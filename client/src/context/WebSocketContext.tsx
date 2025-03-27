import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { ConnectionStatus, ConnectionInfo, SignalMessage, DeviceInfo, NetworkScanResult } from "@shared/types";

interface WebSocketContextType {
  ws: WebSocket | null;
  connectionInfo: ConnectionInfo;
  sendMessage: (message: SignalMessage) => void;
  connect: (method: "wifi" | "usb", ipAddress?: string, port?: string) => void;
  disconnect: () => void;
  stream: MediaStream | null;
  errorModalOpen: boolean;
  closeErrorModal: () => void;
  discoveredDevices: DeviceInfo[];
  scanForDevices: () => void;
  connectToDevice: (deviceInfo: DeviceInfo) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: ConnectionStatus.DISCONNECTED,
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [discoveredDevices, setDiscoveredDevices] = useState<DeviceInfo[]>([]);

  const createWebSocketConnection = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as SignalMessage;
        handleWebSocketMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionInfo({
        status: ConnectionStatus.ERROR,
        errorMessage: "WebSocket connection error",
      });
      setErrorMessage("WebSocket connection error");
      setErrorModalOpen(true);
    };
    
    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setConnectionInfo({
        status: ConnectionStatus.DISCONNECTED,
      });
      setStream(null);
    };
    
    return socket;
  };

  useEffect(() => {
    const socket = createWebSocketConnection();
    setWs(socket);
    
    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (message: SignalMessage) => {
    switch (message.type) {
      case 'offer':
        // Handle offer (from mobile device)
        handleOffer(message);
        break;
      case 'answer':
        // Handle answer (in response to our offer)
        handleAnswer(message);
        break;
      case 'ice-candidate':
        // Handle new ICE candidate
        handleIceCandidate(message);
        break;
      case 'disconnect':
        // Handle disconnect request
        disconnect();
        break;
      case 'discovery-response':
        // Handle discovery response with available devices
        handleDiscoveryResponse(message);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  };
  
  const handleDiscoveryResponse = (message: SignalMessage) => {
    // Process discovered devices list
    const scanResult = message.payload as NetworkScanResult;
    console.log("Received device discovery response:", scanResult);
    
    if (scanResult && Array.isArray(scanResult.devices)) {
      setDiscoveredDevices(scanResult.devices);
      
      // If we were in searching state, update to disconnected
      if (connectionInfo.status === ConnectionStatus.SEARCHING) {
        setConnectionInfo({
          status: ConnectionStatus.DISCONNECTED
        });
      }
    }
  };

  const handleOffer = (message: SignalMessage) => {
    // This would integrate with WebRTC to handle an offer from a mobile device
    console.log("Received offer from mobile device:", message);
    
    // In a real implementation, this would create a WebRTC connection and set remote description
    // For this example, we'll simulate a successful connection
    setTimeout(() => {
      // Mock successful connection
      if (Math.random() > 0.3) { // 70% chance of success
        // Create mock video stream
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(mediaStream => {
          setStream(mediaStream);
          setConnectionInfo({
            status: ConnectionStatus.CONNECTED,
            deviceInfo: {
              id: message.from,
              name: "Mobile Device",
              ipAddress: "192.168.1.105",
              port: "4747",
            },
            signalStrength: "Excellent (5.4 MB/s)"
          });
        })
        .catch(error => {
          console.error("Error accessing camera:", error);
          setConnectionInfo({
            status: ConnectionStatus.ERROR,
            errorMessage: "Could not access camera: " + error.message,
          });
          setErrorMessage("Could not access camera: " + error.message);
          setErrorModalOpen(true);
        });
      } else {
        // Mock connection failure
        setConnectionInfo({
          status: ConnectionStatus.ERROR,
          errorMessage: "Connection failed. The mobile device could not be reached."
        });
        setErrorMessage("Connection failed. The mobile device could not be reached.");
        setErrorModalOpen(true);
      }
    }, 1500);
  };

  const handleAnswer = (message: SignalMessage) => {
    // This would integrate with WebRTC to handle an answer to our offer
    console.log("Received answer:", message);
  };

  const handleIceCandidate = (message: SignalMessage) => {
    // This would integrate with WebRTC to handle ICE candidates
    console.log("Received ICE candidate:", message);
  };

  const sendMessage = (message: SignalMessage) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
      setErrorMessage("WebSocket is not connected. Please try again.");
      setErrorModalOpen(true);
    }
  };

  const connect = (method: "wifi" | "usb", ipAddress?: string, port?: string) => {
    if (connectionInfo.status === ConnectionStatus.CONNECTING) {
      return;
    }
    
    setConnectionInfo({
      status: ConnectionStatus.CONNECTING,
    });
    
    // Simulate a connection attempt via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendMessage({
        type: 'offer',
        payload: {
          connectionType: method,
          ipAddress,
          port,
        },
        from: 'browser-client',
      });
    } else {
      setConnectionInfo({
        status: ConnectionStatus.ERROR,
        errorMessage: "WebSocket is not connected. Try refreshing the page.",
      });
      setErrorMessage("WebSocket is not connected. Try refreshing the page.");
      setErrorModalOpen(true);
    }
  };

  const disconnect = () => {
    if (connectionInfo.status !== ConnectionStatus.CONNECTED) {
      return;
    }
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendMessage({
        type: 'disconnect',
        payload: {},
        from: 'browser-client',
      });
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setConnectionInfo({
      status: ConnectionStatus.DISCONNECTED,
    });
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
    if (connectionInfo.status === ConnectionStatus.ERROR || 
        connectionInfo.status === ConnectionStatus.CONNECTING) {
      setConnectionInfo({
        status: ConnectionStatus.DISCONNECTED,
      });
    }
  };

  // Function to scan for available devices on the network
  const scanForDevices = useCallback(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      setErrorMessage("WebSocket is not connected. Please refresh the page and try again.");
      setErrorModalOpen(true);
      return;
    }
    
    // Set status to searching
    setConnectionInfo({
      status: ConnectionStatus.SEARCHING
    });
    
    // Send discovery request
    sendMessage({
      type: 'discovery',
      payload: {},
      from: 'browser-client'
    });
    
    // Also make a direct API call to initiate a network scan
    fetch('/api/devices/scan', {
      method: 'POST',
    })
    .then(response => response.json())
    .catch(error => {
      console.error("Error initiating device scan:", error);
    });
    
    // Clear previous devices while scanning
    setDiscoveredDevices([]);
  }, [ws]);
  
  // Function to connect to a specific discovered device
  const connectToDevice = useCallback((deviceInfo: DeviceInfo) => {
    if (!deviceInfo.ipAddress || !deviceInfo.port) {
      setErrorMessage("Cannot connect to device: Missing IP address or port");
      setErrorModalOpen(true);
      return;
    }
    
    // Connect using the WiFi method with device IP and port
    connect("wifi", deviceInfo.ipAddress, deviceInfo.port);
  }, []);
  
  return (
    <WebSocketContext.Provider
      value={{
        ws,
        connectionInfo,
        sendMessage,
        connect,
        disconnect,
        stream,
        errorModalOpen,
        closeErrorModal,
        discoveredDevices,
        scanForDevices,
        connectToDevice,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
