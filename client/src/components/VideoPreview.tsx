import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectionStatus, ConnectionInfo } from "@shared/types";

interface VideoPreviewProps {
  connectionInfo: ConnectionInfo;
  stream?: MediaStream | null;
}

const VideoPreview = ({ connectionInfo, stream }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isConnected = connectionInfo.status === ConnectionStatus.CONNECTED;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleScreenshot = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `droidcam-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    link.click();
  };

  // Placeholder for record functionality
  const handleRecord = () => {
    // Record functionality would be implemented here
    console.log("Record button clicked");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-neutral-700">Video Preview</h2>
          <div className="text-sm text-neutral-500">
            {isConnected ? "Live Preview" : "Not connected"}
          </div>
        </div>
        
        <div className="aspect-video bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
          {isConnected && stream ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-6">
              <i className="fas fa-video text-4xl text-neutral-400 mb-3"></i>
              <p className="text-neutral-600">Connect to your device to view the camera feed</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center mt-4 space-x-4">
          <Button 
            variant={isConnected ? "default" : "outline"} 
            disabled={!isConnected}
            onClick={handleScreenshot}
            className="py-2 px-4"
          >
            <i className="fas fa-camera mr-2"></i>
            Screenshot
          </Button>
          <Button 
            variant={isConnected ? "default" : "outline"} 
            disabled={!isConnected}
            onClick={handleRecord}
            className="py-2 px-4"
          >
            <i className="fas fa-record-vinyl mr-2"></i>
            Record
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPreview;
