import {
    addCustomerPreference,
    getCustomerPreference,
    removeCustomerPreference,
    setCustomerPreference
} from 'src/api/subscriber'
import { RequestState } from 'src/store/common'

async function updateBooleanPreference (context, { customerId, key, value }) {
    await savePreference(context, () => {
        const preferences = Object.keys(context.state.customerPreferences ?? [])
        if (preferences.includes(key)) {
            return value
                ? setCustomerPreference(customerId, key, value)
                : removeCustomerPreference(customerId, key)
        }

        return addCustomerPreference(customerId, key, value)
    })
}

async function savePreference (context, apiFn) {
    try {
        const result = await apiFn()
        context.commit('customerPreferencesUpdateLoaded', result)
    } catch (err) {
        context.commit('customerPreferencesLoadingFailed', err.message)
    }
}

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
            return state.customerPreferences?.ignore_members_when_hunting
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
        loadCustomerPreferences (context, customerId) {
            return new Promise((resolve, reject) => {
                context.commit('customerPreferencesLoading')
                getCustomerPreference(customerId).then((customerPreferences) => {
                    context.commit('customerPreferencesLoaded', customerPreferences)
                    resolve()
                }).catch((err) => {
                    reject(err)
                    context.commit('customerPreferencesLoadingFailed', err.message)
                })
            })
        },
        async updateIgnoreMembers (context, data) {
            return updateBooleanPreference(context, {
                customerId: data.customerId,
                key: 'ignore_cf_when_hunting',
                value: data.ignore_cf_when_hunting
            })
        },
        async updateBlockInMode (context, data) {
            return updateBooleanPreference(context, {
                customerId: data.customerId,
                key: 'block_in_mode',
                value: data.block_in_mode
            })
        },
        async updateBlockInClir (context, data) {
            return updateBooleanPreference(context, {
                customerId: data.customerId,
                key: 'block_in_clir',
                value: data.block_in_clir
            })
        },
        async updateBlockOutMode (context, data) {
            return updateBooleanPreference(context, {
                customerId: data.customerId,
                key: 'block_out_mode',
                value: data.block_out_mode
            })
        },
        async updateBlockInList (context, data) {
            await savePreference(context, () => {
                if (!Array.isArray(data.block_in_list) || !data.block_in_list.length) {
                    return removeCustomerPreference(data.customerId, 'block_in_list')
                }

                const preferences = Object.keys(context.state.customerPreferences ?? [])
                if (preferences.includes('block_in_list')) {
                    return setCustomerPreference(data.customerId, 'block_in_list', data.block_in_list)
                }

                return addCustomerPreference(data.customerId, 'block_in_list', data.block_in_list)
            })
        },
        async updateBlockOutList (context, data) {
            await savePreference(context, () => {
                if (!Array.isArray(data.block_out_list) || !data.block_out_list.length) {
                    return removeCustomerPreference(data.customerId, 'block_out_list')
                }

                const preferences = Object.keys(context.state.customerPreferences ?? [])
                if (preferences.includes('block_out_list')) {
                    return setCustomerPreference(data.customerId, 'block_out_list', data.block_out_list)
                }

                return addCustomerPreference(data.customerId, 'block_out_list', data.block_out_list)
            })
        },
        async updateBlockOutOverridePin (context, data) {
            await savePreference(context, () => {
                if (!data.block_out_override_pin?.trim()) {
                    return removeCustomerPreference(data.customerId, 'block_out_override_pin')
                }

                const preferences = Object.keys(context.state.customerPreferences ?? [])
                if (preferences.includes('block_out_override_pin')) {
                    return setCustomerPreference(data.customerId, 'block_out_override_pin', data.block_out_override_pin)
                }

                return addCustomerPreference(data.customerId, 'block_out_override_pin', data.block_out_override_pin)
            })
        },
        async updatePlayAnnounceBeforeCallSetup (context, data) {
            return updateBooleanPreference(context, {
                customerId: data.customerId,
                key: 'play_announce_before_call_setup',
                value: data.play_announce_before_call_setup
            })
        },
        async updatePlayAnnounceToCallee (context, data) {
            return updateBooleanPreference(context, {
                customerId: data.customerId,
                key: 'play_announce_to_callee',
                value: data.play_announce_to_callee
            })
        }
    }
}
