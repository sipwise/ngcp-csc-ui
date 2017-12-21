
'use strict';

import _ from 'lodash';
import { getSourcesets, getDestinationsets, getTimesets,
    getMappings, loadAlwaysDestinations } from '../api/call-forward';

export default {
    namespaced: true,
    state: {
        sourceSets: [
            {
                id: 1,
                name: 'SourceSet1',
                online: [
                    {
                        id: 2,
                        name: 'dest2',
                        destinations: []
                    },
                    {
                        id: 1,
                        name: 'dest1',
                        destinations: []
                    }
                ],
                offline: [
                    {
                        id: 3,
                        name: 'dest3',
                        destinations: []
                    }
                ],
                busy: [
                    {
                        id: 1,
                        name: 'dest1',
                        destinations: []
                    }
                ],
            }
        ],
        mappings: null,
        sourcesets: null,
        timesets: null,
        destinationsets: null
    },
    mutations: {
        load(state, options) {
            state.sourceSets = options.sourceSets;
        },
        addDestination(state, options) {

        },
        loadMappings(state, result) {
            state.mappings = result;
        },
        loadSourcesets(state, result) {
            state.sourcesets = result;
        },
        loadTimesets(state, result) {
            state.timesets = result;
        },
        loadDestinationsets(state, result) {
            state.destinationsets = result;
        }
    },
    actions: {
        loadMappings(context) {
            return new Promise((resolve, reject) => {
                getMappings(localStorage.getItem('subscriberId'))
                    .then(result => {
                        context.commit('loadMappings', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        },
        loadSourcesets(context) {
            return new Promise((resolve, reject) => {
                getSourcesets(localStorage.getItem('subscriberId'))
                    .then(result => {
                        context.commit('loadSourcesets', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        },
        loadTimesets(context) {
            return new Promise((resolve, reject) => {
                getTimesets(localStorage.getItem('subscriberId'))
                    .then(result => {
                        context.commit('loadTimesets', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        },
        loadDestinationsets(context) {
            return new Promise((resolve, reject) => {
                getDestinationsets(localStorage.getItem('subscriberId'))
                    .then(result => {
                        context.commit('loadDestinationsets', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        },
        loadAlwaysDestinations() {
            return new Promise((resolve, reject)=>{
                loadAlwaysDestinations(localStorage.getItem('subscriberId')).then((result)=>{
                    console.log(result);
                })
            });
        }
    }
};
