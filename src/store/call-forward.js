
'use strict'; import _ from 'lodash'; import { getSourcesets, getDestinationsets, getTimesets, getMappings,
    loadEverybodyDestinations,
    deleteDestinationFromDestinationset,
    addDestinationToDestinationset,
    addDestinationToEmptyGroup,
    addDestinationToExistingGroup,
    changePositionOfDestination,
    moveDestinationUp,
    moveDestinationDown,
    loadTimesetTimes } from '../api/call-forward';

const DestinationState = {
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
        destinations: {
            online: [],
            busy: [],
            offline: []
        },
        removeDestinationState: DestinationState.button,
        removeDestinationError: null,
        lastRemovedDestination: null,
        addDestinationState: DestinationState.button,
        addDestinationError: null,
        lastAddedDestination: null,
        changeDestinationState: DestinationState.button,
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
        timesetTimes: [],
        timesetCompatible: true,
        hasTimeset: true
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
        getTimesetId(state) {
            let timeset;
            for (let group in state.destinations) {
                if (!timeset) {
                    timeset = _.find(state.destinations[group], (o) => {
                        return o.timesetId > 0;
                    });
                };
            };
            return timeset ? timeset.timesetId : null;
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
        loadDestinations(state, result) {
            state.destinations = result;
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
        setLastRemovedDestination(state, value) {
            state.lastRemovedDestination = value;
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
            state.addDestinationState = DestinationState.button;
            state.changeDestinationState = DestinationState.button;
            state.removeDestinationState = DestinationState.button;
        },
        addDestinationRequesting(state) {
            state.addDestinationState = DestinationState.requesting;
            state.addDestinationError = null;
        },
        addDestinationSucceeded(state) {
            state.addDestinationState = DestinationState.succeeded;
            state.addDestinationError = null;
        },
        addDestinationFailed(state, error) {
            state.addDestinationState = DestinationState.failed;
            state.addDestinationError = error;
        },
        changeDestinationRequesting(state) {
            state.changeDestinationState = DestinationState.requesting;
            state.changeDestinationError = null;
        },
        changeDestinationSucceeded(state) {
            state.changeDestinationState = DestinationState.succeeded;
            state.changeDestinationError = null;
        },
        changeDestinationFailed(state, error) {
            state.changeDestinationState = DestinationState.failed;
            state.changeDestinationError = error;
        },
        removeDestinationRequesting(state) {
            state.removeDestinationState = DestinationState.requesting;
            state.removeDestinationError = null;
        },
        removeDestinationSucceeded(state) {
            state.removeDestinationState = DestinationState.succeeded;
            state.removeDestinationError = null;
        },
        removeDestinationFailed(state, error) {
            state.removeDestinationState = DestinationState.failed;
            state.removeDestinationError = error;
        },
        loadTimesetTimes(state, result) {
            state.timesetTimes = result;
        },
        setTimesetCompatible(state, value) {
            state.timesetCompatible = value;
        },
        setHasTimeset(state, value) {
            state.hasTimeset = value;
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
                loadEverybodyDestinations({
                    subscriberId: localStorage.getItem('subscriberId'),
                    timeset: null
                    }).then((result)=>{
                        context.commit('loadDestinations', result);
                    });
            });
        },
        loadCompanyHoursEverybodyDestinations(context) {
            return new Promise((resolve, reject)=>{
                loadEverybodyDestinations({
                    subscriberId: localStorage.getItem('subscriberId'),
                    timeset: 'Company Hours'
                    }).then((result)=>{
                        context.commit('loadDestinations', result);
                    });
            });
        },
        loadAfterHoursEverybodyDestinations(context) {
            return new Promise((resolve, reject)=>{
                loadEverybodyDestinations({
                    subscriberId: localStorage.getItem('subscriberId'),
                    timeset: 'After Hours'
                    }).then((result)=>{
                        context.commit('loadDestinations', result);
                    });
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
            let timeset = null;
            if (options.timeset === 'Company Hours' ||
                options.timeset === 'After Hours') {
                timeset = context.getters.getTimesetId;
            };
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
                timesetId: timeset
            };
            if (options.destinations) {
                return new Promise((resolve, reject) => {
                    addDestinationToExistingGroup(updatedOptions).then(() => {
                        context.commit('setLastAddedDestination', options.form.destination);
                        context.commit('addDestinationSucceeded');
                    }).catch((err) => {
                        context.commit('addDestinationFailed', err.message);
                    });
                });
            } else {
                return new Promise((resolve, reject) => {
                    addDestinationToEmptyGroup(updatedOptions).then((result) => {
                        context.commit('setLastAddedDestination', options.form.destination);
                        context.commit('addDestinationSucceeded');
                    }).catch((err) => {
                        context.commit('addDestinationFailed', err.message);
                    });
                });
            }
        },
        changePositionOfDestination(context, options) {
            let clonedDestinations = _.cloneDeep(options.destinations);
            let clonedDestination = _.clone(options.destinations[options.index]);
            let lastIndex = clonedDestinations.length < 1 ?
                0 : clonedDestinations.length - 1;
            context.commit('changeDestinationRequesting');
            if (options.direction === 'up' && options.prevId && options.index === 0) {
                return new Promise((resolve, reject) => {
                    moveDestinationUp({
                        prevId: options.prevId,
                        id: options.id,
                        destination: clonedDestination
                    }).then(() => {
                        context.commit('changeDestinationSucceeded');
                    }).catch((err) => {
                        context.commit('changeDestinationFailed', err.message);
                    });
                });
            } else if (options.direction === 'down' && options.nextId && options.index === lastIndex) {
                return new Promise((resolve, reject) => {
                    moveDestinationDown({
                        nextId: options.nextId,
                        id: options.id,
                        destination: clonedDestination
                    }).then(() => {
                        context.commit('changeDestinationSucceeded');
                    }).catch((err) => {
                        context.commit('changeDestinationFailed', err.message);
                    });
                });
            } else {
                let adjacentDestination = options.direction === 'up' ?
                    options.destinations[options.index-1] :
                    options.destinations[options.index+1];
                let adjacentPriority = adjacentDestination ?
                    adjacentDestination.priority : 1;
                let adjacentIndex = options.direction === 'up' ?
                options.index - 1 :
                options.index + 1;
                clonedDestinations.splice(options.index, 1);
                clonedDestinations.splice(adjacentIndex, 0, clonedDestination);
                clonedDestinations[adjacentIndex].priority = adjacentPriority;
                return new Promise((resolve, reject) => {
                    changePositionOfDestination({
                        destinations: clonedDestinations,
                        id: options.id,
                        subscriberId: context.getters.getSubscriberId
                    }).then(() => {
                        context.commit('changeDestinationSucceeded');
                    }).catch((err) => {
                        context.commit('changeDestinationFailed', err.message);
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
        },
        loadTimesetTimes(context, options) {
            loadTimesetTimes({
                timeset: options.timeset,
                subscriberId: context.getters.getSubscriberId
            }).then((result) => {
                context.commit('loadTimesetTimes', result.times);
                context.commit('setTimesetCompatible', result.isCompatible);
                context.commit('setHasTimeset', result.hasTimeset);
            });
        }
    }
};
