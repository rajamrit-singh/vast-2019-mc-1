import { useEffect } from "react";
import {select, selectAll, axisBottom, axisLeft, group, max, scaleBand, scaleTime, scaleLinear, scaleOrdinal} from "d3";
import { useSelector } from 'react-redux';
import { filterDataByDateTime} from '../../utils/dataProcessUtil';
import "./DotPlot.css";

const color = ["#B0BF1A", "#0048BA", "#7CB9E8", "#B284BE", "#DB2D43", "#C46210", "#EFDECD", "#9F2B68", "#3B7A57", "#FFBF00",
            "#9966CC", "#3DDC84", "#665D1E", "#FF9966", "#B2BEB5", "#FF9966", "#80FF00", "#DC143C", "#87421F"];

const neighborhoods = {
    1 : "Palace Hills",
    2 : "Northwest",
    3 : "Old Town",
    4 : "Safe Town",
    5 : "Southwest",
    6 : "Downtown",
    7 : "Wilson Forest",
    8 : "Scenic Vista",
    9 : "Broadview",
    10 : "Chapparal",
    11 : "Terrapin Springs",
    12 : "Pepper Mill",
    13 : "Cheddarford",
    14 : "Easton",
    15 : "Weston",
    16 : "Southton",
    17 : "Oak Willow",
    18 : "East Parton",
    19 : "West Parton"
};

var tooltipDiv = undefined;
const NUMBER_OF_LOCATIONS = 19;
var inputData, locationsSelected;
var yThresholdInput = undefined;

function drawDotPlot() {

    select('.dot_plot').selectAll("*").remove();

    let dotPlotTimeWiseData = [];
    var previousData = null;
    
    for(const row of inputData) {
        
        if(previousData === null) {
            var locationWiseRecords = [];
            for(let index = 0 ; index < NUMBER_OF_LOCATIONS ; index++) {
                locationWiseRecords.push(0);
            }

            previousData = {
                time : row.time,
                locationRecords : locationWiseRecords,
                totalReports : 0
            };
        }
        else if(row.time.getTime() !== previousData.time.getTime()) {
            dotPlotTimeWiseData.push(previousData);

            var locationWiseRecords = [];
            for(let index = 0 ; index < NUMBER_OF_LOCATIONS ; index++) {
                locationWiseRecords.push(0);
            }

            previousData = {
                time : row.time,
                locationRecords : locationWiseRecords,
                totalReports : 0
            };
        }
        previousData.locationRecords[row.location - 1]++;
        previousData.totalReports++;
    }
    dotPlotTimeWiseData.push(previousData);

    var noLocationsSelected = true;

    const width = 600,
    height = 450,
    margin = {top : 4, bottom : 25, left : 55, right : 25};

    for(let index = 0 ; index < NUMBER_OF_LOCATIONS ; index++) {
        if(locationsSelected[index] === 1) {
            noLocationsSelected = false;
            break;
        }
    }

    var dotPlotData;

    if(!noLocationsSelected) {
        dotPlotData = [];

        for(const recordsInCurrentTime of dotPlotTimeWiseData) {
            const currentTime = recordsInCurrentTime.time;
            
            const locationRecordsInCurrentTime = recordsInCurrentTime.locationRecords;
            for(let index = 0 ; index < NUMBER_OF_LOCATIONS ; index++) {

                if(locationsSelected[index] === 0)
                    continue;
                
                const numberOfRecords = locationRecordsInCurrentTime[index];
                if(numberOfRecords !== 0) {
                    var currentData = {
                        time : currentTime,
                        location : index + 1,
                        numberOfRecords : numberOfRecords
                    };
                    dotPlotData.push(currentData);
                }
            }
        }
    }
    else {
        dotPlotData = dotPlotTimeWiseData;
    }

    const chartG = select('.dot_plot')
              .attr('width', width + margin.right + margin.left)
              .attr('height', height + margin.top + margin.bottom)
              .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    var dateTimeRange = [];
    dateTimeRange.push(dotPlotData[0].time);
    dateTimeRange.push(dotPlotData[dotPlotData.length - 1].time);

    var xScale = scaleTime()
                    .domain([dateTimeRange[0], dateTimeRange[1]])
                    .range([0, innerWidth]);

    var maxY;

    if(yThreshold > 0) {
        maxY = yThreshold;
    }
    else {
        maxY = max(dotPlotData, function(d) {
            if(noLocationsSelected) {
                return d["totalReports"];;
            }
            return d["numberOfRecords"];
        });
    }

    if(yThreshold < 0) {
        
        yThresholdInput.attr("max", maxY);
        
        yThresholdInput.node().value = maxY;
    }

    var yScale = scaleLinear()
                    .domain([0, maxY])
                    .range([innerHeight, 0]);

    const xAxis = axisBottom(xScale);
    const yAxis = axisLeft(yScale);

    chartG.append('g')
            .classed("yAxis", true)
            .call(yAxis);
    chartG.append('g')
                .classed("xAxis", true)
                    .call(xAxis)
                        .attr("transform", `translate(0,${innerHeight})`)
                      .selectAll("text")                   
                    .style("text-anchor", "right");

    chartG.selectAll(".circle")
    .data(dotPlotData)
    .enter()
        .append("circle")
        .classed("circle", true)
        .attr("cx", d => xScale(d.time))
        .attr("cy", function(d) {
            if(noLocationsSelected) {
                return yScale(d.totalReports);
            }
            return yScale(d.numberOfRecords);
        })
        .attr("r", 2)
        .attr("fill", function(d) {

            if(noLocationsSelected) {
                return "black";
            }
            return color[d.location - 1];
        })
        .attr("stroke", "black")
        .attr("stroke-width", "1")
        .style("opacity", 0.7)
        .on("mouseover", function(event, data) {
            selectAll(".circle")
                .style("opacity", 0.4);

            select(this)
                .style("opacity", 1);

            tooltipDiv.style("visibility", "visible");
            tooltipDiv.style("opacity", 1);

            if(data.totalReports !== undefined) {
                let locWiseReps = "";
                for(let locIndex = 0 ; locIndex < NUMBER_OF_LOCATIONS ; locIndex++) {
                    if(data.locationRecords[locIndex] !== 0) {
                        if(locWiseReps.length > 0) {
                            locWiseReps = locWiseReps.concat(", " + neighborhoods[locIndex + 1] + " : " + data.locationRecords[locIndex]);
                        }
                        else {
                            locWiseReps = locWiseReps.concat(neighborhoods[locIndex + 1] + " : " + data.locationRecords[locIndex]);
                        }
                    }
                }

                tooltipDiv.html("Total reports : " + data.totalReports + ", " + locWiseReps + "<br />Time : " + data.time.toLocaleString("en-US"));
            }
            else {

                tooltipDiv.html("Neighborhood : " + neighborhoods[data.location] + "<br />Number of reports : " + data.numberOfRecords + "<br />Time : " + data.time.toLocaleString("en-US"));
            }

            tooltipDiv.style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 70) + "px");
        })
        .on("mouseout", function(event, data) {
            selectAll(".circle")
                .style("opacity", 0.7);
            tooltipDiv.style("visibility", "collapse");
            tooltipDiv.style("opacity", 0);
            
        });
    
        chartG.append('text')
        .attr("id", "xAxisText")
        .classed("label", true)
        .attr('x',innerWidth/2)
        .attr('y',innerHeight+35)
        .text("Timestamp")
        .style("color", "black");

        chartG.append('text')
                    .attr("id", "yAxisText")
                    .classed("label", true)
                    .attr('transform','rotate(-90)')
                    .attr('y','-40px')
                    .attr('x',-innerHeight/2)
                    .style('text-anchor','middle')
                    .text("Number of Reports")
                    .style("color", "black");
        
        var neighborhoodNames = [];
        var colorRange = [];
        for(let index = 0 ; index < NUMBER_OF_LOCATIONS ; index++) {
            if(locationsSelected[index] === 1) {
                neighborhoodNames.push(neighborhoods[index + 1]);
                colorRange.push(color[index]);
            }
        }

        if(neighborhoodNames.length > 0) {
            var legendScale = scaleOrdinal()
                            .domain(neighborhoodNames)
                            .range(colorRange);

            var legendTileSize = 20;
            
            chartG
                .selectAll("legendTiles")
                .data(neighborhoodNames)
                .join("rect")
                    .attr("x", innerWidth - 40)
                    .attr("y", function(d, i) {
                        return 0 + i * (legendTileSize + 5);
                    })
                    .attr("width", legendTileSize)
                    .attr("height", legendTileSize)
                    .style("fill", function(d) {
                        return legendScale(d);
                    });

            chartG
                .selectAll("legendNames")
                .data(neighborhoodNames)
                .join("text")
                    .attr("x", innerWidth - 40 + legendTileSize * 1.2)
                    .attr("y", function(d, i) {
                        return 5 + i * (legendTileSize + 5) + (legendTileSize / 2);
                    })
                    .style("fill", function(d, i) {
                        return colorRange[i];
                    })
                    .text((d) => d)
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle");
        }
}

var yThreshold = -1;

function setThreshold() {
    const thresholdInput = yThresholdInput.node().value;
    
    if(thresholdInput > 0) {
        yThreshold = thresholdInput;
        drawDotPlot();
    }
}

function resetThreshold() {
    yThreshold = -1;
    drawDotPlot();
}

const DotPlot = ({data}) => {
    const checkedRegions = useSelector(state => state.entities.selectedRegions);

    const start_datetime = useSelector(state => state.entities.start_datetime);
    const end_datetime = useSelector(state => state.entities.end_datetime);
    const dataByDateTime = filterDataByDateTime(data, start_datetime, end_datetime);

    useEffect(() => {
      if(tooltipDiv === undefined) {
        tooltipDiv = 
        select('body')
        .append("div")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("text-align", "center")
            .style("width", "auto")
            .style("height", "auto")
            .style("padding", "2px")
            .style("border", "2px solid")
            .style("border-radius", "4px")
            .style("background", "black")
            .style("border-color", "black")
            .style("color", "white");
      }

      if(yThresholdInput === undefined) {
        yThresholdInput = select("#yThreshold");
      }

      if(dataByDateTime== null || dataByDateTime.length === 0) {
        return;
      }

        locationsSelected = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        
        for(const currentRegion of checkedRegions) {
            locationsSelected[currentRegion - 1] = 1;
        }

        inputData = dataByDateTime;

        drawDotPlot();

    });

    return(
        <div className='dotplot_container_svg'>
            {/* <div id="tooltipDotPlot"></div> */}
            <h4>Number of reports received over time</h4>
            <svg className='dot_plot'></svg><br />
            <label htmlFor="yAxisThreshold">Maximum number of reports</label>
            <input type="number" id="yThreshold" size="5" min="1" style={{marginLeft: 15+'px', marginRight: 15+'px', width: 80+'px'}}/>
            <input type="button" value="Update" onClick={setThreshold} style={{marginLeft: 15+'px', marginRight: 15 +'px'}}/>
            <input type="button" value="Reset to default" onClick={resetThreshold} />
            <span className='dot-plot-text'>The dot plot shows reporting patterns across all neighborhoods when no region is selected on the map, location-wise information will be shown as regions are selected. <b>Hover</b> over the points for more info.</span>
        </div>
      );
};
// react fragment

export default DotPlot;