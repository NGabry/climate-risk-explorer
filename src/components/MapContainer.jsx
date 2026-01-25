import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { AkHiStates, AkHiCounties } from "../AkHi";
import { MAP_CONFIG, MAP_COLORS } from "../constants";

/**
 * Shared map rendering component used by both desktop and mobile layouts
 */
const MapContainer = ({
  zoom,
  center,
  onMoveEnd,
  dataMap,
  colorScale,
  selectedRiskType,
  selectedCounty,
  comparisonCounties,
  hoveredCounty,
  cityMarker,
  onCountyClick,
  onCountyHover,
  onCountyLeave,
  onCityMarkerClear,
  getCountyOpacity,
  className = "map-svg",
}) => {
  // Get county stroke styling based on selection state
  const getCountyStroke = (geo) => {
    if (selectedCounty && selectedCounty.id === geo.id) {
      return { color: MAP_COLORS.selection, width: 3 };
    }
    if (comparisonCounties?.find((c) => c.id === geo.id)) {
      return { color: MAP_COLORS.selection, width: 2 };
    }
    if (hoveredCounty && hoveredCounty.id === geo.id) {
      return { color: MAP_COLORS.selection, width: 1.5 };
    }
    return { color: MAP_COLORS.defaultStroke, width: 0.2 };
  };

  return (
    <ComposableMap projection="geoAlbersUsa" className={className}>
      <ZoomableGroup
        zoom={zoom}
        center={center}
        onMoveEnd={onMoveEnd}
        minZoom={MAP_CONFIG.defaultZoom}
        maxZoom={MAP_CONFIG.maxZoom}
      >
        {/* County layer */}
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
                    onClick={(e) => onCountyClick?.(geo, e)}
                    onMouseEnter={(e) => onCountyHover?.(geo, e)}
                    onMouseMove={(e) => onCountyHover?.(geo, e)}
                    onMouseLeave={onCountyLeave}
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

        {/* State borders layer */}
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

        {/* City marker */}
        {cityMarker && (
          <Marker coordinates={[cityMarker.lng, cityMarker.lat]}>
            <g className="city-marker" onClick={onCityMarkerClear}>
              <circle r={8 / zoom} className="city-marker-pulse" />
              <circle r={0.05 / zoom} className="city-marker-dot" />
            </g>
          </Marker>
        )}
      </ZoomableGroup>
    </ComposableMap>
  );
};

export default MapContainer;
