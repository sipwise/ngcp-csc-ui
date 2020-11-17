import _ from 'lodash'
import {
	getFaxServerSettings,
	setFaxServerField
} from '../api/fax'

export default {
	namespaced: true,
	state: {
		faxServerSettingsInitialized: false,
		faxServerSettings: {}
	},
	getters: {
		subscriberId (state, getters, rootState, rootGetters) {
			return parseInt(rootGetters['user/getSubscriberId'])
		}
	},
	mutations: {
		settingsSucceeded (state, res) {
			if (_.has(res, 'faxServerSettings')) {
				state.faxServerSettings = res.faxServerSettings
				state.faxServerSettingsInitialized = true
			}
		}
	},
	actions: {
		async loadFaxSettingsAction (context) {
			const faxServerSettings = await getFaxServerSettings(context.getters.subscriberId)
			context.commit('settingsSucceeded', {
				faxServerSettings
			})
		},
		async fieldUpdateAction (context, options) {
			const faxServerSettings = await setFaxServerField({
				subscriberId: context.getters.subscriberId,
				field: options.field,
				value: options.value
			})
			context.commit('settingsSucceeded', {
				faxServerSettings
			})
			context.commit('user/updateFaxActiveCapabilityState', faxServerSettings.active, { root: true })
		}
	}
}
