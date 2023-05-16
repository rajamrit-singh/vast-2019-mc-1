import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSelector, useDispatch } from 'react-redux';
import { setEndDate, setStartDate } from "../../store/actionCreators";
import './MultiLIneChart.css';

const attrs = [
  "sewer_and_water",
  "power",
  "roads_and_bridges",
  "medical",
  "buildings",
  "shake_intensity",
  "average_row"
];

const MultiLineChart = ({ data }) => {
  const svgRef = useRef(null);
  const margin = { top: 0, right: 40, bottom: 50, left: 75 };
  const width = 1495 - margin.left - margin.right;
  const height = 280 - margin.top - margin.bottom;
  const selectedAttribute = useSelector(state => state.entities.current_choropleth_attribute);
  const dispatch = useDispatch();

  useEffect(() => {
    // Remove existing classes
    d3.select('.multiLineChart').remove();
    d3.select('.line-chart-y-axis').remove();
    d3.select('.line-chart-legend').remove();
    d3.select('.brush').remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const color = d3
      .scaleOrdinal()
      .range(["#d4eeff"])

    const colorScale = d3.scaleOrdinal().domain(attrs).range(d3.schemeDark2);
    
    // Processing the data into data map
    let lineData = data.map((d) => {
        return {
          time: new Date(d.time),
          power: +d.power,
          sewer_and_water: +d.sewer_and_water,
          roads_and_bridges: +d.roads_and_bridges,
          medical: +d.medical,
          buildings: +d.buildings,
          shake_intensity: +d.shake_intensity,
          average_row: +d.average_row
        };
    });

    let attributes;
    if(selectedAttribute === 'average') {
      attributes = ['average_row']
    } else {
      attributes = [selectedAttribute]
    }

    // Roll up the data to take average of data for every minute
    const minuteData = {};
  
    attributes.forEach((attr) => {
        const tempData = d3.rollup(
          lineData,
          (v) => d3.mean(v, (d) => d[attr]),
          (d) => d3.timeMinute(new Date(d.time))
        );
        minuteData[attr] = tempData;
    });
    
    // X-axis and Y-axis setup
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(d3.extent(minuteData[attributes[0]].keys()));
    y.domain([0, d3.max(attributes.map((attr) =>d3.max(minuteData[attr].values(),(d) => d))),]);

    // Add x axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add y axis
    svg.append("g")
    .attr('class', 'line-chart-y-axis')
    .call(d3.axisLeft(y));

    // Axis Labels Section
    const y_label = svg.append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Magnitude");

    const x_label = svg
      .append("text")
      .classed("label", true)
      .classed("axis-label", true)
      // .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .text("Time");

    // Lines for Line Chart Section  
    const line = d3.line()
                    .x((d) => x(d[0]))
                    .y((d) => y(d[1]));

    attributes.forEach(
    (attr, i) => 
    {
        svg.append("path")
          .datum(Array.from(minuteData[attr]))
          .attr("class", "multiLineChart")
          .attr("fill", "none")
          .attr("stroke", colorScale(attr))
          .attr("stroke-width", 1.5)
          .attr("d", line);
    });

    // Brush Section
    const brush = d3.brushX()
                    .extent([[0, 0], [width, height]])
                    .on("end", (event) => brushed(event));
    
    let brushSelection = null
    let brushElement = null

    if (brushElement && !brushElement.empty()) 
    {
        brushSelection.call(brush);
    } else 
    {
        createBrush();
    }

    function createBrush()
    {
      brushElement = svg.append("g")
        .attr("class", "brush")
        .call(brush);
      brushSelection = brushElement.select(".overlay");
    }

    function brushed(event) 
    {
      const extent = event.selection;
      if (extent) 
      {
        const [x0, x1] = extent.map(x.invert);
        dispatch(setStartDate(x0.toString()));
        dispatch(setEndDate(x1.toString()));
      }
      else
      {
        dispatch(setStartDate("4/5/2020  1:40:00 PM"))
        dispatch(setEndDate("4/13/2020  3:15:00 PM"))
      }
    }

    //Legend Section
    const legend = svg.append("g")
        .attr("class", "line-chart-legend")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(attributes)
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i *20})`);
        
    legend
        .append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", function (){
          if (selectedAttribute == "average")
            return colorScale("average_row");
          return colorScale(selectedAttribute)
        });
    
    legend
        .append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) {
          if (d === "average_row") {
            return "Average Magnitude";
          } 
          else if (d === "sewer_and_water")
          {
            return "Sewer and Water";
          }
          else if (d === "roads_and_bridges")
          {
            return "Road and Bridges"
          }
          else if (d === "shake_intensity")
          {
            return "Shake Intensity"
          }
          else if (d === "power")
          {
            return "Power"
          }
          else if (d === "medical")
          {
            return "Medical" 
          }
          else if (d == "buildings")
          {
            return "Buildings"
          }
          else
          {
            return d;
          }
        });

}, [data, selectedAttribute]);

return (
  <div className="multi-line-chart-container-div-cmp">
    <div className="tooltip-multilinechart"></div>
    <h4>Distribution of reporting over a time series</h4>
    <svg ref={svgRef}> </svg>
    <span className="multiline-text">The above line chart shows valleys and peaks over period of reporting of damages. These valleys and peaks give insight about the uncertainity of reporting in the data.<br/>Drag and draw a window on line chart to update the timeline in different plots on this page. <br/><b>The line chart attribute can be changed from the dropdown in <i>ChoroplethMap</i>.</b></span>
  </div>
);
};

export default MultiLineChart;