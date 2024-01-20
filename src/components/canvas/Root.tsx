import React, { useState } from "react";
import Canvas from "./Canvas";
import * as types from "./types";
import ControlPanel from "./ControlPanel";

const App: React.FC = () => {
  const [canvasData, setCanvasData] = useState<types.Canvas>(
    types.exampleCanvas,
  );
  const [duration, setDuration] = useState<number>(1); // default duration is 1 second

  const addRectangle = () => {
    // Implement logic to add a random rectangular shape to the scene
    // Update the 'shapes' state
  };

  const playAnimation = () => {
    // Implement logic to rotate all shapes in the scene
    // Use the 'duration' state to set the animation duration
  };

  const downloadProject = () => {
    // Implement logic to download the scene's data in JSON format
    // Use the 'shapes' state to get the current scene data
  };

  const updateShapeColor = (index: number) => {
    // Implement logic to update the color of a clicked shape
    // Use the 'shapes' state to update the color of the selected shape
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0">
      <div className="fixed top-0 right-0 bottom-0 left-0 flex">
        <div className="grow lg:border-r h-full">
          <Canvas canvasData={canvasData} onClick={updateShapeColor} />
        </div>
        <aside className="p-6 flex" style={{ minWidth: "300px" }}>
          <ControlPanel
            onAddRectangle={addRectangle}
            onDurationChange={setDuration}
            onPlayAnimation={playAnimation}
            onDownloadProject={downloadProject}
          />
        </aside>
      </div>
    </div>
  );
};

export default App;