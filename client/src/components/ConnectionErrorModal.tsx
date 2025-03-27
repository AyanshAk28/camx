import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConnectionErrorModalProps {
  isOpen: boolean;
  errorMessage?: string;
  onClose: () => void;
}

const ConnectionErrorModal = ({ isOpen, errorMessage, onClose }: ConnectionErrorModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <DialogHeader>
          <div className="flex items-start mb-4">
            <div className="bg-error bg-opacity-10 p-3 rounded-full">
              <AlertTriangle className="text-error h-6 w-6" />
            </div>
            <div className="ml-4">
              <DialogTitle className="text-lg font-medium text-neutral-800">Connection Error</DialogTitle>
              <p className="text-neutral-600 mt-1">
                {errorMessage || "Unable to connect to the device. Please check your connection settings and try again."}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4 bg-neutral-100 p-3 rounded-md text-sm">
          <div className="font-medium mb-1">Possible solutions:</div>
          <ul className="list-disc pl-5 text-neutral-600 space-y-1">
            <li>Ensure your phone and computer are on the same network</li>
            <li>Check if the mobile app is running</li>
            <li>Verify the IP address and port are correct</li>
            <li>Disable firewalls or add an exception</li>
          </ul>
        </div>
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="py-2 px-4 bg-primary text-white rounded-md hover:bg-secondary transition duration-200">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionErrorModal;
