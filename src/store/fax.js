import _ from 'lodash'
import {
    getFaxServerSettings,
    setFaxServerField,
    getMailToFaxSettings,
    setMailToFaxSettingField
} from '../api/fax'

export default {
    namespaced: true,
    state: {
        faxServerSettingsInitialized: false,
        faxServerSettings: {},

        mailToFaxSettingsInitialized: false,
        mailToFaxSettings: {}
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

            if (_.has(res, 'mailToFaxSettings')) {
                state.mailToFaxSettings = res.mailToFaxSettings
                state.mailToFaxSettingsInitialized = true
            }
        }
    },
    actions: {
        async loadFaxSettingsAction (context, id) {
            const subscriberId = id || context.getters.subscriberId
            const faxServerSettings = await getFaxServerSettings(subscriberId)
            context.commit('settingsSucceeded', {
                faxServerSettings
            })
        },
        async faxServerSettingsUpdateAction (context, options) {
            const subscriberId = options.id || context.getters.subscriberId
            const faxServerSettings = await setFaxServerField({
                subscriberId: subscriberId,
                field: options.field,
                value: options.value
            })
            context.commit('settingsSucceeded', {
                faxServerSettings
            })
            if (!options.fromPbxConfiguration) {
                context.commit('user/updateFaxActiveCapabilityState', faxServerSettings.active, { root: true })
            }
        },

        async loadMailToFaxSettingsAction (context, id) {
            const subscriberId = id || context.getters.subscriberId
            const mailToFaxSettings = await getMailToFaxSettings(subscriberId)
            context.commit('settingsSucceeded', {
                mailToFaxSettings
            })
        },
        async mailToFaxSettingsUpdateAction (context, options) {
            const subscriberId = options.id || context.getters.subscriberId
            const mailToFaxSettings = await setMailToFaxSettingField({
                subscriberId: subscriberId,
                field: options.field,
                value: options.value
            })
            context.commit('settingsSucceeded', {
                mailToFaxSettings
            })
        }
    }
}
