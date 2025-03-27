import { useState } from "react";
import Header from "@/components/Header";
import ConnectionStatus from "@/components/ConnectionStatus";
import ConnectionOptions from "@/components/ConnectionOptions";
import VideoSettings from "@/components/VideoSettings";
import VideoPreview from "@/components/VideoPreview";
import Footer from "@/components/Footer";
import ConnectionErrorModal from "@/components/ConnectionErrorModal";
import { useWebSocket } from "@/context/WebSocketContext";
import { VideoSettings as VideoSettingsType } from "@shared/schema";

const Home = () => {
  const {
    connectionInfo,
    connect,
    disconnect,
    stream,
    errorModalOpen,
    closeErrorModal
  } = useWebSocket();

  const [videoSettings, setVideoSettings] = useState<VideoSettingsType>({
    resolution: "1280×720",
    frameRate: "30",
    autoFocus: true,
    videoStabilization: false,
    mirrorVideo: false,
    lowLightEnhancement: false,
  });

  const handleVideoSettingsChange = (newSettings: VideoSettingsType) => {
    setVideoSettings(newSettings);
    // You would apply these settings to the active connection
    console.log("Video settings changed:", newSettings);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <ConnectionStatus connectionInfo={connectionInfo} />
        
        <ConnectionOptions 
          connectionInfo={connectionInfo}
          onConnectClick={connect}
          onDisconnectClick={disconnect}
        />
        
        <VideoSettings 
          connectionInfo={connectionInfo}
          onSettingsChange={handleVideoSettingsChange}
        />
        
        <VideoPreview 
          connectionInfo={connectionInfo}
          stream={stream}
        />
      </main>
      
      <Footer />
      
      <ConnectionErrorModal 
        isOpen={errorModalOpen}
        errorMessage={connectionInfo.errorMessage}
        onClose={closeErrorModal}
      />
    </div>
  );
};

export default Home;
