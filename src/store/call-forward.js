
import _ from 'lodash'
import {
	RequestState
} from './common'
import {
	getSourcesets,
	getDestinationsets,
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
	createSourcesetWithSource,
	appendSourceToSourceset,
	deleteSourcesetById,
	deleteSourceFromSourcesetByIndex,
	flipCfuAndCft,
	getOwnPhoneTimeout,
	updateOwnPhoneTimeout
} from '../api/call-forward'
import {
	i18n
} from 'src/boot/i18n'
import { getSubscriberId } from 'src/auth'

export default {
	namespaced: true,
	state: {
		mappings: null,
		sourcesets: [],
		sourceset: [],
		timesets: null,
		destinationsets: null,
		destinations: [],
		loadDestinationState: RequestState.initial,
		loadDestinationError: null,
		removeDestinationState: RequestState.initial,
		removeDestinationError: null,
		lastRemovedDestination: null,
		addDestinationState: RequestState.initial,
		addDestinationError: null,
		lastAddedDestination: null,
		changeDestinationState: RequestState.initial,
		changeDestinationError: null,
		removeTimeState: RequestState.initial,
		removeTimeError: null,
		lastRemovedDay: null,
		resetTimeState: RequestState.initial,
		resetTimeError: null,
		addTimeState: RequestState.initial,
		addTimeError: null,
		addSourcesetState: RequestState.initial,
		addSourcesetError: null,
		removeSourcesetState: RequestState.initial,
		removeSourcesetError: null,
		lastRemovedSourceset: null,
		lastAddedSourceset: null,
		addSourceState: RequestState.initial,
		addSourceError: null,
		lastAddedSource: null,
		removeSourceState: RequestState.initial,
		removeSourceError: null,
		lastRemovedSource: null,
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
		activeTimeForm: false,
		addSourceFormEnabled: false,
		timesetTimesLoaded: false,
		updateOwnPhoneToggleState: RequestState.initial,
		updateOwnPhoneToggleError: null,
		lastOwnPhoneToggle: null,
		lastOwnPhoneTimeout: null,
		ownPhoneTimeout: null,
		updateOwnPhoneTimeoutState: RequestState.initial,
		updateOwnPhoneTimeoutError: null
	},
	getters: {
		hasFaxCapability (state, getters, rootState, rootGetters) {
			return rootGetters['user/hasFaxCapability']
		},
		subscriberId (state, getters, rootState, rootGetters) {
			return rootGetters['user/getSubscriberId']
		},
		getForm (state) {
			return state.form
		},
		getFormType (state) {
			return state.formType
		},
		getGroupName (state) {
			return state.groupName
		},
		getDestinationsetId (state) {
			return state.destinationsetId
		},
		getTimesetId (state) {
			return state.timesetId
		},
		getTimesetTimes (state) {
			return state.timesetTimes
		},
		getTimesetTimesLength (state) {
			return state.timesetTimes.length
		},
		addTimeError (state) {
			return state.addTimeError ||
                i18n.t('pages.callForward.times.addTimeErrorMessage')
		},
		resetTimeError (state) {
			return state.resetTimeError ||
                i18n.t('pages.callForward.times.resetErrorMessage')
		},
		showDefinedAlert (state) {
			return !state.timesetExists && !state.activeTimeForm
		},
		destinationsLoaded (state) {
			return state.destinations.length > 0
		},
		showTimesAndDestinations (state) {
			return state.timesetIsCompatible &&
                !state.timesetHasReverse &&
                !state.timesetHasDuplicate &&
                state.timesetExists
		},
		loadDestinationError (state) {
			return state.loadDestinationError ||
                i18n.t('pages.callForward.times.loadDestinationErrorMessage')
		},
		addSourcesetError (state) {
			return state.addSourcesetError ||
                i18n.t('pages.callForward.sources.addSourcesetErrorMessage')
		},
		addSourceError (state) {
			return state.addSourceError ||
                i18n.t('pages.callForward.sources.addSourceErrorMessage')
		},
		addSourceState (state) {
			return state.addSourceState
		},
		lastAddedSource (state) {
			return state.lastAddedSource
		},
		addSourceFormEnabled (state) {
			return state.addSourceFormEnabled
		},
		removeSourcesetState (state) {
			return state.removeSourcesetState
		},
		removeSourcesetError (state) {
			return state.removeSourcesetError ||
                i18n.t('pages.callForward.sources.removeSourcesetErrorMessage')
		},
		lastRemovedSourceset (state) {
			return state.lastRemovedSourceset
		},
		removeSourceState (state) {
			return state.removeSourceState
		},
		removeSourceError (state) {
			return state.removeSourceError ||
                i18n.t('pages.callForward.sources.removeSourceErrorMessage')
		},
		lastRemovedSource (state) {
			return state.lastRemovedSource
		},
		timesetTimesLoaded (state) {
			return state.timesetTimesLoaded
		},
		destinations (state) {
			return state.destinations
		},
		timesetTimes (state) {
			return state.timesetTimes
		},
		resetTimeState (state) {
			return state.resetTimeState
		},
		addTimeState (state) {
			return state.addTimeState
		},
		timesetHasDuplicate (state) {
			return state.timesetHasDuplicate
		},
		timesetIsCompatible (state) {
			return state.timesetIsCompatible
		},
		timesetHasReverse (state) {
			return state.timesetHasReverse
		},
		timesetExists (state) {
			return state.timesetExists
		},
		activeTimeForm (state) {
			return state.activeTimeForm
		},
		sourcesets (state) {
			return state.sourcesets
		},
		loadDestinationState (state) {
			return state.loadDestinationState
		},
		addSourcesetState (state) {
			return state.addSourcesetState
		},
		lastAddedSourceset (state) {
			return state.lastAddedSourceset
		},
		updateOwnPhoneToggleState (state) {
			return state.updateOwnPhoneToggleState
		},
		updateOwnPhoneToggleError (state) {
			return state.updateOwnPhoneToggleError ||
                i18n.t('pages.callForward.updateOwnPhoneToggleErrorMessage')
		},
		isUpdating (state) {
			return state.updateOwnPhoneToggleState === RequestState.requesting
		},
		ownPhoneTimeout (state) {
			return state.ownPhoneTimeout
		},
		lastOwnPhoneToggle (state) {
			return state.lastOwnPhoneToggle
		},
		updateOwnPhoneTimeoutState (state) {
			return state.updateOwnPhoneTimeoutState
		},
		updateOwnPhoneTimeoutError (state) {
			return state.updateOwnPhoneTimeoutError ||
                i18n.t('pages.callForward.updateOwnPhoneTimeoutErrorMessage')
		},
		lastOwnPhoneTimeout (state) {
			return state.lastOwnPhoneTimeout
		},
		addDestinationError (state) {
			return state.addDestinationError || i18n.t('pages.callForward.addErrorMessage')
		},
		removeTimeError (state) {
			return state.removeTimeError || i18n.t('pages.callForward.times.removeErrorMessage')
		}
	},
	mutations: {
		loadSourcesets (state, result) {
			state.sourcesets = result
		},
		loadDestinations (state, result) {
			state.destinations = result
		},
		setActiveForm (state, value) {
			state.activeForm = value
		},
		setFormType (state, value) {
			state.formType = value
		},
		setDestinationsetId (state, value) {
			state.destinationsetId = value
		},
		setGroupName (state, value) {
			state.groupName = value
		},
		setPriority (state, value) {
			state.form.priority = value
		},
		setLastAddedDestination (state, value) {
			state.lastAddedDestination = value
		},
		setLastRemovedDestination (state, value) {
			state.lastRemovedDestination = value
		},
		resetFormState (state) {
			state.form = {
				announcement_id: null,
				destination: '',
				priority: 1,
				timeout: ''
			}
		},
		resetDestinationState (state) {
			state.activeForm = ''
			state.formType = ''
			state.destinationsetId = ''
			state.groupName = ''
			state.addDestinationState = RequestState.initial
			state.changeDestinationState = RequestState.initial
			state.removeDestinationState = RequestState.initial
		},
		addDestinationRequesting (state) {
			state.addDestinationState = RequestState.requesting
			state.addDestinationError = null
		},
		addDestinationSucceeded (state) {
			state.addDestinationState = RequestState.succeeded
			state.addDestinationError = null
		},
		addDestinationFailed (state, error) {
			state.addDestinationState = RequestState.failed
			state.addDestinationError = error
		},
		changeDestinationRequesting (state) {
			state.changeDestinationState = RequestState.requesting
			state.changeDestinationError = null
		},
		changeDestinationSucceeded (state) {
			state.changeDestinationState = RequestState.succeeded
			state.changeDestinationError = null
		},
		changeDestinationFailed (state, error) {
			state.changeDestinationState = RequestState.failed
			state.changeDestinationError = error
		},
		removeDestinationRequesting (state) {
			state.removeDestinationState = RequestState.requesting
			state.removeDestinationError = null
		},
		removeDestinationSucceeded (state) {
			state.removeDestinationState = RequestState.succeeded
			state.removeDestinationError = null
		},
		removeDestinationFailed (state, error) {
			state.removeDestinationState = RequestState.failed
			state.removeDestinationError = error
		},
		removeTimeRequesting (state) {
			state.removeTimeState = RequestState.requesting
			state.removeTimeError = null
		},
		removeTimeSucceeded (state, updatedTimeset) {
			state.removeTimeState = RequestState.succeeded
			state.removeTimeError = null
		},
		removeTimeFailed (state, error) {
			state.removeTimeState = RequestState.failed
			state.removeTimeError = error
		},
		setLastRemovedDay (state, value) {
			state.lastRemovedDay = value
		},
		loadTimesSucceeded (state, result) {
			state.timesetTimesLoaded = true
			state.timesetTimes = result.times
			state.timesetIsCompatible = result.timesetIsCompatible
			state.timesetExists = result.timesetExists
			state.timesetHasReverse = result.timesetHasReverse
			state.timesetHasDuplicate = result.timesetHasDuplicate
			state.timesetId = result.timesetId
		},
		resetTimeRequesting (state) {
			state.resetTimeState = RequestState.requesting
			state.resetTimeError = null
		},
		resetTimeSucceeded (state) {
			state.resetTimeState = RequestState.succeeded
			state.resetTimeError = null
		},
		resetTimeFailed (state, error) {
			state.resetTimeState = RequestState.failed
			state.resetTimeError = error
		},
		addTimeRequesting (state) {
			state.addTimeState = RequestState.requesting
			state.addTimeError = null
		},
		addTimeSucceeded (state) {
			state.addTimeState = RequestState.succeeded
			state.addTimeError = null
		},
		addTimeFailed (state, error) {
			state.addTimeState = RequestState.failed
			state.addTimeError = error
		},
		setActiveTimeForm (state, value) {
			state.activeTimeForm = value
		},
		resetAddTimeState (state) {
			state.addTimeState = RequestState.initial
		},
		resetTimesetState (state) {
			state.timesetIsCompatible = true
			state.timesetExists = true
			state.timesetHasReverse = false
			state.timesetHasDuplicate = false
			state.activeTimeForm = false
			state.addTimeState = RequestState.initial
			state.timesetTimesLoaded = false
		},
		setSourceset (state, result) {
			state.sourceset = result
		},
		loadDestinationRequesting (state) {
			state.loadDestinationState = RequestState.requesting
			state.loadDestinationError = null
		},
		loadDestinationSucceeded (state) {
			state.loadDestinationState = RequestState.succeeded
			state.loadDestinationError = null
		},
		loadDestinationFailed (state, error) {
			state.loadDestinationState = RequestState.failed
			state.loadDestinationError = error
		},
		addSourcesetRequesting (state) {
			state.addSourcesetState = RequestState.requesting
			state.addSourcesetError = null
		},
		addSourcesetSucceeded (state) {
			state.addSourcesetState = RequestState.succeeded
			state.addSourcesetError = null
		},
		addSourcesetFailed (state, error) {
			state.addSourcesetState = RequestState.failed
			state.addSourcesetError = error
		},
		setLastAddedSourceset (state, value) {
			state.lastAddedSourceset = value
		},
		addSourceRequesting (state) {
			state.addSourceState = RequestState.requesting
			state.addSourceError = null
		},
		addSourceSucceeded (state) {
			state.addSourceState = RequestState.succeeded
			state.addSourceError = null
		},
		addSourceFailed (state, error) {
			state.addSourceState = RequestState.failed
			state.addSourceError = error
		},
		setLastAddedSource (state, value) {
			state.lastAddedSource = value
		},
		setAddSourceFormEnabled (state, value) {
			state.addSourceFormEnabled = value
		},
		removeSourcesetRequesting (state) {
			state.removeSourcesetState = RequestState.requesting
			state.removeSourcesetError = null
		},
		removeSourcesetSucceeded (state) {
			state.removeSourcesetState = RequestState.succeeded
			state.removeSourcesetError = null
		},
		removeSourcesetFailed (state, error) {
			state.removeSourcesetState = RequestState.failed
			state.removeSourcesetError = error
		},
		setLastRemovedSourceset (state, value) {
			state.lastRemovedSourceset = value
		},
		removeSourceRequesting (state) {
			state.removeSourceState = RequestState.requesting
			state.removeSourceError = null
		},
		removeSourceSucceeded (state) {
			state.removeSourceState = RequestState.succeeded
			state.removeSourceError = null
		},
		removeSourceFailed (state, error) {
			state.removeSourceState = RequestState.failed
			state.removeSourceError = error
		},
		setLastRemovedSource (state, value) {
			state.lastRemovedSource = value
		},
		updateOwnPhoneRequesting (state) {
			state.updateOwnPhoneToggleState = RequestState.requesting
			state.updateOwnPhoneToggleError = null
		},
		updateOwnPhoneSucceeded (state, type) {
			const toggle = type === 'cft'
				? i18n.t('pages.callForward.enabled')
				: i18n.t('pages.callForward.disabled')
			state.lastOwnPhoneToggle = toggle
			state.updateOwnPhoneToggleState = RequestState.succeeded
			state.updateOwnPhoneToggleError = null
		},
		updateOwnPhoneFailed (state, error) {
			state.updateOwnPhoneToggleState = RequestState.failed
			state.updateOwnPhoneToggleError = error
		},
		loadOwnPhoneTimeout (state, value) {
			state.ownPhoneTimeout = value
		},
		updateOwnPhoneTimeoutRequesting (state) {
			state.updateOwnPhoneTimeoutState = RequestState.requesting
			state.updateOwnPhoneTimeoutError = null
		},
		updateOwnPhoneTimeoutSucceeded (state, timeout) {
			state.lastOwnPhoneTimeout = timeout
			state.updateOwnPhoneTimeoutState = RequestState.succeeded
			state.updateOwnPhoneTimeoutError = null
		},
		updateOwnPhoneTimeoutFailed (state, error) {
			state.updateOwnPhoneTimeoutState = RequestState.failed
			state.updateOwnPhoneTimeoutError = error
		}
	},
	actions: {
		loadSourcesets (context) {
			return new Promise((resolve, reject) => {
				getSourcesets(getSubscriberId())
					.then(result => {
						context.commit('loadSourcesets', result)
					}).catch(err => {
						reject(err)
					})
			})
		},
		loadDestinationsets (context) {
			return new Promise((resolve, reject) => {
				getDestinationsets(getSubscriberId())
					.then(result => {
						context.commit('loadDestinationsets', result)
					}).catch(err => {
						reject(err)
					})
			})
		},
		deleteDestinationFromDestinationset (context, options) {
			const removedDestination = options.removeDestination
			context.commit('removeDestinationRequesting')
			return new Promise(() => {
				deleteDestinationFromDestinationset(options)
					.then(() => {
						context.commit('setLastRemovedDestination', removedDestination)
						context.commit('removeDestinationSucceeded')
						context.dispatch('loadDestinations', {
							timeset: options.timeset
						})
					}).catch((err) => {
						context.commit('removeDestinationFailed', err.message)
					})
			})
		},
		addDestinationToDestinationset (context, options) {
			return new Promise((resolve, reject) => {
				addDestinationToDestinationset(options)
					.then((result) => {
						resolve(result)
					}).catch((err) => {
						reject(err)
					})
			})
		},
		addDestination (context, options) {
			const form = _.clone(context.getters.getForm)
			let updatedOptions = null
			const type = context.getters.getFormType
			let timeset = null
			if (options.timeset === 'Company Hours' ||
                options.timeset === 'After Hours') {
				timeset = context.getters.getTimesetId
			}
			context.commit('addDestinationRequesting')
			if (type !== 'number') {
				delete form.timeout
				form.destination = type
			} else {
				form.timeout = options.form.timeout
				form.destination = options.form.destination
			}
			updatedOptions = {
				subscriberId: context.getters.subscriberId,
				data: form,
				groupName: context.getters.getGroupName,
				id: context.getters.getDestinationsetId,
				timesetId: timeset,
				sourcesetId: options.sourcesetId
			}
			if (options.destinations) {
				return new Promise(() => {
					addDestinationToExistingGroup(updatedOptions).then(() => {
						context.commit('setLastAddedDestination', options.form.destination)
						context.commit('addDestinationSucceeded')
						context.dispatch('loadDestinations', {
							timeset: options.timeset
						})
					}).catch((err) => {
						context.commit('addDestinationFailed', err.message)
					})
				})
			} else {
				return new Promise(() => {
					addDestinationToEmptyGroup(updatedOptions).then(() => {
						context.commit('setLastAddedDestination', options.form.destination)
						context.commit('addDestinationSucceeded')
						context.dispatch('loadDestinations', {
							timeset: options.timeset
						})
					}).catch((err) => {
						context.commit('addDestinationFailed', err.message)
					})
				})
			}
		},
		changePositionOfDestination (context, options) {
			const clonedDestinations = _.cloneDeep(options.destinations)
			const clonedDestination = _.clone(options.destinations[options.index])
			const lastIndex = clonedDestinations.length < 1
				? 0 : clonedDestinations.length - 1
			context.commit('changeDestinationRequesting')
			if (options.direction === 'up' && options.prevId && options.index === 0) {
				return new Promise(() => {
					moveDestinationUp({
						prevId: options.prevId,
						id: options.id,
						destination: clonedDestination
					}).then(() => {
						context.commit('changeDestinationSucceeded')
						context.dispatch('loadDestinations', {
							timeset: options.timeset
						})
					}).catch((err) => {
						context.commit('changeDestinationFailed', err.message)
					})
				})
			} else if (options.direction === 'down' && options.nextId && options.index === lastIndex) {
				return new Promise(() => {
					moveDestinationDown({
						nextId: options.nextId,
						id: options.id,
						destination: clonedDestination
					}).then(() => {
						context.commit('changeDestinationSucceeded')
						context.dispatch('loadDestinations', {
							timeset: options.timeset
						})
					}).catch((err) => {
						context.commit('changeDestinationFailed', err.message)
					})
				})
			} else {
				const adjacentDestination = options.direction === 'up'
					? options.destinations[options.index - 1]
					: options.destinations[options.index + 1]
				const adjacentPriority = adjacentDestination
					? adjacentDestination.priority : 1
				const adjacentIndex = options.direction === 'up'
					? options.index - 1
					: options.index + 1
				clonedDestinations.splice(options.index, 1)
				clonedDestinations.splice(adjacentIndex, 0, clonedDestination)
				clonedDestinations[adjacentIndex].priority = adjacentPriority
				return new Promise(() => {
					changePositionOfDestination({
						destinations: clonedDestinations,
						id: options.id,
						subscriberId: context.getters.subscriberId
					}).then(() => {
						context.commit('changeDestinationSucceeded')
						context.dispatch('loadDestinations', {
							timeset: options.timeset
						})
					}).catch((err) => {
						context.commit('changeDestinationFailed', err.message)
					})
				})
			}
		},
		loadTimesetTimes (context, options) {
			loadTimesetTimes({
				timeset: options.timeset,
				subscriberId: context.getters.subscriberId
			}).then((result) => {
				context.commit('loadTimesSucceeded', result)
			})
		},
		async appendTimeToTimeset (context, options) {
			try {
				context.commit('addTimeRequesting')
				const fromParts = options.time[0].from.split(':')
				const toParts = options.time[0].to.split(':')
				const updatedTimes = await appendTimeToTimeset({
					timesetId: context.getters.getTimesetId,
					time: {
						minute: fromParts[1] + '-' + toParts[1],
						hour: fromParts[0] + '-' + toParts[0],
						wday: options.weekday
					}
				})
				context.commit('addTimeSucceeded')
				context.commit('loadTimesSucceeded', updatedTimes)
			} catch (err) {
				console.log(err)
				context.commit('addTimeFailed', err.message)
			}
		},
		async deleteTimeFromTimeset (context, options) {
			context.commit('removeTimeRequesting')
			try {
				const updatedTimes = await deleteTimeFromTimeset({
					timesetId: context.getters.getTimesetId,
					timeId: options.index
				})
				context.commit('removeTimeSucceeded')
				context.commit('loadTimesSucceeded', updatedTimes)
			} catch (err) {
				context.commit('removeTimeFailed', err.message)
			}
		},
		deleteTimesetById (context) {
			context.commit('removeTimeRequesting')
			deleteTimesetById(context.getters.getTimesetId).then(() => {
				context.commit('resetAddTimeState')
				context.commit('setActiveTimeForm', false)
				context.commit('removeTimeSucceeded')
			}).catch((err) => {
				context.commit('removeTimeFailed', err.message)
			})
		},
		resetTimesetByName (context, name) {
			context.commit('resetTimeRequesting')
			resetTimesetByName({
				id: context.getters.subscriberId,
				name: name
			}).then(() => {
				context.commit('resetTimesetState')
				context.commit('resetTimeSucceeded')
			}).catch((err) => {
				context.commit('resetTimeFailed', err.message)
			})
		},
		createTimesetWithTime (context, options) {
			context.commit('addTimeRequesting')
			createTimesetWithTime({
				time: options.time,
				weekday: options.weekday,
				name: options.name,
				subscriberId: context.getters.subscriberId
			}).then(() => {
				context.commit('addTimeSucceeded')
			}).catch((err) => {
				context.commit('addTimeFailed', err.message)
			})
		},
		loadDestinations (context, options) {
			context.commit('loadDestinationRequesting')
			loadDestinations({
				timeset: options.timeset,
				subscriberId: context.getters.subscriberId
			}).then((result) => {
				context.commit('loadDestinations', result)
				context.commit('loadDestinationSucceeded')
			}).catch((err) => {
				context.commit('loadDestinationFailed', err.message)
			})
		},
		createSourcesetWithSource (context, options) {
			context.commit('addSourcesetRequesting')
			createSourcesetWithSource({
				sourcesetName: options.sourcesetName,
				source: options.source,
				subscriberId: context.getters.subscriberId,
				mode: options.mode
			}).then(() => {
				context.commit('setLastAddedSourceset', options.sourcesetName)
				context.commit('addSourcesetSucceeded')
				context.dispatch('loadSourcesets')
				context.dispatch('loadDestinations', {
					timeset: options.timeset
				})
			}).catch((err) => {
				context.commit('addSourcesetFailed', err.message)
			})
		},
		appendSourceToSourceset (context, options) {
			context.commit('addSourceRequesting')
			appendSourceToSourceset(options).then(() => {
				context.commit('setLastAddedSource', options.source[0].source)
				context.commit('addSourceSucceeded')
			}).catch((err) => {
				context.commit('addSourceFailed', err.message)
			})
		},
		deleteSourcesetById (context, options) {
			context.commit('removeSourcesetRequesting')
			deleteSourcesetById(options.sourcesetId).then(() => {
				context.commit('setLastRemovedSourceset', options.sourcesetName)
				context.commit('removeSourcesetSucceeded')
			}).catch((err) => {
				context.commit('removeSourcesetFailed', err.message)
			})
		},
		deleteSourceFromSourcesetByIndex (context, options) {
			context.commit('removeSourceRequesting')
			deleteSourceFromSourcesetByIndex(options).then(() => {
				context.commit('setLastRemovedSource', options.sources[options.sourceIndex].source)
				context.commit('removeSourceSucceeded')
			}).catch((err) => {
				context.commit('removeSourceFailed', err.message)
			})
		},
		updateOwnPhone (context, options) {
			const fromType = options.toggle ? 'cfu' : 'cft'
			const toType = !options.toggle ? 'cfu' : 'cft'
			context.commit('updateOwnPhoneRequesting')
			flipCfuAndCft({
				fromType: fromType,
				toType: toType,
				sourcesetId: options.sourcesetId,
				timesetId: options.timesetId,
				subscriberId: context.getters.subscriberId
			}).then(() => {
				return context.dispatch('loadOwnPhoneTimeout')
			}).then(() => {
				context.commit('updateOwnPhoneSucceeded', toType)
				context.dispatch('loadDestinations', {
					timeset: options.timeset
				})
			}).catch((err) => {
				context.commit('updateOwnPhoneFailed', err.message)
			})
		},
		loadOwnPhoneTimeout (context) {
			getOwnPhoneTimeout(context.getters.subscriberId).then((result) => {
				context.commit('loadOwnPhoneTimeout', result)
			})
		},
		updateOwnPhoneTimeout (context, options) {
			context.commit('updateOwnPhoneTimeoutRequesting')
			updateOwnPhoneTimeout({
				subscriberId: context.getters.subscriberId,
				timeout: options.timeout
			}).then(() => {
				return context.dispatch('loadOwnPhoneTimeout')
			}).then(() => {
				context.commit('updateOwnPhoneTimeoutSucceeded', options.timeout)
			}).catch((err) => {
				context.commit('updateOwnPhoneTimeoutFailed', err.message)
			})
		}
	}
}
