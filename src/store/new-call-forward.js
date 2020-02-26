'use strict';
import Vue from 'vue'

// import _ from 'lodash';
// import { RequestState } from './common'
// import { i18n } from '../i18n';
// import {
//     getSourcesets,
//     getDestinationsets,
//     deleteDestinationFromDestinationset,
//     addDestinationToDestinationset,
//     addDestinationToEmptyGroup,
//     addDestinationToExistingGroup,
//     changePositionOfDestination,
//     moveDestinationUp,
//     moveDestinationDown,
//     loadTimesetTimes,
//     deleteTimeFromTimeset,
//     deleteTimesetById,
//     resetTimesetByName,
//     createTimesetWithTime,
//     appendTimeToTimeset,
//     loadDestinations,
//     createSourcesetWithSource,
//     appendSourceToSourceset,
//     deleteSourcesetById,
//     deleteSourceFromSourcesetByIndex,
//     flipCfuAndCft,
//     getOwnPhoneTimeout,
//     updateOwnPhoneTimeout
// } from '../api/call-forward';

export default {
    namespaced: true,
    state: {
        destinations: [{
            announcement_id: null,
            destination: "+4355555555",
            priority: 1,
            timeout: 10
        },{
            announcement_id: null,
            destination: "+43666666",
            priority: 1,
            timeout: 10
        }],
    },
    getters: {
        subscriberDisplayName(state, getters, rootState, rootGetters) {
            return rootGetters['user/getUsername'];
        },
        destinations(state) {
            return state.destinations;
        }
    },
    mutations: {
        addDestination(state, destination){
            const newDestination = {
                "announcement_id": null,
                "destination": destination,
                "priority": 1,
                "timeout": 10
            }
            state.destinations.push(newDestination);
        },
        editDestination(state, data){
            let destination = state.destinations.slice(data.index, data.index+1)[0];
            destination.destination =  data.destination;
            Vue.set(state.destinations, data.index, destination)
        },
        editTimeout(state, data){
            let destination = state.destinations.slice(data.index, data.index+1)[0];
            destination.timeout =  data.timeout;
            Vue.set(state.destinations, data.index, destination)
        }
    },
    actions: {}
};
