import React from "react";
import { RISK_TYPES } from "../constants";

/**
 * Shared risk category selector tabs
 * Used in both desktop sidebar and mobile bottom bar
 */
const RiskTabs = ({
  selectedRiskType,
  onRiskTypeChange,
  showInfoButton = false,
  onInfoClick,
  className = "",
  tabClassName = "risk-tab",
}) => {
  return (
    <>
      {RISK_TYPES.map((type) => (
        <button
          key={type.key}
          className={`${tabClassName} ${selectedRiskType.key === type.key ? 'active' : ''} ${className}`}
          onClick={() => onRiskTypeChange(type)}
        >
          {type.label}
        </button>
      ))}
      {showInfoButton && (
        <button
          className="info-icon-btn"
          onClick={onInfoClick}
          title="About Risk Factors"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>
      )}
    </>
  );
};

export default RiskTabs;
