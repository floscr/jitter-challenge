import React, { useCallback, useRef } from "react";
import md5 from "md5";
import { Ok, Err, Result } from "ts-results";
import { match } from "ts-pattern";

import * as timeline from "@/lib/timeline";
import * as canvas from "@/lib/canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Export ----------------------------------------------------------------------

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

const exportCanvasJson = (canvas: canvas.Canvas): void => {
  const exportableCanvas = {
    entities: canvas.entities,
  };
  const json = JSON.stringify(exportableCanvas, null, 2);
  const hash = md5(json);

  const filename = `jitter_${hash}.json`;
  downloadJson(filename, json);
};

// Import ----------------------------------------------------------------------

const readFile = async (file: File): Promise<canvas.Canvas> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result as string;
        const result = canvas.CanvasJson.parse(JSON.parse(jsonString));
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};

const importCanvasJson = async (
  event: React.ChangeEvent<HTMLInputElement>,
): Promise<Result<canvas.Canvas, Error>> => {
  const file = event.target.files?.[0];
  let result;

  if (file) {
    try {
      const data = await readFile(file);
      result = Ok(data);
    } catch (error) {
      result = Err(error as Error);
    }
  } else {
    result = Err(new Error("No file given"));
  }

  return result;
};

const FileUploadButton = function ({
  onInputChange,
  label,
  accept = ".json",
}: {
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  accept?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onButtonClick = () => fileInputRef.current?.click();

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />
      <Button onClick={onButtonClick}>{label}</Button>
    </>
  );
};

// Component -------------------------------------------------------------------

interface ControlPanelProps {
  canvasData: canvas.Canvas;
  onAddRectangle: () => void;
  setCanvasData: React.Dispatch<React.SetStateAction<canvas.Canvas>>;
  setTimelineState: React.Dispatch<React.SetStateAction<timeline.Timeline>>;
  timelineState: timeline.Timeline;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  canvasData,
  onAddRectangle,
  setCanvasData,
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

  const onExportClick = useCallback(
    function (): void {
      exportCanvasJson(canvasData);
    },
    [canvasData],
  );

  const onImportClick = useCallback(
    async function (e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
      const result = await importCanvasJson(e);
      match(result)
        .with({ ok: true }, ({ val }) => {
          const canvasData = val as canvas.Canvas;
          setCanvasData((state) => ({ ...state, ...canvasData }));
          setTimelineState(timeline.stop);
        })
        .with({ ok: false }, ({ val }) => console.error(val))
        .exhaustive();
    },
    [setCanvasData, setTimelineState],
  );

  return (
    <div className="flex flex-col grow space-y-6 justify-between">
      <div className="flex flex-col space-y-6">
        <Button onClick={(_e) => onAddRectangle()}>Add Rectangle</Button>
      </div>
      <div className="flex flex-col space-y-3">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label>Duration</Label>
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
        <Button onClick={onExportClick}>Export</Button>
        <FileUploadButton label={"Import"} onInputChange={onImportClick} />
      </div>
    </div>
  );
};

export default ControlPanel;
