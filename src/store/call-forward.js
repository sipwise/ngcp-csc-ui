
'use strict';

import _ from 'lodash';
import { getSourcesets,
    getDestinationsets,
    getTimesets,
    getMappings,
    loadAlwaysEverybodyDestinations,
    deleteDestinationFromDestinationset,
    addDestinationToDestinationset,
    addDestinationToEmptyGroup,
    addDestinationToExistingGroup,
    changePositionOfDestination } from '../api/call-forward';

const AddDestinationState = {
    button: 'button',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

const ChangeDestinationState = {
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
            online: [{}],
            busy: [{}],
            offline: [{}]
        },
        addDestinationState: AddDestinationState.button,
        addDestinationError: null,
        changeDestinationState: ChangeDestinationState.button,
        changeDestinationError: null,
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
        changeDestinationRequesting(state) {
            state.changeDestinationState = ChangeDestinationState.requesting;
            state.changeDestinationError = null;
        },
        changeDestinationSucceeded(state) {
            state.changeDestinationState = ChangeDestinationState.succeeded;
            state.changeDestinationError = null;
        },
        changeDestinationFailed(state, error) {
            state.changeDestinationState = ChangeDestinationState.failed;
            state.changeDestinationError = error;
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
                    console.log('destinations store', result);
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
                id: context.getters.getDestinationsetId
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
        changePositionOfDestination(context, options) {
            let clonedDestinations = _.cloneDeep(options.destinations);
            let clonedDestination = _.clone(options.destinations[options.index]);
            let adjacentDestination = options.direction === 'up' ?
                options.destinations[options.index-1] :
                options.destinations[options.index+1];
            let adjacentPriority = adjacentDestination.priority || 1;
            let adjacentIndex = options.direction === 'up' ?
                options.index - 1 :
                options.index + 1;
            // TODO: If we have Inter-DestinationSet movement of Destinations,
            // we need to update priority and both DestinationSets
            clonedDestinations.splice(options.index, 1);
            clonedDestinations.splice(adjacentIndex, 0, clonedDestination);
            clonedDestinations[adjacentIndex].priority = adjacentPriority;
            context.commit('changeDestinationRequesting');
            return new Promise((resolve, reject) => {
                changePositionOfDestination({
                    destinations: clonedDestinations,
                    id: options.id,
                    subscriberId: context.getters.getSubscriberId
                }).then(() => {
                    context.commit('changeDestinationSucceeded');
                    context.dispatch('loadAlwaysEverybodyDestinations');
                }).catch((err) => {
                    context.commit('changeDestinationFailed', err.message);
                });
            });
        },
        moveDestination(destinations, fromIndex, toIndex) {
            let destination = destinations[fromIndex];
            destinations.splice(fromIndex, 1);
            destinations.splice(toIndex, 0, destination);
            return destinations;
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
