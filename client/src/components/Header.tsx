import { Button } from "@/components/ui/button";
import { Settings, HelpCircle } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-primary text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <i className="fas fa-video text-2xl mr-2"></i>
          <h1 className="text-xl font-bold">DroidCam</h1>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white hover:bg-secondary">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-secondary ml-2">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
