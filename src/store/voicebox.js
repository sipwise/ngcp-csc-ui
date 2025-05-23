import { i18n } from 'boot/i18n'
import _ from 'lodash'
import { apiCreateCancelObject, apiIsCanceledRequest } from 'src/api/common'
import {
    deleteVoiceboxGreetingById,
    getVoiceboxGreetingByType,
    getVoiceboxSettings,
    playGreeting,
    setVoiceboxAttach,
    setVoiceboxDelete,
    setVoiceboxEmail,
    setVoiceboxPin,
    uploadGreeting
} from 'src/api/voicebox'
import { RequestState } from 'src/store/common'

const setVoiceboxSettings = {
    pin: setVoiceboxPin,
    email: setVoiceboxEmail,
    attach: setVoiceboxAttach,
    delete: setVoiceboxDelete
}

export default {
    namespaced: true,
    state: {
        settingsLoadState: RequestState.initial,

        pinValue: '',
        pinUpdateState: RequestState.initiated,
        pinUpdateError: null,

        emailValue: '',
        emailUpdateState: RequestState.initiated,
        emailUpdateError: null,

        attachValue: false,
        attachUpdateState: RequestState.initiated,
        attachUpdateError: null,

        deleteValue: false,
        deleteUpdateState: RequestState.initiated,
        deleteUpdateError: null,

        busyGreetingId: null,
        busyGreetingUrl: null,
        busyGreetingLoadState: RequestState.initiated,
        busyGreetingUploadState: RequestState.initiated,
        busyGreetingUploadError: null,
        busyGreetingUploadProgress: 0,
        busyGreetingDeletionState: RequestState.initiated,
        busyGreetingDeletionError: null,
        busyGreetingLoadError: null,

        unavailableGreetingId: null,
        unavailableGreetingUrl: null,
        unavailableGreetingLoadState: RequestState.initiated,
        unavailableGreetingUploadState: RequestState.initiated,
        unavailableGreetingUploadError: null,
        unavailableGreetingUploadProgress: 0,
        unavailableGreetingDeletionState: RequestState.initiated,
        unavailableGreetingDeletionError: null,
        unavailableGreetingLoadError: null,

        uploadCancelActions: {},

        tempGreetingId: null,
        tempGreetingUrl: null,
        tempGreetingLoadState: RequestState.initiated,
        tempGreetingUploadState: RequestState.initiated,
        tempGreetingUploadError: null,
        tempGreetingUploadProgress: 0,
        tempGreetingDeletionState: RequestState.initiated,
        tempGreetingDeletionError: null,
        tempGreetingLoadError: null,

        greetGreetingId: null,
        greetGreetingUrl: null,
        greetGreetingLoadState: RequestState.initiated,
        greetGreetingUploadState: RequestState.initiated,
        greetGreetingUploadError: null,
        greetGreetingUploadProgress: 0,
        greetGreetingDeletionState: RequestState.initiated,
        greetGreetingDeletionError: null,
        greetGreetingLoadError: null
    },
    getters: {
        subscriberId (state, getters, rootState, rootGetters) {
            return parseInt(rootGetters['user/getSubscriberId'])
        },
        settingsLoading (state) {
            return state.settingsLoadState === RequestState.requesting
        },

        pinLoading (state, getters) {
            return getters.settingsLoading || state.pinUpdateState === RequestState.requesting
        },
        pinUpdateSucceeded (state) {
            return state.pinUpdateState === RequestState.succeeded
        },
        pinUpdateFailed (state) {
            return state.pinUpdateState === RequestState.failed
        },

        emailLoading (state, getters) {
            return getters.settingsLoading || state.emailUpdateState === RequestState.requesting
        },
        emailUpdateSucceeded (state) {
            return state.emailUpdateState === RequestState.succeeded
        },
        emailUpdateFailed (state) {
            return state.emailUpdateState === RequestState.failed
        },

        attachLoading (state, getters) {
            return getters.settingsLoading || state.attachUpdateState === RequestState.requesting
        },
        attachLabel (state, getters) {
            return state.attachValue
                ? i18n.global.t('Attach voicemail to email notification')
                : i18n.global.t('Attach voicemail to email notification')
        },

        deleteLoading (state, getters) {
            return getters.settingsLoading || state.deleteUpdateState === RequestState.requesting
        },
        deleteLabel (state, getters) {
            return state.deleteValue
                ? i18n.global.t('Delete voicemail after email notification is delivered')
                : i18n.global.t('Delete voicemail after email notification is delivered')
        },

        busyGreetingUploading (state) {
            return state.busyGreetingUploadState === RequestState.requesting
        },
        busyGreetingFileLoaded (state) {
            return state.busyGreetingLoadState === RequestState.succeeded
        },
        busyGreetingLabel (state) {
            return state.busyGreetingId
                ? i18n.global.t('Custom sound')
                : i18n.global.t('Default sound')
        },
        busyGreetingDeleting (state) {
            return state.busyGreetingDeletionState === RequestState.requesting
        },

        unavailableGreetingUploading (state) {
            return state.unavailableGreetingUploadState === RequestState.requesting
        },
        unavailableGreetingFileLoaded (state) {
            return state.unavailableGreetingLoadState === RequestState.succeeded
        },
        unavailableGreetingLabel (state) {
            return state.unavailableGreetingId
                ? i18n.global.t('Custom sound')
                : i18n.global.t('Default sound')
        },
        unavailableGreetingDeleting (state) {
            return state.unavailableGreetingDeletionState === RequestState.requesting
        },
        tempGreetingUploading (state) {
            return state.tempGreetingUploadState === RequestState.requesting
        },
        tempGreetingFileLoaded (state) {
            return state.tempGreetingLoadState === RequestState.succeeded
        },
        tempGreetingLabel (state) {
            return state.tempGreetingId
                ? i18n.global.t('Custom sound')
                : i18n.global.t('Default sound')
        },
        tempGreetingDeleting (state) {
            return state.tempGreetingDeletionState === RequestState.requesting
        },
        greetGreetingUploading (state) {
            return state.greetGreetingUploadState === RequestState.requesting
        },
        greetGreetingFileLoaded (state) {
            return state.greetGreetingLoadState === RequestState.succeeded
        },
        greetGreetingLabel (state) {
            return state.greetGreetingId
                ? i18n.global.t('Custom sound')
                : i18n.global.t('Default sound')
        },
        greetGreetingDeleting (state) {
            return state.greetGreetingDeletionState === RequestState.requesting
        }
    },
    mutations: {
        settingsRequesting (state) {
            state.settingsLoadState = RequestState.requesting
        },
        settingsSucceeded (state, res) {
            state.settingsLoadState = RequestState.succeeded
            if (_.has(res, 'settings')) {
                state.pinValue = res.settings.pin
                state.emailValue = res.settings.email
                state.attachValue = res.settings.attach
                state.deleteValue = res.settings.delete
            }
            if (_.has(res, 'busyGreetingId') && res.busyGreetingId !== null) {
                state.busyGreetingId = res.busyGreetingId
            }
            if (_.has(res, 'unavailableGreetingId') && res.unavailableGreetingId !== null) {
                state.unavailableGreetingId = res.unavailableGreetingId
            }
            if (_.has(res, 'tempGreetingId') && res.tempGreetingId !== null) {
                state.tempGreetingId = res.tempGreetingId
            }
            if (_.has(res, 'greetGreetingId') && res.greetGreetingId !== null) {
                state.greetGreetingId = res.greetGreetingId
            }
        },

        pinInitialize (state) {
            state.pinUpdateState = RequestState.initiated
            state.pinUpdateError = null
        },
        pinUpdateRequesting (state) {
            state.pinUpdateState = RequestState.requesting
            state.pinUpdateError = null
        },
        pinUpdateSucceeded (state) {
            state.pinUpdateState = RequestState.succeeded
            state.pinUpdateError = null
        },
        pinUpdateFailed (state, err) {
            state.pinUpdateState = RequestState.failed
            state.pinUpdateError = err
        },

        emailInitialize (state) {
            state.emailUpdateState = RequestState.initiated
            state.emailUpdateError = null
        },
        emailUpdateRequesting (state) {
            state.emailUpdateState = RequestState.requesting
            state.emailUpdateError = null
        },
        emailUpdateSucceeded (state) {
            state.emailUpdateState = RequestState.succeeded
            state.emailUpdateError = null
        },
        emailUpdateFailed (state, err) {
            state.emailUpdateState = RequestState.failed
            state.emailUpdateError = err
        },

        attachUpdateRequesting (state) {
            state.attachUpdateState = RequestState.requesting
            state.attachUpdateError = null
        },
        attachUpdateSucceeded (state) {
            state.attachUpdateState = RequestState.succeeded
            state.attachUpdateError = null
        },
        attachUpdateFailed (state, err) {
            state.attachUpdateState = RequestState.failed
            state.attachUpdateError = err
        },

        deleteUpdateRequesting (state) {
            state.deleteUpdateState = RequestState.requesting
            state.deleteUpdateError = null
        },
        deleteUpdateSucceeded (state) {
            state.deleteUpdateState = RequestState.succeeded
            state.deleteUpdateError = null
        },
        deleteUpdateFailed (state, err) {
            state.deleteUpdateState = RequestState.failed
            state.deleteUpdateError = err
        },

        busyGreetingUploadRequesting (state) {
            state.busyGreetingUploadState = RequestState.requesting
            state.busyGreetingUploadError = null
            state.busyGreetingUploadProgress = 0
        },
        busyGreetingUploadProgress (state, progress) {
            state.busyGreetingUploadProgress = progress
        },
        busyGreetingUploadSucceeded (state, id) {
            state.busyGreetingUploadState = RequestState.succeeded
            state.busyGreetingUploadError = null
            state.busyGreetingId = id
        },
        busyGreetingUploadFailed (state, error) {
            state.busyGreetingUploadState = RequestState.failed
            state.busyGreetingUploadError = error
            state.busyGreetingUploadProgress = 0
        },
        busyGreetingPlayRequesting (state) {
            state.busyGreetingLoadState = RequestState.requesting
            state.busyGreetingUrl = null
        },
        busyGreetingPlaySucceeded (state, url) {
            state.busyGreetingLoadState = RequestState.succeeded
            state.busyGreetingUrl = url
        },
        busyGreetingPlayFailed (state, err) {
            state.busyGreetingLoadState = RequestState.failed
            state.busyGreetingUrl = null
            state.busyGreetingLoadError = err
        },
        busyGreetingDeletionRequesting (state) {
            state.busyGreetingDeletionState = RequestState.requesting
            state.busyGreetingDeletionError = null
        },
        busyGreetingDeletionSucceeded (state) {
            state.busyGreetingDeletionState = RequestState.succeeded
            state.busyGreetingDeletionError = null
            state.busyGreetingId = null
            state.busyGreetingLoadState = RequestState.initiated
            state.busyGreetingUrl = null
        },
        busyGreetingDeletionFailed (state, error) {
            state.busyGreetingDeletionState = RequestState.failed
            state.busyGreetingDeletionError = error
        },

        unavailableGreetingUploadRequesting (state) {
            state.unavailableGreetingUploadState = RequestState.requesting
            state.unavailableGreetingUploadError = null
            state.unavailableGreetingUploadProgress = 0
        },
        unavailableGreetingUploadProgress (state, progress) {
            state.unavailableGreetingUploadProgress = progress
        },
        unavailableGreetingUploadSucceeded (state, id) {
            state.unavailableGreetingUploadState = RequestState.succeeded
            state.unavailableGreetingUploadError = null
            state.unavailableGreetingId = id
        },
        unavailableGreetingUploadFailed (state, error) {
            state.unavailableGreetingUploadState = RequestState.failed
            state.unavailableGreetingUploadError = error
            state.unavailableGreetingUploadProgress = 0
        },
        unavailableGreetingPlayRequesting (state) {
            state.unavailableGreetingLoadState = RequestState.requesting
            state.unavailableGreetingUrl = null
        },
        unavailableGreetingPlaySucceeded (state, url) {
            state.unavailableGreetingLoadState = RequestState.succeeded
            state.unavailableGreetingUrl = url
        },
        unavailableGreetingPlayFailed (state, err) {
            state.unavailableGreetingLoadState = RequestState.failed
            state.unavailableGreetingUrl = null
            state.unavailableGreetingLoadError = err
        },
        unavailableGreetingDeletionRequesting (state) {
            state.unavailableGreetingDeletionState = RequestState.requesting
            state.unavailableGreetingDeletionError = null
        },
        unavailableGreetingDeletionSucceeded (state) {
            state.unavailableGreetingDeletionState = RequestState.succeeded
            state.unavailableGreetingDeletionError = null
            state.unavailableGreetingId = null
            state.unavailableGreetingLoadState = RequestState.initiated
            state.unavailableGreetingUrl = null
        },
        unavailableGreetingDeletionFailed (state, error) {
            state.unavailableGreetingDeletionState = RequestState.failed
            state.unavailableGreetingDeletionError = error
        },
        updateUploadCancelActions (state, field, value) {
            state.uploadCancelActions[field] = value
        },
        tempGreetingUploadProgress (state, progress) {
            state.tempGreetingUploadProgress = progress
        },
        tempGreetingUploadRequesting (state) {
            state.tempGreetingUploadState = RequestState.requesting
            state.tempGreetingUploadError = null
            state.tempGreetingUploadProgress = 0
        },
        tempGreetingUploadSucceeded (state, id) {
            state.tempGreetingUploadState = RequestState.succeeded
            state.tempGreetingUploadError = null
            state.tempGreetingId = id
        },
        tempGreetingUploadFailed (state, error) {
            state.tempGreetingUploadState = RequestState.failed
            state.tempGreetingUploadError = error
            state.tempGreetingUploadProgress = 0
        },
        tempGreetingPlayRequesting (state) {
            state.tempGreetingLoadState = RequestState.requesting
            state.tempGreetingUrl = null
        },
        tempGreetingPlaySucceeded (state, url) {
            state.tempGreetingLoadState = RequestState.succeeded
            state.tempGreetingUrl = url
        },
        tempGreetingPlayFailed (state, err) {
            state.tempGreetingLoadState = RequestState.failed
            state.tempGreetingUrl = null
            state.tempGreetingLoadError = err
        },
        tempGreetingDeletionRequesting (state) {
            state.tempGreetingDeletionState = RequestState.requesting
            state.tempGreetingDeletionError = null
        },
        tempGreetingDeletionFailed (state, error) {
            state.tempGreetingDeletionState = RequestState.failed
            state.tempGreetingDeletionError = error
        },
        tempGreetingDeletionSucceeded (state) {
            state.tempGreetingDeletionState = RequestState.succeeded
            state.tempGreetingDeletionError = null
            state.tempGreetingId = null
            state.tempGreetingLoadState = RequestState.initiated
            state.tempGreetingUrl = null
        },
        greetGreetingUploadRequesting (state) {
            state.greetGreetingUploadState = RequestState.requesting
            state.greetGreetingUploadError = null
            state.greetGreetingUploadProgress = 0
        },
        greetGreetingUploadSucceeded (state, id) {
            state.greetGreetingUploadState = RequestState.succeeded
            state.greetGreetingUploadError = null
            state.greetGreetingId = id
        },
        greetGreetingUploadProgress (state, progress) {
            state.greetGreetingUploadProgress = progress
        },
        greetGreetingUploadFailed (state, error) {
            state.greetGreetingUploadState = RequestState.failed
            state.greetGreetingUploadError = error
            state.greetGreetingUploadProgress = 0
        },
        greetGreetingPlayRequesting (state) {
            state.greetGreetingLoadState = RequestState.requesting
            state.greetGreetingUrl = null
        },
        greetGreetingPlaySucceeded (state, url) {
            state.greetGreetingLoadState = RequestState.succeeded
            state.greetGreetingUrl = url
        },
        greetGreetingPlayFailed (state, err) {
            state.greetGreetingLoadState = RequestState.failed
            state.greetGreetingUrl = null
            state.greetGreetingLoadError = err
        },
        greetGreetingDeletionRequesting (state) {
            state.greetGreetingDeletionState = RequestState.requesting
            state.greetGreetingDeletionError = null
        },
        greetGreetingDeletionSucceeded (state) {
            state.greetGreetingDeletionState = RequestState.succeeded
            state.greetGreetingDeletionError = null
            state.greetGreetingId = null
            state.greetGreetingLoadState = RequestState.initiated
            state.greetGreetingUrl = null
        },
        greetGreetingDeletionFailed (state, error) {
            state.greetGreetingDeletionState = RequestState.failed
            state.greetGreetingDeletionError = error
        }
    },
    actions: {
        async settingsLoadAction (context, id) {
            const subscriberId = id || context.getters.subscriberId
            context.commit('settingsRequesting')
            const res = await Promise.all([
                getVoiceboxSettings(subscriberId),
                getVoiceboxGreetingByType({
                    id: subscriberId,
                    type: 'busy'
                }),
                getVoiceboxGreetingByType({
                    id: subscriberId,
                    type: 'unavail'
                }),
                getVoiceboxGreetingByType({
                    id: subscriberId,
                    type: 'temp'
                }),
                getVoiceboxGreetingByType({
                    id: subscriberId,
                    type: 'greet'
                })
            ])
            context.commit('settingsSucceeded', {
                settings: res[0],
                busyGreetingId: _.get(res, '1.items.0.id', null),
                unavailableGreetingId: _.get(res, '2.items.0.id', null),
                tempGreetingId: _.get(res, '3.items.0.id', null),
                greetGreetingId: _.get(res, '4.items.0.id', null)
            })
        },
        async updateAction (context, options) {
            let subscriberId
            if (options.subscriberId) {
                subscriberId = options.subscriberId
            } else {
                subscriberId = context.getters.subscriberId
            }
            try {
                context.commit(`${options.property}UpdateRequesting`)
                await setVoiceboxSettings[options.property]({
                    subscriberId,
                    value: options.value
                })
                context.commit('settingsSucceeded', {
                    settings: await getVoiceboxSettings(subscriberId)
                })
                context.commit(`${options.property}UpdateSucceeded`)
            } catch (err) {
                context.commit(`${options.property}UpdateFailed`, err.message)
            }
        },
        async pinUpdateAction (context, options) {
            await context.dispatch('updateAction', {
                property: 'pin',
                value: options.pin,
                subscriberId: options.subscriberId
            })
        },
        async emailUpdateAction (context, options) {
            await context.dispatch('updateAction', {
                property: 'email',
                value: options.email,
                subscriberId: options.subscriberId
            })
        },
        async attachToggleAction (context, options) {
            await context.dispatch('updateAction', {
                property: 'attach',
                value: options.attachValue,
                subscriberId: options.subscriberId
            })
        },
        async deleteToggleAction (context, options) {
            await context.dispatch('updateAction', {
                property: 'delete',
                value: options.deleteValue,
                subscriberId: options.subscriberId
            })
        },
        async greetingUpload (context, options) {
            const subscriberId = options.subscriberId || context.getters.subscriberId
            try {
                context.commit(`${options.type}GreetingUploadRequesting`)
                const cancelToken = apiCreateCancelObject()
                context.commit('updateUploadCancelActions', options.greeting, cancelToken.cancel)
                await uploadGreeting({
                    data: {
                        subscriber_id: subscriberId,
                        dir: options.greeting,
                        file: options.file
                    },
                    onProgress: (progress) => {
                        context.commit(`${options.type}GreetingUploadProgress`, progress)
                    },
                    cancelToken: cancelToken.token
                })
                const greetings = await getVoiceboxGreetingByType({
                    id: subscriberId,
                    type: options.greeting
                })
                context.commit(`${options.type}GreetingUploadSucceeded`, greetings.items[0].id)
            } catch (err) {
                if (!apiIsCanceledRequest(err)) {
                    context.commit(`${options.type}GreetingUploadFailed`, err.message)
                }
            } finally {
                context.commit('updateUploadCancelActions', options.greeting, undefined)
            }
        },
        async greetingUploadAbort (context, greeting) {
            const cancelFunction = context.state.uploadCancelActions[greeting]
            if (typeof cancelFunction === 'function') {
                cancelFunction()
            }
        },
        async greetingPlay (context, options) {
            try {
                context.commit(`${options.type}GreetingPlayRequesting`)
                const greetingUrl = await playGreeting({
                    id: options.id,
                    format: options.format
                })
                context.commit(`${options.type}GreetingPlaySucceeded`, greetingUrl)
            } catch (err) {
                context.commit(`${options.type}GreetingPlayFailed`, err.message)
            }
        },
        async greetingDelete (context, options) {
            try {
                context.commit(`${options.type}GreetingDeletionRequesting`)
                await deleteVoiceboxGreetingById(options.id)
                context.commit(`${options.type}GreetingDeletionSucceeded`)
            } catch (err) {
                context.commit(`${options.type}GreetingDeletionFailed`, err.message)
            }
        },
        async busyGreetingUpload (context, options) {
            await context.dispatch('greetingUpload', {
                type: 'busy',
                greeting: 'busy',
                file: options.file,
                subscriberId: options.subscriberId
            })
        },
        async busyGreetingUploadAbort (context) {
            await context.dispatch('greetingUploadAbort', 'busy')
        },
        async busyGreetingPlay (context, format) {
            await context.dispatch('greetingPlay', {
                type: 'busy',
                id: context.state.busyGreetingId,
                format
            })
        },
        async busyGreetingDelete (context) {
            await context.dispatch('greetingDelete', {
                type: 'busy',
                id: context.state.busyGreetingId
            })
        },
        async unavailableGreetingUpload (context, options) {
            await context.dispatch('greetingUpload', {
                type: 'unavailable',
                greeting: 'unavail',
                file: options.file,
                subscriberId: options.subscriberId
            })
        },
        async unavailableGreetingUploadAbort (context) {
            await context.dispatch('greetingUploadAbort', 'unavail')
        },
        async unavailableGreetingPlay (context, format) {
            await context.dispatch('greetingPlay', {
                type: 'unavailable',
                id: context.state.unavailableGreetingId,
                format
            })
        },
        async unavailableGreetingDelete (context) {
            await context.dispatch('greetingDelete', {
                type: 'unavailable',
                id: context.state.unavailableGreetingId
            })
        },
        async tempGreetingUpload (context, options) {
            await context.dispatch('greetingUpload', {
                type: 'temp',
                greeting: 'temp',
                file: options.file,
                subscriberId: options.subscriberId
            })
        },
        async tempGreetingUploadAbort (context) {
            await context.dispatch('greetingUploadAbort', 'temp')
        },
        async tempGreetingPlay (context, format) {
            await context.dispatch('greetingPlay', {
                type: 'temp',
                id: context.state.tempGreetingId,
                format
            })
        },
        async tempGreetingDelete (context) {
            await context.dispatch('greetingDelete', {
                type: 'temp',
                id: context.state.tempGreetingId
            })
        },
        async greetGreetingUpload (context, options) {
            await context.dispatch('greetingUpload', {
                type: 'greet',
                greeting: 'greet',
                file: options.file,
                subscriberId: options.subscriberId
            })
        },
        async greetGreetingUploadAbort (context) {
            await context.dispatch('greetingUploadAbort', 'greet')
        },
        async greetGreetingPlay (context, format) {
            await context.dispatch('greetingPlay', {
                type: 'greet',
                id: context.state.greetGreetingId,
                format
            })
        },
        async greetGreetingDelete (context) {
            await context.dispatch('greetingDelete', {
                type: 'greet',
                id: context.state.greetGreetingId
            })
        }
    }
}
