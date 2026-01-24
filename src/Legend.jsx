import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import "d3-transition";
import { useTheme } from "./hooks/useTheme";

const EPSILON = 0.0001;

const Legend = ({
  colorScale,
  bins = [],
  width = 300,
  height = 50,
  title = "Risk Level",
  onRangeSelect,
  selectedRanges,
}) => {
  const svgRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (!svgRef.current || !colorScale) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 14, right: 10, bottom: 18, left: 10 };
    const barHeight = 10;
    const barWidth = width - margin.left - margin.right;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Title
    g.append("text")
      .attr("x", barWidth / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", theme.text.primary)
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text(title);

    const domain = colorScale.domain();

    // Use bins if provided, otherwise fall back to color scale segments
    let segments;
    if (bins && bins.length > 0) {
      // Use histogram bins for segment boundaries
      segments = bins.map((bin) => ({
        min: bin.x0,
        max: bin.x1,
        color: colorScale((bin.x0 + bin.x1) / 2),
      }));
    } else {
      // Fallback: calculate segments from color scale
      const range = colorScale.range();
      const step = (domain[1] - domain[0]) / range.length;
      segments = range.map((color, i) => ({
        min: domain[0] + step * i,
        max: domain[0] + step * (i + 1),
        color: color,
      }));
    }

    // Create scale to position segments proportionally
    const xScale = scaleLinear().domain(domain).range([0, barWidth]);

    // Helper to check if a segment exactly matches a specific range
    const segmentMatchesRange = (d, range) => {
      return Math.abs(d.min - range[0]) < EPSILON && Math.abs(d.max - range[1]) < EPSILON;
    };

    // Helper to check if segment is selected (falls within any selected range)
    const isSegmentSelected = (d) => {
      if (!selectedRanges || selectedRanges.length === 0) return false;
      return selectedRanges.some(range =>
        d.min >= range[0] - EPSILON && d.max <= range[1] + EPSILON
      );
    };

    // Helper to check if segment exactly matches any selected range (for toggle)
    const isSegmentExactMatch = (d) => {
      if (!selectedRanges || selectedRanges.length === 0) return false;
      return selectedRanges.some(range => segmentMatchesRange(d, range));
    };

    // Draw color segments
    const segmentGroups = g
      .selectAll(".legend-segment")
      .data(segments)
      .enter()
      .append("g")
      .attr("class", "legend-segment")
      .attr("transform", (d) => `translate(${xScale(d.min)}, 0)`)
      .style("cursor", "pointer");

    segmentGroups
      .append("rect")
      .attr("width", (d) => Math.max(0, xScale(d.max) - xScale(d.min)))
      .attr("height", barHeight)
      .attr("fill", (d) => d.color)
      .attr("stroke", (d) => isSegmentSelected(d) ? theme.stroke : "none")
      .attr("stroke-width", 2)
      .attr("opacity", (d) => {
        if (!selectedRanges || selectedRanges.length === 0) return 1;
        return isSegmentSelected(d) ? 1 : 0.3;
      })
      .on("click", function (event, d) {
        if (onRangeSelect) {
          const modifiers = {
            shiftKey: event.shiftKey,
            metaKey: event.metaKey,
            ctrlKey: event.ctrlKey
          };
          // Only toggle off on plain click if exact match
          if (!event.shiftKey && !event.metaKey && !event.ctrlKey && isSegmentExactMatch(d)) {
            onRangeSelect(null);
          } else {
            onRangeSelect([d.min, d.max], modifiers);
          }
        }
      })
      .on("mouseenter", function () {
        select(this).transition().duration(100).attr("stroke", theme.stroke).attr("stroke-width", 2);
      })
      .on("mouseleave", function (_, d) {
        const isSelected = isSegmentSelected(d);
        select(this)
          .transition()
          .duration(100)
          .attr("stroke", isSelected ? theme.stroke : "none")
          .attr("stroke-width", isSelected ? 2 : 0);
      });

    // Add axis labels
    const tickValues = [domain[0], (domain[0] + domain[1]) / 2, domain[1]];
    tickValues.forEach((tick) => {
      g.append("text")
        .attr("x", xScale(tick))
        .attr("y", barHeight + 10)
        .attr("text-anchor", "middle")
        .attr("fill", theme.text.secondary)
        .attr("font-size", "9px")
        .text(Math.round(tick));
    });

    // Add labels
    g.append("text")
      .attr("x", -15)
      .attr("y", barHeight + 22)
      .attr("text-anchor", "start")
      .attr("fill", theme.text.muted)
      .attr("font-size", "9px")
      .text("Low Risk");

    g.append("text")
      .attr("x", barWidth + 20)
      .attr("y", barHeight + 22)
      .attr("text-anchor", "end")
      .attr("fill", theme.text.muted)
      .attr("font-size", "9px")
      .text("High Risk");
  }, [colorScale, bins, width, height, title, onRangeSelect, selectedRanges, theme]);

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
  bins: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  onRangeSelect: PropTypes.func,
  selectedRanges: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
};

export default Legend;
