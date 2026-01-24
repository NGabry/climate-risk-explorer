import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { select } from "d3-selection";
import { scaleLinear, scaleBand } from "d3-scale";
import { axisLeft } from "d3-axis";
import { max } from "d3-array";
import "d3-transition";

const BarChart = ({
  counties,
  colorScale,
  width = 350,
  height = 200,
  onCountyClick,
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !counties || counties.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 25, right: 20, bottom: 80, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("County Comparison");

    // Sort counties by total_risk
    const sortedCounties = [...counties].sort(
      (a, b) => b.total_risk - a.total_risk
    );

    // Scales
    const xScale = scaleBand()
      .domain(sortedCounties.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = scaleLinear()
      .domain([0, max(sortedCounties, (d) => d.total_risk)])
      .nice()
      .range([innerHeight, 0]);

    // Y axis
    const yAxis = axisLeft(yScale).ticks(5);

    g.append("g")
      .call(yAxis)
      .attr("color", "rgba(255, 255, 255, 0.7)")
      .selectAll("text")
      .attr("fill", "rgba(255, 255, 255, 0.7)")
      .attr("font-size", "9px");

    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255, 255, 255, 0.6)")
      .attr("font-size", "9px")
      .text("Total Risk Score");

    // Draw bars
    const bars = g
      .selectAll(".bar")
      .data(sortedCounties)
      .enter()
      .append("g")
      .attr("class", "bar");

    bars
      .append("rect")
      .attr("x", (d) => xScale(d.name))
      .attr("y", innerHeight)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .attr("fill", (d) => colorScale(d.total_risk))
      .attr("cursor", "pointer")
      .on("click", function (event, d) {
        if (onCountyClick) {
          onCountyClick(d);
        }
      })
      .on("mouseenter", function (event, d) {
        select(this).transition().duration(100).attr("opacity", 0.8);

        // Show tooltip
        const x = xScale(d.name) + xScale.bandwidth() / 2;
        const y = yScale(d.total_risk);

        g.append("rect")
          .attr("class", "bar-tooltip-bg")
          .attr("x", x - 35)
          .attr("y", y - 35)
          .attr("width", 70)
          .attr("height", 28)
          .attr("fill", "rgba(0, 0, 0, 0.85)")
          .attr("rx", 4);

        g.append("text")
          .attr("class", "bar-tooltip")
          .attr("x", x)
          .attr("y", y - 22)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text(`Risk: ${d.total_risk}`);

        g.append("text")
          .attr("class", "bar-tooltip")
          .attr("x", x)
          .attr("y", y - 10)
          .attr("text-anchor", "middle")
          .attr("fill", "rgba(255, 255, 255, 0.7)")
          .attr("font-size", "8px")
          .text(d.state || "");
      })
      .on("mouseleave", function () {
        select(this).transition().duration(100).attr("opacity", 1);
        g.selectAll(".bar-tooltip, .bar-tooltip-bg").remove();
      })
      .transition()
      .duration(500)
      .delay((d, i) => i * 50)
      .attr("y", (d) => yScale(d.total_risk))
      .attr("height", (d) => innerHeight - yScale(d.total_risk));

    // X axis labels (county names)
    g.selectAll(".bar-label")
      .data(sortedCounties)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr("y", innerHeight + 10)
      .attr("text-anchor", "end")
      .attr("transform", (d) => {
        const x = xScale(d.name) + xScale.bandwidth() / 2;
        return `rotate(-45, ${x}, ${innerHeight + 10})`;
      })
      .attr("fill", "rgba(255, 255, 255, 0.7)")
      .attr("font-size", "8px")
      .text((d) => {
        const name = d.name.replace(" County", "").replace(" Parish", "");
        return name.length > 12 ? name.substring(0, 12) + "..." : name;
      });
  }, [counties, colorScale, width, height, onCountyClick]);

  if (!counties || counties.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: "12px",
        }}
      >
        Select multiple counties to compare
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    />
  );
};

BarChart.propTypes = {
  counties: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      total_risk: PropTypes.number.isRequired,
      state: PropTypes.string,
    })
  ),
  colorScale: PropTypes.func.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  onCountyClick: PropTypes.func,
};

export default BarChart;
