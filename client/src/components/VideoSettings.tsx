import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { ConnectionStatus, ConnectionInfo } from "@shared/types";

interface VideoSettingsProps {
  connectionInfo: ConnectionInfo;
  onSettingsChange: (settings: {
    resolution: string;
    frameRate: string;
    autoFocus: boolean;
    videoStabilization: boolean;
    mirrorVideo: boolean;
    lowLightEnhancement: boolean;
  }) => void;
}

const VideoSettings = ({ connectionInfo, onSettingsChange }: VideoSettingsProps) => {
  const [resolution, setResolution] = useState("1280×720");
  const [frameRate, setFrameRate] = useState("30");
  const [autoFocus, setAutoFocus] = useState(true);
  const [videoStabilization, setVideoStabilization] = useState(false);
  const [mirrorVideo, setMirrorVideo] = useState(false);
  const [lowLightEnhancement, setLowLightEnhancement] = useState(false);

  const handleResolutionChange = (value: string) => {
    setResolution(value);
    onSettingsChange({
      resolution: value,
      frameRate,
      autoFocus,
      videoStabilization,
      mirrorVideo,
      lowLightEnhancement,
    });
  };

  const handleFrameRateChange = (value: string) => {
    setFrameRate(value);
    onSettingsChange({
      resolution,
      frameRate: value,
      autoFocus,
      videoStabilization,
      mirrorVideo,
      lowLightEnhancement,
    });
  };

  const handleAutoFocusChange = (checked: boolean) => {
    setAutoFocus(checked);
    onSettingsChange({
      resolution,
      frameRate,
      autoFocus: checked,
      videoStabilization,
      mirrorVideo,
      lowLightEnhancement,
    });
  };

  const handleVideoStabilizationChange = (checked: boolean) => {
    setVideoStabilization(checked);
    onSettingsChange({
      resolution,
      frameRate,
      autoFocus,
      videoStabilization: checked,
      mirrorVideo,
      lowLightEnhancement,
    });
  };

  const handleMirrorVideoChange = (checked: boolean) => {
    setMirrorVideo(checked);
    onSettingsChange({
      resolution,
      frameRate,
      autoFocus,
      videoStabilization,
      mirrorVideo: checked,
      lowLightEnhancement,
    });
  };

  const handleLowLightEnhancementChange = (checked: boolean) => {
    setLowLightEnhancement(checked);
    onSettingsChange({
      resolution,
      frameRate,
      autoFocus,
      videoStabilization,
      mirrorVideo,
      lowLightEnhancement: checked,
    });
  };

  const isConnected = connectionInfo.status === ConnectionStatus.CONNECTED;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-neutral-700 mb-4">Video Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-2">Video Resolution</Label>
            <Select 
              value={resolution} 
              onValueChange={handleResolutionChange}
              disabled={!isConnected}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="640×480">640×480 (VGA)</SelectItem>
                <SelectItem value="1280×720">1280×720 (HD)</SelectItem>
                <SelectItem value="1920×1080">1920×1080 (Full HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-2">Frame Rate</Label>
            <Select 
              value={frameRate} 
              onValueChange={handleFrameRateChange}
              disabled={!isConnected}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frame rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 FPS</SelectItem>
                <SelectItem value="30">30 FPS</SelectItem>
                <SelectItem value="60">60 FPS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-neutral-700">Auto-Focus</Label>
              <Toggle 
                checked={autoFocus} 
                onCheckedChange={handleAutoFocusChange} 
                disabled={!isConnected}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-neutral-700">Video Stabilization</Label>
              <Toggle 
                checked={videoStabilization} 
                onCheckedChange={handleVideoStabilizationChange} 
                disabled={!isConnected}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-neutral-700">Mirror Video</Label>
              <Toggle 
                checked={mirrorVideo} 
                onCheckedChange={handleMirrorVideoChange} 
                disabled={!isConnected}
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-neutral-700">Low Light Enhancement</Label>
              <Toggle 
                checked={lowLightEnhancement} 
                onCheckedChange={handleLowLightEnhancementChange} 
                disabled={!isConnected}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoSettings;
