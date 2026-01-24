import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { lineRadial, curveLinearClosed } from "d3-shape";
import "d3-transition";

const COLORS = [
  { fill: "rgba(255, 99, 132, 0.25)", stroke: "rgba(255, 99, 132, 1)" },
  { fill: "rgba(54, 162, 235, 0.25)", stroke: "rgba(54, 162, 235, 1)" },
  { fill: "rgba(255, 206, 86, 0.25)", stroke: "rgba(255, 206, 86, 1)" },
  { fill: "rgba(75, 192, 192, 0.25)", stroke: "rgba(75, 192, 192, 1)" },
  { fill: "rgba(153, 102, 255, 0.25)", stroke: "rgba(153, 102, 255, 1)" },
];

const FACTORS = [
  { key: "heat", label: "Heat" },
  { key: "wet_bulb", label: "Wet Bulb" },
  { key: "farm_crop_yields", label: "Crop Yields" },
  { key: "sea_level_rise", label: "Sea Level" },
  { key: "wildfires", label: "Wildfire" },
  { key: "economic_damages", label: "Economic" },
];

const D3RadarChart = ({ counties, width = 400, height = 400 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!counties || counties.length === 0 || !svgRef.current) return;

    const svg = select(svgRef.current);
    const margin = 70;
    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;

    const angleSlice = (Math.PI * 2) / FACTORS.length;
    const maxValue = 10;

    const rScale = scaleLinear().domain([0, maxValue]).range([0, radius]);

    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Draw circular grid
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;
      g.append("circle")
        .attr("r", levelRadius)
        .attr("fill", "none")
        .attr("stroke", "rgba(255, 255, 255, 0.2)")
        .attr("stroke-width", 1);

      g.append("text")
        .attr("x", 5)
        .attr("y", -levelRadius)
        .attr("fill", "rgba(255, 255, 255, 0.5)")
        .attr("font-size", "10px")
        .text((maxValue / levels) * level);
    }

    // Draw axis lines and labels
    FACTORS.forEach((factor, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "rgba(255, 255, 255, 0.2)")
        .attr("stroke-width", 1);

      const labelRadius = radius + 30;
      const labelX = Math.cos(angle) * labelRadius;
      const labelY = Math.sin(angle) * labelRadius;

      g.append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "white")
        .attr("font-size", "12px")
        .attr("font-weight", "500")
        .text(factor.label);
    });

    // Create radar line generator
    const radarLine = lineRadial()
      .radius((d) => rScale(d.value))
      .angle((d, i) => i * angleSlice)
      .curve(curveLinearClosed);

    // Draw each county as a layer (in reverse order so primary is on top)
    const reversedCounties = [...counties].reverse();

    reversedCounties.forEach((county, reverseIndex) => {
      const index = counties.length - 1 - reverseIndex;
      const color = county.isPrimary ? COLORS[0] : COLORS[(index % (COLORS.length - 1)) + 1];

      const radarData = FACTORS.map((f) => ({
        key: f.key,
        value: Number(county[f.key]) || 0,
      }));

      // Draw radar area
      g.append("path")
        .datum(radarData)
        .attr("fill", color.fill)
        .attr("stroke", color.stroke)
        .attr("stroke-width", 2)
        .attr("d", radarLine)
        .attr("opacity", 0)
        .transition()
        .duration(400)
        .delay(reverseIndex * 100)
        .attr("opacity", 1);

      // Draw data points
      radarData.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = Math.cos(angle) * rScale(d.value);
        const y = Math.sin(angle) * rScale(d.value);

        g.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 4)
          .attr("fill", color.stroke)
          .attr("stroke", "white")
          .attr("stroke-width", 1.5)
          .attr("opacity", 0)
          .transition()
          .duration(400)
          .delay(reverseIndex * 100)
          .attr("opacity", 1);
      });
    });

    // Add interactive overlay points (only for primary county)
    const primaryCounty = counties.find((c) => c.isPrimary) || counties[0];
    if (primaryCounty) {
      const primaryData = FACTORS.map((f) => ({
        key: f.key,
        label: FACTORS.find((fac) => fac.key === f.key)?.label || f.key,
        value: Number(primaryCounty[f.key]) || 0,
      }));

      g.selectAll(".radar-point-overlay")
        .data(primaryData)
        .enter()
        .append("circle")
        .attr("class", "radar-point-overlay")
        .attr("r", 15)
        .attr("fill", "transparent")
        .attr("cursor", "pointer")
        .attr("cx", (d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          return Math.cos(angle) * rScale(d.value);
        })
        .attr("cy", (d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          return Math.sin(angle) * rScale(d.value);
        })
        .on("mouseenter", function (event, d) {
          const i = primaryData.findIndex((pd) => pd.key === d.key);
          const angle = angleSlice * i - Math.PI / 2;

          // Show all county values for this factor
          const tooltipData = counties.map((county, ci) => ({
            name: county.name.replace(" County", "").replace(" Parish", ""),
            value: county[d.key],
            color: county.isPrimary ? COLORS[0].stroke : COLORS[(ci % (COLORS.length - 1)) + 1].stroke,
          }));

          const tooltipWidth = 140;
          const tooltipHeight = 20 + tooltipData.length * 18;
          let tooltipX = Math.cos(angle) * (rScale(d.value) + 20);
          let tooltipY = Math.sin(angle) * (rScale(d.value) + 20);

          // Adjust position to stay within bounds
          if (tooltipX < -centerX + tooltipWidth / 2) tooltipX = -centerX + tooltipWidth / 2 + 10;
          if (tooltipX > centerX - tooltipWidth / 2) tooltipX = centerX - tooltipWidth / 2 - 10;
          if (tooltipY < -centerY + tooltipHeight / 2) tooltipY = -centerY + tooltipHeight / 2 + 10;

          g.append("rect")
            .attr("class", "tooltip-bg")
            .attr("x", tooltipX - tooltipWidth / 2)
            .attr("y", tooltipY - tooltipHeight / 2)
            .attr("width", tooltipWidth)
            .attr("height", tooltipHeight)
            .attr("fill", "rgba(0, 0, 0, 0.9)")
            .attr("rx", 6);

          g.append("text")
            .attr("class", "tooltip-text")
            .attr("x", tooltipX)
            .attr("y", tooltipY - tooltipHeight / 2 + 16)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .text(d.label);

          tooltipData.forEach((td, ti) => {
            g.append("circle")
              .attr("class", "tooltip-text")
              .attr("cx", tooltipX - tooltipWidth / 2 + 12)
              .attr("cy", tooltipY - tooltipHeight / 2 + 32 + ti * 18)
              .attr("r", 4)
              .attr("fill", td.color);

            g.append("text")
              .attr("class", "tooltip-text")
              .attr("x", tooltipX - tooltipWidth / 2 + 22)
              .attr("y", tooltipY - tooltipHeight / 2 + 36 + ti * 18)
              .attr("fill", "rgba(255, 255, 255, 0.8)")
              .attr("font-size", "10px")
              .text(`${td.name}: ${td.value}`);
          });
        })
        .on("mouseleave", function () {
          g.selectAll(".tooltip-bg, .tooltip-text").remove();
        });
    }
  }, [counties, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    />
  );
};

D3RadarChart.propTypes = {
  counties: PropTypes.arrayOf(
    PropTypes.shape({
      heat: PropTypes.number.isRequired,
      wet_bulb: PropTypes.number.isRequired,
      farm_crop_yields: PropTypes.number.isRequired,
      sea_level_rise: PropTypes.number.isRequired,
      wildfires: PropTypes.number.isRequired,
      economic_damages: PropTypes.number.isRequired,
      isPrimary: PropTypes.bool,
    })
  ).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  onRemove: PropTypes.func,
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.width !== nextProps.width || prevProps.height !== nextProps.height) {
    return false;
  }
  if (prevProps.counties.length !== nextProps.counties.length) {
    return false;
  }
  for (let i = 0; i < prevProps.counties.length; i++) {
    if (prevProps.counties[i].id !== nextProps.counties[i].id) {
      return false;
    }
  }
  return true;
};

export default React.memo(D3RadarChart, areEqual);
