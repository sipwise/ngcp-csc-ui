import {
    getPreferences,
    getPreferencesDefs,
    removePreference,
    setPreference
} from 'src/api/subscriber'

export default {
    namespaced: true,
    state: {
        subscriberPreferencesInitialized: false,
        subscriberPreferences: {},
        preferencesDefs: {}
    },
    getters: {
        subscriberId (state, getters, rootState, rootGetters) {
            return parseInt(rootGetters['user/getSubscriberId'])
        },
        musicOnHold (state) {
            return state.subscriberPreferences?.music_on_hold
        },
        dnd (state) {
            return state.subscriberPreferences?.dnd
        },
        language (state) {
            return state.subscriberPreferences.language
        },
        defaultLanguage (state, getters) {
            const languages = getters.languages
            return languages && languages.find((lang) => {
                return lang.default_val
            }).label
        },
        languages (state) {
            return state.preferencesDefs.language?.enum_values?.map((lang) => {
                return { value: lang.value, label: lang.label, default_val: lang.default_val }
            })
        }
    },
    mutations: {
        subscriberPreferencesSucceeded (state, res) {
            state.subscriberPreferences = res
            state.subscriberPreferencesInitialized = true
        },
        subscriberPreferencesUpdate (state, { field, value }) {
            state.subscriberPreferences[field] = value
        },
        preferencesDefsSucceeded (state, res) {
            state.preferencesDefs = res
        }
    },
    actions: {
        async loadSubscriberPreferencesAction (context, id) {
            const subscriberId = id || context.getters.subscriberId
            const subscriberPreferences = await getPreferences(subscriberId)
            context.commit('subscriberPreferencesSucceeded', subscriberPreferences)
        },
        async fieldUpdateAction (context, options) {
            await setPreference(context.getters.subscriberId, options.field, options.value)
            context.commit('subscriberPreferencesUpdate', {
                field: options.field,
                value: options.value
            })
        },
        async loadPreferencesDefsAction (context) {
            const preferencesDefs = await getPreferencesDefs()
            context.commit('preferencesDefsSucceeded', preferencesDefs)
        },
        async setMusicOnHold (context, value) {
            await context.dispatch('fieldUpdateAction', { field: 'music_on_hold', value })
        },
        async setDnd (context, value) {
            await context.dispatch('fieldUpdateAction', { field: 'dnd', value })
        },
        async setLanguage (context, options) {
            const subscriberId = options.subscriberId || context.getters.subscriberId
            if (options.language) {
                await setPreference(subscriberId, 'language', options.language)
                context.commit('subscriberPreferencesUpdate', {
                    field: 'language',
                    value: options.language
                })
            } else {
                await removePreference(subscriberId, 'language')
                context.commit('subscriberPreferencesUpdate', {
                    field: 'language',
                    value: null
                })
            }
        }
    }
}
