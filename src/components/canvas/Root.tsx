import React, { useState, useCallback } from "react";
import Canvas from "./Canvas";
import * as types from "./types";
import * as timeline from "../../types/timeline.tsx";
import ControlPanel from "./ControlPanel";

const App: React.FC = () => {
  const [canvasData, _setCanvasData] = useState<types.Canvas>(
    types.exampleCanvas,
  );
  const [timelineState, setTimelineState] = useState<timeline.Timeline>(
    timeline.init(),
  );

  const onAddRectangle = useCallback(
    function () {
      setTimelineState(timeline.pause(timelineState));
    },
    [timelineState],
  );

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0">
      <div className="fixed top-0 right-0 bottom-0 left-0 flex">
        <div className="grow lg:border-r h-full">
          <Canvas
            canvasData={canvasData}
            timelineState={timelineState}
            setTimelineState={setTimelineState}
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
    </div>
  );
};

export default App;
