import { Card, CardContent } from "@/components/ui/card";
import { ConnectionStatus, ConnectionInfo } from "@shared/types";

interface ConnectionStatusProps {
  connectionInfo: ConnectionInfo;
}

const ConnectionStatusComponent = ({ connectionInfo }: ConnectionStatusProps) => {
  const getStatusColor = () => {
    switch (connectionInfo.status) {
      case ConnectionStatus.CONNECTED:
        return "bg-accent status-pulse";
      case ConnectionStatus.CONNECTING:
        return "bg-yellow-500";
      case ConnectionStatus.ERROR:
        return "bg-error";
      default:
        return "bg-neutral-400";
    }
  };

  const getStatusText = () => {
    switch (connectionInfo.status) {
      case ConnectionStatus.CONNECTED:
        return "Connected";
      case ConnectionStatus.CONNECTING:
        return "Connecting...";
      case ConnectionStatus.ERROR:
        return "Connection Error";
      default:
        return "Disconnected";
    }
  };

  const getStatusTextClass = () => {
    switch (connectionInfo.status) {
      case ConnectionStatus.CONNECTED:
        return "text-accent";
      case ConnectionStatus.CONNECTING:
        return "text-yellow-500";
      case ConnectionStatus.ERROR:
        return "text-error";
      default:
        return "text-neutral-600";
    }
  };

  const getConnectionInfoText = () => {
    switch (connectionInfo.status) {
      case ConnectionStatus.CONNECTED:
        return (
          <>
            <p>Connected to device at {connectionInfo.deviceInfo?.ipAddress}:{connectionInfo.deviceInfo?.port}</p>
            <p className="mt-1 text-xs">Signal strength: {connectionInfo.signalStrength || "Good"}</p>
          </>
        );
      case ConnectionStatus.CONNECTING:
        return <p>Attempting to connect to device...</p>;
      case ConnectionStatus.ERROR:
        return <p>{connectionInfo.errorMessage || "Connection error occurred. Please try again."}</p>;
      default:
        return <p>No device connected. Use the connection options below to start.</p>;
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-700">Connection Status</h2>
          <div className="flex items-center">
            <span className={`h-3 w-3 rounded-full ${getStatusColor()} mr-2`}></span>
            <span className={getStatusTextClass()}>{getStatusText()}</span>
          </div>
        </div>
        <div className="mt-4 p-4 bg-neutral-100 rounded-md text-sm text-neutral-600">
          {getConnectionInfoText()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatusComponent;
