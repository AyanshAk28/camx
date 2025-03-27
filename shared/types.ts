export interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'disconnect' | 'discovery' | 'discovery-response';
  payload: any;
  from: string;
  to?: string;
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
  SEARCHING = 'searching'
}

export interface DeviceInfo {
  id: string | number; // Can be string from client, number from database
  name: string;
  ipAddress?: string | null;
  port?: string | null;
  model?: string | null;
  platform?: string | null; // 'android', 'ios', etc.
  isAvailable?: boolean;
  lastSeen?: string | Date;
  deviceId?: string; // Database field
  isActive?: boolean; // Database field
}

export interface ConnectionInfo {
  status: ConnectionStatus;
  deviceInfo?: DeviceInfo;
  errorMessage?: string;
  signalStrength?: string;
}

export interface DiscoveryMessage {
  action: 'scan' | 'announce' | 'acknowledge';
  device: {
    id: string;
    name: string;
    model?: string;
    platform?: string;
    ipAddress: string;
    port: string;
  };
}

export interface DeviceCapabilities {
  maxResolution: string;
  frameRates: string[];
  hasFlash: boolean;
  hasAutoFocus: boolean;
  supportsVideoStabilization: boolean;
  supportsLowLightEnhancement: boolean;
  availableCameras: CameraInfo[];
}

export interface CameraInfo {
  id: string;
  type: 'front' | 'back' | 'external';
  label: string;
}

export interface NetworkScanResult {
  devices: DeviceInfo[];
  timestamp: string;
}
