
'use strict';

import _ from 'lodash';
import { getSourcesets, getDestinationsets, getTimesets,
    getMappings, loadAlwaysEverybodyDestinations,
    deleteDestinationFromDestinationset,
    deleteDestinationsetById } from '../api/call-forward';

export default {
    namespaced: true,
    state: {
        mappings: null,
        sourcesets: null,
        timesets: null,
        destinationsets: null,
        alwaysEverybodyDestinations: {
            online: [],
            busy: [],
            offline: []
        }
    },
    getters: {
        getDestinationsetId(state) {
        }
    },
    mutations: {
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
        },
        loadAlwaysEverybodyDestinations(state, result) {
            console.log(result);
            state.alwaysEverybodyDestinations = result;
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
                    }).catch((err) => {
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
        loadAlwaysEverybodyDestinations(context) {
            return new Promise((resolve, reject)=>{
                loadAlwaysEverybodyDestinations(localStorage.getItem('subscriberId')).then((result)=>{
                    context.commit('loadAlwaysEverybodyDestinations', result);
                })
            });
        },
        deleteDestinationFromDestinationset(context, options) {
            return new Promise((resolve, reject) => {
                deleteDestinationFromDestinationset(options)
                    .then((result) => {
                        resolve(result);
                    }).catch((err) => {
                        reject(err);
                    });
            });
        },
        deleteDestinationsetById(context, id) {
            return new Promise((resolve, reject) => {
                deleteDestinationsetById(id)
                    .then((result) => {
                        resolve(result);
                    }).catch((err) => {
                        reject(err);
                    });
            });
        }
    }
};
