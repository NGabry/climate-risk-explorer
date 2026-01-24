import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { mean, median } from "d3-array";
import { format } from "d3-format";

const Statistics = ({ data, selectedCounty, riskKey = 'total_risk', riskLabel = 'Risk' }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const riskValues = data.map((d) => d[riskKey]);
    const formatNum = format(".1f");

    return {
      count: data.length,
      mean: formatNum(mean(riskValues)),
      median: formatNum(median(riskValues)),
    };
  }, [data, riskKey]);

  const countyPercentile = useMemo(() => {
    if (!data || !selectedCounty) return null;

    const sorted = [...data].sort((a, b) => a[riskKey] - b[riskKey]);
    const index = sorted.findIndex((d) => d.id === selectedCounty.id);
    if (index === -1) return null;

    const percentile = ((index + 1) / sorted.length) * 100;
    return format(".0f")(percentile);
  }, [data, selectedCounty, riskKey]);

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
          <span className="stat-label">Mean {riskLabel}</span>
          <span className="stat-value">{stats.mean}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Median {riskLabel}</span>
          <span className="stat-value">{stats.median}</span>
        </div>
      </div>

      {selectedCounty && countyPercentile && (
        <div className="selected-stats">
          <div className="selected-stats-main">
            <div className="selected-stats-left">
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
            <div className="selected-stats-score">
              <span className="score-value">{selectedCounty[riskKey]}</span>
              <span className="score-label">{riskLabel} Score</span>
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
      id: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedCounty: PropTypes.object,
  riskKey: PropTypes.string,
  riskLabel: PropTypes.string,
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.data.length !== nextProps.data.length) {
    return false;
  }
  if (prevProps.riskKey !== nextProps.riskKey) {
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
