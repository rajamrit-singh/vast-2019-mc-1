import React from "react";
import { useEffect } from "react";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import { getMeanforTimeInterval } from "../../utils/dataProcessUtil";
import "./ScatterPlot.css";

const attrs = [
  "sewer_and_water",
  "power",
  "roads_and_bridges",
  "medical",
  "buildings",
  "shake_intensity",
  "location",
];

const ATTRIBUTE_LIST = {
  sewer_and_water: "Sewer & Water",
  power: "Power",
  roads_and_bridges: "Roads & Bridges",
  medical: "Medical",
  buildings: "Buildings",
  shake_intensity: "Shake",
};

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

function drawScatterPlot(
  svg,
  avgVals,
  xScale,
  yScale,
  colorScale,
  radiusScale
) {
  // create the scatterplot
  svg
    .selectAll("sewer_water")
    .data(avgVals)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(new Date(d.time)))
    .attr("cy", (d) => yScale(d.sewer_and_water))
    .attr("r", (d) => {
      if (d.sewer_and_water) return radiusScale(d.count);
      else return 0;
    })
    .attr("class", "scatterplot-point sewer_and_water")
    .attr("fill", function (d) {
      return colorScale("sewer_and_water");
    });

  svg
    .selectAll("power")
    .data(avgVals)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(new Date(d.time)))
    .attr("cy", (d) => yScale(d.power))
    .attr("r", (d) => {
      if (d.power) return radiusScale(d.count);
      else return 0;
    })
    .attr("class", "scatterplot-point power")
    .attr("fill", function (d) {
      return colorScale("power");
    });

  svg
    .selectAll("roads_and_bridges")
    .data(avgVals)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(new Date(d.time)))
    .attr("cy", (d) => yScale(d.roads_and_bridges))
    .attr("r", (d) => {
      if (d.roads_and_bridges) return radiusScale(d.count);
      else return 0;
    })
    .attr("class", "scatterplot-point roads_and_bridges")
    .attr("fill", function (d) {
      return colorScale("roads_and_bridges");
    });

  svg
    .selectAll("medical")
    .data(avgVals)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(new Date(d.time)))
    .attr("cy", (d) => yScale(d.medical))
    .attr("r", (d) => {
      if (d.medical) return radiusScale(d.count);
      else return 0;
    })
    .attr("class", "scatterplot-point medical")
    .attr("fill", function (d) {
      return colorScale("medical");
    });

  svg
    .selectAll("buildings")
    .data(avgVals)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(new Date(d.time)))
    .attr("cy", (d) => yScale(d.buildings))
    .attr("r", (d) => {
      if (d.buildings) return radiusScale(d.count);
      else return 0;
    })
    .attr("class", "scatterplot-point buildings")
    .attr("fill", function (d) {
      return colorScale("buildings");
    });

  svg
    .selectAll("shake_intensity")
    .data(avgVals)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(new Date(d.time)))
    .attr("cy", (d) => yScale(d.shake_intensity))
    .attr("r", (d) => {
      if (d.shake_intensity) return radiusScale(d.count);
      else return 0;
    })
    .attr("class", "scatterplot-point shake_intensity")
    .attr("fill", function (d) {
      return colorScale("shake_intensity");
    });

  const tooltip = d3.select(".tooltip-scatterplot").style("opacity", 0);

  const options = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  svg
    .selectAll(".scatterplot-point")
    .on("mouseover", function (event, d) {
      const attr = String(this.className.baseVal).split(" ").pop();

      // console.log(this, d);

      tooltip.style("visibility", "visible");

      tooltip.transition().style("opacity", 0.9);

      // console.log(d);
      tooltip
        .html(
          "<b>No. of Reports:</b> " +
            d.count +
            "<br><b>Magnitude:</b> " +
            roundToTwo(d[attr]) +
            "<br><b>Time:</b> " +
            d.time.toLocaleTimeString("en-US", options)
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");

      d3.select(this).attr("stroke", "black").attr("stroke-width", "1px");

      d3.selectAll(".scatterplot-point")
        .transition()
        .style("opacity", 1 * 0.1)
        .style("fill", "grey");

      d3.selectAll(`.${attr}`)
        .transition()
        .style("fill", colorScale(attr))
        .style("opacity", 1);
    })
    .on("mouseout", function (e, d) {
      attrs.forEach((attr) => {
        if (attr !== "location") {
          d3.selectAll("." + attr)
            .transition()
            .style("fill", colorScale(attr))
            .style("opacity", 1);
        }
      });

      // d3.selectAll(".scatterplot-point").transition().style("opacity", 1);
      d3.select(this).attr("stroke-width", "0px");
      tooltip.style("visibility", "collapse");
      tooltip.transition().style("opacity", 0);
    });
}

function createLegends(colorScale, parentSvg, margin) {
  const svg = parentSvg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`);

  svg
    .append("rect")
    .attr("transform", `translate(0,15)`)
    .attr("width", "10")
    .attr("class", "sewer_and_water")
    .attr("height", "10")

    .attr("fill", colorScale("sewer_and_water"))
    .on("mouseover", function () {
      const attr = String(this.className.baseVal).split(" ").pop();
      d3.selectAll(".scatterplot-point")
        .transition()
        .style("opacity", 1 * 0.1)
        .style("fill", "grey");

      d3.selectAll(`.${attr}`)
        .transition()
        .style("fill", colorScale(attr))
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      attrs.forEach((attr) => {
        if (attr !== "location") {
          d3.selectAll("." + attr)
            .transition()
            .style("fill", colorScale(attr))
            .style("opacity", 1);
        }
      });
    });

  svg
    .append("text")
    .attr("transform", `translate(15,24)`)
    .attr("fill", "black")
    .style("font-size", "10px")

    .text(ATTRIBUTE_LIST["sewer_and_water"]);

  svg
    .append("rect")
    .attr("transform", `translate(100,15)`)
    .attr("width", "10")
    .attr("height", "10")
    .attr("fill", colorScale("power"))
    .attr("class", "power")
    .on("mouseover", function () {
      const attr = String(this.className.baseVal).split(" ").pop();
      d3.selectAll(".scatterplot-point")
        .transition()
        .style("opacity", 1 * 0.1)
        .style("fill", "grey");

      d3.selectAll(`.${attr}`)
        .transition()
        .style("fill", colorScale(attr))
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      attrs.forEach((attr) => {
        if (attr !== "location") {
          d3.selectAll("." + attr)
            .transition()
            .style("fill", colorScale(attr))
            .style("opacity", 1);
        }
      });
    });

  svg
    .append("text")
    .attr("transform", `translate(115,24)`)
    .attr("fill", "black")
    .style("font-size", "10px")

    .text(ATTRIBUTE_LIST["power"]);

  svg
    .append("rect")
    .attr("transform", `translate(160,15)`)
    .attr("width", "10")
    .attr("height", "10")

    .attr("fill", colorScale("roads_and_bridges"))
    .attr("class", "roads_and_bridges")
    .on("mouseover", function () {
      const attr = String(this.className.baseVal).split(" ").pop();
      d3.selectAll(".scatterplot-point")
        .transition()
        .style("opacity", 1 * 0.1)
        .style("fill", "grey");

      d3.selectAll(`.${attr}`)
        .transition()
        .style("fill", colorScale(attr))
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      attrs.forEach((attr) => {
        if (attr !== "location") {
          d3.selectAll("." + attr)
            .transition()
            .style("fill", colorScale(attr))
            .style("opacity", 1);
        }
      });
    });

  svg
    .append("text")
    .attr("transform", `translate(175,24)`)
    .attr("fill", "black")
    .style("font-size", "10px")

    .text(ATTRIBUTE_LIST["roads_and_bridges"]);

  svg
    .append("rect")
    .attr("transform", `translate(260,15)`)
    .attr("width", "10")
    .attr("height", "10")
    .attr("fill", colorScale("medical"))
    .attr("class", "medical")
    .on("mouseover", function () {
      const attr = String(this.className.baseVal).split(" ").pop();
      d3.selectAll(".scatterplot-point")
        .transition()
        .style("opacity", 1 * 0.1)
        .style("fill", "grey");

      d3.selectAll(`.${attr}`)
        .transition()
        .style("fill", colorScale(attr))
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      attrs.forEach((attr) => {
        if (attr !== "location") {
          d3.selectAll("." + attr)
            .transition()
            .style("fill", colorScale(attr))
            .style("opacity", 1);
        }
      });
    });

  svg
    .append("text")
    .attr("transform", `translate(275,24)`)
    .attr("fill", "black")
    .style("font-size", "10px")

    .text(ATTRIBUTE_LIST["medical"]);

  svg
    .append("rect")
    .attr("transform", `translate(320,15)`)
    .attr("width", "10")
    .attr("height", "10")
    .attr("fill", colorScale("buildings"))
    .attr("class", "buildings")
    .on("mouseover", function () {
      const attr = String(this.className.baseVal).split(" ").pop();
      d3.selectAll(".scatterplot-point")
        .transition()
        .style("opacity", 1 * 0.1)
        .style("fill", "grey");

      d3.selectAll(`.${attr}`)
        .transition()
        .style("fill", colorScale(attr))
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      attrs.forEach((attr) => {
        if (attr !== "location") {
          d3.selectAll("." + attr)
            .transition()
            .style("fill", colorScale(attr))
            .style("opacity", 1);
        }
      });
    });

  svg
    .append("text")
    .attr("transform", `translate(335,24)`)
    .attr("fill", "black")
    .style("font-size", "10px")

    .text(ATTRIBUTE_LIST["buildings"]);

  svg
    .append("rect")
    .attr("transform", `translate(390,15)`)
    .attr("width", "10")
    .attr("height", "10")

    .attr("fill", colorScale("shake_intensity"))
    .attr("class", "shake_intensity")
    .on("mouseover", function () {
      const attr = String(this.className.baseVal).split(" ").pop();
      d3.selectAll(".scatterplot-point")
        .transition()
        .style("opacity", 1 * 0.1)
        .style("fill", "grey");

      d3.selectAll(`.${attr}`)
        .transition()
        .style("fill", colorScale(attr))
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      attrs.forEach((attr) => {
        if (attr !== "location") {
          d3.selectAll("." + attr)
            .transition()
            .style("fill", colorScale(attr))
            .style("opacity", 1);
        }
      });
    });

  svg
    .append("text")
    .attr("transform", `translate(405,24)`)
    .attr("fill", "black")
    .style("font-size", "10px")

    .text(ATTRIBUTE_LIST["shake_intensity"]);
}

const ScatterPlot = ({ data }) => {
  const selectedRegions = useSelector(
    (state) => state.entities.selectedRegions
  );
  const start_datetime = useSelector((state) => state.entities.start_datetime);
  const end_datetime = useSelector((state) => state.entities.end_datetime);

  const dimensions = {
    width: 600,
    height: 480,
    margin: { top: 50, right: 30, bottom: 50, left: 60 },
  };

  const svgRef = React.useRef(null);
  const { width, height, margin } = dimensions;
  const svgWidth = width - margin.left - margin.right;
  const svgHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove(); // Clear svg content before adding new elements

    const avgVals = getMeanforTimeInterval(
      data,
      selectedRegions,
      start_datetime,
      end_datetime
    );
    // console.log("BC", avgVals);

    const svg = svgEl
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // create the x scale using UTC time
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(avgVals, (d) => new Date(d.time)))
      .range([0, svgWidth]);

    // create the y scale for the ratings
    const yScale = d3.scaleLinear().domain([0, 10]).range([svgHeight, 0]);

    const colorScale = d3.scaleOrdinal().domain(attrs).range(d3.schemeDark2);

    const radiusScale = d3
      .scaleLog()
      .domain(d3.extent(avgVals, (d) => d.count))
      .range([0.5, 6]);

    // create the x axis
    const xAxis = d3.axisBottom(xScale);

    // create the y axis
    const yAxis = d3.axisLeft(yScale);

    const y_axis_label = svg
      .append("text")
      .classed("label", true)
      .classed("axis-label", true)
      // .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", "-30px")
      .attr("x", -svgWidth / 2 + 60)
      .attr("text-anchor", "middle")
      .text("Magnitude");

    const x_axis_label = svg
      .append("text")
      .classed("label", true)
      .classed("axis-label", true)
      // .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", svgWidth / 2)
      .attr("y", svgHeight + 40)
      .text("Time");

    drawScatterPlot(svg, avgVals, xScale, yScale, colorScale, radiusScale);
    createLegends(colorScale, svgEl, margin);

    // add the x axis
    svg.append("g").attr("transform", `translate(0, ${svgHeight})`).call(xAxis);

    // add the y axis
    svg.append("g").call(yAxis);
  });

  return (
    <div className="scatter-plot-container-div">
      <div className="tooltip-scatterplot"></div>
      <h4>Category wise damage reports over a time series</h4>
      <svg ref={svgRef} width={width} height={height} />
      <span className="scatter-plot-text">
        The scatterplot shows the average value of various attributes at
        each minute. Area is proportional to the number of reports. <b>Hover</b> over the point mark for more info.
      </span>
    </div>
  );
};

export default ScatterPlot;
