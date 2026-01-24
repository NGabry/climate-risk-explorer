import React from "react";
import PropTypes from "prop-types";

const Tooltip = ({ data, position, colorScale }) => {
  if (!data || !position) return null;

  return (
    <div
      className="map-tooltip"
      style={{
        position: "fixed",
        left: position.x + 15,
        top: position.y - 10,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      <div className="tooltip-header">
        <span className="tooltip-name">{data.name}</span>
      </div>
      <div className="tooltip-content">
        <div className="tooltip-risk">
          <span
            className="risk-indicator"
            style={{ backgroundColor: colorScale(data.total_risk) }}
          />
          <span className="risk-label">Total Risk:</span>
          <span className="risk-value">{data.total_risk}</span>
        </div>
        <div className="tooltip-factors">
          <div className="factor-row">
            <span className="factor-label">Heat</span>
            <span className="factor-value">{data.heat}</span>
          </div>
          <div className="factor-row">
            <span className="factor-label">Wet Bulb</span>
            <span className="factor-value">{data.wet_bulb}</span>
          </div>
          <div className="factor-row">
            <span className="factor-label">Crop Yields</span>
            <span className="factor-value">{data.farm_crop_yields}</span>
          </div>
          <div className="factor-row">
            <span className="factor-label">Sea Level</span>
            <span className="factor-value">{data.sea_level_rise}</span>
          </div>
          <div className="factor-row">
            <span className="factor-label">Wildfire</span>
            <span className="factor-value">{data.wildfires}</span>
          </div>
          <div className="factor-row">
            <span className="factor-label">Economic</span>
            <span className="factor-value">{data.economic_damages}</span>
          </div>
        </div>
      </div>
      <div className="tooltip-footer">Click to select</div>
    </div>
  );
};

Tooltip.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    total_risk: PropTypes.number.isRequired,
    heat: PropTypes.number.isRequired,
    wet_bulb: PropTypes.number.isRequired,
    farm_crop_yields: PropTypes.number.isRequired,
    sea_level_rise: PropTypes.number.isRequired,
    wildfires: PropTypes.number.isRequired,
    economic_damages: PropTypes.number.isRequired,
  }),
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }),
  colorScale: PropTypes.func.isRequired,
};

export default Tooltip;
