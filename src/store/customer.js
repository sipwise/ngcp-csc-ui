import {
    getCustomerPreference,
    setCustomerPreference
} from 'src/api/subscriber'
import { RequestState } from 'src/store/common'

export default {
    namespaced: true,
    state: {
        customerPreferences: null,
        customerPreferencesLoadingState: RequestState.initiated,
        customerPreferencesError: null,
        customerPreferencesSelected: null
    },
    getters: {
        ignoreMembers (state) {
            return state.ignoreMembers
        }
    },
    mutations: {
        customerPreferencesLoading (state) {
            state.customerPreferencesLoadingState = RequestState.requesting
            state.customerPreferencesError = null
        },
        customerPreferencesLoaded (state, customerPreferences) {
            state.customerPreferencesLoadingState = RequestState.succeeded
            state.customerPreferences = customerPreferences
        },
        customerPreferencesLoadingFailed (state, error) {
            state.customerPreferencesLoadingState = RequestState.failed
            state.customerPreferencesError = error
        },
        customerPreferencesUpdateLoaded (state, customerPreferences) {
            state.customerPreferencesLoadingState = RequestState.succeeded
            state.customerPreferences = customerPreferences
        },
        expandCustomerPreferences (state) {
            state.customerPreferencesSelected = state.customerPreferences
        }
    },
    actions: {
        async loadCustomerPreferences (context, customerId) {
            context.commit('customerPreferencesLoading')
            try {
                const customerPreferences = await getCustomerPreference(customerId)
                context.commit('customerPreferencesLoaded', customerPreferences)
            } catch (err) {
                context.commit('customerPreferencesLoadingFailed', err.message)
            }
        },
        updateIgnoreMembers (context, options) {
            setCustomerPreference(options.customerId, options.ignore_cf, 'ignore_cf_when_hunting').then((customerPreference) => {
                context.commit('customerPreferencesUpdateLoaded', customerPreference)
            }).catch((err) => {
                context.commit('customerPreferencesLoadingFailed', err.message)
            })
        },
        updateBlockInMode (context, options) {
            setCustomerPreference(options.customerId, options.block_in_mode, 'block_in_mode').then((customerPreference) => {
                context.commit('customerPreferencesUpdateLoaded', customerPreference)
            }).catch((err) => {
                context.commit('customerPreferencesLoadingFailed', err.message)
            })
        },
        updateBlockInClir (context, options) {
            setCustomerPreference(options.customerId, options.block_in_clir, 'block_in_clir').then((customerPreference) => {
                context.commit('customerPreferencesUpdateLoaded', customerPreference)
            }).catch((err) => {
                context.commit('customerPreferencesLoadingFailed', err.message)
            })
        },
        updateBlockOutMode (context, options) {
            setCustomerPreference(options.customerId, options.block_out_mode, 'block_out_mode').then((customerPreference) => {
                context.commit('customerPreferencesUpdateLoaded', customerPreference)
            }).catch((err) => {
                context.commit('customerPreferencesLoadingFailed', err.message)
            })
        },
        updateBlockInList (context, options) {
            setCustomerPreference(options.customerId, options.block_in_list, 'block_in_list').then((customerPreference) => {
                context.commit('customerPreferencesUpdateLoaded', customerPreference)
            }).catch((err) => {
                context.commit('customerPreferencesLoadingFailed', err.message)
            })
        },
        updateBlockOutList (context, options) {
            setCustomerPreference(options.customerId, options.block_out_list, 'block_out_list').then((customerPreference) => {
                context.commit('customerPreferencesUpdateLoaded', customerPreference)
            }).catch((err) => {
                context.commit('customerPreferencesLoadingFailed', err.message)
            })
        },
        updateBlockOutOverridePin (context, options) {
            setCustomerPreference(options.customerId, options.block_out_override_pin, 'block_out_override_pin').then((customerPreference) => {
                context.commit('customerPreferencesUpdateLoaded', customerPreference)
            }).catch((err) => {
                context.commit('customerPreferencesLoadingFailed', err.message)
            })
        },
        updatePlayAnnounceBeforeCallSetup (context, options) {
            setCustomerPreference(options.customerId, options.play_announce_before_call_setup, 'play_announce_before_call_setup').then((customerPreference) => {
                context.commit('customerPreferencesUpdateLoaded', customerPreference)
            }).catch((err) => {
                context.commit('customerPreferencesLoadingFailed', err.message)
            })
        },
        updatePlayAnnounceToCallee (context, options) {
            setCustomerPreference(options.customerId, options.play_announce_to_callee, 'play_announce_to_callee').then((customerPreference) => {
                context.commit('customerPreferencesUpdateLoaded', customerPreference)
            }).catch((err) => {
                context.commit('customerPreferencesLoadingFailed', err.message)
            })
        }
    }
}
