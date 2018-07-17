'use strict';

import { i18n } from '../i18n';
import { RequestState } from './common'
import {
    getSpeedDials
} from '../api/speed-dial';

export default {
    namespaced: true,
    state: {
        assignments: [],
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
        assignments(state) {
            return state.assignments;
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
        speedDialSucceeded(state, result) {
            state.speedDialLoadingState = RequestState.succeeded;
            state.assignments = result;
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
            getSpeedDials(context.getters.subscriberId).then((result) => {
                context.commit('speedDialSucceeded', result);
            }).catch((err) => {
                context.commit('speedDialFailed', err);
            });
        }
    }
};
