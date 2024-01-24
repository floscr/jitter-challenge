import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as types from "./types";
import * as timeline from "@/types/timeline";
import md5 from "md5";

interface ControlPanelProps {
  canvasData: types.Canvas;
  onAddRectangle: () => void;
  setTimelineState: React.Dispatch<timeline.Timeline>;
  timelineState: timeline.Timeline;
}

const downloadJson = (filename: string, jsonString: string) => {
  const blob = new Blob([jsonString], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const onDownloadCanvasJsonClick = (canvas: types.Canvas): void => {
  const exportableCanvas = {
    entities: canvas.entities,
  };
  const json = JSON.stringify(exportableCanvas, null, 2);
  const hash = md5(json);

  const filename = `jitter_${hash}.json`;
  downloadJson(filename, json);
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  canvasData,
  onAddRectangle,
  setTimelineState,
  timelineState,
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

  const onDowloadClick = useCallback(
    function (): void {
      onDownloadCanvasJsonClick(canvasData);
    },
    [canvasData],
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
        <Button onClick={onDowloadClick}>Export</Button>
      </div>
    </div>
  );
};

export default ControlPanel;
