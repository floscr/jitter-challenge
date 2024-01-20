import React from "react";

interface ControlPanelProps {
  onAddRectangle: () => void;
  onDurationChange: (duration: number) => void;
  onPlayAnimation: () => void;
  onDownloadProject: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onAddRectangle,
  onDurationChange,
  onPlayAnimation,
  onDownloadProject,
}) => {
  return (
    <div className="control-panel">
      <button onClick={onAddRectangle}>Add Rectangle</button>
      <label>
        Duration (seconds):
        <input
          type="number"
          min="1"
          onChange={(e) => onDurationChange(Number(e.target.value))}
        />
      </label>
      <button onClick={onPlayAnimation}>Play Animation</button>
      <button onClick={onDownloadProject}>Download Project</button>
    </div>
  );
};

export default ControlPanel;
