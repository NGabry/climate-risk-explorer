import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import { interpolateRdYlGn } from "d3-scale-chromatic";
import { csv, json } from "d3-fetch";
import { bin } from "d3-array";
import { geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import { AkHiStates, AkHiCounties } from "./AkHi";

import D3RadarChart from "./D3RadarChart";
import Legend from "./Legend";
import Histogram from "./Histogram";
import Statistics from "./Statistics";
import Tooltip from "./Tooltip";
import Search from "./Search";
import InfoModal from "./InfoModal";
import { CHART_COLORS, MAP_CONFIG, MAP_COLORS, RISK_TYPES } from "./constants";

const MapChart = () => {
  const [data, setData] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [selectedRiskType, setSelectedRiskType] = useState(RISK_TYPES[0]);
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [comparisonCounties, setComparisonCounties] = useState([]);
  const [zoom, setZoom] = useState(MAP_CONFIG.defaultZoom);
  const [center, setCenter] = useState(MAP_CONFIG.defaultCenter);
  const [countyCentroids, setCountyCentroids] = useState(new Map());
  const [cities, setCities] = useState([]);
  const [cityMarker, setCityMarker] = useState(null);
  const [infoModalType, setInfoModalType] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    csv("/climate.csv", (d) => ({
      ...d,
      heat: +d.heat,
      wet_bulb: +d.wet_bulb,
      farm_crop_yields: +d.farm_crop_yields,
      sea_level_rise: +d.sea_level_rise,
      wildfires: +d.wildfires,
      economic_damages: +d.economic_damages,
      total_risk: +d.total_risk,
    })).then((counties) => {
      setData(counties);
    });
  }, []);

  // Load county centroids for zoom-to-county feature
  useEffect(() => {
    json(MAP_CONFIG.geoUrl).then((topology) => {
      const counties = feature(topology, topology.objects.counties);
      const centroids = new Map();
      counties.features.forEach((f) => {
        const centroid = geoCentroid(f);
        if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
          centroids.set(f.id, centroid);
        }
      });
      setCountyCentroids(centroids);
    });
  }, []);

  // Load cities for search
  useEffect(() => {
    json("/cities.json").then((citiesData) => {
      setCities(citiesData);
    });
  }, []);

  const dataMap = useMemo(() => {
    const map = new Map();
    data.forEach((d) => map.set(d.id, d));
    return map;
  }, [data]);

  const colorScale = useMemo(() =>
    scaleQuantize()
      .domain(selectedRiskType.domain)
      .range(Array.from({ length: 15 }, (_, i) => interpolateRdYlGn(1 - i / 14))),
    [selectedRiskType]
  );

  // Calculate histogram bins to share between Legend and Histogram
  // This ensures both components use identical boundaries for selection sync
  const histogramBins = useMemo(() => {
    if (!data || data.length === 0) return [];

    const riskValues = data.map((d) => d[selectedRiskType.key]);
    const [minDomain, maxDomain] = selectedRiskType.domain;
    const rangeSize = maxDomain - minDomain;
    const numBins = rangeSize <= 10 ? rangeSize : 15;

    const histogram = bin()
      .domain([minDomain, maxDomain])
      .thresholds(numBins);

    return histogram(riskValues);
  }, [data, selectedRiskType]);

  const handleCountyClick = useCallback(
    (geo, event) => {
      const countyData = dataMap.get(geo.id);
      if (countyData) {
        if (event?.shiftKey) {
          setComparisonCounties((prev) => {
            const exists = prev.find((c) => c.id === countyData.id);
            if (exists) {
              return prev.filter((c) => c.id !== countyData.id);
            }
            if (prev.length >= 4) {
              return [...prev.slice(1), countyData];
            }
            return [...prev, countyData];
          });
        } else {
          setSelectedCounty(countyData);
          setCityMarker(null); // Clear city marker when county selected
        }
      }
    },
    [dataMap]
  );

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

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.5, MAP_CONFIG.maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.5, MAP_CONFIG.defaultZoom));
  };

  const handleReset = () => {
    setZoom(MAP_CONFIG.defaultZoom);
    setCenter(MAP_CONFIG.defaultCenter);
  };

  const handleMoveEnd = (position) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  };

  const handleRangeSelect = useCallback((range) => {
    setSelectedRange(range);
  }, []);

  const handleBinClick = useCallback((range) => {
    setSelectedRange(range);
  }, []);

  const handleRiskTypeChange = useCallback((type) => {
    setSelectedRiskType(type);
    setSelectedRange(null);
  }, []);

  const handleSearchSelect = useCallback((county) => {
    setSelectedCounty(county);
    setCityMarker(null); // Clear any city marker
    // Zoom to the county if we have its centroid
    const centroid = countyCentroids.get(county.id);
    if (centroid) {
      setCenter(centroid);
      setZoom(MAP_CONFIG.selectionZoom);
    }
  }, [countyCentroids]);

  const handleCitySelect = useCallback((city) => {
    // Zoom to the city coordinates without selecting a county
    setCenter([city.lng, city.lat]);
    setZoom(MAP_CONFIG.selectionZoom);
    // Show marker at city location
    setCityMarker({ lat: city.lat, lng: city.lng, name: city.name });
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonCounties([]);
  }, []);

  const removeFromComparison = useCallback((county) => {
    setComparisonCounties((prev) => prev.filter((c) => c.id !== county.id));
  }, []);

  const getCountyOpacity = (countyData) => {
    if (!selectedRange) return 1;
    if (!countyData) return 0.3;
    const value = countyData[selectedRiskType.key];
    // Use half-open interval [min, max) - left-inclusive, right-exclusive
    // Exception: include the domain maximum in the last bin
    const isLastBin = selectedRange[1] === selectedRiskType.domain[1];
    const isInRange = value >= selectedRange[0] &&
      (isLastBin ? value <= selectedRange[1] : value < selectedRange[1]);
    return isInRange ? 1 : 0.15;
  };

  const getCountyStroke = (geo) => {
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
  };

  // Combine selected county with comparison counties for radar
  const radarCounties = useMemo(() => {
    const counties = [];
    if (selectedCounty) {
      counties.push({ ...selectedCounty, isPrimary: true });
    }
    comparisonCounties.forEach((c) => {
      if (!selectedCounty || c.id !== selectedCounty.id) {
        counties.push({ ...c, isPrimary: false });
      }
    });
    return counties;
  }, [selectedCounty, comparisonCounties]);

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="top-section">
          <div className="map-section">
            <div className="map-controls">
              <Search data={data} cities={cities} onSelect={handleSearchSelect} onCitySelect={handleCitySelect} colorScale={colorScale} />
              <div className="zoom-controls">
                <button onClick={handleZoomIn} title="Zoom In">+</button>
                <button onClick={handleZoomOut} title="Zoom Out">-</button>
                <button onClick={handleReset} title="Reset Zoom View">Reset Zoom</button>
              </div>
            </div>

            <div className="map-wrapper" ref={mapRef}>
              <div className="risk-tabs">
                {RISK_TYPES.map((type) => (
                  <button
                    key={type.key}
                    className={`risk-tab ${selectedRiskType.key === type.key ? 'active' : ''}`}
                    onClick={() => handleRiskTypeChange(type)}
                  >
                    {type.label}
                  </button>
                ))}
                <button
                  className="info-icon-btn"
                  onClick={() => setInfoModalType(true)}
                  title="About Risk Factors"
                >
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </button>
              </div>
              <ComposableMap projection="geoAlbersUsa">
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
                              onClick={(e) => handleCountyClick(geo, e)}
                              onMouseEnter={(e) => handleCountyHover(geo, e)}
                              onMouseMove={(e) =>
                                setTooltipPosition({ x: e.clientX, y: e.clientY })
                              }
                              onMouseLeave={handleCountyLeave}
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
                        <circle r={4 / zoom} className="city-marker-dot" />
                      </g>
                    </Marker>
                  )}
                </ZoomableGroup>
              </ComposableMap>
            </div>

            <div className="map-footer">
              <Legend
                colorScale={colorScale}
                bins={histogramBins}
                width={800}
                height={60}
                title={`${selectedRiskType.label} Score`}
                onRangeSelect={handleRangeSelect}
                selectedRange={selectedRange}
              />
              {selectedRange && (
                <button className="clear-filter-btn" onClick={() => setSelectedRange(null)}>
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          <div className="radar-section">
            {radarCounties.length > 0 ? (
              <>
                <div className="radar-header">
                  <h3>Risk Profile</h3>
                  {comparisonCounties.length > 0 && (
                    <button className="clear-btn" onClick={clearComparison}>
                      Clear Comparison
                    </button>
                  )}
                </div>
                <D3RadarChart
                  counties={radarCounties}
                  width={400}
                  height={400}
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
                        {county.name.replace(" County", "").replace(" Parish", "")}
                      </span>
                      <span className="legend-risk">({county.total_risk})</span>
                    </div>
                  ))}
                </div>
                <p className="hint">Shift+Click counties to compare</p>
              </>
            ) : (
              <div className="no-selection">
                <p>Click on a county to view its risk profile</p>
                <p className="hint">Shift+Click to add counties for comparison</p>
              </div>
            )}
          </div>
        </div>

        <div className="bottom-section">
          <div className="chart-panel">
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
              selectedRange={selectedRange}
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
      />

      <InfoModal
        isOpen={infoModalType !== null}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );
};

export default MapChart;
