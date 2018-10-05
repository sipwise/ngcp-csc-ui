
'use strict';

import Vue from 'vue';
import { RequestState } from './common'
import {
    getVoiceboxSettings, setVoiceboxDelete,
    setVoiceboxAttach,
    setVoiceboxPin,
    setVoiceboxEmail,
    uploadGreeting,
    abortPreviousRequest,
    getVoiceboxGreetingByType,
    deleteVoiceboxGreetingById,
    playGreeting
} from '../api/voicebox';
import { i18n } from '../i18n';

export default {
    namespaced: true,
    state: {
        voiceboxSettingDelete: false,
        voiceboxSettingAttach: false,
        voiceboxSettingPin: '',
        voiceboxSettingEmail: '',
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
        uploadBusyProgress: 0,
        uploadUnavailProgress: 0,
        busyGreetingId: null,
        unavailGreetingId: null,
        loadBusyGreetingState: RequestState.initial,
        loadBusyGreetingError: null,
        loadUnavailGreetingState: RequestState.initial,
        loadUnavailGreetingError: null,
        deleteGreetingState: RequestState.initial,
        deleteGreetingError: null,
        playGreetingUrls: {},
        playGreetingStates: {},
        playGreetingErrors: {}
    },
    getters: {
        subscriberId(state, getters, rootState, rootGetters) {
            return parseInt(rootGetters['user/getSubscriberId']);
        },
        isSettingsLoaded(state) {
            return state.loadSettingsState === 'succeeded';
        },
        isDeleteRequesting(state) {
            return state.loadSettingsState === 'requesting' ||
                state.toggleDeleteState === 'requesting';
        },
        isAttachRequesting(state) {
            return state.loadSettingsState === 'requesting' ||
                state.toggleAttachState === 'requesting';
        },
        isPinRequesting(state) {
            return state.loadSettingsState === 'requesting' ||
                state.updatePinState === 'requesting';
        },
        isEmailRequesting(state) {
            return state.loadSettingsState === 'requesting' ||
                state.updateEmailState === 'requesting';
        },
        loadSettingsState(state) {
            return state.loadSettingsState;
        },
        loadSettingsError(state) {
            return state.loadSettingsError ||
                i18n.t('voicebox.loadSettingsErrorMessage');
        },
        voiceboxDelete(state) {
            return state.voiceboxSettingDelete;
        },
        voiceboxAttach(state) {
            return state.voiceboxSettingAttach;
        },
        voiceboxPin(state) {
            return state.voiceboxSettingPin;
        },
        voiceboxEmail(state) {
            return state.voiceboxSettingEmail;
        },
        deleteLabel(state, getters) {
            return getters.voiceboxDelete ?
                i18n.t('voicebox.label.deletionEnabled') :
                i18n.t('voicebox.label.deletionDisabled');
        },
        attachLabel(state, getters) {
            return  getters.voiceboxAttach ?
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
        uploadBusyProgress(state) {
            return state.uploadBusyProgress;
        },
        uploadUnavailProgress(state) {
            return state.uploadUnavailProgress;
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
        busyGreetingLabel(state) {
            return state.busyGreetingId ? i18n.t('voicebox.label.customSoundActive') :
                i18n.t('voicebox.label.defaultSoundActive');
        },
        unavailGreetingLabel(state) {
            return state.unavailGreetingId ? i18n.t('voicebox.label.customSoundActive') :
                i18n.t('voicebox.label.defaultSoundActive')
        },
        playGreetingLoaded(state) {
            return (id) => {
                return state.playGreetingStates[id] === 'succeeded';
            }
        },
        playGreetingUrl(state) {
            return (id) => {
                return state.playGreetingUrls[id];
            }
        }
    },
    mutations: {
        loadedSettings(state, settings) {
            state.voiceboxSettingDelete = settings.delete;
            state.voiceboxSettingAttach = settings.attach;
            state.voiceboxSettingPin = settings.pin;
            state.voiceboxSettingEmail = settings.email;
            state.loadSettingsError = null;
        },
        loadSettingsRequesting(state) {
            state.loadSettingsState = RequestState.requesting;
            state.loadSettingsError = null;
        },
        loadSettingsSucceeded(state, settings) {
            state.loadSettingsState = RequestState.succeeded;
            state.loadSettingsError = null;
            state.voiceboxSettingDelete = settings.delete;
            state.voiceboxSettingAttach = settings.attach;
            state.voiceboxSettingPin = settings.pin;
            state.voiceboxSettingEmail = settings.email;
        },
        loadSettingsFailed(state, error) {
            state.loadSettingsState = RequestState.succeeded;
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
        uploadUnavailGreetingRequesting(state) {
            state.uploadUnavailGreetingState = RequestState.requesting;
            state.uploadUnavailGreetingError = null;
        },
        uploadUnavailGreetingSucceeded(state) {
            state.uploadUnavailGreetingState = RequestState.succeeded;
            state.uploadUnavailGreetingError = null;
        },
        uploadUnavailGreetingFailed(state, error) {
            state.uploadUnavailGreetingState = RequestState.failed;
            state.uploadUnavailGreetingError = error;
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
        uploadBusyProgress(state, progress) {
            state.uploadBusyProgress = progress;
        },
        uploadUnavailProgress(state, progress) {
            state.uploadUnavailProgress = progress;
        },
        resetBusyProgress(state) {
            state.uploadBusyProgress = 0;
        },
        resetUnavailProgress(state) {
            state.uploadUnavailProgress = 0;
        },
        loadBusyGreetingRequesting(state) {
            state.busyGreetingId = null,
            state.loadBusyGreetingState = RequestState.requesting;
            state.loadBusyGreetingError = null;
        },
        loadBusyGreetingSucceeded(state, greetings) {
            if (greetings.length > 0) {
                state.busyGreetingId = greetings[0].id;
            }
            state.loadBusyGreetingState = RequestState.succeeded;
            state.loadBusyGreetingError = null;
        },
        loadBusyGreetingFailed(state, error) {
            state.loadBusyGreetingState = RequestState.failed;
            state.loadBusyGreetingError = error;
        },
        loadUnavailGreetingRequesting(state) {
            state.unavailGreetingId = null,
            state.loadUnavailGreetingState = RequestState.requesting;
            state.loadUnavailGreetingError = null;
        },
        loadUnavailGreetingSucceeded(state, greetings) {
            if (greetings.length > 0) {
                state.unavailGreetingId = greetings[0].id;
            }
            state.loadUnavailGreetingState = RequestState.succeeded;
            state.loadUnavailGreetingError = null;
        },
        loadUnavailGreetingFailed(state, error) {
            state.loadUnavailGreetingState = RequestState.failed;
            state.loadUnavailGreetingError = error;
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
        },
        playGreetingRequesting(state, id) {
            Vue.set(state.playGreetingStates, id, RequestState.requesting);
            Vue.set(state.playGreetingErrors, id, null);
        },
        playGreetingSucceeded(state, options) {
            Vue.set(state.playGreetingUrls, options.id, options.url);
            Vue.set(state.playGreetingStates, options.id, RequestState.succeeded);
            Vue.set(state.playGreetingErrors, options.id, null);
        },
        playGreetingFailed(state, id, err) {
            Vue.set(state.playGreetingUrls, id, null);
            Vue.set(state.playGreetingStates, id, RequestState.failed);
            Vue.set(state.playGreetingErrors, id, err);
        }
    },
    actions: {
        getVoiceboxSettings(context) {
            context.commit('loadSettingsRequesting');
            getVoiceboxSettings(context.getters.subscriberId).then((settings) => {
                context.commit('loadSettingsSucceeded', settings);
            }).catch((err) => {
                context.commit('loadSettingsFailed', err.message);
            });
        },
        toggleDelete(context) {
            context.commit('toggleDeleteRequesting');
            setVoiceboxDelete({
                subscriberId: context.getters.subscriberId,
                value: !context.getters.voiceboxDelete
            }).then(() => {
                return getVoiceboxSettings(context.getters.subscriberId);
            }).then((settings)=>{
                context.commit('loadedSettings', settings);
                context.commit('toggleDeleteSucceeded');
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
                return getVoiceboxSettings(context.getters.subscriberId);
            }).then((settings)=>{
                context.commit('loadedSettings', settings);
                context.commit('toggleAttachSucceeded');
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
                return getVoiceboxSettings(context.getters.subscriberId);
            }).then((settings)=>{
                context.commit('loadedSettings', settings);
                context.commit('updatePinSucceeded');
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
                return getVoiceboxSettings(context.getters.subscriberId);
            }).then((settings)=>{
                context.commit('loadedSettings', settings);
                context.commit('updateEmailSucceeded');
            }).catch((err) => {
                context.commit('updateEmailFailed', err.message);
            });
        },
        uploadBusyGreeting(context, $options) {
            let options = Object.assign($options, {
                subscriber_id: context.getters.subscriberId,
                dir: 'busy'
            });
            context.commit('uploadBusyGreetingRequesting');
            uploadGreeting({
                data: options,
                onProgress: (progress) => { context.commit('uploadBusyProgress', progress) }
            }).then(() => {
                context.commit('loadBusyGreetingRequesting');
                return getVoiceboxGreetingByType({
                    id: context.getters.subscriberId,
                    type: 'busy'
                })
            }).then((greetings) => {
                context.commit('loadBusyGreetingSucceeded', greetings.items);
                context.commit('uploadBusyGreetingSucceeded');
            }).catch((err) => {
                context.commit('uploadBusyGreetingFailed', err.message);
            });
        },
        uploadUnavailGreeting(context, $options) {
            let options = Object.assign($options, {
                subscriber_id: context.getters.subscriberId,
                dir: 'unavail'
            });
            context.commit('uploadUnavailGreetingRequesting');
            uploadGreeting({
                data: options,
                onProgress: (progress) => { context.commit('uploadUnavailProgress', progress) }
            }).then(() => {
                context.commit('loadUnavailGreetingRequesting');
                return getVoiceboxGreetingByType({
                    id: context.getters.subscriberId,
                    type: 'unavail'
                })
            }).then((greetings) => {
                context.commit('loadUnavailGreetingSucceeded', greetings.items);
                context.commit('uploadUnavailGreetingSucceeded');
            }).catch((err) => {
                context.commit('uploadUnavailGreetingFailed', err.message);
            });
        },
        abortPreviousRequest(context, name) {
            abortPreviousRequest(name);
        },
        loadBusyGreeting(context) {
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
        deleteGreeting(context, options) {
            context.commit('deleteGreetingRequesting');
            deleteVoiceboxGreetingById(options.id).then(() => {
                context.commit('deleteGreetingSucceeded');
                if (options.type === 'busy') {
                    context.dispatch('loadBusyGreeting');
                }
                else if (options.type === 'unavail') {
                    context.dispatch('loadUnavailGreeting');
                }
            }).catch((err) => {
                context.commit('deleteGreetingFailed', err.message);
            });
        },
        playGreeting(context, options) {
            context.commit('playGreetingRequesting', options.id);
            playGreeting(options).then((url) => {
                context.commit('playGreetingSucceeded', {
                    id: options.id,
                    url: url
                });
            }).catch((err) => {
                context.commit('playGreetingFailed', options.id, err.mesage);
            });
        },
        abortUploadBusyGreeting(context) {
            abortPreviousRequest('busy').then(() => {
                context.dispatch('loadBusyGreeting');
            });
        },
        abortUploadUnavailGreeting(context) {
            abortPreviousRequest('unavail').then(() => {
                context.dispatch('loadUnavailGreeting');
            });
        }
    }
};
