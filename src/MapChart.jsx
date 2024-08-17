import React from "react";
import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import { csv } from "d3-fetch";
import RadarChart from "./RadarChart";
import { AkHiStates, AkHiCounties } from "./AkHi";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
const statesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"; // Add states GeoJSON URL

const colorScale = scaleQuantize()
  .domain([1, 40])
  .range([
"#00441b", // Dark green
"#006d2c",
"#238b45",
"#41ae76",
"#66c2a4",
"#e0f3db", // Light green
"#ffeda0", // Light yellow
"#fed976",
"#feb24c",
"#fd8d3c",
"#fc4e2a",
"#e31a1c",
"#bd0026",
"#800026",
"#4d0019"  // Dark red
  ]);

const MapChart = () => {
  const [data, setData] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);

  useEffect(() => {
    csv("/climate.csv", (d) => {
      return {
        ...d,
        heat: +d.heat,
        wet_bulb: +d.wet_bulb,
        farm_crop_yields: +d.farm_crop_yields,
        sea_level_rise: +d.sea_level_rise,
        wildfires: +d.wildfires,
        economic_damages: +d.economic_damages,
        total_risk: +d.total_risk
      };
    }).then(counties => {
      setData(counties);
    });
  }, []);

  const handleCountyClick = (geo) => {
    const countyData = data.find(s => s.id === geo.id);
    setSelectedCounty(countyData);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ flex: 15 }}>
      <ComposableMap projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              .filter(geo => !AkHiCounties.includes(geo.id)) 
              .map(geo => {
              const cur = data.find(s => s.id === geo.id);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorScale(cur ? cur.total_risk: "#EEE")}
                  stroke="#000"
                  strokeWidth={0.2}
                  onClick={() => handleCountyClick(geo)}
                />
              );
            })
          }
        </Geographies>
        <Geographies geography={statesGeoUrl}>
          {({ geographies }) =>
            geographies
            .filter(geo => !AkHiStates.includes(geo.id)) 
            .map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="none"
                stroke="#000"
                strokeWidth={0.7} // Thicker border for states
              />
            ))
          }
        </Geographies>
      </ComposableMap>
      </div>
      {selectedCounty && (
        <div style= {{flex: 10, paddingLeft: '50px'}}>
          <h2 style={{ fontSize: '2em' }}>{selectedCounty.name}</h2>
            <h3 style={{ fontSize: '1.5em' }}>
              Combined Risk: {selectedCounty.total_risk} / 60
            </h3>
          <RadarChart data={selectedCounty} />
        </div>
      )}
    </div>
  );
};

export default MapChart;
