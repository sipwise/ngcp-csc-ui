
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
    input: 'input',
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
        activeForm: '',
        formType: '',
        destinationsetId: '',
        groupName: '',
        form: {
            announcement_id: null,
            destination: '',
            priority: 1,
            timeout: ''
        }
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
        },
        getAddDestinationState(state) {
            return state.addDestinationState;
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
            let adjacentDestination = options.direction === 'up' ?
                options.destinations[options.index-1] :
                options.destinations[options.index+1];
            let adjacentPriority = adjacentDestination.priority || 1;
            let reorderedDestinations; // TODO: Update priority of moved destination, and then insert it at right index in destinations array
            context.commit('changeDestinationRequesting');
            return new Promise((resolve, reject) => {
                changePositionOfDestination({
                    destinations: reorderedDestinations,
                    id: options.id,
                    group: options.group,
                    subscriberId: context.getters.getSubscriberId
                }).then(() => {
                    context.commit('changeDestinationSucceeded');
                    context.dispatch('loadAlwaysEverybodyDestinations');
                }).catch((err) => {
                    context.commit('addDestinationFailed', err.message);
                });
            });
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
