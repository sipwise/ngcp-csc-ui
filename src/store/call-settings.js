import {
	getPreferences,
	setPreference
} from '../api/subscriber'

export default {
	namespaced: true,
	state: {
		subscriberPreferencesInitialized: false,
		subscriberPreferences: {}
	},
	getters: {
		subscriberId (state, getters, rootState, rootGetters) {
			return parseInt(rootGetters['user/getSubscriberId'])
		},
		musicOnHold (state) {
			return state.subscriberPreferences.music_on_hold
		}
	},
	mutations: {
		subscriberPreferencesSucceeded (state, res) {
			state.subscriberPreferences = res
			state.subscriberPreferencesInitialized = true
		},
		subscriberPreferencesUpdate (state, { field, value }) {
			state.subscriberPreferences[field] = value
		}
	},
	actions: {
		async loadSubscriberPreferencesAction (context) {
			const subscriberPreferences = await getPreferences(context.getters.subscriberId)
			context.commit('subscriberPreferencesSucceeded', subscriberPreferences)
		},
		async fieldUpdateAction (context, options) {
			await setPreference(context.getters.subscriberId, options.field, options.value)
			context.commit('subscriberPreferencesUpdate', {
				field: options.field,
				value: options.value
			})
		},
		async setMusicOnHold (context, value) {
			await context.dispatch('fieldUpdateAction', { field: 'music_on_hold', value })
		}
	}
}
