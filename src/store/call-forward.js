
'use strict';

import _ from 'lodash';
import { getSourcesets,
    getDestinationsets,
    getTimesets,
    getMappings,
    loadAlwaysDestinations,
    deleteDestinationFromDestinationset,
    addDestinationToDestinationset,
    addDestinationToEmptyGroup,
    addDestinationToExistingGroup } from '../api/call-forward';

const AddDestinationState = {
    button: 'button',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

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
        lastRemovedDestination: null,
        addDestinationState: AddDestinationState.button,
        addDestinationError: null,
        activeForm: '',
        formType: '',
        destinationsetId: '',
        groupName: '',
        form: {
            announcement_id: null,
            destination: '',
            priority: 1,
            timeout: ''
        },
        lastAddedDestination: null
    },
    getters: {
        hasFaxCapability(state, getters, rootState, rootGetters) {
            return rootGetters['user/hasFaxCapability'];
        },
        getSubscriberId(state, getters, rootState, rootGetters) {
            return rootGetters['user/getSubscriberId'];
        },
        getForm(state) {
            return state.form;
        },
        getFormType(state) {
            return state.formType;
        },
        getGroupName(state) {
            return state.groupName;
        },
        getDestinationsetId(state) {
            return state.destinationsetId;
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
            state.alwaysEverybodyDestinations = result;
        },
        loadAlwaysCompanyHoursDestinations(state, result) {
            state.alwaysCompanyHoursDestinations = result;
        },
        setActiveForm(state, value) {
            state.activeForm = value;
        },
        setFormType(state, value) {
            state.formType = value;
        },
        setDestinationsetId(state, value) {
            state.destinationsetId = value;
        },
        setGroupName(state, value) {
            state.groupName = value;
        },
        setPriority(state, value) {
            state.form.priority = value;
        },
        setLastAddedDestination(state, value) {
            state.lastAddedDestination = value;
        },
        resetFormState(state) {
            state.form = {
                announcement_id: null,
                destination: '',
                priority: 1,
                timeout: ''
            }
        },
        resetDestinationState(state) {
            state.activeForm = '';
            state.formType = '';
            state.destinationsetId = '';
            state.groupName = '';
            state.addDestinationState = AddDestinationState.button;
        },
        addDestinationRequesting(state) {
            state.addDestinationState = AddDestinationState.requesting;
            state.addDestinationError = null;
        },
        addDestinationSucceeded(state) {
            state.addDestinationState = AddDestinationState.succeeded;
            state.addDestinationError = null;
        },
        addDestinationFailed(state, error) {
            state.addDestinationState = AddDestinationState.failed;
            state.addDestinationError = error;
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
        addDestinationToDestinationset(context, options) {
            return new Promise((resolve, reject) => {
                addDestinationToDestinationset(options)
                    .then((result) => {
                        resolve(result);
                    }).catch((err) => {
                        reject(err);
                    });
            });
        },
        addDestination(context, options) {
            let form = _.clone(context.getters.getForm);
            let updatedOptions;
            let type = context.getters.getFormType;
            context.commit('addDestinationRequesting');
            if (type !== 'number') {
                delete form.timeout;
                form.destination = type;
            } else {
                form.timeout = options.form.timeout;
                form.destination = options.form.destination;
            };
            updatedOptions = {
                subscriberId: context.getters.getSubscriberId,
                data: form,
                groupName: context.getters.getGroupName,
                id: context.getters.getDestinationsetId,
                timeset: options.timeset
            };
            if (options.destinations) {
                return new Promise((resolve, reject) => {
                    addDestinationToExistingGroup(updatedOptions).then(() => {
                        context.commit('setLastAddedDestination', options.form.destination);
                        context.commit('addDestinationSucceeded');
                        context.dispatch('loadAlwaysEverybodyDestinations');
                    }).catch((err) => {
                        context.commit('addDestinationFailed', err.message);
                    });
                });
            } else {
                return new Promise((resolve, reject) => {
                    addDestinationToEmptyGroup(updatedOptions).then((result) => {
                        context.commit('addDestinationSucceeded');
                        context.dispatch('loadAlwaysEverybodyDestinations');
                    }).catch((err) => {
                        context.commit('addDestinationFailed', err.message);
                    });
                });
            }
        },
        setActiveForm(context, value) {
            context.commit('setActiveForm', value);
        },
        setFormType(context, value) {
            context.commit('setFormType', value);
        },
        setDestinationsetId(context, value) {
            context.commit('setDestinationsetId', value);
        },
        setGroupName(context, value) {
            context.commit('setGroupName', value);
        },
        setPriority(context, value) {
            context.commit('setPriority', value);
        },
        resetFormState(context) {
            context.commit('resetFormState');
        },
        resetDestinationState(context) {
            context.commit('resetDestinationState');
        }
    }
};
