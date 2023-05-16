import React, { useEffect } from "react";
import {select, axisBottom, axisLeft, mode, scaleBand, scaleTime, scaleSequential, interpolate, selectAll, extent} from "d3";
import { useSelector } from 'react-redux';
import "./HeatMap.css";
import { Slider } from '../attribute-slider/Slider'

const width = 1200,
      height = 500,
      margins = {top:10, right: 200, bottom: 50, left: 200};
      
const ATTRIBUTE_LIST = {
  "sewer_and_water": "Sewer and Water",
  "power": "Power",
  "roads_and_bridges": "Roads and Bridges",
  "medical": "Medical",
  "buildings": "Buildings",
  "shake_intensity": "Shake Intensity"
}
const options = { hour: 'numeric', minute: 'numeric', hour12: true ,  year: 'numeric', month: 'long', day: 'numeric'};
var tooltip = undefined;

function wrangleData(data, selectedRegions, currentValue, start_datetime, end_datetime) {
  var filteredData = []
  var avgData = []
  if(selectedRegions.length ==0) {
    filteredData = data.filter(d => {
      let time = d['time']
      return (time.getTime() >= start_datetime.getTime() && time.getTime() <= end_datetime.getTime());
    }).sort((a,b)=> a['time'].getTime() < b['time'].getTime() ? -1 : 1)
  } else {
    filteredData = data.filter(d => {
        let time = d['time']
        return selectedRegions.includes(d['location']) && time.getTime() >= start_datetime.getTime() && time.getTime() <= end_datetime.getTime();
      }).sort((a,b)=> a['time'].getTime() < b['time'].getTime() ? -1 : 1)
  }

  let prevkey = filteredData[0]['time']
  var groupedData = filteredData.reduce((g, d) => {
    let time = d['time']
    let diff = (time-prevkey)/(60000)
    if(diff < currentValue) {
      if(!g[prevkey]) {
        g[prevkey] = []
      }
      g[prevkey].push(d)
      return g;
    }
    prevkey = new Date(prevkey.getTime() + currentValue*60000)

    while((time.getTime() - prevkey.getTime())/60000 > currentValue ) {
      g[prevkey] = []
      prevkey = new Date(prevkey.getTime() + currentValue*60000)
    }
    if(!g[prevkey]) {
      g[prevkey] = []
    }
    g[prevkey].push(d)
    return g;
    }, {}
  );

  Object.keys(groupedData).map((v)=>{
      return Object.keys(ATTRIBUTE_LIST).map((key)=> {
        let vals = groupedData[v].map((d)=> {return  d[key]}).filter((d) => {return d!=null})
        if(vals.length != 0){
          avgData.push({'key': v,'property':ATTRIBUTE_LIST[key], 'value': mode(vals), 'count': vals.length})
        } else {
          avgData.push({'key': v,'property':ATTRIBUTE_LIST[key], 'value': -1, 'count':0})
        }
      });  
    })

  return avgData;
}

//Append color legend using legendData
function drawLegend() {
  const count = 10;

  const categories = [...Array(count)].map((_, i) => {
    const uB = 10 / count * (i + 1);
    const lB = 10 / count * i;
    const color = interpolate('white', 'red');
    return {uB,lB,color: color(uB / 10)};
  });

  var legend = select('.heatmap-legend').append("svg").attr("width", 350).attr("height", 100)
      legend.append('g').append("text").attr("class", "header").text("Damage scale").attr('x', 120)
      .attr('y', 25)
      legend.append('g')
        .selectAll('g')
        .data(categories).enter()
        .append('rect')
        .attr('width', 30)
        .attr('height', 20)
        .attr('x', (d, i) => { return i * 30+20})
        .attr('y', 40)
        .style('fill', d => {return d.color;});
    
      //Append text labels
      legend.append('g')
      .append('text')
      .attr('x', 20)
      .attr('y',80).text('0')
    
      legend.append('g')
        .selectAll('text')
        .data(categories).enter().append('text')
        .attr('x', (d,i) => {return i * 30 + 50})
        .attr('y', 80)
        .text(d => {return d.uB })
}

const HeatMap = ({ data }) => {
    const selectedRegions = useSelector(state => state.entities.selectedRegions)
    const start_datetime = new Date(useSelector(state => state.entities.start_datetime))
    const end_datetime = new Date(useSelector(state => state.entities.end_datetime))
    var currentValue = useSelector(state => state.entities.heatmapDuration)

    useEffect(() => {

      select('.heat_chart').selectAll("*").remove()
      select('.heatmap-legend').selectAll("*").remove()
      select('body').selectAll(".tooltip-heatmap").remove()

      drawLegend()

      if(end_datetime - start_datetime > 1*60*60*1000) {
        select(".duration-slider").style("display", "block")
      } else {
        select(".duration-slider").style("display", "none")
        currentValue = 5
      }

      //Setting chart width and adjusting for margins
      const chart = select('.heat_chart')
        .attr('width', width + margins.right + margins.left)
        .attr('height', height + margins.top + margins.bottom)
        .append('g')
        .attr('transform','translate(' + margins.left + ',' + margins.top + ')');
      
      var avgData =wrangleData(data, selectedRegions, currentValue, start_datetime, end_datetime)
      
      let boundaries = extent(avgData, d => new Date(d['key']));
      let m1 = new Date(boundaries[0])
      let m2= new Date(boundaries[1])

      const barWidth = width / ((m2.getTime()-m1.getTime())/(currentValue*60*1000)),
            barHeight = height / 6;
    
      const yScale = scaleBand()
        .range([0, height])
        .domain([...Object.values(ATTRIBUTE_LIST)]);
      
      const xScale = scaleTime()
        .range([0,width])
        .domain([m1, new Date(m2.getTime()+currentValue*60*1000)]);

      tooltip = select('body')
      .append("div")
      .attr("class", "tooltip-heatmap")
      .style("opacity", 0)

      //Return dynamic color based on the magnitude
      const colorScale = scaleSequential(interpolate('white', 'red')).domain([-1,10])
 
      //Append heatmap markers, styles, and mouse events
      chart.selectAll('g')
        .data(avgData).enter().append('g')
        .append('rect')
        .attr("class", "heat-rect")
        .attr("id", d => {return (d['key']+d['property']).replaceAll(/[^A-Z0-9]/ig, "")})
        .attr('x', d => {return xScale(new Date(d['key']))})
        .attr('y', d =>  {return yScale(d['property'])})
        .style('fill', d => {return colorScale(d['value'])})
        .attr('width', barWidth)
        .attr('height', barHeight);

      chart.selectAll(".heat-rect")
      .on("mouseover", function (event, d) {
      tooltip.style("visibility", "visible");
      tooltip.transition().style("opacity", 0.9);
      let k = new Date(d['key'])
      if(d.value == -1 && d.count==0) {
        tooltip
        .html("No REPORTS for " + d['property'] + " on " + k.toLocaleTimeString('en-US', options) )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
      } else {
        tooltip
        .html(d['count']+ " Reports for " + d['property'] +" on " +  k.toLocaleTimeString('en-US', options) +"</br>" +"The reported status is "+d['value'])
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
      }
      select(this).attr("stroke", "black").attr("stroke-width", "1.5 px");
      selectAll(".heat-rect")
      .transition()
      .style("opacity", 0.3);
      selectAll(`#${(d['key']+d['property']).replaceAll(/[^A-Z0-9]/ig, "")}`).transition().style("opacity", 1.0);
      })
      .on("mouseout", function () {
        selectAll(".heat-rect").transition().style("opacity", 1.0);
        select(this).attr("stroke-width", "0px");
        tooltip.style("visibility", "collapse");
        tooltip.transition().style("opacity", 0.0);
      })
      
      //Append x axis
      chart.append('g')
        .attr('transform','translate(0,' + height + ')')
        .call(axisBottom(xScale));
      
      //Append y axis
      chart.append('g')
        .call(axisLeft(yScale))
        .attr('class','yAxis');
      
      // Append y axis label
      chart.append('text')
      .attr('class', 'label')
      .attr('transform','translate(-100,' + (height / 2)  + ') rotate(-90)')
      .style('text-anchor','middle')
      .text('Categories');
      
      //Append x axis label
      chart.append('text')
      .attr('class', 'label')
      .attr('transform','translate(' + (width / 2) + ',' + (height+40) + ')')
      .style('text-anchor','middle')
      .text('Time Stamp');   
  });

  return(
    <div className='heatmap_container_svg'>
      <h4 className="heatmap-title">Self-reported Damage Patterns </h4>
      <div className="heatmap-legend"></div>
      <div className="duration-slider">
        <span className="header">Select Duration </span> 
        <Slider></Slider>
      </div>
      <svg className='heat_chart'></svg>
      <span className='heatmap-text'><b>Observe</b> the pattern in the damage intensities reported by St.Himark citizens. <b>Select larger durations</b> to see enduring patterns. <b>Hover</b> over each point and observe the volume of reports. White spaces indicate No Reports. High percent of white spaces indicates high data uncertainty.</span>
    </div>
  );
};

export default HeatMap;