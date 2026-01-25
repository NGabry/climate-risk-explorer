import React from "react";

/**
 * Shared zoom control buttons for map navigation
 */
const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
  className = "zoom-controls",
  showResetLabel = true,
}) => {
  return (
    <div className={className}>
      <button onClick={onZoomIn} title="Zoom In">+</button>
      <button onClick={onZoomOut} title="Zoom Out">−</button>
      <button onClick={onReset} title="Reset View">
        {showResetLabel ? "Reset" : "⟲"}
      </button>
    </div>
  );
};

export default ZoomControls;
