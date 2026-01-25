import React, { useState } from "react";

// Shared components
import MapContainer from "./components/MapContainer";
import RiskTabs from "./components/RiskTabs";
import RadarPanel from "./components/RadarPanel";
import ZoomControls from "./components/ZoomControls";
import SocialLinks from "./components/SocialLinks";

// Other components
import Legend from "./Legend";
import Histogram from "./Histogram";
import Statistics from "./Statistics";
import Search from "./Search";
import InfoModal from "./InfoModal";

// Constants
import { COMPARISON_LIMIT } from "./constants";

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
  const [activeTab, setActiveTab] = useState('map');
  const [compareMode, setCompareMode] = useState(false);

  // Handle county click with compare mode support
  const handleMobileCountyClick = (geo, event) => {
    if (compareMode) {
      handleCountyClick(geo, { shiftKey: true });
    } else {
      handleCountyClick(geo, event);
    }
  };

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
            <div className="mobile-map-container">
              <MapContainer
                zoom={zoom}
                center={center}
                onMoveEnd={handleMoveEnd}
                dataMap={dataMap}
                colorScale={colorScale}
                selectedRiskType={selectedRiskType}
                selectedCounty={selectedCounty}
                comparisonCounties={comparisonCounties}
                cityMarker={cityMarker}
                onCountyClick={handleMobileCountyClick}
                onCityMarkerClear={() => setCityMarker(null)}
                getCountyOpacity={getCountyOpacity}
              />

              {/* Zoom Controls Overlay */}
              <ZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
                className="mobile-zoom-controls"
                showResetLabel={false}
              />

              {/* Compare Mode Toggle */}
              <button
                className={`mobile-compare-toggle ${compareMode ? 'active' : ''} ${comparisonCounties.length >= COMPARISON_LIMIT ? 'at-limit' : ''}`}
                onClick={() => {
                  if (compareMode) {
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
                    ? `Compare: ${comparisonCounties.length}/${COMPARISON_LIMIT}`
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
                  <RadarPanel
                    radarCounties={radarCounties}
                    comparisonCounties={comparisonCounties}
                    onClear={clearComparison}
                    onRemove={removeFromComparison}
                    showHeader={false}
                    showClearButton={false}
                    emptyStateHint="Use the Compare button on the map to add multiple counties"
                  />
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
          <RiskTabs
            selectedRiskType={selectedRiskType}
            onRiskTypeChange={handleRiskTypeChange}
            tabClassName="mobile-risk-tab"
          />
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
          <SocialLinks showDataSource={true} className="mobile-footer" />
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
