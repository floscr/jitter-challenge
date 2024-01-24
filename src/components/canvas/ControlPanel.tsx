import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as timeline from "@/types/timeline";

interface ControlPanelProps {
  setTimelineState: React.Dispatch<timeline.Timeline>;
  timelineState: timeline.Timeline;
  onAddRectangle: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  setTimelineState,
  timelineState,
  onAddRectangle,
}) => {
  const onDurationChange = useCallback(
    function (e: React.ChangeEvent<HTMLInputElement>): void {
      const duration = Number(e.target.value);
      const nextState = timeline.updateDuration(duration, timelineState);
      setTimelineState(nextState);
    },
    [timelineState, setTimelineState],
  );

  const onPlayPauseClick = useCallback(
    function (): void {
      const nextState = timeline.togglePlayPause(timelineState);
      setTimelineState(nextState);
    },
    [timelineState, setTimelineState],
  );

  return (
    <div className="flex flex-col grow space-y-6">
      <div className="flex flex-col space-y-6">
        <Button onClick={(_e) => onAddRectangle()}>Add Rectangle</Button>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Duration</Label>
          <Input
            type="number"
            min={timeline.MIN_DURATION}
            value={timelineState.duration}
            onChange={onDurationChange}
          />
        </div>
        {timeline.isPlaying(timelineState) ? (
          <Button onClick={onPlayPauseClick}>Pause</Button>
        ) : (
          <Button onClick={onPlayPauseClick}>Play</Button>
        )}
      </div>
      <div className="flex flex-col space-y-3">
        <Button>Import</Button>
        <Button>Export</Button>
      </div>
    </div>
  );
};

export default ControlPanel;
