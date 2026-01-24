import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { mean, median, deviation, min, max, quantile } from "d3-array";
import { format } from "d3-format";

const Statistics = ({ data, selectedCounty }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const riskValues = data.map((d) => d.total_risk);
    const formatNum = format(".1f");
    const formatInt = format("d");

    return {
      count: data.length,
      mean: formatNum(mean(riskValues)),
      median: formatNum(median(riskValues)),
      stdDev: formatNum(deviation(riskValues)),
      min: formatInt(min(riskValues)),
      max: formatInt(max(riskValues)),
      q25: formatNum(quantile(riskValues.sort((a, b) => a - b), 0.25)),
      q75: formatNum(quantile(riskValues.sort((a, b) => a - b), 0.75)),
    };
  }, [data]);

  const countyPercentile = useMemo(() => {
    if (!data || !selectedCounty) return null;

    const sorted = [...data].sort((a, b) => a.total_risk - b.total_risk);
    const index = sorted.findIndex((d) => d.id === selectedCounty.id);
    if (index === -1) return null;

    const percentile = ((index + 1) / sorted.length) * 100;
    return format(".0f")(percentile);
  }, [data, selectedCounty]);

  if (!stats) return null;

  return (
    <div className="statistics-container">
      <h4 className="statistics-title">National Statistics</h4>
      <div className="statistics-grid">
        <div className="stat-item">
          <span className="stat-label">Counties</span>
          <span className="stat-value">{format(",")(stats.count)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Mean Risk</span>
          <span className="stat-value">{stats.mean}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Median Risk</span>
          <span className="stat-value">{stats.median}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Std Dev</span>
          <span className="stat-value">{stats.stdDev}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Range</span>
          <span className="stat-value">
            {stats.min} - {stats.max}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">IQR</span>
          <span className="stat-value">
            {stats.q25} - {stats.q75}
          </span>
        </div>
      </div>

      {selectedCounty && countyPercentile && (
        <div className="selected-stats">
          <div className="selected-county-name">
            {selectedCounty.name}
          </div>
          <div className="percentile-container">
            <span className="percentile-label">National Percentile</span>
            <span className="percentile-value">{countyPercentile}%</span>
            <div className="percentile-bar">
              <div
                className="percentile-fill"
                style={{ width: `${countyPercentile}%` }}
              />
              <div
                className="percentile-marker"
                style={{ left: `${countyPercentile}%` }}
              />
            </div>
            <div className="percentile-labels">
              <span>Lower Risk</span>
              <span>Higher Risk</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Statistics.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      total_risk: PropTypes.number.isRequired,
      id: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedCounty: PropTypes.object,
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.data.length !== nextProps.data.length) {
    return false;
  }
  const prevId = prevProps.selectedCounty?.id;
  const nextId = nextProps.selectedCounty?.id;
  if (prevId !== nextId) {
    return false;
  }
  return true;
};

export default React.memo(Statistics, areEqual);
