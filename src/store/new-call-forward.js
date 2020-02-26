'use strict';

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
            state.destinations.push(destination);
        }
    },
    actions: {}
};
