// import { group, mean, bin } from 'd3';
import * as d3 from "d3";
import { values } from "d3-collection";

export const groupDataByLocation = (data = []) => {
    const nestedData = d3.group(data, (d) => d.location);
    return nestedData;
};

export const findAverageValueForLocation = (data) => {
    const modifiedData = removeDateFromObject(data);
    const firstIteration = modifiedData.map((d) => {
      const value = values(d);
      const mean = d3.mean(value);
      return mean;
    })
    const finalMean = d3.mean(firstIteration);
    return finalMean;
}

export const getMeanForAttribute = (data = [], attribute) => {
    if (data.length > 0 && !!attribute) {
        if(attribute === 'average') {
            return findAverageValueForLocation(data)
        }
        const avgValue = d3.mean(data, (d) => {
            return d[attribute];
        });
        return avgValue;
    }
};

export const filterDataByDateTime = (data, start_datetime, end_datetime) => {
    const st_dt = new Date(start_datetime);
    const end_dt = new Date(end_datetime);
    return data.filter((d) => {
        return d.time >= st_dt && d.time <= end_dt;
    });
};

export const getMeanforTimeInterval = (data, locations=[], start_datetime, end_datetime) => {
    // Calculate the average value of each attribute for each minute    
    // Round the minutes down to the nearest minute


    const roundDownMinute = function (date) {
        return new Date(Math.floor(date.getTime() / 60000) * 60000);
    };

    var locationFilter = []
    if (locations.length==0)
        locationFilter = data
    else
        locationFilter = data.filter((d)=> locations.includes(d.location))

    const timeFilter = filterDataByDateTime(locationFilter,start_datetime,end_datetime)

    // Group the objects by minute
    const groupedData = d3.group(timeFilter, function (d) {
        return roundDownMinute(d.time);
    });

    const averageData = [];

    groupedData.forEach(function (value, key) {
        const sum = {
            sewer_and_water: 0,
            power: 0,
            roads_and_bridges: 0,
            medical: 0,
            buildings: 0,
            shake_intensity: 0,
        };
        const count = { total: 0 };
        value.forEach(function (d) {
            // console.log(d.location);
            if(locations.length==0 ||  locations.includes(d.location)){
                for (const key in sum) {
                    if (d[key] != null) {
                        sum[key] += d[key];
                        count[key] = (count[key] || 0) + 1;
                    }
                }
                count.total++;
            }
            
        });
        const average = { time: key, count: count.total };
        for (const key in sum) {
            average[key] = sum[key] / count[key];
        }
        averageData.push(average);
    });

    return averageData;
};

export const getQuantileData = (data,attribute) => { 
    const q1 = d3.quantile(data.map(function(g) { return g[attribute];}).sort(d3.ascending),.25);
    const median = d3.quantile(data.map(function(g) { return g[attribute];}).sort(d3.ascending),.5)
    const q3 = d3.quantile(data.map(function(g) { return g[attribute];}).sort(d3.ascending),.75)
    const interQuantileRange = q3 - q1
    const min = d3.min(data.map(function(g) { return g[attribute];}))
    const max = d3.max(data.map(function(g) { return g[attribute];}))

   return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
}

export const removeDateFromObject = (data) => {
    const modifiedData = data.map((d) => {
        return {
            buildings: d.buildings,
            location: d.location,
            medical: d.medical,
            power: d.power,
            roads_and_bridges: d.roads_and_bridges,
            sewer_and_water: d.sewer_and_water,
            shake_intensity: d.shake_intensity,
        }
    })
    return modifiedData;
}