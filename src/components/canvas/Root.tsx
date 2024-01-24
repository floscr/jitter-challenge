import React, { useState, useCallback } from "react";
import Canvas from "./Canvas";
import * as types from "./types";
import * as timeline from "../../types/timeline.tsx";
import ControlPanel from "./ControlPanel";

const App: React.FC = () => {
  const [canvasData, setCanvasData] = useState<types.Canvas>(
    types.exampleCanvas,
  );
  const [timelineState, setTimelineState] = useState<timeline.Timeline>(
    timeline.init(),
  );

  const onAddRectangle = useCallback(function () {
    setTimelineState(timeline.pause);
    setCanvasData(types.addRandomRectangleEntity);
  }, []);

  const onRandomizeRectangleColor = useCallback(function (id: string): void {
    setCanvasData((state) => types.randomizeRectangleColor(id, state));
  }, []);

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 flex">
      <div className="grow lg:border-r h-full">
        <Canvas
          canvasData={canvasData}
          setCanvasData={setCanvasData}
          timelineState={timelineState}
          setTimelineState={setTimelineState}
          onRandomizeRectangleColor={onRandomizeRectangleColor}
        />
      </div>
      <aside className="p-6 flex" style={{ minWidth: "300px" }}>
        <ControlPanel
          timelineState={timelineState}
          setTimelineState={setTimelineState}
          onAddRectangle={onAddRectangle}
        />
      </aside>
    </div>
  );
};

export default App;
