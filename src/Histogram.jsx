import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { bin, max, extent } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { format } from "d3-format";
import "d3-transition";
import { useTheme } from "./hooks/useTheme";

const Histogram = ({
  data,
  colorScale,
  selectedCounty,
  onBinClick,
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 200 });
  const theme = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.floor(width), height: Math.floor(height) });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0 || dimensions.width < 50) return;

    const { width, height } = dimensions;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 35, right: 25, bottom: 50, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth < 10 || innerHeight < 10) return;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 22)
      .attr("text-anchor", "middle")
      .attr("fill", theme.text.primary)
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Risk Distribution");

    // Extract total_risk values
    const riskValues = data.map((d) => d.total_risk);
    const [minRisk, maxRisk] = extent(riskValues);

    // Create bins
    const histogram = bin()
      .domain([minRisk, maxRisk])
      .thresholds(15);

    const bins = histogram(riskValues);

    // Scales
    const xScale = scaleLinear()
      .domain([minRisk, maxRisk])
      .range([0, innerWidth]);

    const yScale = scaleLinear()
      .domain([0, max(bins, (d) => d.length)])
      .nice()
      .range([innerHeight, 0]);

    // X axis
    const xAxis = axisBottom(xScale).ticks(6).tickFormat(format("d"));

    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr("color", theme.axis)
      .selectAll("text")
      .attr("fill", theme.text.secondary)
      .attr("font-size", "12px");

    // Y axis
    const yAxis = axisLeft(yScale).ticks(5).tickFormat(format("d"));

    g.append("g")
      .call(yAxis)
      .attr("color", theme.axis)
      .selectAll("text")
      .attr("fill", theme.text.secondary)
      .attr("font-size", "12px");

    // X axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", theme.text.subtle)
      .attr("font-size", "13px")
      .text("Total Risk Score");

    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("fill", theme.text.subtle)
      .attr("font-size", "13px")
      .text("Counties");

    // Draw bars
    const bars = g
      .selectAll(".bar")
      .data(bins)
      .enter()
      .append("g")
      .attr("class", "bar");

    bars
      .append("rect")
      .attr("x", (d) => xScale(d.x0) + 1)
      .attr("y", innerHeight)
      .attr("width", (d) => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
      .attr("height", 0)
      .attr("fill", (d) => {
        const midValue = (d.x0 + d.x1) / 2;
        return colorScale(midValue);
      })
      .attr("opacity", 0.8)
      .attr("cursor", "pointer")
      .on("click", function (event, d) {
        if (onBinClick) {
          onBinClick([d.x0, d.x1]);
        }
      })
      .on("mouseenter", function (event, d) {
        select(this).transition().duration(100).attr("opacity", 1);

        // Show tooltip
        const x = xScale((d.x0 + d.x1) / 2);
        const y = yScale(d.length);

        g.append("rect")
          .attr("class", "histogram-tooltip-bg")
          .attr("x", x - 30)
          .attr("y", y - 35)
          .attr("width", 60)
          .attr("height", 28)
          .attr("fill", theme.tooltip.bg)
          .attr("rx", 4);

        g.append("text")
          .attr("class", "histogram-tooltip")
          .attr("x", x)
          .attr("y", y - 22)
          .attr("text-anchor", "middle")
          .attr("fill", theme.tooltip.text)
          .attr("font-size", "10px")
          .text(`${d.length} counties`);

        g.append("text")
          .attr("class", "histogram-tooltip")
          .attr("x", x)
          .attr("y", y - 10)
          .attr("text-anchor", "middle")
          .attr("fill", theme.tooltip.textMuted)
          .attr("font-size", "9px")
          .text(`Risk: ${Math.round(d.x0)}-${Math.round(d.x1)}`);
      })
      .on("mouseleave", function () {
        select(this).transition().duration(100).attr("opacity", 0.8);
        g.selectAll(".histogram-tooltip, .histogram-tooltip-bg").remove();
      })
      .transition()
      .duration(500)
      .delay((d, i) => i * 30)
      .attr("y", (d) => yScale(d.length))
      .attr("height", (d) => innerHeight - yScale(d.length));

    // Highlight selected county's bin
    if (selectedCounty) {
      const xPos = xScale(selectedCounty.total_risk);

      // Vertical line
      g.append("line")
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", theme.stroke)
        .attr("stroke-width", 2.5)
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 0.9);

      // Triangle marker pointing up from below x-axis
      const triangleSize = 8;
      g.append("path")
        .attr("d", `M${xPos},${innerHeight + 8} L${xPos - triangleSize},${innerHeight + 8 + triangleSize * 1.5} L${xPos + triangleSize},${innerHeight + 8 + triangleSize * 1.5} Z`)
        .attr("fill", theme.stroke)
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 0.9);
    }
  }, [data, colorScale, dimensions, selectedCounty, onBinClick, theme]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: "visible" }}
      />
    </div>
  );
};

Histogram.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      total_risk: PropTypes.number.isRequired,
    })
  ).isRequired,
  colorScale: PropTypes.func.isRequired,
  selectedCounty: PropTypes.object,
  onBinClick: PropTypes.func,
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.data.length !== nextProps.data.length) {
    return false;
  }
  const prevId = prevProps.selectedCounty?.id;
  const nextId = nextProps.selectedCounty?.id;
  if (prevId !== nextId) {
    return false;
  }
  return true;
};

export default React.memo(Histogram, areEqual);
