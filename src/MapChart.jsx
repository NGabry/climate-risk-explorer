import React, { useState, useCallback, useRef } from "react";

// Components
import MapContainer from "./components/MapContainer";
import RiskTabs from "./components/RiskTabs";
import RadarPanel from "./components/RadarPanel";
import ZoomControls from "./components/ZoomControls";
import LegendWithClear from "./components/LegendWithClear";
import SocialLinks from "./components/SocialLinks";
import Histogram from "./Histogram";
import Statistics from "./Statistics";
import Tooltip from "./Tooltip";
import Search from "./Search";
import InfoModal from "./InfoModal";
import MobileLayout from "./MobileLayout";

// Hooks
import { useIsMobile } from "./hooks/useIsMobile";
import { useMapData, useColorScale, useHistogramBins } from "./hooks/useMapData";
import { useMapState } from "./hooks/useMapState";
import { useSelectionState } from "./hooks/useSelectionState";

// Constants
import { MAP_COLORS, MOBILE_BREAKPOINT } from "./constants";

const MapChart = () => {
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);

  // Tooltip state (desktop only)
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [infoModalType, setInfoModalType] = useState(null);
  const mapRef = useRef(null);

  // Map viewport state
  const {
    zoom,
    center,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleMoveEnd,
    zoomToLocation,
  } = useMapState();

  // Data fetching and processing
  const {
    data,
    cities,
    dataMap,
    countyCentroids,
    countyFeatures,
    defaultCounty,
  } = useMapData();

  // Selection state
  const {
    selectedCounty,
    comparisonCounties,
    selectedRiskType,
    selectedRanges,
    setSelectedRanges,
    cityMarker,
    setCityMarker,
    radarCounties,
    handleCountyClick,
    handleSearchSelect,
    handleCitySelect,
    handleRiskTypeChange,
    handleRangeSelect,
    handleBinClick,
    clearComparison,
    removeFromComparison,
    getCountyOpacity,
  } = useSelectionState({
    dataMap,
    countyCentroids,
    countyFeatures,
    defaultCounty,
    zoomToLocation,
  });

  // Compute color scale and histogram based on selected risk type
  const colorScale = useColorScale(selectedRiskType);
  const histogramBins = useHistogramBins(data, selectedRiskType);

  // Hover handlers for tooltip (desktop only)
  const handleCountyHover = useCallback(
    (geo, event) => {
      const countyData = dataMap.get(geo.id);
      if (countyData) {
        setHoveredCounty(countyData);
        setTooltipPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [dataMap]
  );

  const handleCountyLeave = useCallback(() => {
    setHoveredCounty(null);
    setTooltipPosition(null);
  }, []);

  // Get county stroke styling
  const getCountyStroke = useCallback((geo) => {
    if (selectedCounty && selectedCounty.id === geo.id) {
      return { color: MAP_COLORS.selection, width: 3 };
    }
    if (comparisonCounties.find((c) => c.id === geo.id)) {
      return { color: MAP_COLORS.selection, width: 2 };
    }
    if (hoveredCounty && hoveredCounty.id === geo.id) {
      return { color: MAP_COLORS.selection, width: 1.5 };
    }
    return { color: MAP_COLORS.defaultStroke, width: 0.2 };
  }, [selectedCounty, comparisonCounties, hoveredCounty]);

  // Render mobile layout
  if (isMobile) {
    return (
      <MobileLayout
        data={data}
        dataMap={dataMap}
        cities={cities}
        colorScale={colorScale}
        histogramBins={histogramBins}
        selectedCounty={selectedCounty}
        selectedRiskType={selectedRiskType}
        selectedRanges={selectedRanges}
        comparisonCounties={comparisonCounties}
        radarCounties={radarCounties}
        zoom={zoom}
        center={center}
        cityMarker={cityMarker}
        setCityMarker={setCityMarker}
        handleRiskTypeChange={handleRiskTypeChange}
        handleRangeSelect={handleRangeSelect}
        handleBinClick={handleBinClick}
        handleCountyClick={handleCountyClick}
        handleSearchSelect={handleSearchSelect}
        handleCitySelect={handleCitySelect}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleReset={handleReset}
        handleMoveEnd={handleMoveEnd}
        getCountyOpacity={getCountyOpacity}
        getCountyStroke={getCountyStroke}
        clearComparison={clearComparison}
        removeFromComparison={removeFromComparison}
        setSelectedRanges={setSelectedRanges}
        infoModalType={infoModalType}
        setInfoModalType={setInfoModalType}
      />
    );
  }

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="top-section">
          <div className="map-section">
            <div className="map-controls">
              <Search
                data={data}
                cities={cities}
                onSelect={handleSearchSelect}
                onCitySelect={handleCitySelect}
                colorScale={colorScale}
              />
              <div className="header-title">
                <h1>U.S. Climate Risk Explorer</h1>
                <span className="header-subtitle">County-level climate risk projections for 2040–2060</span>
              </div>
            </div>

            <div className="map-wrapper" ref={mapRef}>
              <div className="risk-tabs">
                <div className="tabs-left">
                  <RiskTabs
                    selectedRiskType={selectedRiskType}
                    onRiskTypeChange={handleRiskTypeChange}
                    showInfoButton={true}
                    onInfoClick={() => setInfoModalType(true)}
                  />
                </div>
                <ZoomControls
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onReset={handleReset}
                />
              </div>

              <MapContainer
                zoom={zoom}
                center={center}
                onMoveEnd={handleMoveEnd}
                dataMap={dataMap}
                colorScale={colorScale}
                selectedRiskType={selectedRiskType}
                selectedCounty={selectedCounty}
                comparisonCounties={comparisonCounties}
                hoveredCounty={hoveredCounty}
                cityMarker={cityMarker}
                onCountyClick={handleCountyClick}
                onCountyHover={handleCountyHover}
                onCountyLeave={handleCountyLeave}
                onCityMarkerClear={() => setCityMarker(null)}
                getCountyOpacity={getCountyOpacity}
              />

              <LegendWithClear
                colorScale={colorScale}
                bins={histogramBins}
                width={500}
                height={45}
                title={`${selectedRiskType.label} Score`}
                selectedRanges={selectedRanges}
                onRangeSelect={handleRangeSelect}
                onClear={() => setSelectedRanges(null)}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <SocialLinks />
            <div className="radar-section">
              <RadarPanel
                radarCounties={radarCounties}
                comparisonCounties={comparisonCounties}
                onClear={clearComparison}
                onRemove={removeFromComparison}
                emptyStateHint="Shift+Click counties to compare"
              />
            </div>
          </div>
        </div>

        <div className="bottom-section">
          <div className="chart-panel stats-panel">
            <Statistics
              data={data}
              selectedCounty={selectedCounty}
              riskKey={selectedRiskType.key}
              riskLabel={selectedRiskType.label}
            />
          </div>
          <div className="chart-panel histogram-panel">
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
      </div>

      <Tooltip
        data={hoveredCounty}
        position={tooltipPosition}
        colorScale={colorScale}
        selectedRiskType={selectedRiskType}
      />

      <InfoModal
        isOpen={infoModalType !== null}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );
};

export default MapChart;
