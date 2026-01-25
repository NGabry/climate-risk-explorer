import { useState, useCallback, useMemo, useEffect } from "react";
import { geoContains } from "d3-geo";
import { RISK_TYPES, COMPARISON_LIMIT } from "../constants";

/**
 * Hook for managing county selection, comparison, and risk type state
 */
export const useSelectionState = ({ dataMap, countyCentroids, countyFeatures, defaultCounty, zoomToLocation }) => {
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [comparisonCounties, setComparisonCounties] = useState([]);
  const [selectedRiskType, setSelectedRiskType] = useState(RISK_TYPES[0]);
  const [selectedRanges, setSelectedRanges] = useState(null);
  const [cityMarker, setCityMarker] = useState(null);

  // Set default county when it becomes available
  useEffect(() => {
    if (defaultCounty && !selectedCounty) {
      setSelectedCounty(defaultCounty);
    }
  }, [defaultCounty]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle county click - regular or shift+click for comparison
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
            if (prev.length >= COMPARISON_LIMIT) {
              return prev;
            }
            return [...prev, countyData];
          });
        } else {
          setSelectedCounty(countyData);
          setCityMarker(null);
        }
      }
    },
    [dataMap]
  );

  // Handle search selection (county)
  const handleSearchSelect = useCallback((county) => {
    setSelectedCounty(county);
    setCityMarker(null);
    const centroid = countyCentroids.get(county.id);
    if (centroid && zoomToLocation) {
      zoomToLocation(centroid);
    }
  }, [countyCentroids, zoomToLocation]);

  // Handle city selection from search
  const handleCitySelect = useCallback((city) => {
    if (zoomToLocation) {
      zoomToLocation([city.lng, city.lat]);
    }
    setCityMarker({ lat: city.lat, lng: city.lng, name: city.name });

    // Find and select the county containing this city
    const cityPoint = [city.lng, city.lat];
    const containingFeature = countyFeatures.find(f => geoContains(f, cityPoint));
    if (containingFeature) {
      const countyData = dataMap.get(containingFeature.id);
      if (countyData) {
        setSelectedCounty(countyData);
      }
    }
  }, [countyFeatures, dataMap, zoomToLocation]);

  // Handle risk type change
  const handleRiskTypeChange = useCallback((type) => {
    setSelectedRiskType(type);
    setSelectedRanges(null);
  }, []);

  // Helper to check if a range is already selected
  const isRangeSelected = useCallback((range) => {
    if (!selectedRanges) return false;
    const EPSILON = 0.0001;
    return selectedRanges.some(r =>
      Math.abs(r[0] - range[0]) < EPSILON && Math.abs(r[1] - range[1]) < EPSILON
    );
  }, [selectedRanges]);

  // Handle legend/histogram range selection
  const handleRangeSelect = useCallback((range, { shiftKey = false, metaKey = false, ctrlKey = false } = {}) => {
    const cmdOrCtrl = metaKey || ctrlKey;

    if (range === null) {
      setSelectedRanges(null);
    } else if (cmdOrCtrl && selectedRanges) {
      if (isRangeSelected(range)) {
        const newRanges = selectedRanges.filter(r =>
          !(Math.abs(r[0] - range[0]) < 0.0001 && Math.abs(r[1] - range[1]) < 0.0001)
        );
        setSelectedRanges(newRanges.length > 0 ? newRanges : null);
      } else {
        setSelectedRanges([...selectedRanges, range]);
      }
    } else if (shiftKey && selectedRanges && selectedRanges.length > 0) {
      const firstRange = selectedRanges[0];
      setSelectedRanges([[
        Math.min(firstRange[0], range[0]),
        Math.max(firstRange[1], range[1])
      ]]);
    } else if (cmdOrCtrl) {
      setSelectedRanges([range]);
    } else {
      setSelectedRanges([range]);
    }
  }, [selectedRanges, isRangeSelected]);

  const handleBinClick = useCallback((range, modifiers = {}) => {
    handleRangeSelect(range, modifiers);
  }, [handleRangeSelect]);

  // Clear all comparison counties
  const clearComparison = useCallback(() => {
    setComparisonCounties([]);
  }, []);

  // Remove a single county from comparison
  const removeFromComparison = useCallback((county) => {
    setComparisonCounties((prev) => prev.filter((c) => c.id !== county.id));
  }, []);

  // Combine selected county with comparison counties for radar chart
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

  // Get county opacity based on selected ranges
  const getCountyOpacity = useCallback((countyData) => {
    if (!selectedRanges || selectedRanges.length === 0) return 1;
    if (!countyData) return 0.3;
    const value = countyData[selectedRiskType.key];
    const isInAnyRange = selectedRanges.some(range => {
      const isLastBin = range[1] === selectedRiskType.domain[1];
      return value >= range[0] && (isLastBin ? value <= range[1] : value < range[1]);
    });
    return isInAnyRange ? 1 : 0.15;
  }, [selectedRanges, selectedRiskType]);

  return {
    selectedCounty,
    setSelectedCounty,
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
  };
};

export default useSelectionState;
