import React from 'react';
import { geoMercator, geoPath, scaleSequential, interpolateYlOrRd } from 'd3';
import { geoJson } from '../../map-data/StHimark_geo';
import './ChoroplethMap.css';
import { AttributeDropdown } from '../attribute-dropdown/AttributeDropdown';
import { useDispatch, useSelector } from 'react-redux';
import { filterDataByDateTime, getMeanForAttribute, groupDataByLocation } from '../../utils/dataProcessUtil';
import { ColorLegend } from './ColorLegend';
import { setSelectedRegions } from '../../store/actionCreators';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const ChoroplethMap = ({ data }) => {
    const dispatch = useDispatch();
    const start_datetime = useSelector(state => state.entities.start_datetime);
    const end_datetime = useSelector(state => state.entities.end_datetime);
    const dataByDateTime = filterDataByDateTime(data, start_datetime, end_datetime);
    const dataByLocation = groupDataByLocation(dataByDateTime);
    const selectedAttribute = useSelector(state => state.entities.current_choropleth_attribute);
    const projection = geoMercator().fitSize([700, 750], geoJson);
    const pathGenerator = geoPath().projection(projection);
    const colorScale = scaleSequential(interpolateYlOrRd)
        .domain([0, 10]);
    const selectedRegions = useSelector(state => state.entities.selectedRegions)

    const handleMapClick = (feature) => {
        var currentRegionsSelected = selectedRegions
        if (currentRegionsSelected.indexOf(feature.properties.Id) !== -1) {
            currentRegionsSelected = currentRegionsSelected.filter((d) => {
                return d !== feature.properties.Id;
            })
            dispatch(setSelectedRegions(currentRegionsSelected));
        } else {
            dispatch(setSelectedRegions([...currentRegionsSelected, feature.properties.Id]));
        }
    }

    const tooltipMessage = (feature, avgValue) => {
        let textToDisplay;
        if(selectedAttribute === null) {
            return
        }
        if(avgValue === undefined) {
            textToDisplay = 'No Data'
        } else {
            textToDisplay = <div><strong>Average Magnitude:</strong> {avgValue.toFixed(2)}</div>
        }
        return (
            <div>
            <div><strong>Neighbourhood:</strong> {feature.properties.Nbrhood}</div>
            {textToDisplay}
        </div>
        )
    }
    const missingDataColor = 'grey';
    return (
        <div className="choropleth-container-div">
            <h4>Mapping Damage Reports</h4>
            <AttributeDropdown></AttributeDropdown>
            <svg className="choropleth-container-svg" width={600} height={430}>
                <g>
                    {geoJson.features.map((feature) => {
                        const avgValue = getMeanForAttribute(dataByLocation.get(feature?.properties?.Id), selectedAttribute)
                        const isSelected = selectedRegions.indexOf(feature.properties.Id);
                        return (
                            <OverlayTrigger
                              key={feature.properties.Id}
                              placement="top"
                              overlay={<Tooltip id={`tooltip-${feature.properties.Id}`}>{tooltipMessage(feature, avgValue)}</Tooltip>}
                            >
                              <path
                                stroke="black"
                                fill={avgValue ? colorScale(avgValue) : missingDataColor}
                                onClick={() => handleMapClick(feature)}
                                className={isSelected !== -1 ? "selected-region" : ""}
                                d={pathGenerator(feature)}
                                style={{ transform: "scale(0.6)" }}
                              />
                            </OverlayTrigger>
                          );
                          
                    })}
                </g>
                <ColorLegend />
            </svg>
            <div className="map-info-text">
            <p>The choropleth map shows the average magnitude for various attributes. Please select the attribute to see the changes and the areas on the map to see stats related to that area in other graphs</p>
        </div>
        </div>
    );
};

export default ChoroplethMap;
