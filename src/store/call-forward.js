
'use strict';

import _ from 'lodash';
import { getSourcesets, getDestinationsets, getTimesets,
    getMappings, loadAlwaysDestinations,
    deleteDestinationFromDestinationset,
    deleteDestinationsetById } from '../api/call-forward';

const RemoveDestinationState = {
    button: 'button',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

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
        },
        alwaysCompanyHoursDestinations: {
            online: [],
            busy: [],
            offline: []
        },
        removeDestinationState: RemoveDestinationState.button,
        removeDestinationError: null,
        lastRemovedDestination: null
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
            state.alwaysEverybodyDestinations = result;
        },
        loadAlwaysCompanyHoursDestinations(state, result) {
            state.alwaysCompanyHoursDestinations = result;
        },
        removeDestinationRequesting(state) {
            state.removeDestinationState = RemoveDestinationState.requesting;
            state.removeDestinationError = null;
        },
        removeDestinationSucceeded(state) {
            state.removeDestinationState = RemoveDestinationState.succeeded;
            state.removeDestinationError = null;
        },
        removeDestinationFailed(state, error) {
            state.removeDestinationState = RemoveDestinationState.failed;
            state.removeDestinationError = error;
        },
        setLastRemovedDestination(state, value) {
            state.lastRemovedDestination = value;
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
                loadAlwaysDestinations({
                    subscriberId: localStorage.getItem('subscriberId'),
                    timeset: null
                        }).then((result)=>{
                    context.commit('loadAlwaysEverybodyDestinations', result);
                })
            });
        },
        loadAlwaysCompanyHoursDestinations(context) {
            return new Promise((resolve, reject)=>{
                loadAlwaysDestinations({
                    subscriberId: localStorage.getItem('subscriberId'),
                    timeset: 'Company Hours'
                        }).then((result)=>{
                    context.commit('loadAlwaysCompanyHoursDestinations', result);
                })
            });
        },
        deleteDestinationFromDestinationset(context, options) {
            let removedDestination = options.removeDestination;
            context.commit('removeDestinationRequesting');
            return new Promise((resolve, reject) => {
                deleteDestinationFromDestinationset(options)
                    .then(() => {
                        context.commit('setLastRemovedDestination', removedDestination);
                        context.commit('removeDestinationSucceeded');
                    }).catch((err) => {
                        context.commit('removeDestinationFailed', err.message);
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
