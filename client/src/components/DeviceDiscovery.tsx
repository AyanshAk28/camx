import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Laptop, Smartphone, Search, Wifi, Clock, Info } from "lucide-react";
import { useWebSocket } from "@/context/WebSocketContext";
import { DeviceInfo, ConnectionStatus } from "@shared/types";

export const DeviceDiscovery = () => {
  const { 
    connectionInfo, 
    discoveredDevices, 
    scanForDevices, 
    connectToDevice 
  } = useWebSocket();

  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  const handleScan = () => {
    scanForDevices();
    setLastScanTime(new Date());
  };

  // Auto-scan when component mounts
  useEffect(() => {
    if (connectionInfo.status === ConnectionStatus.DISCONNECTED) {
      handleScan();
    }
  }, []);

  return (
    <Card className="w-full shadow-md border-opacity-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Device Discovery</CardTitle>
            <CardDescription>Find available devices on your network</CardDescription>
          </div>
          <Button onClick={handleScan} variant="outline" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            <span>Scan</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {connectionInfo.status === ConnectionStatus.SEARCHING && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-500 animate-pulse" />
              <AlertDescription className="text-blue-700">
                Searching for devices on your network...
              </AlertDescription>
            </div>
          </Alert>
        )}

        {lastScanTime && (
          <div className="flex items-center text-xs text-muted-foreground mb-3">
            <Clock className="h-3 w-3 mr-1" />
            <span>Last scan: {lastScanTime.toLocaleTimeString()}</span>
          </div>
        )}

        <Tabs defaultValue="discovered">
          <TabsList className="mb-2 w-full">
            <TabsTrigger value="discovered" className="flex-1">
              <Wifi className="h-4 w-4 mr-1" />
              Discovered Devices
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              <Clock className="h-4 w-4 mr-1" />
              Recent Devices
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="discovered">
            {discoveredDevices.length > 0 ? (
              <ScrollArea className="h-[240px] rounded-md border p-2">
                <div className="space-y-2">
                  {discoveredDevices.map((device) => (
                    <DeviceCard 
                      key={device.id} 
                      device={device} 
                      onConnect={() => connectToDevice(device)}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] text-center p-4 border rounded-md bg-muted/20">
                <Info className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                <h3 className="font-medium mb-1">No devices found</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  Make sure your mobile device is connected to the same WiFi network and has the CamX app open.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="flex flex-col items-center justify-center h-[240px] text-center p-4 border rounded-md bg-muted/20">
              <Clock className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
              <h3 className="font-medium mb-1">Recent connections</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Your recently connected devices will appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface DeviceCardProps {
  device: DeviceInfo;
  onConnect: () => void;
}

const DeviceCard = ({ device, onConnect }: DeviceCardProps) => {
  const isAvailable = device.isAvailable !== false;
  
  return (
    <div className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center">
          {device.platform?.toLowerCase().includes('android') ? (
            <Smartphone className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Laptop className="h-4 w-4 mr-2 text-blue-500" />
          )}
          <span className="font-medium">{device.name}</span>
        </div>
        <Badge variant={isAvailable ? "outline" : "secondary"} className="text-xs">
          {isAvailable ? "Available" : "Offline"}
        </Badge>
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        <div>Model: {device.model || "Unknown"}</div>
        <div>IP: {device.ipAddress || "Unknown"}</div>
      </div>
      
      <Separator className="my-2" />
      
      <div className="flex justify-end">
        <Button 
          size="sm" 
          onClick={onConnect}
          disabled={!isAvailable}
          className="text-xs"
        >
          Connect
        </Button>
      </div>
    </div>
  );
};