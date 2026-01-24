import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import { interpolateRdYlGn } from "d3-scale-chromatic";
import { csv } from "d3-fetch";
import { AkHiStates, AkHiCounties } from "./AkHi";

import D3RadarChart from "./D3RadarChart";
import Legend from "./Legend";
import Histogram from "./Histogram";
import Statistics from "./Statistics";
import Tooltip from "./Tooltip";
import Search from "./Search";
import { CHART_COLORS, MAP_CONFIG } from "./constants";

const colorScale = scaleQuantize()
  .domain([1, 40])
  .range(
    Array.from({ length: 15 }, (_, i) =>
      interpolateRdYlGn(1 - i / 14)
    )
  );

const MapChart = () => {
  const [data, setData] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [comparisonCounties, setComparisonCounties] = useState([]);
  const [zoom, setZoom] = useState(MAP_CONFIG.defaultZoom);
  const [center, setCenter] = useState(MAP_CONFIG.defaultCenter);
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

  const dataMap = useMemo(() => {
    const map = new Map();
    data.forEach((d) => map.set(d.id, d));
    return map;
  }, [data]);

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

  const handleSearchSelect = useCallback((county) => {
    setSelectedCounty(county);
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
    if (
      countyData.total_risk >= selectedRange[0] &&
      countyData.total_risk <= selectedRange[1]
    ) {
      return 1;
    }
    return 0.15;
  };

  const getCountyStroke = (geo) => {
    if (selectedCounty && selectedCounty.id === geo.id) {
      return { color: "#fff", width: 2 };
    }
    if (comparisonCounties.find((c) => c.id === geo.id)) {
      return { color: "#00bfff", width: 1.5 };
    }
    if (hoveredCounty && hoveredCounty.id === geo.id) {
      return { color: "#fff", width: 1 };
    }
    return { color: "#000", width: 0.2 };
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
              <Search data={data} onSelect={handleSearchSelect} colorScale={colorScale} />
              <div className="zoom-controls">
                <button onClick={handleZoomIn} title="Zoom In">+</button>
                <button onClick={handleZoomOut} title="Zoom Out">-</button>
                <button onClick={handleReset} title="Reset View">Reset</button>
              </div>
            </div>

            <div className="map-wrapper" ref={mapRef}>
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
                                  ? colorScale(countyData.total_risk)
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
                </ZoomableGroup>
              </ComposableMap>
            </div>

            <div className="map-footer">
              <Legend
                colorScale={colorScale}
                width={800}
                height={60}
                title="Climate Risk Score"
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
            <Statistics data={data} selectedCounty={selectedCounty} />
          </div>

          <div className="chart-panel histogram-panel">
            <Histogram
              data={data}
              colorScale={colorScale}
              selectedCounty={selectedCounty}
              onBinClick={handleBinClick}
            />
          </div>

        </div>
      </div>

      <Tooltip
        data={hoveredCounty}
        position={tooltipPosition}
        colorScale={colorScale}
      />
    </div>
  );
};

export default MapChart;
