import { useState, useCallback } from "react";
import { MAP_CONFIG } from "../constants";

/**
 * Hook for managing map viewport state (zoom, center, panning)
 */
export const useMapState = () => {
  const [zoom, setZoom] = useState(MAP_CONFIG.defaultZoom);
  const [center, setCenter] = useState(MAP_CONFIG.defaultCenter);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.5, MAP_CONFIG.maxZoom));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.5, MAP_CONFIG.defaultZoom));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(MAP_CONFIG.defaultZoom);
    setCenter(MAP_CONFIG.defaultCenter);
  }, []);

  const handleMoveEnd = useCallback((position) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  }, []);

  // Zoom to a specific location
  const zoomToLocation = useCallback((coordinates, zoomLevel = MAP_CONFIG.selectionZoom) => {
    setCenter(coordinates);
    setZoom(zoomLevel);
  }, []);

  return {
    zoom,
    center,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleMoveEnd,
    zoomToLocation,
  };
};

export default useMapState;
