import React from "react";
import D3RadarChart from "../D3RadarChart";
import { CHART_COLORS } from "../constants";

/**
 * Shared radar chart panel with legend
 * Displays risk profile for selected and comparison counties
 */
const RadarPanel = ({
  radarCounties,
  comparisonCounties,
  onClear,
  onRemove,
  emptyStateTitle = "Click on a county to view its risk profile",
  emptyStateHint = "Shift+Click counties to compare",
  showClearButton = true,
  showHeader = true,
  className = "",
}) => {
  if (radarCounties.length === 0) {
    return (
      <div className={`no-selection ${className}`}>
        <p>{emptyStateTitle}</p>
        <p className="hint">{emptyStateHint}</p>
      </div>
    );
  }

  return (
    <>
      {showHeader && (
        <div className="radar-header">
          <h3>Risk Profile</h3>
          {showClearButton && comparisonCounties.length > 0 && (
            <button className="clear-btn" onClick={onClear}>
              Clear Comparison
            </button>
          )}
        </div>
      )}
      <D3RadarChart
        counties={radarCounties}
        onRemove={onRemove}
      />
      <div className="radar-legend">
        {radarCounties.map((county, i) => (
          <div key={county.id} className="radar-legend-item">
            <span
              className="legend-color"
              style={{
                backgroundColor: county.isPrimary
                  ? CHART_COLORS[0].stroke
                  : CHART_COLORS[(i % (CHART_COLORS.length - 1)) + 1].stroke
              }}
            />
            <span className="legend-name">{county.name}</span>
            <span className="legend-risk">({county.total_risk})</span>
          </div>
        ))}
      </div>
      <p className="hint">{emptyStateHint}</p>
    </>
  );
};

export default RadarPanel;
