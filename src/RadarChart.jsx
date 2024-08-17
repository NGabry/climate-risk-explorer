import React from "react";
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
  } from 'chart.js';
  
// Register the necessary components
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
  );

const RadarChart = ({ data }) => {
  const chartRef = useRef(null);
  const radarData = {
    labels: ['Heat', 'Wet Bulb', 'Crop Yields', 'Sea Level Rise', 'Wildfire', 'Economic Damage'],
    datasets: [
      {
        label: 'Climate Risk Factors',
        data: [
            Number(data.heat),
            Number(data.wet_bulb),
            Number(data.farm_crop_yields),
            Number(data.sea_level_rise),
            Number(data.wildfires),
            Number(data.economic_damages)
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };


  const options = {
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
        },
        grid: {
          color: 'white'
        },
        angleLines: {
          color: 'white'
        },
        pointLabels: {
          font: {
            size: 20 
          },
        color: 'white'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true, 
        mode: 'nearest',
        intersect: false,
        displayColors: false,
        callbacks: {
          title: function() {
            return ''; // Remove the title
          },
          label: function(context) {
            return `${context.raw}`;
          }
      },
      bodyFont: {
        size: 24
      },
      padding: 16 
      }
    }
  };

  useEffect(() => {
    const chartInstance = chartRef.current?.chartInstance;    
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [data]);

  return <Radar data={radarData} options={options} ref={chartRef}/>;
};


RadarChart.propTypes = {
  data: PropTypes.shape({
    heat: PropTypes.number.isRequired,
    wet_bulb: PropTypes.number.isRequired,
    farm_crop_yields: PropTypes.number.isRequired,
    sea_level_rise: PropTypes.number.isRequired,
    wildfires: PropTypes.number.isRequired,
    economic_damages: PropTypes.number.isRequired
  }).isRequired
};

export default RadarChart;