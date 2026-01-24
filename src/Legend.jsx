import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import "d3-transition";
import { useTheme } from "./hooks/useTheme";

const Legend = ({
  colorScale,
  width = 300,
  height = 50,
  title = "Risk Level",
  onRangeSelect,
  selectedRange,
}) => {
  const svgRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (!svgRef.current || !colorScale) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 10, bottom: 25, left: 10 };
    const barHeight = 15;
    const barWidth = width - margin.left - margin.right;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Title
    g.append("text")
      .attr("x", barWidth / 2)
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .attr("fill", theme.text.primary)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(title);

    const domain = colorScale.domain();
    const range = colorScale.range();
    const segmentWidth = barWidth / range.length;

    // Calculate thresholds for each segment
    const step = (domain[1] - domain[0]) / range.length;
    const thresholds = range.map((_, i) => ({
      min: domain[0] + step * i,
      max: domain[0] + step * (i + 1),
      color: range[i],
    }));

    // Draw color segments
    const segments = g
      .selectAll(".legend-segment")
      .data(thresholds)
      .enter()
      .append("g")
      .attr("class", "legend-segment")
      .attr("transform", (d, i) => `translate(${i * segmentWidth}, 0)`)
      .style("cursor", "pointer");

    segments
      .append("rect")
      .attr("width", segmentWidth)
      .attr("height", barHeight)
      .attr("fill", (d) => d.color)
      .attr("stroke", (d) => {
        if (selectedRange && d.min >= selectedRange[0] && d.max <= selectedRange[1]) {
          return "white";
        }
        return "none";
      })
      .attr("stroke-width", 2)
      .attr("opacity", (d) => {
        if (!selectedRange) return 1;
        if (d.min >= selectedRange[0] && d.max <= selectedRange[1]) return 1;
        return 0.3;
      })
      .on("click", function (event, d) {
        if (onRangeSelect) {
          if (selectedRange && selectedRange[0] === d.min && selectedRange[1] === d.max) {
            onRangeSelect(null);
          } else {
            onRangeSelect([d.min, d.max]);
          }
        }
      })
      .on("mouseenter", function () {
        select(this).transition().duration(100).attr("stroke", "white").attr("stroke-width", 2);
      })
      .on("mouseleave", function (_, d) {
        const isSelected =
          selectedRange && d.min >= selectedRange[0] && d.max <= selectedRange[1];
        select(this)
          .transition()
          .duration(100)
          .attr("stroke", isSelected ? "white" : "none")
          .attr("stroke-width", isSelected ? 2 : 0);
      });

    // Add axis labels
    const xScale = scaleLinear().domain(domain).range([0, barWidth]);

    const tickValues = [domain[0], (domain[0] + domain[1]) / 2, domain[1]];
    tickValues.forEach((tick) => {
      g.append("text")
        .attr("x", xScale(tick))
        .attr("y", barHeight + 15)
        .attr("text-anchor", "middle")
        .attr("fill", theme.text.secondary)
        .attr("font-size", "10px")
        .text(Math.round(tick));
    });

    // Add labels
    g.append("text")
      .attr("x", 0)
      .attr("y", barHeight + 24)
      .attr("text-anchor", "start")
      .attr("fill", theme.text.subtle)
      .attr("font-size", "9px")
      .text("Low Risk");

    g.append("text")
      .attr("x", barWidth)
      .attr("y", barHeight + 24)
      .attr("text-anchor", "end")
      .attr("fill", theme.text.subtle)
      .attr("font-size", "9px")
      .text("High Risk");
  }, [colorScale, width, height, title, onRangeSelect, selectedRange, theme]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    />
  );
};

Legend.propTypes = {
  colorScale: PropTypes.func.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  onRangeSelect: PropTypes.func,
  selectedRange: PropTypes.arrayOf(PropTypes.number),
};

export default Legend;
