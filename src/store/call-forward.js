
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
        mytest: 'this is another test here'
    },
    mutations: {
        loadSourcesetsCount(state, count) {
            state.countSourcesets = count;
        },
        loadTimesetsCount(state, count) {
            state.countTimesets = count;
        },
        loadDestinationsetsCount(state, count) {
            state.countDestinationsets = count;
        }
    },
    actions: {
        loadMappings() {
            return new Promise((resolve, reject) => {
                getMappings(localStorage.getItem('subscriberId'))
                    .then(result => {
                        delete result._links;
                        resolve(result);
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
        loadSourcesets() {
            return new Promise((resolve, reject) => {
                getSourcesets(localStorage.getItem('subscriberId'))
                    .then(result => {
                        resolve(result);
                    }).catch(err => {
                        reject(err);
                    });
            });
        }
    }
};
