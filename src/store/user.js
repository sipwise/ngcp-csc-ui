'use strict'

import router from '../router'
import Vue from 'vue'
import _ from 'lodash'
import {
    RequestState
} from './common'
import {
    login,
    getUserData,
    createAuthToken
} from '../api/user'
import {
    changePassword,
    resetPassword,
    recoverPassword,
    getBrandingLogo,
    getSubscriberRegistrations,
    getSubscriberProfile
} from '../api/subscriber'
import { deleteJwt, getJwt, getSubscriberId, setJwt, setSubscriberId } from 'src/auth'
import QRCode from 'qrcode'
import {
    qrPayload
} from 'src/helpers/qr'

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
        rtcEngineInitState: RequestState.initiated,
        rtcEngineInitError: null,
        changePasswordState: RequestState.initiated,
        changePasswordError: null,
        newPasswordRequesting: false,
        logo: null,
        logoRequesting: false,
        logoRequested: false,
        resellerBranding: null,
        defaultBranding: {},
        subscriberRegistrations: [],
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
        hasRtcEngineCapability (state) {
            return state.capabilities !== null && _.has(state.capabilities, 'rtcengine')
        },
        hasRtcEngineCapabilityEnabled (state, getters) {
            return getters.hasRtcEngineCapability && state.capabilities.rtcengine === true
        },
        isRtcEngineUiVisible (state) {
            return (state.capabilities !== null && state.capabilities.csc_show_rtcengine_features === true)
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
        userDataRequesting (state) {
            return state.userDataRequesting
        },
        userDataSucceeded (state) {
            return state.userDataSucceeded
        },
        jwtTTL (state) {
            const expirationBuffer = 0.05
            try {
                const jwtParts = state.jwt.split('.')
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
        isRtcEngineInitialized (state) {
            return state.rtcEngineInitState === RequestState.succeeded
        },
        isRtcEngineInitializing (state) {
            return state.rtcEngineInitState === RequestState.requesting
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
        rtcEngineInitRequesting (state) {
            state.rtcEngineInitState = RequestState.requesting
        },
        rtcEngineInitSucceeded (state) {
            state.rtcEngineInitState = RequestState.succeeded
        },
        rtcEngineInitFailed (state, error) {
            state.rtcEngineInitState = RequestState.failed
            state.rtcEngineInitError = error
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
        setProfile (state, value) {
            state.profile = value
        },
        setQrCode (state, qrCode) {
            state.qrCode = qrCode
        },
        setQrExpiringTime (state, qrExpiringTime) {
            state.qrExpiringTime = qrExpiringTime
        }
    },
    actions: {
        login (context, options) {
            context.commit('loginRequesting')
            login(options.username, options.password).then((result) => {
                setJwt(result.jwt)
                setSubscriberId(result.subscriberId)
                context.commit('loginSucceeded', {
                    jwt: getJwt(),
                    subscriberId: getSubscriberId()
                })
                context.dispatch('initUser')
            }).catch((err) => {
                context.commit('loginFailed', err.message)
            })
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
                            context.dispatch('logout')
                        }, context.getters.jwtTTL * 1000)
                    }
                    if (context.getters.hasRtcEngineCapabilityEnabled && context.getters.isRtcEngineUiVisible) {
                        context.commit('rtcEngineInitRequesting')
                        Vue.$rtcEngine.setNgcpApiJwt(getJwt())
                        try {
                            await Vue.$rtcEngine.initialize()
                            context.commit('rtcEngineInitSucceeded')
                        } catch (err) {
                            console.debug(err)
                            context.commit('rtcEngineInitFailed', err.message)
                        }
                    }
                    if (userData.subscriber.profile_id) {
                        const profile = await getSubscriberProfile(userData.subscriber.profile_id)
                        context.commit('setProfile', profile)
                    }
                    await context.dispatch('forwardHome')
                } catch (err) {
                    console.debug(err)
                    await context.dispatch('logout')
                }
            } else {
                await context.dispatch('forwardHome')
            }
        },
        changePassword (context, newPassword) {
            const subscriberId = getSubscriberId()
            context.commit('userPasswordRequesting')
            changePassword(subscriberId, newPassword).then(() => {
                context.commit('userPasswordSucceeded')
                context.dispatch('logout')
            }).catch((err) => {
                context.commit('userPasswordFailed', err.message)
            })
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
        async forwardHome (context) {
            if (context.rootState.route?.path === '/user/dashboard' && !context.getters.isRtcEngineUiVisible) {
                await router.push({ path: '/user/conversations' })
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
                    ...options,
                    subscriber_id: getSubscriberId()
                })
                commit('setSubscriberRegistrations', list.items)
                return list.totalCount
            } catch (err) {
                commit('setSubscriberRegistrations', [])
                throw err
            }
        },
        async fetchAuthToken ({ commit, state, getters }, expiringTime = 300) {
            const subscriber = state.subscriber
            commit('setQrExpiringTime', expiringTime)
            try {
                const authToken = await createAuthToken(expiringTime)
                const data = qrPayload({
                    subscriber: subscriber.username,
                    server: subscriber.domain,
                    token: authToken
                })
                const qrCode = await QRCode.toDataURL(data)
                commit('setQrCode', qrCode)
            } catch (err) {
                commit('setQrCode', null)
            }
        }
    }
}
