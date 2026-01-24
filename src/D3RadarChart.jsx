import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { lineRadial, curveLinearClosed } from "d3-shape";
import "d3-transition";
import { useTheme } from "./hooks/useTheme";
import { CHART_COLORS, RISK_FACTORS } from "./constants";

const D3RadarChart = ({ counties }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 280, height: 280 });
  const theme = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const size = Math.min(width, height);
        setDimensions({ width: size, height: size });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!counties || counties.length === 0 || !svgRef.current) return;

    const { width, height } = dimensions;
    const svg = select(svgRef.current);
    const margin = 45;
    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;

    const angleSlice = (Math.PI * 2) / RISK_FACTORS.length;
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
        .attr("stroke", theme.grid)
        .attr("stroke-width", 1);

      g.append("text")
        .attr("x", 5)
        .attr("y", -levelRadius)
        .attr("fill", theme.text.muted)
        .attr("font-size", "10px")
        .text((maxValue / levels) * level);
    }

    // Draw axis lines and labels
    RISK_FACTORS.forEach((factor, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", theme.grid)
        .attr("stroke-width", 1);

      const labelRadius = radius + 22;
      const labelX = Math.cos(angle) * labelRadius;
      const labelY = Math.sin(angle) * labelRadius;

      g.append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", theme.text.primary)
        .attr("font-size", "10px")
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
      const color = county.isPrimary ? CHART_COLORS[0] : CHART_COLORS[(index % (CHART_COLORS.length - 1)) + 1];

      const radarData = RISK_FACTORS.map((f) => ({
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
          .attr("r", 3)
          .attr("fill", color.stroke)
          .attr("stroke", theme.pointStroke)
          .attr("stroke-width", 1)
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
      const primaryData = RISK_FACTORS.map((f) => ({
        key: f.key,
        label: RISK_FACTORS.find((fac) => fac.key === f.key)?.label || f.key,
        value: Number(primaryCounty[f.key]) || 0,
      }));

      g.selectAll(".radar-point-overlay")
        .data(primaryData)
        .enter()
        .append("circle")
        .attr("class", "radar-point-overlay")
        .attr("r", 20)
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
          // Show all county values for this factor
          const tooltipData = counties.map((county, ci) => ({
            name: county.name.replace(" County", "").replace(" Parish", ""),
            value: county[d.key],
            color: county.isPrimary ? CHART_COLORS[0].stroke : CHART_COLORS[(ci % (CHART_COLORS.length - 1)) + 1].stroke,
          }));

          const tooltipWidth = 160;
          const tooltipHeight = 26 + tooltipData.length * 22;

          // Get mouse position relative to the SVG, then convert to g coordinates
          const svgRect = svgRef.current.getBoundingClientRect();
          let tooltipX = event.clientX - svgRect.left - centerX + 15;
          let tooltipY = event.clientY - svgRect.top - centerY - tooltipHeight / 2;

          // Adjust position to stay within bounds
          if (tooltipX + tooltipWidth > centerX) tooltipX = tooltipX - tooltipWidth - 30;
          if (tooltipY < -centerY) tooltipY = -centerY + 10;
          if (tooltipY + tooltipHeight > centerY) tooltipY = centerY - tooltipHeight - 10;

          g.append("rect")
            .attr("class", "tooltip-bg")
            .attr("x", tooltipX)
            .attr("y", tooltipY)
            .attr("width", tooltipWidth)
            .attr("height", tooltipHeight)
            .attr("fill", theme.tooltip.bg)
            .attr("rx", 6)
            .style("pointer-events", "none");

          g.append("text")
            .attr("class", "tooltip-text")
            .attr("x", tooltipX + tooltipWidth / 2)
            .attr("y", tooltipY + 18)
            .attr("text-anchor", "middle")
            .attr("fill", theme.tooltip.text)
            .attr("font-size", "13px")
            .attr("font-weight", "bold")
            .text(d.label)
            .style("pointer-events", "none");

          tooltipData.forEach((td, ti) => {
            g.append("circle")
              .attr("class", "tooltip-text")
              .attr("cx", tooltipX + 14)
              .attr("cy", tooltipY + 38 + ti * 22)
              .attr("r", 5)
              .attr("fill", td.color)
              .style("pointer-events", "none");

            g.append("text")
              .attr("class", "tooltip-text")
              .attr("x", tooltipX + 26)
              .attr("y", tooltipY + 42 + ti * 22)
              .attr("fill", theme.tooltip.textMuted)
              .attr("font-size", "12px")
              .text(`${td.name}: ${td.value}`)
              .style("pointer-events", "none");
          });
        })
        .on("mouseleave", function () {
          g.selectAll(".tooltip-bg, .tooltip-text").remove();
        });
    }
  }, [counties, dimensions, theme]);

  return (
    <div ref={containerRef} style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: "visible" }}
      />
    </div>
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
  onRemove: PropTypes.func,
};

const areEqual = (prevProps, nextProps) => {
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
