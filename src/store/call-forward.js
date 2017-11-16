
'use strict';

import _ from 'lodash';
import { getSourcesetsCount, getDestinationsetsCount,
    getTimesetsCount, getSourcesets, getDestinationsets, getTimesets,
    getMappings } from '../api/call-forward';

export default {
    namespaced: true,
    state: {
        countSourcesets: 10,
        countTimesets: 10,
        countDestinationsets: 10,
        sourcesets: null,
        timesets: null,
        destinationsets: null,
        mappings: null
    },
    mutations: {
        loadMappings(state, result) {
            state.mappings = result;
        },
        loadSourcesetsCount(state, result) {
            state.countSourcesets = result;
        },
        loadTimesetsCount(state, result) {
            state.countTimesets = result;
        },
        loadDestinationsetsCount(state, result) {
            state.countDestinationsets = result;
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
                        delete result._links;
                        delete result.cfs;
                        context.commit('loadMappings', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        },
        loadSourcesetsCount(context) {
            return new Promise((resolve, reject) => {
                getSourcesetsCount(localStorage.getItem('subscriberId'))
                    .then(result => {
                        context.commit('loadSourcesetsCount', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        },
        loadTimesetsCount(context) {
            return new Promise((resolve, reject) => {
                getTimesetsCount(localStorage.getItem('subscriberId'))
                    .then(result => {
                        context.commit('loadTimesetsCount', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        },
        loadDestinationsetsCount(context) {
            return new Promise((resolve, reject) => {
                getDestinationsetsCount(localStorage.getItem('subscriberId'))
                    .then(result => {
                        context.commit('loadDestinationsetsCount', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        },
        loadSourcesets(context) {
            return new Promise((resolve, reject) => {
                getSourcesets(localStorage.getItem('subscriberId'), this.state.countSourcesets)
                    .then(result => {
                        context.commit('loadSourcesets', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        },
        loadTimesets(context) {
            return new Promise((resolve, reject) => {
                getTimesets(localStorage.getItem('subscriberId'), this.state.countTimesets)
                    .then(result => {
                        context.commit('loadTimesets', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        },
        loadDestinationsets(context) {
            return new Promise((resolve, reject) => {
                getDestinationsets(localStorage.getItem('subscriberId'), this.state.countDestinationsets)
                    .then(result => {
                        context.commit('loadDestinationsets', result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        }
    }
};
