
'use strict';

import _ from 'lodash';
import { i18n } from '../i18n';
import {
    getSourcesets,
    getDestinationsets,
    getTimesets,
    getMappings,
    deleteDestinationFromDestinationset,
    addDestinationToDestinationset,
    addDestinationToEmptyGroup,
    addDestinationToExistingGroup,
    changePositionOfDestination,
    moveDestinationUp,
    moveDestinationDown,
    loadTimesetTimes,
    deleteTimeFromTimeset,
    deleteTimesetById,
    resetTimesetByName,
    createTimesetWithTime,
    appendTimeToTimeset,
    loadDestinations,
    createSourcesetWithSource
} from '../api/call-forward';

const RequestState = {
    button: 'button',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

export default {
    namespaced: true,
    state: {
        mappings: null,
        sourcesets: [],
        sourceset: [],
        timesets: null,
        destinationsets: null,
        destinations: [],
        loadDestinationState: RequestState.button,
        loadDestinationError: null,
        removeDestinationState: RequestState.button,
        removeDestinationError: null,
        lastRemovedDestination: null,
        addDestinationState: RequestState.button,
        addDestinationError: null,
        lastAddedDestination: null,
        changeDestinationState: RequestState.button,
        changeDestinationError: null,
        removeTimeState: RequestState.button,
        removeTimeError: null,
        resetTimeState: RequestState.button,
        resetTimeError: null,
        addTimeState: RequestState.button,
        addTimeError: null,
        addSourcesetState: RequestState.button,
        addSourcesetError: null,
        lastAddedSourceset: null,
        lastRemovedDay: null,
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
        timesetIsCompatible: true,
        timesetExists: true,
        timesetHasReverse: false,
        timesetHasDuplicate: false,
        timesetId: null,
        activeTimeForm: false
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
            return state.timesetId;
        },
        getTimesetTimes(state) {
            return state.timesetTimes;
        },
        getTimesetTimesLength(state) {
            return state.timesetTimes.length;
        },
        addTimeError(state) {
            return state.addTimeError ||
                i18n.t('pages.callForward.times.addTimeErrorMessage');
        },
        resetTimeError(state) {
            return state.resetTimeError ||
                i18n.t('pages.callForward.times.resetErrorMessage');
        },
        showDefinedAlert(state) {
            return !state.timesetExists && !state.activeTimeForm && state.addTimeState !== 'succeeded';
        },
        destinationsLoaded(state) {
            return state.destinations.length > 0;
        },
        showTimesAndDestinations(state) {
            return state.timesetIsCompatible &&
                !state.timesetHasReverse &&
                !state.timesetHasDuplicate &&
                state.timesetExists;
        },
        loadDestinationError(state) {
            return state.loadDestinationError ||
                i18n.t('pages.callForward.times.loadDestinationErrorMessage');
        },
        addSourcesetError(state) {
            return state.addSourcesetError ||
                i18n.t('pages.callForward.sources.addSourcesetErrorMessage');
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
            state.addDestinationState = RequestState.button;
            state.changeDestinationState = RequestState.button;
            state.removeDestinationState = RequestState.button;
        },
        addDestinationRequesting(state) {
            state.addDestinationState = RequestState.requesting;
            state.addDestinationError = null;
        },
        addDestinationSucceeded(state) {
            state.addDestinationState = RequestState.succeeded;
            state.addDestinationError = null;
        },
        addDestinationFailed(state, error) {
            state.addDestinationState = RequestState.failed;
            state.addDestinationError = error;
        },
        changeDestinationRequesting(state) {
            state.changeDestinationState = RequestState.requesting;
            state.changeDestinationError = null;
        },
        changeDestinationSucceeded(state) {
            state.changeDestinationState = RequestState.succeeded;
            state.changeDestinationError = null;
        },
        changeDestinationFailed(state, error) {
            state.changeDestinationState = RequestState.failed;
            state.changeDestinationError = error;
        },
        removeDestinationRequesting(state) {
            state.removeDestinationState = RequestState.requesting;
            state.removeDestinationError = null;
        },
        removeDestinationSucceeded(state) {
            state.removeDestinationState = RequestState.succeeded;
            state.removeDestinationError = null;
        },
        removeDestinationFailed(state, error) {
            state.removeDestinationState = RequestState.failed;
            state.removeDestinationError = error;
        },
        removeTimeRequesting(state) {
            state.removeTimeState = RequestState.requesting;
            state.removeTimeError = null;
        },
        removeTimeSucceeded(state) {
            state.removeTimeState = RequestState.succeeded;
            state.removeTimeError = null;
        },
        removeTimeFailed(state, error) {
            state.removeTimeState = RequestState.failed;
            state.removeTimeError = error;
        },
        setLastRemovedDay(state, value) {
            state.lastRemovedDay = value;
        },
        loadTimesSucceeded(state, result) {
            state.timesetTimes = result.times;
            state.timesetIsCompatible = result.timesetIsCompatible;
            state.timesetExists = result.timesetExists;
            state.timesetHasReverse = result.timesetHasReverse;
            state.timesetHasDuplicate = result.timesetHasDuplicate;
            state.timesetId = result.timesetId;
        },
        resetTimeRequesting(state) {
            state.resetTimeState = RequestState.requesting;
            state.resetTimeError = null;
        },
        resetTimeSucceeded(state) {
            state.resetTimeState = RequestState.succeeded;
            state.resetTimeError = null;
        },
        resetTimeFailed(state, error) {
            state.resetTimeState = RequestState.failed;
            state.resetTimeError = error;
        },
        addTimeRequesting(state) {
            state.addTimeState = RequestState.requesting;
            state.addTimeError = null;
        },
        addTimeSucceeded(state) {
            state.addTimeState = RequestState.succeeded;
            state.addTimeError = null;
        },
        addTimeFailed(state, error) {
            state.addTimeState = RequestState.failed;
            state.addTimeError = error;
        },
        setActiveTimeForm(state, value) {
            state.activeTimeForm = value;
        },
        resetAddTimeState(state) {
            state.addTimeState = RequestState.button;
        },
        resetTimesetState(state) {
            state.timesetIsCompatible = true;
            state.timesetExists = true;
            state.timesetHasReverse = false;
            state.timesetHasDuplicate = false;
            state.activeTimeForm = false;
            state.addTimeState = RequestState.button;
        },
        setSourceset(state, result) {
            state.sourceset = result;
        },
        loadDestinationRequesting(state) {
            state.loadDestinationState = RequestState.requesting;
            state.loadDestinationError = null;
        },
        loadDestinationSucceeded(state) {
            state.loadDestinationState = RequestState.succeeded;
            state.loadDestinationError = null;
        },
        loadDestinationFailed(state, error) {
            state.loadDestinationState = RequestState.failed;
            state.loadDestinationError = error;
        },
        addSourcesetRequesting(state) {
            state.addSourcesetState = RequestState.requesting;
            state.addSourcesetError = null;
        },
        addSourcesetSucceeded(state) {
            state.addSourcesetState = RequestState.succeeded;
            state.addSourcesetError = null;
        },
        addSourcesetFailed(state, error) {
            state.addSourcesetState = RequestState.failed;
            state.addSourcesetError = error;
        },
        setLastAddedSourceset(state, value) {
            state.lastAddedSourceset = value;
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
        deleteDestinationFromDestinationset(context, options) {
            let removedDestination = options.removeDestination;
            context.commit('removeDestinationRequesting');
            return new Promise(() => {
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
            }
            context.commit('addDestinationRequesting');
            if (type !== 'number') {
                delete form.timeout;
                form.destination = type;
            }
            else {
                form.timeout = options.form.timeout;
                form.destination = options.form.destination;
            }
            updatedOptions = {
                subscriberId: context.getters.getSubscriberId,
                data: form,
                groupName: context.getters.getGroupName,
                id: context.getters.getDestinationsetId,
                timesetId: timeset,
                sourcesetId: options.sourcesetId
            };
            if (options.destinations) {
                return new Promise(() => {
                    addDestinationToExistingGroup(updatedOptions).then(() => {
                        context.commit('setLastAddedDestination', options.form.destination);
                        context.commit('addDestinationSucceeded');
                    }).catch((err) => {
                        context.commit('addDestinationFailed', err.message);
                    });
                });
            }
            else {
                return new Promise(() => {
                    addDestinationToEmptyGroup(updatedOptions).then(() => {
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
                return new Promise(() => {
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
            }
            else if (options.direction === 'down' && options.nextId && options.index === lastIndex) {
                return new Promise(() => {
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
            }
            else {
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
                return new Promise(() => {
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
        loadTimesetTimes(context, options) {
            loadTimesetTimes({
                timeset: options.timeset,
                subscriberId: context.getters.getSubscriberId
            }).then((result) => {
                context.commit('loadTimesSucceeded', result);
            });
        },
        deleteTimeFromTimeset(context, options) {
            context.commit('removeTimeRequesting');
            let clonedTimes = _.cloneDeep(context.getters.getTimesetTimes);
            let indexInt = parseInt(options.index);
            clonedTimes.splice(indexInt, 1);
            clonedTimes.forEach((time) => {
                delete time.weekday;
                delete time.from;
                delete time.to;
            });
            deleteTimeFromTimeset({
                subscriberId: context.getters.getSubscriberId,
                timesetId: context.getters.getTimesetId,
                times: clonedTimes
                }).then(() => {
                    context.commit('setLastRemovedDay', options.removedDay);
                    context.commit('removeTimeSucceeded');
                }).catch((err) => {
                    context.commit('removeTimeFailed', err.message);
                });
        },
        deleteTimesetById(context) {
            context.commit('removeTimeRequesting');
            deleteTimesetById(context.getters.getTimesetId).then(() => {
                    context.commit('resetAddTimeState');
                    context.commit('setActiveTimeForm', false);
                    context.commit('removeTimeSucceeded');
                }).catch((err) => {
                    context.commit('removeTimeFailed', err.message);
                });
        },
        resetTimesetByName(context, name) {
            context.commit('resetTimeRequesting');
            resetTimesetByName({
                id: context.getters.getSubscriberId,
                name: name
                }).then(() => {
                    context.commit('resetTimesetState');
                    context.commit('resetTimeSucceeded');
                }).catch((err) => {
                    context.commit('resetTimeFailed', err.message);
                });
        },
        createTimesetWithTime(context, options) {
            context.commit('addTimeRequesting');
            createTimesetWithTime({
                    time: options.time,
                    weekday: options.weekday,
                    name: options.name,
                    subscriberId: context.getters.getSubscriberId
                }).then(() => {
                    context.commit('addTimeSucceeded');
                }).catch((err) => {
                    context.commit('addTimeFailed', err.message);
                });
        },
        appendTimeToTimeset(context, options) {
            context.commit('addTimeRequesting');
            appendTimeToTimeset({
                    time: options.time,
                    weekday: options.weekday,
                    id: context.getters.getTimesetId,
                    subscriberId: context.getters.getSubscriberId
                }).then(() => {
                    context.commit('addTimeSucceeded');
                }).catch((err) => {
                    context.commit('addTimeFailed', err.message);
                });
        },
        loadDestinations(context, options) {
            context.commit('loadDestinationRequesting');
            loadDestinations({
                timeset: options.timeset,
                subscriberId: context.getters.getSubscriberId
            }).then((result) => {
                context.commit('loadDestinations', result);
                context.commit('loadDestinationSucceeded');
            }).catch((err) => {
                context.commit('loadDestinationFailed', err.message);
            });
        },
        createSourcesetWithSource(context, options) {
            context.commit('addSourcesetRequesting');
            createSourcesetWithSource({
                sourcesetName: options.sourcesetName,
                source: options.source,
                subscriberId: context.getters.getSubscriberId,
                mode: options.mode
            }).then(() => {
                context.commit('setLastAddedSourceset', options.sourcesetName);
                context.commit('addSourcesetSucceeded');
            }).catch((err) => {
                context.commit('addSourcesetFailed', err.message);
            });
        }
    }
};
