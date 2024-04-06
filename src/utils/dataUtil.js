import * as d3 from 'd3';
import challengeData from '../data/sorted_file.csv';

export async function getData() {
    return await d3.csv(challengeData).then(data=>{
        return data.map(d=>{
            d.medical= d.medical===""?null:+d.medical
            d.location= d.location===""?null:+d.location
            d.power= d.power===""?null:+d.power
            d.roads_and_bridges= d.roads_and_bridges===""?null:+d.roads_and_bridges
            d.sewer_and_water= d.sewer_and_water===""?null:+d.sewer_and_water
            d.shake_intensity= d.shake_intensity===""?null:+d.shake_intensity
            d.buildings= d.buildings===""?null:+d.buildings
            d.time = new Date(d.time)
            d.average_row = d.average
            return d;
        })
    }).then(data => {
        data.sort((a, b) => a.time.getTime() - b.time.getTime());
        return data;
    });
}
