// Risk types for tab selection
// Descriptions based on ProPublica/Rhodium Group climate migration study methodology
export const RISK_TYPES = [
  {
    key: 'total_risk',
    label: 'Total Risk',
    domain: [1, 40],
    description: 'Combined risk score aggregating all six climate factors. Higher scores indicate greater overall climate vulnerability. Data represents median probabilities modeled by the Rhodium Group for 2040-2060 under various climate scenarios.'
  },
  {
    key: 'heat',
    label: 'Heat',
    domain: [1, 10],
    description: 'Risk from extreme heat events. Under high emissions scenarios, extreme temperatures will become commonplace in the South and Southwest, with some counties experiencing temperatures above 95°F for half the year. Heat alone could cause as many as 80 additional deaths per 100,000 people in affected areas.'
  },
  {
    key: 'wet_bulb',
    label: 'Wet Bulb',
    domain: [1, 10],
    description: 'Wet bulb temperature combines heat and humidity to measure conditions where the human body cannot cool itself through sweating. By 2050, parts of the Midwest and Louisiana could see dangerous wet bulb conditions nearly one out of every 20 days per year, making outdoor activity potentially fatal.'
  },
  {
    key: 'farm_crop_yields',
    label: 'Crop Yields',
    domain: [1, 10],
    description: 'Agricultural impact measured using corn and soybean yields as proxies. Rising temperatures and changing water availability could reduce crop yields by 13-44% in high emissions scenarios. Some regions may see virtually no agricultural production.'
  },
  {
    key: 'sea_level_rise',
    label: 'Sea Level',
    domain: [1, 10],
    description: 'Coastal flooding risk from rising sea levels. Measures the percentage of land that could be underwater at high tide. In heavily affected coastal counties, 5-10% of all land could be swallowed by daily tides, causing permanent property loss.'
  },
  {
    key: 'wildfires',
    label: 'Wildfire',
    domain: [1, 10],
    description: 'Likelihood of very large wildfires (over 12,000 acres) based on U.S. Forest Service models. Risk increases substantially in the West, Northwest, Rocky Mountains, and also Florida, Georgia, and the Southeast due to heat and drought conditions.'
  },
  {
    key: 'economic_damages',
    label: 'Economic',
    domain: [1, 10],
    description: 'Climate-driven economic damage as a share of county GDP. Includes rising energy costs (up to 20% higher), lower labor productivity, poor crop yields, increasing crime, storm damage, and heat-related deaths. Major cities could see losses worth several percentage points of GDP.'
  },
];

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
