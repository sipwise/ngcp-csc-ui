'use strict';

import { i18n } from '../i18n';
import { RequestState } from './common'
import {
    getSpeedDials
} from '../api/speed-dial';

export default {
    namespaced: true,
    state: {
        assignedSlots: [],
        slotOptions: [],
        speedDialLoadingState: RequestState.initiated,
        speedDialError: null
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
        }
    }
};
