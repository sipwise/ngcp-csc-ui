'use strict'
import _ from 'lodash'
import {
    RequestState
} from './common'
import {
    login,
    getUserData,
    createAuthToken,
    changeExpiredPassword,
    getPreLoginPasswordInfo
} from '../api/user'
import {
    changePassword,
    resetPassword,
    recoverPassword,
    getBrandingLogo,
    getSubscriberRegistrations,
    getSubscriberPhonebook,
    getCustomerPhonebook,
    getSubscriberProfile,
    setValueShared,
    setValueName,
    setValueNameCustomer,
    setValueNumberCustomer,
    setValueNumber,
    changeSIPPassword,
    createPhonebook,
    createCustomerPhonebook,
    uploadCsv,
    getNcosLevels,
    getNcosSet,
    getPreferences,
    setPreference,
    generateGeneralPassword
} from '../api/subscriber'
import { deleteJwt, getJwt, getSubscriberId, setJwt, setSubscriberId } from 'src/auth'
import QRCode from 'qrcode'
import {
    qrPayload
} from 'src/helpers/qr'
import { date } from 'quasar'
import { callInitialize } from 'src/api/ngcp-call'
import { setLocal } from 'src/storage'
import { getSipInstanceId } from 'src/helpers/call-utils'
import { PROFILE_ATTRIBUTE_MAP } from 'src/constants'
import {
    httpApi,
    apiDownloadFile
} from 'src/api/common'
import { PATH_CHANGE_PASSWORD } from 'src/router/routes'

export default {
    namespaced: true,
    state: {
        jwt: null,
        subscriberId: null,
        subscriber: null,
        capabilities: null,
        profile: null,
        features: {
            sendFax: true,
            sendSms: false
        },
        loginRequesting: false,
        loginSucceeded: false,
        loginError: null,
        userDataRequesting: false,
        userDataSucceeded: false,
        userDataError: null,
        changePasswordState: RequestState.initiated,
        changePasswordError: null,
        newPasswordRequesting: false,
        logo: null,
        logoRequesting: false,
        logoRequested: false,
        resellerBranding: null,
        defaultBranding: {},
        subscriberRegistrations: [],
        subscriberPhonebook: [],
        customerPhonebook: [],
        phonebookMap: {},
        platformInfo: null,
        qrCode: null,
        qrExpiringTime: null
    },
    getters: {
        isLogged (state) {
            return !_.isEmpty(state.jwt) && !_.isEmpty(state.subscriberId)
        },
        hasUser (state) {
            return state.subscriber !== null
        },
        getUsername (state) {
            if (state.subscriber !== null && !_.isEmpty(state.subscriber.display_name)) {
                return state.subscriber.display_name
            } else if (state.subscriber !== null) {
                return state.subscriber.webusername
            } else {
                return ''
            }
        },
        isAdmin (state) {
            return state.subscriber !== null && state.subscriber.administrative
        },
        isPbxAdmin (state, getters) {
            return getters.isAdmin && state.capabilities !== null && state.capabilities.cloudpbx
        },
        isPbxEnabled (state) {
            return state.capabilities !== null && state.capabilities.cloudpbx
        },
        hasSmsCapability (state) {
            return state.capabilities !== null &&
                state.capabilities.sms === true
        },
        hasSendSmsFeature (state) {
            return state.features.sendSms
        },
        hasSendFaxFeature (state) {
            return state.features.sendFax
        },
        hasFaxCapability (state) {
            return state.capabilities !== null &&
                state.capabilities.faxserver
        },
        hasFaxCapabilityAndFaxActive (state) {
            return state.capabilities !== null &&
                state.capabilities.faxserver &&
                state.capabilities.faxactive
        },
        getSubscriberId (state) {
            return state.subscriberId
        },
        loginRequesting (state, getters) {
            return state.loginRequesting || getters.userDataRequesting
        },
        loginSucceeded (state, getters) {
            return state.loginSucceeded && getters.userDataSucceeded
        },
        loginError (state) {
            return state.loginError
        },
        passwordRequirements (state) {
            return state.platformInfo.security.password
        },
        userDataRequesting (state) {
            return state.userDataRequesting
        },
        userDataSucceeded (state) {
            return state.userDataSucceeded
        },
        jwtTTL (state) {
            const expirationBuffer = 0.05
            try {
                const jwtParts = getJwt().split('.')
                const jwtPayload = JSON.parse(atob(jwtParts[1]))
                if (_.isNumber(jwtPayload.exp)) {
                    const timeDiff = Math.floor((Date.now() / 1000) - jwtPayload.exp)
                    const timeLeft = Math.abs(timeDiff)
                    const timeLeftBuffer = Math.round(timeLeft * expirationBuffer)
                    return timeLeft - timeLeftBuffer
                } else {
                    return null
                }
            } catch (err) {
                return null
            }
        },
        getSubscriber (state) {
            return state.subscriber
        },
        getCustomerId (state) {
            return state.subscriber?.customer_id
        },
        isPasswordChanging (state) {
            return state.changePasswordState === RequestState.requesting
        },
        primaryNumber (state) {
            if (state.subscriber === null) {
                return null
            }
            return state.subscriber.primary_number
        },
        aliasNumbers (state) {
            if (state.subscriber === null) {
                return []
            }
            return state.subscriber.alias_numbers
        },
        isLogoRequesting (state) {
            return state.logoRequesting
        },
        isLogoRequested (state) {
            return state.logoRequested
        },
        hasSubscriberProfileAttribute: (state) => (attribute) => {
            return state.profile ? state.profile.attributes.includes(attribute) : true
        },
        hasSubscriberProfileAttributes: (state) => (attributes) => {
            return state.profile ? state.profile.attributes.some(item => attributes.includes(item)) : true
        },
        isOldCSCProxyingAllowed (state, getters) {
            return getters.isAdmin && state.platformInfo?.csc_v2_mode === 'mixed' && !!getters.getCustomerId
        },
        isLicenseActive: (state) => (license) => {
            return state?.platformInfo.licenses.includes(license)
        },
        isPbxPilot (state) {
            return !!state.subscriber?.is_pbx_pilot
        },
        isPbxGroup (state) {
            return !!state.subscriber?.is_pbx_group
        },
        isPbxSeat (state, getters) {
            return !getters.isPbxPilot && !getters.isPbxGroup && !!state.subscriber?.pbx_extension
        },
        isPbxAttendant (state, getters) {
            return getters.isPbxPilot || getters.isPbxGroup || getters.isPbxSeat
        },
        isSpCe (state) {
            return state.platformInfo.type === 'spce'
        }
    },
    mutations: {
        loginRequesting (state) {
            state.loginRequesting = true
            state.loginSucceeded = false
            state.loginError = null
        },
        loginSucceeded (state, options) {
            state.jwt = options.jwt
            state.subscriberId = options.subscriberId
            state.loginRequesting = false
            state.loginSucceeded = true
            state.loginError = null
        },
        loginFailed (state, error) {
            state.loginRequesting = false
            state.loginSucceeded = false
            state.loginError = error
        },
        userDataRequesting (state) {
            state.resellerBranding = null
            state.userDataRequesting = true
            state.userDataSucceeded = false
            state.userDataError = null
        },
        userDataSucceeded (state, options) {
            state.subscriber = options.subscriber
            state.capabilities = options.capabilities
            state.resellerBranding = options.resellerBranding
            state.platformInfo = options.platformInfo

            state.userDataSucceeded = true
            state.userDataRequesting = false
            state.userDataError = null
        },
        subscriberUpdateSucceeded (state, data) {
            state.subscriber = data
        },
        userDataFailed (state, error) {
            state.userDataError = error
            state.userDataSucceeded = false
            state.userDataRequesting = false
        },
        logout (state) {
            state.jwt = null
            state.subscriberId = null
            state.subscriber = null
            state.capabilities = null
            state.loginRequesting = false
            state.loginSucceeded = false
            state.loginError = null
            state.userDataRequesting = false
            state.userDataSucceeded = false
            state.userDataError = null
        },
        userPasswordRequesting (state) {
            state.changePasswordState = RequestState.requesting
            state.changePasswordError = null
        },
        userPasswordSucceeded (state) {
            state.changePasswordState = RequestState.succeeded
            state.changePasswordError = null
        },
        userPasswordFailed (state, error) {
            state.changePasswordError = error
            state.changePasswordState = RequestState.failed
        },
        newPasswordRequesting (state, isRequesting) {
            state.newPasswordRequesting = isRequesting
        },
        updateLogo (state, value) {
            state.logo = value
        },
        updateFaxActiveCapabilityState (state, value) {
            state.capabilities.faxactive = value
        },
        updateLogoRequestState (state, isRequesting) {
            state.logoRequesting = isRequesting
            state.logoRequested = !isRequesting
        },
        setDefaultBranding (state, value) {
            state.defaultBranding = value
        },
        setSubscriberRegistrations (state, value) {
            state.subscriberRegistrations = value
        },
        setSubscriberPhonebook (state, value) {
            state.subscriberPhonebook = value
        },
        setCustomerPhonebook (state, value) {
            state.customerPhonebook = value
        },
        setProfile (state, value) {
            state.profile = value
        },
        setQrCode (state, qrCode) {
            state.qrCode = qrCode
        },
        setQrExpiringTime (state, qrExpiringTime) {
            state.qrExpiringTime = qrExpiringTime
        },
        setPhonebookShared (state, { id, value }) {
            const index = state.subscriberPhonebook.findIndex(row => row.id === id)
            if (index > -1) {
                state.subscriberPhonebook[index].shared = value
            }
        }
    },
    actions: {
        async login (context, options) {
            context.commit('loginRequesting')
            try {
                const result = await login(options.username, options.password)
                setJwt(result.jwt)
                setSubscriberId(result.subscriberId)
                context.commit('loginSucceeded', {
                    jwt: getJwt(),
                    subscriberId: getSubscriberId()
                })
                await context.dispatch('initUser')
                await this.$router.push({ name: 'dashboard' })
            } catch (err) {
                context.commit('loginFailed', err.message)
                if (err.message === 'Password expired') {
                    this.$router.push({ path: PATH_CHANGE_PASSWORD })
                }
            }
        },
        logout () {
            deleteJwt()
            document.location.href = document.location.pathname
        },
        async initUser (context) {
            if (!context.getters.userDataSucceeded) {
                try {
                    context.commit('userDataRequesting')
                    const userData = await getUserData(getSubscriberId())
                    context.commit('userDataSucceeded', userData)
                    if (_.isNumber(context.getters.jwtTTL)) {
                        setTimeout(() => {
                            setLocal('show_session_expired_msg', true)
                            context.dispatch('logout')
                        }, context.getters.jwtTTL * 1000)
                    }
                    if (userData.subscriber.profile_id) {
                        const profile = await getSubscriberProfile(userData.subscriber.profile_id)
                        context.commit('setProfile', profile)
                    }
                    if (context.getters.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.cscCalls)) {
                        try {
                            await callInitialize({
                                subscriber: userData.subscriber,
                                instanceId: getSipInstanceId()
                            })
                        } catch (err) {
                            console.log(err)
                        }
                    }
                } catch (err) {
                    console.debug(err)
                    await context.dispatch('logout')
                }
            }
        },
        async changeExpiredPassword (context, newPassword) {
            context.commit('userPasswordRequesting')
            try {
                await changeExpiredPassword(newPassword)
            } catch (error) {
                return context.commit('userPasswordFailed', error)
            }

            context.commit('userPasswordSucceeded')
        },
        async changePassword (context, newPassword) {
            const subscriberId = getSubscriberId()
            await changePassword(subscriberId, newPassword)
            await context.dispatch('logout')
        },
        async changeSIPPassword (context, newPassword) {
            const subscriberId = getSubscriberId()
            const subscriberData = await changeSIPPassword(subscriberId, newPassword)
            context.commit('subscriberUpdateSucceeded', subscriberData)
        },
        async resetPassword ({ commit }, data) {
            commit('newPasswordRequesting', true)
            const response = await resetPassword(data)
            commit('newPasswordRequesting', false)
            return response
        },
        async recoverPassword ({ commit, dispatch, state, rootGetters }, data) {
            commit('userPasswordRequesting')
            try {
                const res = await recoverPassword(data)
                if (res.status === 200 || res.status === 201) {
                    commit('userPasswordSucceeded')
                } else {
                    commit('userPasswordFailed')
                }
            } catch (err) {
                commit('userPasswordFailed', err.message)
            }
        },
        async getCustomLogo (context) {
            if (!context.state.logo) {
                context.commit('updateLogoRequestState', true)
                context.commit('updateLogo', await getBrandingLogo(context.state.subscriberId))
                context.commit('updateLogoRequestState', false)
            }
            return context.state.logo
        },
        setDefaultBranding (context, value) {
            if (value) {
                context.commit('setDefaultBranding', value)
            }
        },
        async loadSubscriberRegistrations ({ commit, dispatch, state, rootGetters }, options) {
            try {
                const list = await getSubscriberRegistrations({
                    ...options
                })
                commit('setSubscriberRegistrations', list.items)
                return list.totalCount
            } catch (err) {
                commit('setSubscriberRegistrations', [])
                throw err
            }
        },
        async loadSubscriberPhonebook ({ commit, dispatch, state, rootGetters }, options) {
            try {
                const list = await getSubscriberPhonebook({
                    ...options
                })
                commit('setSubscriberPhonebook', list.items)
                return list.totalCount
            } catch (err) {
                commit('setSubscriberPhonebook', [])
                throw err
            }
        },
        async loadCustomerPhonebook ({ commit, dispatch, state, rootGetters }, options) {
            try {
                const list = await getCustomerPhonebook({
                    ...options
                })
                commit('setCustomerPhonebook', list.items)
                return list.totalCount
            } catch (err) {
                commit('setCustomerPhonebook', [])
                throw err
            }
        },
        async ajaxDownloadPhonebookCSV ({ commit }, customerId = 0) {
            const apiGetOptions = {
                resource: 'customerphonebookentries',
                config: {
                    headers: {
                        Accept: 'text/csv'
                    },
                    params: {
                        customer_id: customerId
                    }
                }
            }
            await apiDownloadFile({
                apiGetOptions,
                defaultFileName: 'customer_phonebook_entries.csv',
                defaultContentType: 'text/csv'
            })
        },
        async removeSubscriberRegistration (context, row) {
            await httpApi.delete('api/subscriberregistrations/' + row.id)
        },
        async removeSubscriberPhonebook (context, row) {
            await httpApi.delete('api/subscriberphonebookentries/' + row.id)
        },
        async removeCustomerPhonebook (context, row) {
            await httpApi.delete('api/customerphonebookentries/' + row.id)
        },
        async getNcosLevelsSubscriber () {
            const ncosLevel = []
            const list = await getNcosLevels()
            list.items.forEach((ncos) => {
                ncosLevel.push({
                    label: ncos.level,
                    value: ncos.id
                })
            })
            return ncosLevel
        },
        async getNcosSetSubscriber () {
            const ncosSet = []
            const list = await getNcosSet()
            list.forEach((setNcos) => {
                ncosSet.push({
                    label: setNcos.name,
                    value: setNcos.id
                })
            })
            return ncosSet
        },
        async getCurrentNcosLevelsSubscriber () {
            const list = await getPreferences(getSubscriberId())
            const currentNcosLevel = list.ncos
            return currentNcosLevel
        },
        async getCurrentNcosSetSubscriber () {
            const list = await getPreferences(getSubscriberId())
            const currentNcosSet = list.ncos_set
            return currentNcosSet
        },
        async setNcosLevelsSubscriber (value) {
            await setPreference(getSubscriberId(), 'ncos', value)
        },
        async getPhonebookDetails (context, id) {
            const list = await httpApi.get('api/subscriberphonebookentries/' + id)
            return list
        },
        async getPhonebookCustomerDetails (context, id) {
            const list = await httpApi.get('api/customerphonebookentries/' + id)
            return list
        },
        async getValueShared (context, options) {
            await setValueShared(options.phonebookId, options.shared)
        },
        async updateValueShared (context, row) {
            context.commit('setPhonebookShared', { id: row.id, value: !row.shared })
            await setValueShared(row.id, row.shared)
        },
        async getValueName (context, options) {
            await setValueName(options.phonebookId, options.name)
        },
        async getValueNameCustomer (context, options) {
            await setValueNameCustomer(options.phonebookId, options.name)
        },
        async getValueNumber (context, options) {
            await setValueNumber(options.phonebookId, options.number)
        },
        async getValueNumberCustomer (context, options) {
            await setValueNumberCustomer(options.phonebookId, options.number)
        },
        async createPhonebookSubscriber (context, data) {
            await createPhonebook(data)
        },
        async createPhonebookCustomer (context, data) {
            await createCustomerPhonebook(data)
        },
        async uploadPhonebookCustomer (context, data) {
            await uploadCsv(context, data)
        },
        async fetchAuthToken ({ commit, state, getters }, expiringTime = 300) {
            const subscriber = state.subscriber
            const expireDate = date.addToDate(new Date(), { seconds: expiringTime })
            commit('setQrExpiringTime', expiringTime)
            try {
                const authToken = await createAuthToken(expiringTime)
                const data = qrPayload({
                    subscriber: subscriber.username,
                    server: subscriber.domain,
                    expire: expireDate.getTime(),
                    token: authToken
                })
                const qrCode = await QRCode.toDataURL(data)
                commit('setQrCode', qrCode)
            } catch (err) {
                commit('setQrCode', null)
            }
        },
        async fetchPreLoginPasswordInfo () {
            return await getPreLoginPasswordInfo()
        },
        async generatePasswordUser () {
            const password = await generateGeneralPassword()

            return password
        }
    }
}
