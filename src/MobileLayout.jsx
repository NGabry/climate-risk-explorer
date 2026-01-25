import React, { useState, useRef, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { AkHiStates, AkHiCounties } from "./AkHi";
import D3RadarChart from "./D3RadarChart";
import Legend from "./Legend";
import Histogram from "./Histogram";
import Statistics from "./Statistics";
import Search from "./Search";
import InfoModal from "./InfoModal";
import { CHART_COLORS, MAP_CONFIG, MAP_COLORS, RISK_TYPES } from "./constants";

const MobileLayout = ({
  // Data
  data,
  dataMap,
  cities,
  colorScale,
  histogramBins,

  // Selection state
  selectedCounty,
  selectedRiskType,
  selectedRanges,
  comparisonCounties,
  radarCounties,

  // Map state
  zoom,
  center,
  cityMarker,
  setCityMarker,

  // Handlers
  handleRiskTypeChange,
  handleRangeSelect,
  handleBinClick,
  handleCountyClick,
  handleSearchSelect,
  handleCitySelect,
  handleZoomIn,
  handleZoomOut,
  handleReset,
  handleMoveEnd,
  getCountyOpacity,
  getCountyStroke,
  clearComparison,
  removeFromComparison,
  setSelectedRanges,

  // Modal
  infoModalType,
  setInfoModalType,
}) => {
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'stats' | 'compare'
  const [compareMode, setCompareMode] = useState(false); // Toggle for comparison mode on mobile

  return (
    <div className="mobile-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-title">
          <h1>Climate Risk Explorer</h1>
          <span className="mobile-subtitle">County-level climate risk projections for 2040–2060</span>
        </div>
        <div className="mobile-search-wrapper">
          <Search
            data={data}
            cities={cities}
            onSelect={handleSearchSelect}
            onCitySelect={handleCitySelect}
            colorScale={colorScale}
          />
        </div>
        {/* View Tabs (Map/Stats/Compare) */}
        <div className="mobile-view-tabs">
          <button
            className={`mobile-view-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/>
              <path d="M8 2v16"/>
              <path d="M16 6v16"/>
            </svg>
            <span>Map</span>
          </button>
          <button
            className={`mobile-view-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10"/>
              <path d="M12 20V4"/>
              <path d="M6 20v-6"/>
            </svg>
            <span>Stats</span>
          </button>
          <button
            className={`mobile-view-tab ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <ellipse cx="8" cy="12" rx="6" ry="7"/>
              <ellipse cx="16" cy="12" rx="6" ry="7"/>
            </svg>
            <span>Compare</span>
            {radarCounties.length > 0 && (
              <span className="mobile-view-tab-badge">{radarCounties.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="mobile-content">
        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="mobile-map-view">
            {/* Map */}
            <div className="mobile-map-container">
              <ComposableMap projection="geoAlbersUsa" className="map-svg">
                <ZoomableGroup
                  zoom={zoom}
                  center={center}
                  onMoveEnd={handleMoveEnd}
                  minZoom={MAP_CONFIG.defaultZoom}
                  maxZoom={MAP_CONFIG.maxZoom}
                >
                  <Geographies geography={MAP_CONFIG.geoUrl}>
                    {({ geographies }) =>
                      geographies
                        .filter((geo) => !AkHiCounties.includes(geo.id))
                        .map((geo) => {
                          const countyData = dataMap.get(geo.id);
                          const stroke = getCountyStroke(geo);
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={
                                countyData
                                  ? colorScale(countyData[selectedRiskType.key])
                                  : "#EEE"
                              }
                              stroke={stroke.color}
                              strokeWidth={stroke.width / zoom}
                              opacity={getCountyOpacity(countyData)}
                              onClick={(e) => {
                                // If compare mode is on, add to comparison
                                if (compareMode) {
                                  handleCountyClick(geo, { shiftKey: true });
                                } else {
                                  handleCountyClick(geo, e);
                                }
                              }}
                              style={{
                                default: { outline: "none", cursor: "pointer" },
                                hover: { outline: "none", cursor: "pointer" },
                                pressed: { outline: "none" },
                              }}
                            />
                          );
                        })
                    }
                  </Geographies>
                  <Geographies geography={MAP_CONFIG.statesGeoUrl}>
                    {({ geographies }) =>
                      geographies
                        .filter((geo) => !AkHiStates.includes(geo.id))
                        .map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill="none"
                            stroke="#000"
                            strokeWidth={0.7 / zoom}
                            style={{
                              default: { outline: "none", pointerEvents: "none" },
                              hover: { outline: "none" },
                              pressed: { outline: "none" },
                            }}
                          />
                        ))
                    }
                  </Geographies>
                  {cityMarker && (
                    <Marker coordinates={[cityMarker.lng, cityMarker.lat]}>
                      <g className="city-marker" onClick={() => setCityMarker(null)}>
                        <circle r={8 / zoom} className="city-marker-pulse" />
                        <circle r={0.05 / zoom} className="city-marker-dot" />
                      </g>
                    </Marker>
                  )}
                </ZoomableGroup>
              </ComposableMap>

              {/* Zoom Controls Overlay */}
              <div className="mobile-zoom-controls">
                <button onClick={handleZoomIn} title="Zoom In">+</button>
                <button onClick={handleZoomOut} title="Zoom Out">−</button>
                <button onClick={handleReset} title="Reset">⟲</button>
              </div>

              {/* Compare Mode Toggle */}
              <button
                className={`mobile-compare-toggle ${compareMode ? 'active' : ''} ${comparisonCounties.length >= 8 ? 'at-limit' : ''}`}
                onClick={() => {
                  if (compareMode) {
                    // Turning off compare mode - clear selections
                    clearComparison();
                  }
                  setCompareMode(!compareMode);
                }}
                title={compareMode ? "Exit compare mode" : "Enter compare mode"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <ellipse cx="8" cy="12" rx="6" ry="7"/>
                  <ellipse cx="16" cy="12" rx="6" ry="7"/>
                </svg>
                <span>
                  {compareMode
                    ? `Compare: ${comparisonCounties.length}/8`
                    : 'Compare'}
                </span>
              </button>
            </div>

            {/* Legend */}
            <div className="mobile-legend">
              <Legend
                colorScale={colorScale}
                bins={histogramBins}
                width={320}
                height={40}
                title={`${selectedRiskType.label} Score`}
                onRangeSelect={handleRangeSelect}
                selectedRanges={selectedRanges}
              />
              {selectedRanges && selectedRanges.length > 0 && (
                <button className="clear-filter-btn" onClick={() => setSelectedRanges(null)}>
                  Clear Filter
                </button>
              )}
            </div>

            {/* Selected County Quick Info */}
            {selectedCounty && (
              <div className="mobile-selected-info">
                <div className="mobile-selected-header">
                  <span className="mobile-selected-name">{selectedCounty.name}</span>
                  <span
                    className="mobile-selected-score"
                    style={{ backgroundColor: colorScale(selectedCounty[selectedRiskType.key]) }}
                  >
                    {selectedCounty[selectedRiskType.key]}
                  </span>
                </div>
                <p className="mobile-selected-hint">
                  View detailed stats in the Stats tab
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="mobile-stats-view">
            <div className="mobile-panel stats-panel">
              <Statistics
                data={data}
                selectedCounty={selectedCounty}
                riskKey={selectedRiskType.key}
                riskLabel={selectedRiskType.label}
              />
            </div>
            <div className="mobile-panel histogram-panel">
              <Histogram
                data={data}
                colorScale={colorScale}
                selectedCounty={selectedCounty}
                onBinClick={handleBinClick}
                selectedRanges={selectedRanges}
                riskKey={selectedRiskType.key}
                riskLabel={selectedRiskType.label}
                domain={selectedRiskType.domain}
              />
            </div>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div className="mobile-compare-view">
            <div className="mobile-panel mobile-radar-panel">
              {radarCounties.length > 0 ? (
                <>
                  <div className="radar-header">
                    <h3>Risk Profile Comparison</h3>
                    {comparisonCounties.length > 0 && (
                      <button className="clear-btn" onClick={clearComparison}>
                        Clear
                      </button>
                    )}
                  </div>
                  <D3RadarChart
                    counties={radarCounties}
                    onRemove={removeFromComparison}
                  />
                  <div className="radar-legend">
                    {radarCounties.map((county, i) => (
                      <div key={county.id} className="radar-legend-item">
                        <span
                          className="legend-color"
                          style={{ backgroundColor: county.isPrimary ? CHART_COLORS[0].stroke : CHART_COLORS[(i % (CHART_COLORS.length - 1)) + 1].stroke }}
                        />
                        <span className="legend-name">
                          {county.name}
                        </span>
                        <span className="legend-risk">({county.total_risk})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mobile-empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <ellipse cx="8" cy="12" rx="6" ry="7"/>
                    <ellipse cx="16" cy="12" rx="6" ry="7"/>
                  </svg>
                  <h3>No Counties Selected</h3>
                  <p>Tap a county on the map to see its risk profile</p>
                  <p className="hint">Use the Compare button on the map to add multiple counties</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Risk Category Tabs */}
      <div className="mobile-tab-bar">
        <div className="mobile-risk-bar">
          {RISK_TYPES.map((type) => (
            <button
              key={type.key}
              className={`mobile-risk-tab ${selectedRiskType.key === type.key ? 'active' : ''}`}
              onClick={() => handleRiskTypeChange(type)}
            >
              {type.label}
            </button>
          ))}
          <button
            className="mobile-risk-tab info-btn"
            onClick={() => setInfoModalType(true)}
            title="About Risk Factors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </button>
        </div>
        <div className="mobile-footer">
          <span className="mobile-footer-text">
            Data from <a href="https://projects.propublica.org/climate-migration/" target="_blank" rel="noopener noreferrer">ProPublica / Rhodium Group</a>
          </span>
          <span className="social-divider">|</span>
          <a
            href="https://github.com/NGabry/climate-risk-explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title="GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/ngabry/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            title="LinkedIn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal
        isOpen={infoModalType !== null}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );
};

export default MobileLayout;
