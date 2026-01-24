// Comparison/radar chart colors
export const CHART_COLORS = [
  { name: 'pink', fill: 'rgba(255, 99, 132, 0.25)', stroke: 'rgba(255, 99, 132, 1)' },
  { name: 'blue', fill: 'rgba(54, 162, 235, 0.25)', stroke: 'rgba(54, 162, 235, 1)' },
  { name: 'yellow', fill: 'rgba(255, 206, 86, 0.25)', stroke: 'rgba(255, 206, 86, 1)' },
  { name: 'teal', fill: 'rgba(75, 192, 192, 0.25)', stroke: 'rgba(75, 192, 192, 1)' },
  { name: 'purple', fill: 'rgba(153, 102, 255, 0.25)', stroke: 'rgba(153, 102, 255, 1)' },
];

// Risk factors for radar chart
export const RISK_FACTORS = [
  { key: 'heat', label: 'Heat' },
  { key: 'wet_bulb', label: 'Wet Bulb' },
  { key: 'farm_crop_yields', label: 'Crop Yields' },
  { key: 'sea_level_rise', label: 'Sea Level' },
  { key: 'wildfires', label: 'Wildfire' },
  { key: 'economic_damages', label: 'Economic' },
];

// Map configuration
export const MAP_CONFIG = {
  geoUrl: 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json',
  statesGeoUrl: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
  defaultCenter: [-96, 38],
  defaultZoom: 1,
  maxZoom: 8,
  selectionZoom: 4,
};

// Map interaction colors
export const MAP_COLORS = {
  selection: '#00bfff',      // Light blue for selected/hovered counties
  defaultStroke: '#000',     // Default county border
};
