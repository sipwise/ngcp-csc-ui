
'use strict';

import _ from 'lodash'
import { RequestState } from './common'
import {
    getVoiceboxSettings,
    setVoiceboxDelete,
    setVoiceboxAttach,
    setVoiceboxPin,
    setVoiceboxEmail,
    uploadGreeting,
    abortPreviousRequest,
    getVoiceboxGreetingByType,
    deleteVoiceboxGreetingById
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
        loadSettingsState: RequestState.initial,
        loadSettingsError: null,
        toggleDeleteState: RequestState.initial,
        toggleDeleteError: null,
        toggleAttachState: RequestState.initial,
        toggleAttachError: null,
        updatePinState: RequestState.initial,
        updatePinError: null,
        updateEmailState: RequestState.initial,
        updateEmailError: null,
        uploadBusyGreetingState: RequestState.initial,
        uploadBusyGreetingError: null,
        uploadUnavailGreetingState: RequestState.initial,
        uploadUnavailGreetingError: null,
        uploadProgress: 0,
        busyGreetingId: null,
        unavailGreetingId: null,
        loadBusyGreetingState: RequestState.initial,
        loadBusyGreetingError: null,
        loadUnavailGreetingState: RequestState.initial,
        loadUnavailGreetingError: null,
        deleteGreetingState: RequestState.initial,
        deleteGreetingError: null
    },
    getters: {
        subscriberId(state, getters, rootState, rootGetters) {
            return parseInt(rootGetters['user/getSubscriberId']);
        },
        isSettingsLoaded(state) {
            return state.loadSettingsState === 'succeeded';
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
        loadSettingsState(state) {
            return state.loadSettingsState;
        },
        loadSettingsError(state) {
            return state.loadSettingsError ||
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
        uploadBusyGreetingState(state) {
            return state.uploadBusyGreetingState;
        },
        uploadBusyGreetingError(state) {
            return state.uploadBusyGreetingError ||
                i18n.t('voicebox.uploadGreetingErrorMessage');
        },
        uploadUnavailGreetingState(state) {
            return state.uploadUnavailGreetingState;
        },
        uploadUnavailGreetingError(state) {
            return state.uploadUnavailGreetingError ||
                i18n.t('voicebox.uploadGreetingErrorMessage');
        },
        uploadProgress(state) {
            return state.uploadProgress;
        },
        uploadBusyGreetingRequesting(state) {
            return state.uploadBusyGreetingState === 'requesting';
        },
        uploadUnavailGreetingRequesting(state) {
            return state.uploadUnavailGreetingState === 'requesting';
        },
        busyGreetingId(state) {
            return state.busyGreetingId;
        },
        unavailGreetingId(state) {
            return state.unavailGreetingId;
        },
        deleteGreetingState(state) {
            return state.deleteGreetingState;
        },
        deleteGreetingError(state) {
            return state.deleteGreetingError ||
                i18n.t('voicebox.deleteGreetingErrorMessage');
        },
        isBusyGreetingLoaded(state) {
            return state.loadBusyGreetingState === 'succeeded';
        },
        isUnavailGreetingLoaded(state) {
            return state.loadUnavailGreetingState === 'succeeded';
        }
    },
    mutations: {
        loadSettingsRequesting(state) {
            state.loadSettingsState = RequestState.requesting;
            state.loadSettingsError = null;
        },
        loadSettingsSucceeded(state, settings) {
            state.loadSettingsState = RequestState.succeeded;
            state.voiceboxSettings = settings;
            state.loadSettingsError = null;
        },
        loadSettingsFailed(state, error) {
            state.loadSettingsState = RequestState.failed;
            state.loadSettingsError = error;
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
        uploadBusyGreetingRequesting(state) {
            state.uploadBusyGreetingState = RequestState.requesting;
            state.uploadBusyGreetingError = null;
        },
        uploadBusyGreetingSucceeded(state) {
            state.uploadBusyGreetingState = RequestState.succeeded;
            state.uploadBusyGreetingError = null;
        },
        uploadBusyGreetingFailed(state, error) {
            state.uploadBusyGreetingState = RequestState.failed;
            state.uploadBusyGreetingError = error;
        },
        uploadProgress(state, progress) {
            state.uploadProgress = progress;
        },
        resetProgress(state) {
            state.uploadProgress = 0;
        },
        loadBusyGreetingRequesting(state) {
            state.busyGreetingId = null,
            state.loadBusyGreetingState = RequestState.requesting;
            state.loadBusyGreetingError = null;
        },
        loadBusyGreetingSucceeded(state, greetings) {
            state.loadBusyGreetingState = RequestState.succeeded;
            state.loadBusyGreetingError = null;
            if (greetings.length > 0) {
                state.busyGreetingId = greetings[0].id;
            }
        },
        loadBusyGreetingFailed(state, error) {
            state.loadBusyGreetingState = RequestState.failed;
            state.loadBusyGreetingError = error;
        },
        deleteGreetingRequesting(state) {
            state.deleteGreetingState = RequestState.requesting;
            state.deleteGreetingError = null;
        },
        deleteGreetingSucceeded(state) {
            state.deleteGreetingState = RequestState.succeeded;
            state.deleteGreetingError = null;
        },
        deleteGreetingFailed(state, error) {
            state.deleteGreetingState = RequestState.failed;
            state.deleteGreetingError = error;
        }
    },
    actions: {
        getVoiceboxSettings(context) {
            context.commit('loadSettingsRequesting');
            getVoiceboxSettings(context.getters.subscriberId).then((settings) => {
                context.commit('loadSettingsSucceeded', settings);
            }).catch((err) => {
                context.commit('loadSettingsFailed', err.message);
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
        uploadBusyGreeting(context, $options) {
            let options = Object.assign($options, {
                subscriber_id: context.getters.subscriberId,
                type: $options.dir
            });
            context.commit('uploadBusyGreetingRequesting');
            uploadGreeting({
                data: options,
                onProgress: (progress) => { context.commit('uploadProgress', progress) }
            }).then(() => {
                context.commit('uploadBusyGreetingSucceeded');
                context.dispatch('loadBusyGreeting');
            }).catch((err) => {
                context.commit('uploadBusyGreetingFailed', err.message);
            });
        },
        uploadUnavailGreeting(context, $options) {
            let options = Object.assign($options, {
                subscriber_id: context.getters.subscriberId,
                type: $options.dir
            });
            // TODO: Change and create mutations
            context.commit('uploadBusyGreetingRequesting');
            uploadGreeting({
                data: options,
                onProgress: (progress) => { context.commit('uploadProgress', progress) }
            }).then(() => {
                context.commit('uploadBusyGreetingSucceeded');
                context.dispatch('loadBusyGreeting');
            }).catch((err) => {
                context.commit('uploadBusyGreetingFailed', err.message);
            });
        },
        abortPreviousRequest() {
            abortPreviousRequest();
        },
        loadBusyGreeting(context) {
            // TODO: Create mutations
            context.commit('loadBusyGreetingRequesting');
            getVoiceboxGreetingByType({
                id: context.getters.subscriberId,
                type: 'busy'
            }).then((greetings) => {
                context.commit('loadBusyGreetingSucceeded', greetings.items);
            }).catch((err) => {
                context.commit('loadBusyGreetingFailed', err.message);
            });
        },
        loadUnavailGreeting(context) {
            context.commit('loadUnavailGreetingRequesting');
            getVoiceboxGreetingByType({
                id: context.getters.subscriberId,
                type: 'unavail'
            }).then((greetings) => {
                context.commit('loadUnavailGreetingSucceeded', greetings.items);
            }).catch((err) => {
                context.commit('loadUnavailGreetingFailed', err.message);
            });
        },
        deleteGreeting(context, id) {
            context.commit('deleteGreetingRequesting');
            deleteVoiceboxGreetingById(id).then(() => {
                context.commit('deleteGreetingSucceeded');
                context.dispatch('loadBusyGreeting');
            }).catch((err) => {
                context.commit('deleteGreetingFailed', err.message);
            });
        }
    }
};
