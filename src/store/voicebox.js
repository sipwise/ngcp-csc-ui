
import _ from 'lodash'
import {
	RequestState
} from './common'
import {
	getVoiceboxSettings,
	setVoiceboxDelete,
	setVoiceboxAttach,
	setVoiceboxPin,
	setVoiceboxEmail,
	uploadGreeting,
	abortPreviousRequest,
	getVoiceboxGreetingByType,
	deleteVoiceboxGreetingById,
	playGreeting
} from '../api/voicebox'
import {
	i18n
} from 'src/boot/i18n'

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

		unavailableGreetingId: null,
		unavailableGreetingUrl: null,
		unavailableGreetingLoadState: RequestState.initiated,
		unavailableGreetingUploadState: RequestState.initiated,
		unavailableGreetingUploadError: null,
		unavailableGreetingUploadProgress: 0,
		unavailableGreetingDeletionState: RequestState.initiated,
		unavailableGreetingDeletionError: null
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
				? i18n.t('Attach voicemail to email notification')
				: i18n.t('Attach voicemail to email notification')
		},

		deleteLoading (state, getters) {
			return getters.settingsLoading || state.deleteUpdateState === RequestState.requesting
		},
		deleteLabel (state, getters) {
			return state.deleteValue
				? i18n.t('Delete voicemail after email notification is delivered')
				: i18n.t('Delete voicemail after email notification is delivered')
		},

		busyGreetingUploading (state) {
			return state.busyGreetingUploadState === RequestState.requesting
		},
		busyGreetingFileLoaded (state) {
			return state.busyGreetingLoadState === RequestState.succeeded
		},
		busyGreetingLabel (state) {
			return state.busyGreetingId ? i18n.t('Custom sound')
				: i18n.t('Default sound')
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
			return state.unavailableGreetingId ? i18n.t('Custom sound')
				: i18n.t('Default sound')
		},
		unavailableGreetingDeleting (state) {
			return state.unavailableGreetingDeletionState === RequestState.requesting
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
		busyGreetingPlayFailed (state) {
			state.busyGreetingLoadState = RequestState.failed
			state.busyGreetingUrl = null
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
		unavailableGreetingPlayFailed (state) {
			state.unavailableGreetingLoadState = RequestState.failed
			state.unavailableGreetingUrl = null
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
		}
	},
	actions: {
		async settingsLoadAction (context) {
			context.commit('settingsRequesting')
			const res = await Promise.all([
				getVoiceboxSettings(context.getters.subscriberId),
				getVoiceboxGreetingByType({
					id: context.getters.subscriberId,
					type: 'busy'
				}),
				getVoiceboxGreetingByType({
					id: context.getters.subscriberId,
					type: 'unavail'
				})
			])
			context.commit('settingsSucceeded', {
				settings: res[0],
				busyGreetingId: _.get(res, '1.items.0.id', null),
				unavailableGreetingId: _.get(res, '2.items.0.id', null)
			})
		},
		async updateAction (context, options) {
			try {
				context.commit(options.property + 'UpdateRequesting')
				await setVoiceboxSettings[options.property]({
					subscriberId: context.getters.subscriberId,
					value: options.value
				})
				context.commit('settingsSucceeded', {
					settings: await getVoiceboxSettings(context.getters.subscriberId)
				})
				context.commit(options.property + 'UpdateSucceeded')
			} catch (err) {
				context.commit(options.property + 'UpdateFailed', err.message)
			}
		},
		async pinUpdateAction (context, pin) {
			await context.dispatch('updateAction', {
				property: 'pin',
				value: pin
			})
		},
		async emailUpdateAction (context, email) {
			await context.dispatch('updateAction', {
				property: 'email',
				value: email
			})
		},
		async attachToggleAction (context, attachValue) {
			await context.dispatch('updateAction', {
				property: 'attach',
				value: attachValue
			})
		},
		async deleteToggleAction (context, deleteValue) {
			await context.dispatch('updateAction', {
				property: 'delete',
				value: deleteValue
			})
		},
		async greetingUpload (context, options) {
			try {
				context.commit(options.type + 'GreetingUploadRequesting')
				await uploadGreeting({
					data: {
						subscriber_id: context.getters.subscriberId,
						dir: options.greeting,
						file: options.file
					},
					onProgress: (progress) => {
						context.commit(options.type + 'GreetingUploadProgress', progress)
					}
				})
				const greetings = await getVoiceboxGreetingByType({
					id: context.getters.subscriberId,
					type: options.greeting
				})
				context.commit(options.type + 'GreetingUploadSucceeded', greetings.items[0].id)
			} catch (err) {
				context.commit(options.type + 'GreetingUploadFailed', err.message)
			}
		},
		async greetingUploadAbort (context, greeting) {
			await abortPreviousRequest(greeting)
		},
		async greetingPlay (context, options) {
			try {
				context.commit(options.type + 'GreetingPlayRequesting')
				const greetingUrl = await playGreeting({
					id: options.id,
					format: options.format
				})
				context.commit(options.type + 'GreetingPlaySucceeded', greetingUrl)
			} catch (err) {
				context.commit(options.type + 'GreetingPlayFailed', err.message)
			}
		},
		async greetingDelete (context, options) {
			try {
				context.commit(options.type + 'GreetingDeletionRequesting')
				await deleteVoiceboxGreetingById(options.id)
				context.commit(options.type + 'GreetingDeletionSucceeded')
			} catch (err) {
				context.commit(options.type + 'GreetingDeletionFailed', err.message)
			}
		},
		async busyGreetingUpload (context, file) {
			await context.dispatch('greetingUpload', {
				type: 'busy',
				greeting: 'busy',
				file: file
			})
		},
		async busyGreetingUploadAbort (context) {
			await context.dispatch('greetingUploadAbort', 'busy')
		},
		async busyGreetingPlay (context, format) {
			await context.dispatch('greetingPlay', {
				type: 'busy',
				id: context.state.busyGreetingId,
				format: format
			})
		},
		async busyGreetingDelete (context) {
			await context.dispatch('greetingDelete', {
				type: 'busy',
				id: context.state.busyGreetingId
			})
		},
		async unavailableGreetingUpload (context, file) {
			await context.dispatch('greetingUpload', {
				type: 'unavailable',
				greeting: 'unavail',
				file: file
			})
		},
		async unavailableGreetingUploadAbort (context) {
			await context.dispatch('greetingUploadAbort', 'unavail')
		},
		async unavailableGreetingPlay (context, format) {
			await context.dispatch('greetingPlay', {
				type: 'unavailable',
				id: context.state.unavailableGreetingId,
				format: format
			})
		},
		async unavailableGreetingDelete (context) {
			await context.dispatch('greetingDelete', {
				type: 'unavailable',
				id: context.state.unavailableGreetingId
			})
		}
	}
}
