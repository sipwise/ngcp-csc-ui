'use strict';

import { i18n } from '../i18n';
import { RequestState } from './common'
import {
    getSpeedDialsById,
    unassignSpeedDialSlot,
    getUnassignedSlots,
    assignSpeedDialSlot
} from '../api/speed-dial';

export default {
    namespaced: true,
    state: {
        assignedSlots: [],
        slotOptions: [],
        speedDialLoadingState: RequestState.initiated,
        speedDialError: null,
        unassignSlotState: RequestState.initiated,
        unassignSlotError: null,
        lastUnassignedSlot: null,
        unassignedSlots: [],
        assignSlotState: RequestState.initiated,
        assignSlotError: null,
        lastAssignedSlot: null
    },
    getters: {
        reminderLoadingState(state) {
            return state.reminderLoadingState;
        },
        reminderError(state) {
            return state.reminderError;
        },
        subscriberId(state, getters, rootState, rootGetters) {
            return rootGetters['user/getSubscriberId'];
        },
        assignedSlots(state) {
            return state.assignedSlots;
        },
        speedDialLoadingState(state) {
            return state.speedDialLoadingState;
        },
        speedDialLoadingError(state) {
            return state.speedDialLoadingError || i18n.t('speedDial.loadSpeedDialErrorMessage');
        },
        unassignSlotState(state) {
            return state.unassignSlotState;
        },
        unassignSlotError(state) {
            return state.unassignSlotError || i18n.t('speedDial.unassignSlotErrorMessage');
        },
        lastUnassignedSlot(state) {
            return state.lastUnassignedSlot;
        },
        unassignedSlots(state) {
            return state.unassignedSlots;
        },
        assignSlotState(state) {
            return state.assignSlotState;
        },
        assignSlotError(state) {
            return state.assignSlotError || i18n.t('speedDial.assignSlotErrorMessage');
        },
        lastAssignedSlot(state) {
            return state.lastAssignedSlot;
        },
        isAdding(state) {
            return state.assignSlotState === RequestState.requesting;
        }
    },
    mutations: {
        speedDialRequesting(state) {
            state.speedDialLoadingState = RequestState.requesting;
            state.speedDialLoadingError = null;
        },
        speedDialSucceeded(state, slots) {
            state.speedDialLoadingState = RequestState.succeeded;
            state.assignedSlots = slots;
            state.speedDialLoadingError = null;
        },
        speedDialFailed(state, error) {
            state.speedDialLoadingState = RequestState.failed;
            state.speedDialLoadingError = error;
        },
        unassignSlotRequesting(state) {
            state.unassignSlotState = RequestState.requesting;
            state.unassignSlotError = null;
        },
        unassignSlotSucceeded(state, last) {
            state.lastUnassignedSlot = last;
            state.unassignSlotState = RequestState.succeeded;
            state.unassignSlotError = null;
        },
        unassignSlotFailed(state, error) {
            state.unassignSlotState = RequestState.failed;
            state.unassignSlotError = error;
        },
        loadUnassignedSlots(state, result) {
            state.unassignedSlots = result;
        },
        assignSlotRequesting(state) {
            state.assignSlotState = RequestState.requesting;
            state.assignSlotError = null;
        },
        assignSlotSucceeded(state, last) {
            state.lastAssignedSlot = last;
            state.assignSlotState = RequestState.succeeded;
            state.assignSlotError = null;
        },
        assignSlotFailed(state, error) {
            state.assignSlotState = RequestState.failed;
            state.assignSlotError = error;
        },
    },
    actions: {
        loadSpeedDials(context) {
            context.commit('speedDialRequesting');
            getSpeedDialsById(context.getters.subscriberId).then((slots) => {
                context.commit('speedDialSucceeded', slots);
            }).catch((error) => {
                context.commit('speedDialFailed', error);
            });
        },
        // TODO: Check if you can rename slot param to assignment or config
        unassignSpeedDialSlot(context, slot) {
            context.commit('unassignSlotRequesting');
            unassignSpeedDialSlot({
                slots: context.state.assignedSlots,
                slot: slot,
                id: context.getters.subscriberId
            }).then(() => {
                context.commit('unassignSlotSucceeded', slot.slot);
                context.dispatch('loadSpeedDials');
            }).catch((error) => {
                context.commit('unassignSlotFailed', error);
            });
        },
        getUnassignedSlots(context) {
            getUnassignedSlots(context.getters.subscriberId).then((result) => {
                context.commit('loadUnassignedSlots', result);
            });
        },
        // TODO: Check if you can rename slot param to assignment or config
        assignSpeedDialSlot(context, slot) {
            context.commit('assignSlotRequesting');
            assignSpeedDialSlot({
                id: context.getters.subscriberId,
                slot: slot
            }).then(() => {
                // TODO: Group into one succeeded mutation
                context.commit('assignSlotSucceeded', slot.slot);
                context.dispatch('loadSpeedDials');
                context.dispatch('getUnassignedSlots');
            }).catch((error) => {
                context.commit('assignSlotFailed', error);
            });
        }
    }
};
