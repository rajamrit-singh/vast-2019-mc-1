import React from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";
import { keys } from "d3-collection";
import {
  filterDataByDateTime,
  groupDataByLocation,
  getQuantileData,
} from "../../utils/dataProcessUtil";
import "./ParallelPlot.css";
import { ATTRIBUTE_LIST } from '../../constants';

const attrs = [
  "sewer_and_water",
  "power",
  "roads_and_bridges",
  "medical",
  "buildings",
  "shake_intensity",
  "location",
];

const color = [
  "#B0BF1A",
  "#0048BA",
  "#7CB9E8",
  "#B284BE",
  "#DB2D43",
  "#C46210",
  "#EFDECD",
  "#9F2B68",
  "#3B7A57",
  "#FFBF00",
  "#9966CC",
  "#3DDC84",
  "#665D1E",
  "#FF9966",
  "#B2BEB5",
  "#FF9966",
  "#80FF00",
  "#DC143C",
  "#87421F",
];

const neighborhoods = {
  1: "Palace Hills",
  2: "Northwest",
  3: "Old Town",
  4: "Safe Town",
  5: "Southwest",
  6: "Downtown",
  7: "Wilson Forest",
  8: "Scenic Vista",
  9: "Broadview",
  10: "Chapparal",
  11: "Terrapin Springs",
  12: "Pepper Mill",
  13: "Cheddarford",
  14: "Easton",
  15: "Weston",
  16: "Southton",
  17: "Oak Willow",
  18: "East Parton",
  19: "West Parton",
};

const ParallelPlot = ({ data }) => {
  const margin = { top: 30, right: 30, bottom: 30, left: 0 };
  const width = 750;
  const height = 480;

  const svgRef = React.useRef(null);
  const svgWidth = width - margin.left - margin.right;
  const svgHeight = height - margin.top - margin.bottom;

  const locations = useSelector((state) => state.entities.selectedRegions);
  const start_datetime = useSelector((state) => state.entities.start_datetime);
  const end_datetime = useSelector((state) => state.entities.end_datetime);
  var dataByDateTime = filterDataByDateTime(data, start_datetime, end_datetime);

  if (dataByDateTime === {}) {
    dataByDateTime = data;
  }

  var locationFilter = [];
  if (locations.length === 0) locationFilter = dataByDateTime;
  else
    locationFilter = dataByDateTime.filter((d) =>
      locations.includes(d.location)
    );

  const temp = groupDataByLocation(locationFilter);

  var averageValueByLocation = {};

  const quantile_data = [];

  for (const [key, value] of temp) {
    var q_object = {};

    var sumSewer = 0,
      sumMed = 0,
      sumBuild = 0,
      sumRoads = 0,
      sumShake = 0,
      sumPower = 0,
      countSewer = 0,
      countMed = 0,
      countBuild = 0,
      countShake = 0,
      countPower = 0,
      countRoads = 0;

    for (var i = 0; i < value.length; i++) {
      var array = {};
      if (value[i].sewer_and_water != null) {
        sumSewer += value[i].sewer_and_water;
        countSewer += 1;
      }
      if (value[i].roads_and_bridges != null) {
        sumRoads += value[i].roads_and_bridges;
        countRoads += 1;
      }
      if (value[i].power != null) {
        sumPower += value[i].power;
        countPower += 1;
      }
      if (value[i].medical != null) {
        sumMed += value[i].medical;
        countMed += 1;
      }
      if (value[i].buildings != null) {
        sumBuild += value[i].buildings;
        countBuild += 1;
      }
      if (value[i].shake_intensity != null) {
        sumShake += value[i].shake_intensity;
        countShake += 1;
      }
    }

    array.sewer_and_water = sumSewer / countSewer;
    array.medical = sumMed / countMed;
    array.power = sumPower / countPower;
    array.buildings = sumBuild / countBuild;
    array.shake_intensity = sumShake / countShake;
    array.roads_and_bridges = sumRoads / countRoads;
    averageValueByLocation[key] = array;

    attrs.forEach((prop) => {
      q_object[prop] = getQuantileData(value, prop);
    });
    q_object.location = key;
    quantile_data.push(q_object);
  }

  const avgValueLocationArr = [];

  for (var loc in averageValueByLocation) {
    averageValueByLocation[loc]["location"] = loc;
    avgValueLocationArr.push(averageValueByLocation[loc]);
  }

  useEffect(() => {
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    const svg = svgEl
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const text_legend = svg
      .append("text")
      .attr("transform", "translate(" + (svgWidth - 60) + "," + 0 + ")");

    const x = d3
      .scalePoint()
      .range([0, svgWidth])
      .padding(1)
      .domain(
        Object.keys(avgValueLocationArr[0]).filter((d) => d !== "location")
      );

    const y = {};

    for (const key of Object.keys(avgValueLocationArr[0]).filter(
      (d) => d !== "location"
    )) {
      y[key] = d3
        .scaleLinear()
        .domain([0, 10])
        .range([svgHeight, 0]);
    }

    const line = d3
      .line()
      .defined((d) => !isNaN(d[1]))
      .x((d, i) => x(x.domain()[i]))
      .y((d) => y[d[0]](d[1]));

    // Highlight the specie that is hovered
    var highlight = function (d) {
      var selected_line = String(this.className.baseVal).split(" ").pop();
      const locationId = selected_line.substring(8);

      var avgRoad = averageValueByLocation[+locationId]["roads_and_bridges"];

      // first every group turns grey
      d3.selectAll(".line")
        .transition()
        .style("stroke", "lightgrey")
        .style("opacity", "0.2");
      // Second the hovered specie takes its color

      text_legend
        .text(neighborhoods[+locationId])
        .style("fill", color[+locationId - 1])
        .transition()
        .style("opacity", 1)
        .attr(
          "transform",
          "translate(" + (svgWidth - 80) + "," + y["roads_and_bridges"](avgRoad) + ")"
        );

      d3.selectAll("." + selected_line)
        .transition()
        .style("stroke", color[+locationId - 1])
        .style("opacity", "1");

      d3.selectAll(".boxplot-stripe" + locationId)
        .transition()
        .style("stroke", "black")
        .style("opacity", "1");
    };

    // Unhighlight
    var doNotHighlight = function (d) {
      d3.selectAll(".line")
        .transition()
        .style("stroke", function (d) {
          return color[+d.location - 1];
        })
        .style("opacity", "0.5");

      d3.selectAll(".boxplot").transition().style("opacity", "0");

      text_legend.transition().style("opacity", 0);
    };

    svg
      .selectAll(".line")
      .data(avgValueLocationArr)
      .join("path")
      .attr("d", (d) =>
        line(
          Object.entries(d)
            .filter(([key, value]) => key !== "location")
            .map(([key, value]) => [key, value])
        )
      )
      .attr("class", (d) => {
        return "line location" + d.location;
      })

      .style("stroke-width", "4px")
      .style("stroke", (d) => color[+d.location - 1])
      .style("opacity", 0.5)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight)
      .style("fill", "none");

    svg
      .selectAll(".axis")
      .data(Object.keys(avgValueLocationArr[0]).filter((d) => d !== "location"))
      .join("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${x(d)},0)`)
      .each(function (d) {
        d3.select(this).call(d3.axisLeft(y[d]).ticks(10));
      })
      .append("text")
      .attr("class", "title")
      .attr("fill", "black")
      .attr("y", -10)
      .text((d) => ATTRIBUTE_LIST[d]);

    var y1 = d3.scaleLinear().domain([0, 10]).range([svgHeight, 0]);

    //Box plot
    var locs = d3.map(quantile_data, (d) => d.location);
    locs.forEach((loc) => {
      var quantile_specific = quantile_data.filter((d) => d.location === loc);
      for (var i in quantile_specific[0]) {
        if (i === "location") continue;

        var max = quantile_specific[0][i].max;
        var min = quantile_specific[0][i].min;
        var q3 = quantile_specific[0][i].q3;
        var q1 = quantile_specific[0][i].q1;
        var median = quantile_specific[0][i].median;

        svg
          .append("line")
          .attr("x1", x(i))
          .attr("x2", x(i))
          .attr("y1", y1(min))
          .attr("y2", y1(max))
          .style("stroke", "black")
          .style("opacity", "0")
          .style("stroke-width", "2px")
          .attr("class", "boxplot location" + loc);

        const width = 20;

        svg
          .append("rect")
          .attr("x", x(i) - width / 2)
          .attr("y", y1(q3))
          .attr("height", y1(q1) - y1(q3))
          .attr("width", width)
          .attr("stroke", "black")
          .style("opacity", "0")

          .style("fill", color[loc - 1])
          .attr("class", "boxplot location" + loc);

        svg
          .selectAll("toto")
          .data([min, median, max])
          .enter()
          .append("line")
          .attr("x1", x(i) - width / 2)
          .attr("x2", x(i) + width / 2)
          .attr("y1", function (d) {
            return y1(d);
          })
          .attr("y2", function (d) {
            return y1(d);
          })
          .attr("stroke", "black")
          .style("opacity", "0")

          .attr("stroke-width", "3px")
          .attr("class", "boxplot boxplot-stripe" + loc + " location" + loc);
      }
    });
  });
  return (
    <>
    <div className="parallel-plot-container-div">
    <h4>Attribute wise damage data distribution</h4>
      <svg ref={svgRef} width={width} height={height} />
      <span className='parallel-plot-text'>The <i><b>parallel plot</b></i> above shows the aggregated damage across regions with respect to attributes.
      The <i><b>box plot</b></i> shows the damage data distribution. <i><b>Hover over</b></i> the data lines in order to view the location corresponding box plot.</span>
    </div>
    </>
  );
};
export default ParallelPlot;
