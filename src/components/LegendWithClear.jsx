import React from "react";
import Legend from "../Legend";

/**
 * Legend component with optional clear filter button
 */
const LegendWithClear = ({
  colorScale,
  bins,
  width = 500,
  height = 45,
  title,
  selectedRanges,
  onRangeSelect,
  onClear,
  className = "",
}) => {
  return (
    <div className={`map-legend-footer ${className}`}>
      <Legend
        colorScale={colorScale}
        bins={bins}
        width={width}
        height={height}
        title={title}
        onRangeSelect={onRangeSelect}
        selectedRanges={selectedRanges}
      />
      {selectedRanges && selectedRanges.length > 0 && (
        <button className="clear-filter-btn" onClick={onClear}>
          Clear Filter
        </button>
      )}
    </div>
  );
};

export default LegendWithClear;
