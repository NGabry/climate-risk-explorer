import React from "react";
import PropTypes from "prop-types";

const ALL_FACTORS = [
  { key: 'total_risk', label: 'Total Risk' },
  { key: 'heat', label: 'Heat' },
  { key: 'wet_bulb', label: 'Wet Bulb' },
  { key: 'farm_crop_yields', label: 'Crop Yields' },
  { key: 'sea_level_rise', label: 'Sea Level' },
  { key: 'wildfires', label: 'Wildfire' },
  { key: 'economic_damages', label: 'Economic' },
];

const Tooltip = ({ data, position, colorScale, selectedRiskType }) => {
  if (!data || !position) return null;

  const selectedKey = selectedRiskType?.key || 'total_risk';
  const selectedLabel = selectedRiskType?.label || 'Total Risk';
  const selectedValue = data[selectedKey];

  // All factors except the selected one
  const otherFactors = ALL_FACTORS.filter(f => f.key !== selectedKey);

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
            style={{ backgroundColor: colorScale(selectedValue) }}
          />
          <span className="risk-label">{selectedLabel}:</span>
          <span className="risk-value">{selectedValue}</span>
        </div>
        <div className="tooltip-factors">
          {otherFactors.map(factor => (
            <div className="factor-row" key={factor.key}>
              <span className="factor-label">{factor.label}</span>
              <span className="factor-value">{data[factor.key]}</span>
            </div>
          ))}
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
  selectedRiskType: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
};

export default Tooltip;
