import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ControlPanelProps {
  onAddRectangle: () => void;
  onDurationChange: (duration: number) => void;
  onPlayAnimation: () => void;
  onDownloadProject: () => void;
}

const DEFAULT_DURATION = 60;

const ControlPanel: React.FC<ControlPanelProps> = ({
  onAddRectangle,
  onDurationChange,
  onPlayAnimation,
  onDownloadProject,
}) => {
  return (
    <div className="flex flex-col grow space-y-6">
      <div className="flex flex-col space-y-6">
        <Button onClick={onAddRectangle}>Add Rectangle</Button>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Duration</Label>
          <Input
            type="number"
            min="1"
            defaultValue={DEFAULT_DURATION}
            onChange={(e) => onDurationChange(Number(e.target.value))}
          />
        </div>
        <Button onClick={onPlayAnimation}>Play</Button>
      </div>
      <div className="flex flex-col space-y-3">
        <Button onClick={onDownloadProject}>Import</Button>
        <Button onClick={onDownloadProject} variant="secondary">
          Export
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
