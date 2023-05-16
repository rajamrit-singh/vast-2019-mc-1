import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { SET_CURRENT_CHOROPLETH_ATTRIBUTE, SET_END_DATE, SET_HEATMAP_DURATION, SET_SELECTED_REGIONS, SET_START_DATE } from './actions';

const defaultState = {
    countries: [],
    current_choropleth_attribute: 'average',
    start_datetime: '4/5/2020  1:40:00 PM',
    end_datetime: '4/13/2020  3:15:00 PM',
    selectedRegions: [],
    heatmapDuration:15
}

const reducerFunction = (state = defaultState, action) => {
    switch (action.type) {
        case SET_CURRENT_CHOROPLETH_ATTRIBUTE:
            return {
                ...state,
                current_choropleth_attribute: action.payload
            }
        case SET_SELECTED_REGIONS:
            return {
                ...state,
                selectedRegions: action.payload
            }
        case SET_HEATMAP_DURATION:
            return {
                ...state,
                heatmapDuration: action.payload
            }
        case SET_START_DATE:
            return {
                ...state,
                start_datetime: action.payload
            }
        case SET_END_DATE:
            return {
                ...state,
                end_datetime: action.payload
            }
        default:
            return state;
    }
}
const rootReducer = combineReducers({
    entities: reducerFunction
});

export const store = configureStore({
    reducer: rootReducer
});
