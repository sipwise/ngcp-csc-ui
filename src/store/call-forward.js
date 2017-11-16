
'use strict';

import _ from 'lodash';
import { getSourcesetsCount, getDestinationsetsCount,
    getTimesetsCount, getSourcesets, getDestinationsets, getTimesets,
    getMappings } from '../api/call-forward';

export default {
    namespaced: true,
    state: {
        sourcesetsCount: 1
    },
    mutations: {
        loadSourcesetsCount(state, count) {
            state.sourcesetsCount = count;
        }
    },
    actions: {
        loadMappings() {
            return new Promise((resolve, reject) => {
                getMappings(localStorage.getItem('subscriberId'))
                    .then(result => {
                        delete result._links;
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        },
        loadSourcesetsCount() {
            return new Promise((resolve, reject) => {
                getSourcesetsCount(localStorage.getItem('subscriberId'))
                    .then(result => {
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        },
        loadTimesetsCount() {
            return new Promise((resolve, reject) => {
                getTimesetsCount(localStorage.getItem('subscriberId'))
                    .then(result => {
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        },
        loadDestinationsetsCount() {
            return new Promise((resolve, reject) => {
                getDestinationsetsCount(localStorage.getItem('subscriberId'))
                    .then(result => {
                        resolve(result);
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        }
    }
};
