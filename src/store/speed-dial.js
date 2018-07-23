'use strict';

import { i18n } from '../i18n';
import { RequestState } from './common'
import {
    getSpeedDials,
    unassignSpeedDialSlot
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
        lastUnassignedSlot: null
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
        }
    },
    actions: {
        loadSpeedDials(context) {
            context.commit('speedDialRequesting');
            getSpeedDials(context.getters.subscriberId).then((slots) => {
                context.commit('speedDialSucceeded', slots);
            }).catch((error) => {
                context.commit('speedDialFailed', error);
            });
        },
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
        }
    }
};
