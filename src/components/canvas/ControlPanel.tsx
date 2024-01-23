import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as timeline from "@/types/timeline";

interface ControlPanelProps {
  onAddRectangle: () => void;
  onDurationChange: (duration: number) => void;
  onPlayAnimation: () => void;
  onDownloadProject: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  timelineState,
  setTimelineState,
  onAddRectangle,
  onDownloadProject,
}) => {
  const onDurationChange = useCallback(
    function (e: ChangeEvent<HTMLInputElement>): void {
      const duration = Number(e.target.value);
      setTimelineState(timeline.updateDuration(duration, timelineState));
    },
    [timelineState, setTimelineState],
  );

  return (
    <div className="flex flex-col grow space-y-6">
      <div className="flex flex-col space-y-6">
        <Button onClick={onAddRectangle}>Add Rectangle</Button>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Duration</Label>
          <Input
            type="number"
            min={timeline.MIN_DURATION}
            value={timelineState.duration}
            onChange={onDurationChange}
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
