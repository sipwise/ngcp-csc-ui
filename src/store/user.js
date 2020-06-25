'use strict';

import router from '../router'
import Vue from 'vue';
import {
    i18n
} from '../i18n';
import _ from 'lodash';
import {
    SessionStorage
} from 'quasar-framework'
import {
    RequestState
} from './common'
import {
    login,
    getUserData
} from '../api/user';
import {changePassword} from "../api/subscriber";

export default {
    namespaced: true,
    state: {
        jwt: localStorage.getItem('jwt') || null,
        subscriberId: localStorage.getItem('subscriberId') || null,
        subscriber: null,
        capabilities: null,
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
        sessionLocale: null,
        changeSessionLocaleState: RequestState.initiated,
        changeSessionLocaleError: null,
        languageLabels: [],
        changePasswordState: RequestState.initiated,
        changePasswordError: null
    },
    getters: {
        isLogged(state) {
            return !_.isEmpty(state.jwt) && !_.isEmpty(state.subscriberId);
        },
        hasUser(state) {
            return state.subscriber !== null;
        },
        getUsername(state) {
            if(state.subscriber !== null && !_.isEmpty(state.subscriber.display_name)) {
                return state.subscriber.display_name;
            }
            else if (state.subscriber !== null) {
                return state.subscriber.webusername;
            }
            else {
                return "";
            }
        },
        isAdmin(state) {
            return state.subscriber !== null && state.subscriber.administrative;
        },
        isPbxAdmin(state, getters) {
            return getters.isAdmin && state.capabilities !== null && state.capabilities.cloudpbx;
        },
        hasSmsCapability(state) {
            return state.capabilities !== null &&
                state.capabilities.sms  === true;
        },
        hasSendSmsFeature(state) {
            return state.features.sendSms;
        },
        hasSendFaxFeature(state) {
            return state.features.sendFax;
        },
        hasFaxCapability(state) {
            return state.capabilities !== null &&
                state.capabilities.faxserver &&
                state.capabilities.faxactive;
        },
        hasRtcEngineCapability(state) {
            return state.capabilities !== null && _.has(state.capabilities, 'rtcengine');
        },
        hasRtcEngineCapabilityEnabled(state, getters) {
            return getters.hasRtcEngineCapability && state.capabilities.rtcengine === true;
        },
        isRtcEngineUiVisible(state) {
            return (state.capabilities !== null && state.capabilities.csc_rtcengine_ui === true);
        },
        getSubscriberId(state) {
            return state.subscriberId;
        },
        loginRequesting(state, getters) {
            return state.loginRequesting || getters.userDataRequesting;
        },
        loginSucceeded(state, getters) {
            return state.loginSucceeded && getters.userDataSucceeded;
        },
        loginError(state) {
            return state.loginError;
        },
        userDataRequesting(state) {
            return state.userDataRequesting;
        },
        userDataSucceeded(state) {
            return state.userDataSucceeded;
        },
        jwtTTL(state) {
            let expirationBuffer = 0.05;
            try {
                let jwtParts = state.jwt.split('.');
                let jwtPayload = JSON.parse(atob(jwtParts[1]));
                if(_.isNumber(jwtPayload.exp)) {
                    let timeDiff = Math.floor((Date.now() / 1000) - jwtPayload.exp);
                    let timeLeft = Math.abs(timeDiff);
                    let timeLeftBuffer = Math.round(timeLeft * expirationBuffer);
                    return timeLeft - timeLeftBuffer;
                }
                else {
                    return null;
                }
            }
            catch(err) {
                return null;
            }
        },
        isRtcEngineInitialized(state) {
            return state.rtcEngineInitState === RequestState.succeeded;
        },
        isRtcEngineInitializing(state) {
            return state.rtcEngineInitState === RequestState.requesting;
        },
        changeSessionLocaleState(state) {
            return state.changeSessionLocaleState;
        },
        locale(state) {
            return state.sessionLocale;
        },
        languageLabels(state) {
            return state.languageLabels;
        },
        getSubscriber(state) {
            return state.subscriber;
        },
        isPasswordChanging(state) {
            return state.changePasswordState === RequestState.requesting;
        }
    },
    mutations: {
        loginRequesting(state) {
            state.loginRequesting = true;
            state.loginSucceeded = false;
            state.loginError = null;
        },
        loginSucceeded(state, options) {
            state.jwt = options.jwt;
            state.subscriberId = options.subscriberId;
            state.loginRequesting = false;
            state.loginSucceeded = true;
            state.loginError = null;
        },
        loginFailed(state, error) {
            state.loginRequesting = false;
            state.loginSucceeded = false;
            state.loginError = error;
        },
        userDataRequesting(state) {
            state.userDataRequesting = true;
            state.userDataSucceeded = false;
            state.userDataError = null;
        },
        userDataSucceeded(state, options) {
            state.subscriber = options.subscriber;
            state.capabilities = options.capabilities;
            state.userDataSucceeded = true;
            state.userDataRequesting = false;
            state.userDataError = null;
        },
        userDataFailed(state, error) {
            state.userDataError = error;
            state.userDataSucceeded = false;
            state.userDataRequesting = false;
        },
        logout(state) {
            state.jwt = null;
            state.subscriberId = null;
            state.subscriber = null;
            state.capabilities = null;
            state.loginRequesting = false;
            state.loginSucceeded = false;
            state.loginError = null;
            state.userDataRequesting = false;
            state.userDataSucceeded = false;
            state.userDataError = null;
        },
        rtcEngineInitRequesting(state) {
            state.rtcEngineInitState = RequestState.requesting;
        },
        rtcEngineInitSucceeded(state) {
            state.rtcEngineInitState = RequestState.succeeded;
        },
        rtcEngineInitFailed(state, error) {
            state.rtcEngineInitState = RequestState.failed;
            state.rtcEngineInitError = error;
        },
        changeSessionLocaleRequesting(state) {
            state.changeSessionLocaleState = RequestState.requesting;
            state.changeSessionLocaleError = null;
        },
        changeSessionLocaleSucceeded(state, locale) {
            state.sessionLocale = locale;
            state.changeSessionLocaleState = RequestState.succeeded;
            state.changeSessionLocaleError = null;
        },
        changeSessionLocaleFailed(state, error) {
            state.changeSessionLocaleState = RequestState.failed;
            state.changeSessionLocaleError = error;
        },
        setLanguageLabels(state, languageLabels) {
            state.languageLabels = languageLabels;
        },
        userPasswordRequesting(state) {
            state.changePasswordState = RequestState.requesting;
            state.changePasswordError = null;
        },
        userPasswordSucceeded(state) {
            state.changePasswordState = RequestState.succeeded;
            state.changePasswordError = null;
        },
        userPasswordFailed(state, error) {
            state.changePasswordState = RequestState.failed;
            state.changePasswordError = error;
        }
    },
    actions: {
        login(context, options) {
            context.commit('loginRequesting');
            login(options.username, options.password).then((result) => {
                localStorage.setItem('jwt', result.jwt);
                localStorage.setItem('subscriberId', result.subscriberId);
                context.commit('loginSucceeded', {
                    jwt: localStorage.getItem('jwt'),
                    subscriberId: localStorage.getItem('subscriberId')
                });
                context.dispatch('initUser');
            }).catch((err)=>{
                context.commit('loginFailed', err.message);
            });
        },
        logout() {
            localStorage.removeItem('jwt');
            localStorage.removeItem('subscriberId');
            document.location.href = document.location.pathname;
        },
        async initUser(context) {
            if(!context.getters.userDataSucceeded) {
                try {
                    context.commit('userDataRequesting');
                    const userData = await getUserData(localStorage.getItem('subscriberId'))
                    context.commit('userDataSucceeded', userData);
                    if(_.isNumber(context.getters.jwtTTL)) {
                        setTimeout(()=>{
                            context.dispatch('logout');
                        }, context.getters.jwtTTL * 1000);
                    }
                    if(context.getters.hasRtcEngineCapabilityEnabled && context.getters.isRtcEngineUiVisible) {
                        context.commit('rtcEngineInitRequesting');
                        Vue.$rtcEngine.setNgcpApiJwt(localStorage.getItem('jwt'));
                        try {
                            await Vue.$rtcEngine.initialize()
                            context.commit('rtcEngineInitSucceeded');
                        }
                        catch (err) {
                            console.debug(err);
                            context.commit('rtcEngineInitFailed', err.message);
                        }
                    }
                    await context.dispatch('forwardHome')
                }
                catch(err) {
                    console.debug(err);
                    await context.dispatch('logout');
                }
            }
            else {
                await context.dispatch('forwardHome')
            }
        },
        changeSessionLanguage(context, locale) {
            context.commit('changeSessionLocaleRequesting');
            try {
                SessionStorage.set('locale', locale);
                i18n.locale = locale;
                context.commit('changeSessionLocaleSucceeded', locale);
            }
            catch(error) {
                context.commit('changeSessionLocaleFailed', error);
            }
        },
        changePassword(context, newPassword) {
            let subscriberId = localStorage.getItem('subscriberId');
            context.commit('userPasswordRequesting');
            changePassword(subscriberId, newPassword).then(()=>{
                context.commit('userPasswordSucceeded');
                context.dispatch('logout');
            }).catch((err)=>{
                context.commit('userPasswordFailed', err.message);
            });
        },
        async forwardHome(context) {
            if (context.rootState.route.path === '/user/home' && !context.getters.isRtcEngineUiVisible) {
                await router.push({path:'/user/conversations'})
            }
        }
    }
};
