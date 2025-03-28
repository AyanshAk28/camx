import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConnectionStatus, ConnectionInfo } from "@shared/types";
import { Copy } from "lucide-react";

interface ConnectionOptionsProps {
  connectionInfo: ConnectionInfo;
  onConnectClick: (method: "wifi" | "usb", ipAddress?: string, port?: string) => void;
  onDisconnectClick: () => void;
}

const ConnectionOptions = ({ connectionInfo, onConnectClick, onDisconnectClick }: ConnectionOptionsProps) => {
  const [connectionMethod, setConnectionMethod] = useState<"wifi" | "usb">("wifi");
  const [ipAddress, setIpAddress] = useState("192.168.1.100");
  const [port, setPort] = useState("4747");
  const [myIpAddress, setMyIpAddress] = useState("");

  useEffect(() => {
    // Get the computer's IP address from the backend
    fetch("/api/network/ip")
      .then(res => res.json())
      .then(data => {
        if (data.ipAddress) {
          setMyIpAddress(data.ipAddress);
        }
      })
      .catch(err => {
        console.error("Error fetching IP address:", err);
      });
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(myIpAddress);
  };

  const handleConnectClick = () => {
    if (connectionInfo.status === ConnectionStatus.CONNECTED) {
      onDisconnectClick();
    } else {
      onConnectClick(connectionMethod, connectionMethod === "wifi" ? ipAddress : undefined, port);
    }
  };

  const isConnected = connectionInfo.status === ConnectionStatus.CONNECTED;
  const isConnecting = connectionInfo.status === ConnectionStatus.CONNECTING;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-neutral-700 mb-4">Connection Options</h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium text-neutral-700">Connection Method</label>
          </div>
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
            <Button 
              className={`flex-1 py-6 ${connectionMethod === "wifi" ? "bg-primary text-white" : "bg-neutral-200 text-neutral-700"}`}
              onClick={() => setConnectionMethod("wifi")}
              disabled={isConnected || isConnecting}
            >
              <i className="fas fa-wifi mr-2"></i>
              WiFi
            </Button>
            <Button 
              className={`flex-1 py-6 ${connectionMethod === "usb" ? "bg-primary text-white" : "bg-neutral-200 text-neutral-700"}`}
              onClick={() => setConnectionMethod("usb")}
              disabled={isConnected || isConnecting}
            >
              <i className="fas fa-usb mr-2"></i>
              USB
            </Button>
          </div>
        </div>
        
        {connectionMethod === "wifi" && (
          <div className="mb-4">
            <div className="p-4 bg-neutral-100 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">IP Address</label>
                  <div className="flex">
                    <Input
                      value={myIpAddress}
                      className="rounded-r-none"
                      disabled
                    />
                    <Button 
                      className="bg-neutral-200 px-3 rounded-l-none border border-neutral-300 border-l-0 hover:bg-neutral-300"
                      onClick={handleCopyToClipboard}
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Your computer's network IP address</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Port</label>
                  <Select 
                    value={port}
                    onValueChange={(value) => setPort(value)}
                    disabled={isConnected || isConnecting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select port" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4747">4747 (Default)</SelectItem>
                      <SelectItem value="8080">8080</SelectItem>
                      <SelectItem value="9000">9000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm font-medium text-neutral-700 mb-2">Connection Instructions:</div>
                <ol className="list-decimal pl-5 text-sm text-neutral-600 space-y-1">
                  <li>Install CamX app on your mobile device</li>
                  <li>Ensure your phone and computer are on the same network</li>
                  <li>Open the app and note the IP address and port</li>
                  <li>Enter those details above and click Connect</li>
                </ol>
              </div>
            </div>
          </div>
        )}
        
        {connectionMethod === "usb" && (
          <div className="mb-4">
            <div className="p-4 bg-neutral-100 rounded-md">
              <div className="mb-3">
                <div className="text-sm font-medium text-neutral-700 mb-1">USB Connection Status</div>
                <div className="text-sm text-neutral-600">No device detected. Please connect your mobile device via USB.</div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm font-medium text-neutral-700 mb-1">USB Debugging</div>
                <div className="flex items-center">
                  <span className="text-sm text-neutral-600 mr-2">USB debugging must be enabled on your device</span>
                  <i className="fas fa-info-circle text-primary cursor-pointer" title="Learn how to enable USB debugging"></i>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm font-medium text-neutral-700 mb-2">Connection Instructions:</div>
                <ol className="list-decimal pl-5 text-sm text-neutral-600 space-y-1">
                  <li>Install CamX app on your mobile device</li>
                  <li>Connect your phone to the computer with a USB cable</li>
                  <li>Enable USB debugging in mobile device developer options</li>
                  <li>Open the app on your phone and click Connect</li>
                </ol>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          <Button 
            className={`py-6 px-8 ${isConnected ? "bg-error hover:bg-error/90" : "bg-primary hover:bg-secondary"}`}
            onClick={handleConnectClick}
            disabled={isConnecting}
          >
            {isConnected ? (
              <>
                <i className="fas fa-times-circle mr-2"></i>
                Disconnect
              </>
            ) : (
              <>
                <i className="fas fa-plug mr-2"></i>
                Connect
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionOptions;
