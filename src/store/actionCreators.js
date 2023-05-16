import { SET_CURRENT_CHOROPLETH_ATTRIBUTE, SET_END_DATE, SET_HEATMAP_DURATION, SET_SELECTED_REGIONS, SET_START_DATE } from './actions';

export const setCurrentChoroplethAttribute = (att) => {
    return {
        type: SET_CURRENT_CHOROPLETH_ATTRIBUTE,
        payload: att
    }
}

export const setSelectedRegions = (regions) => {
    return {
        type: SET_SELECTED_REGIONS,
        payload: regions
    }
}

export const setHeatmapDuration = (duration) => {
    return {
        type: SET_HEATMAP_DURATION,
        payload: duration
    }
}

export const setStartDate = (date) => {
    return {
        type: SET_START_DATE,
        payload: date
    }
}

export const setEndDate = (date) => {
    return {
        type: SET_END_DATE,
        payload: date
    }
}