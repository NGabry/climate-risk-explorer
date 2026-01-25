import { useState, useEffect, useMemo } from "react";
import { scaleQuantize } from "d3-scale";
import { interpolateRdYlGn } from "d3-scale-chromatic";
import { csv, json } from "d3-fetch";
import { bin } from "d3-array";
import { geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import { MAP_CONFIG, DEFAULT_COUNTY_ID } from "../constants";

/**
 * Hook for fetching and processing map data
 * Returns county data, cities, GeoJSON features, and helpers for computing scales
 */
export const useMapData = () => {
  const [data, setData] = useState([]);
  const [cities, setCities] = useState([]);
  const [countyCentroids, setCountyCentroids] = useState(new Map());
  const [countyFeatures, setCountyFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultCounty, setDefaultCounty] = useState(null);

  // Fetch county climate data
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
      // Find default county (Oakland County, MI)
      const defaultC = counties.find(c => c.id === DEFAULT_COUNTY_ID);
      if (defaultC) {
        setDefaultCounty(defaultC);
      }
      setLoading(false);
    });
  }, []);

  // Load county centroids and features for zoom-to-county and city-to-county lookup
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
      setCountyFeatures(counties.features);
    });
  }, []);

  // Load cities for search
  useEffect(() => {
    json("/cities.json").then((citiesData) => {
      setCities(citiesData);
    });
  }, []);

  // Create O(1) lookup map for county data by ID
  const dataMap = useMemo(() => {
    const map = new Map();
    data.forEach((d) => map.set(d.id, d));
    return map;
  }, [data]);

  return {
    data,
    cities,
    dataMap,
    countyCentroids,
    countyFeatures,
    loading,
    defaultCounty,
  };
};

/**
 * Hook for computing color scale based on risk type
 */
export const useColorScale = (selectedRiskType) => {
  return useMemo(() =>
    scaleQuantize()
      .domain(selectedRiskType.domain)
      .range(Array.from({ length: 15 }, (_, i) => interpolateRdYlGn(1 - i / 14))),
    [selectedRiskType]
  );
};

/**
 * Hook for computing histogram bins based on data and risk type
 */
export const useHistogramBins = (data, selectedRiskType) => {
  return useMemo(() => {
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
};

export default useMapData;
