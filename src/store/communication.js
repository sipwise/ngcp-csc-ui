
import { RequestState } from './common'
import { createFax } from '../api/communication'
import {
	i18n
} from 'src/boot/i18n'

export default {
	namespaced: true,
	state: {
		createFaxState: RequestState.button,
		createFaxError: null
	},
	getters: {
		subscriberId (state, getters, rootState, rootGetters) {
			return parseInt(rootGetters['user/getSubscriberId'])
		},
		createFaxState (state) {
			return state.createFaxState
		},
		createFaxError (state) {
			return state.createFaxError ||
                i18n.t('communication.createFaxErrorMessage')
		}
	},
	mutations: {
		createFaxRequesting (state) {
			state.createFaxState = RequestState.requesting
			state.createFaxError = null
		},
		createFaxSucceeded (state) {
			state.createFaxState = RequestState.succeeded
			state.createFaxError = null
		},
		createFaxFailed (state, error) {
			state.createFaxState = RequestState.failed
			state.createFaxError = error
		}
	},
	actions: {
		createFax (context, $options) {
			const options = Object.assign($options, {
				subscriber_id: context.getters.subscriberId
			})
			context.commit('createFaxRequesting')
			createFax(options).then(() => {
				context.commit('createFaxSucceeded')
			}).catch((err) => {
				context.commit('createFaxFailed', err.message)
			})
		}
	}
}
