export interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'disconnect';
  payload: any;
  from: string;
  to?: string;
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export interface DeviceInfo {
  id: string;
  name: string;
  ipAddress?: string;
  port?: string;
}

export interface ConnectionInfo {
  status: ConnectionStatus;
  deviceInfo?: DeviceInfo;
  errorMessage?: string;
  signalStrength?: string;
}
