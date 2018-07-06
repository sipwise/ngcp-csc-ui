'use strict';

import _ from 'lodash';
import { login, getUserData} from '../api/user';

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
        userDataError: null
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
                return state.subscriber.username + "@" + state.subscriber.domain;
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
        getSubscriberId(state) {
            return state.subscriberId;
        },
        loginRequesting(state) {
            return state.loginRequesting;
        },
        loginSucceeded(state) {
            return state.loginSucceeded;
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
            }).catch((err)=>{
                context.commit('loginFailed', err.message);
            });
        },
        logout() {
            localStorage.removeItem('jwt');
            localStorage.removeItem('subscriberId');
            document.location.href = document.location.pathname;
        },
        initUser(context) {
            context.commit('userDataRequesting');
            getUserData(localStorage.getItem('subscriberId')).then((result) => {
                let capabilities = Object.assign(
                    { faxactive: result.faxactive },
                    result.capabilities
                );
                context.commit('userDataSucceeded', {
                    subscriber: result.subscriber,
                    capabilities: capabilities
                });
                if(_.isNumber(context.getters.jwtTTL)) {
                    setTimeout(()=>{
                        context.dispatch('logout');
                    }, context.getters.jwtTTL * 1000);
                }
                context.dispatch('call/initialize', null, { root: true });
            }).catch((err)=>{
                context.commit('userDataFailed', err.message);
                context.dispatch('logout');
            });
        }
    }
};
