
'use strict';

import _ from 'lodash'
import { RequestState } from './common'
import {
    getVoiceboxSettings,
    setVoiceboxDelete,
    setVoiceboxAttach,
    setVoiceboxPin,
    setVoiceboxEmail,
    createBusyGreeting,
    abortPreviousRequest
} from '../api/voicebox';
import { i18n } from '../i18n';

export default {
    namespaced: true,
    state: {
        voiceboxSettings: {
            attach: null,
            delete: null,
            email: '',
            id: null,
            pin: null,
            sms_number: ''
        },
        loadingState: RequestState.initial,
        loadingError: null,
        toggleDeleteState: RequestState.initial,
        toggleDeleteError: null,
        toggleAttachState: RequestState.initial,
        toggleAttachError: null,
        updatePinState: RequestState.initial,
        updatePinError: null,
        updateEmailState: RequestState.initial,
        updateEmailError: null,
        createBusyGreetingState: RequestState.initial,
        createBusyGreetingError: null,
        uploadProgress: 0
    },
    getters: {
        subscriberId(state, getters, rootState, rootGetters) {
            return parseInt(rootGetters['user/getSubscriberId']);
        },
        isSettingsLoaded(state) {
            return state.loadingState === 'succeeded';
        },
        isDeleteRequesting(state) {
            return state.toggleDeleteState === 'requesting';
        },
        isAttachRequesting(state) {
            return state.toggleAttachState === 'requesting';
        },
        isPinRequesting(state) {
            return state.updatePinState === 'requesting';
        },
        isEmailRequesting(state) {
            return state.updateEmailState === 'requesting';
        },
        loadingState(state) {
            return state.loadingState;
        },
        loadingError(state) {
            return state.loadingError ||
                i18n.t('voicebox.loadSettingsErrorMessage');
        },
        voiceboxDelete(state) {
            return _.get(state.voiceboxSettings, 'delete', false);
        },
        voiceboxAttach(state) {
            return _.get(state.voiceboxSettings, 'attach', false);
        },
        deleteLabel(state) {
            return state.voiceboxSettings.delete ?
                i18n.t('voicebox.label.deletionEnabled') :
                i18n.t('voicebox.label.deletionDisabled');
        },
        attachLabel(state) {
            return state.voiceboxSettings.attach ?
                i18n.t('voicebox.label.attachmentEnabled') :
                i18n.t('voicebox.label.attachmentDisabled');
        },
        voiceboxSettings(state) {
            return state.voiceboxSettings;
        },
        toggleDeleteState(state) {
            return state.toggleDeleteState;
        },
        toggleDeleteError(state) {
            return state.toggleDeleteError ||
                i18n.t('voicebox.toggleDeleteErrorMessage');
        },
        toggleAttachState(state) {
            return state.toggleAttachState;
        },
        toggleAttachError(state) {
            return state.toggleAttachError ||
                i18n.t('voicebox.toggleAttachErrorMessage');
        },
        updatePinState(state) {
            return state.updatePinState;
        },
        updatePinError(state) {
            return state.updatePinError ||
                i18n.t('voicebox.updatePinErrorMessage');
        },
        updateEmailState(state) {
            return state.updateEmailState;
        },
        updateEmailError(state) {
            return state.updateEmailError ||
                i18n.t('voicebox.updateEmailErrorMessage');
        },
        createBusyGreetingState(state) {
            return state.createBusyGreetingState;
        },
        createBusyGreetingError(state) {
            return state.createBusyGreetingError ||
                i18n.t('voicebox.createBusyGreetingsErrorMessage');
        },
        uploadProgress(state) {
            return state.uploadProgress;
        },
        createBusyGreetingRequesting(state) {
            return state.createBusyGreetingState === 'requesting';
        }
    },
    mutations: {
        loadingRequesting(state) {
            state.loadingState = RequestState.requesting;
            state.loadingError = null;
        },
        loadingSucceeded(state, settings) {
            state.loadingState = RequestState.succeeded;
            state.voiceboxSettings = settings;
            state.loadingError = null;
        },
        loadingFailed(state, error) {
            state.loadingState = RequestState.failed;
            state.loadingError = error;
        },
        toggleDeleteRequesting(state) {
            state.toggleDeleteState = RequestState.requesting;
            state.toggleDeleteError = null;
        },
        toggleDeleteSucceeded(state) {
            state.toggleDeleteState = RequestState.succeeded;
            state.toggleDeleteError = null;
        },
        toggleDeleteFailed(state, error) {
            state.toggleDeleteState = RequestState.failed;
            state.toggleDeleteError = error;
        },
        toggleAttachRequesting(state) {
            state.toggleAttachState = RequestState.requesting;
            state.toggleAttachError = null;
        },
        toggleAttachSucceeded(state) {
            state.toggleAttachState = RequestState.succeeded;
            state.toggleAttachError = null;
        },
        toggleAttachFailed(state, error) {
            state.toggleAttachState = RequestState.failed;
            state.toggleAttachError = error;
        },
        updatePinRequesting(state) {
            state.updatePinState = RequestState.requesting;
            state.updatePinError = null;
        },
        updatePinSucceeded(state) {
            state.updatePinState = RequestState.succeeded;
            state.updatePinError = null;
        },
        updatePinFailed(state, error) {
            state.updatePinState = RequestState.failed;
            state.updatePinError = error;
        },
        updateEmailRequesting(state) {
            state.updateEmailState = RequestState.requesting;
            state.updateEmailError = null;
        },
        updateEmailSucceeded(state) {
            state.updateEmailState = RequestState.succeeded;
            state.updateEmailError = null;
        },
        updateEmailFailed(state, error) {
            state.updateEmailState = RequestState.failed;
            state.updateEmailError = error;
        },
        createBusyGreetingRequesting(state) {
            state.createBusyGreetingState = RequestState.requesting;
            state.createBusyGreetingError = null;
        },
        createBusyGreetingSucceeded(state) {
            state.createBusyGreetingState = RequestState.succeeded;
            state.createBusyGreetingError = null;
        },
        createBusyGreetingFailed(state, error) {
            state.createBusyGreetingState = RequestState.failed;
            state.createBusyGreetingError = error;
        },
        uploadProgress(state, progress) {
            state.uploadProgress = progress;
        },
        resetProgress(state) {
            state.uploadProgress = 0;
        }
    },
    actions: {
        getVoiceboxSettings(context) {
            context.commit('loadingRequesting');
            getVoiceboxSettings(context.getters.subscriberId).then((settings) => {
                context.commit('loadingSucceeded', settings);
            }).catch((err) => {
                context.commit('loadingFailed', err.message);
            })
        },
        toggleDelete(context) {
            context.commit('toggleDeleteRequesting');
            setVoiceboxDelete({
                subscriberId: context.getters.subscriberId,
                value: !context.getters.voiceboxDelete
            }).then(() => {
                context.commit('toggleDeleteSucceeded');
                context.dispatch('getVoiceboxSettings');
            }).catch((err) => {
                context.commit('toggleDeleteFailed', err.message);
                context.dispatch('getVoiceboxSettings');
            });
        },
        toggleAttach(context) {
            context.commit('toggleAttachRequesting');
            setVoiceboxAttach({
                subscriberId: context.getters.subscriberId,
                value: !context.getters.voiceboxAttach
            }).then(() => {
                context.commit('toggleAttachSucceeded');
                context.dispatch('getVoiceboxSettings');
            }).catch((err) => {
                context.commit('toggleAttachFailed', err.message);
                context.dispatch('getVoiceboxSettings');
            });
        },
        updatePin(context, value) {
            context.commit('updatePinRequesting');
            setVoiceboxPin({
                subscriberId: context.getters.subscriberId,
                value: value
            }).then(() => {
                context.commit('updatePinSucceeded');
                context.dispatch('getVoiceboxSettings');
            }).catch((err) => {
                context.commit('updatePinFailed', err.message);
            });
        },
        updateEmail(context, value) {
            context.commit('updateEmailRequesting');
            setVoiceboxEmail({
                subscriberId: context.getters.subscriberId,
                value: value
            }).then(() => {
                context.commit('updateEmailSucceeded');
                context.dispatch('getVoiceboxSettings');
            }).catch((err) => {
                context.commit('updateEmailFailed', err.message);
            });
        },
        createBusyGreeting({commit, getters}, $options) {
            let options = Object.assign($options, {
                subscriber_id: getters.subscriberId
            });
            commit('createBusyGreetingRequesting');
            createBusyGreeting({
                data: options,
                onProgress: (progress) => { commit('uploadProgress', progress) }
            }).then(() => {
                commit('createBusyGreetingSucceeded');
            }).catch((err) => {
                commit('createBusyGreetingFailed', err.message);
            });
        },
        abortPreviousRequest() {
            abortPreviousRequest();
        }
    }
};
