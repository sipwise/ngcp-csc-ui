'use strict';

import _ from 'lodash';
import { login, getUserData} from '../api/user';

export default {
    namespaced: true,
    state: {
        jwt: localStorage.getItem('jwt') || null,
        subscriberId: localStorage.getItem('subscriberId') || null,
        subscriber: null,
        capabilities: null
    },
    getters: {
        isLogged(state, getters) {
            return !_.isEmpty(state.jwt) && !_.isEmpty(state.subscriberId);
        },
        hasUser(state, getters) {
            return state.subscriber !== null;
        },
        getUsername(state, getters) {
            if(state.subscriber !== null && !_.isEmpty(state.subscriber.display_name)) {
                return state.subscriber.display_name;
            } else if (state.subscriber !== null) {
                return state.subscriber.username + "@" + state.subscriber.domain;
            } else {
                return "";
            }
        },
        isAdmin(state, getters) {
            return state.subscriber !== null && state.subscriber.administrative;
        },
        isPbxAdmin(state, getters) {
            return getters.isAdmin && state.capabilities !== null && state.capabilities.cloudpbx;
        },
        hasSmsCapability(state, getters) {
            return state.capabilities !== null && state.capabilities.sms  === true;
        },
        hasFaxCapability(state, getters) {
            return state.capabilities !== null && state.capabilities.faxserver  === true;
        },
        hasRtcEngineCapability(state, getters) {
            return state.capabilities !== null && _.has(state.capabilities, 'rtcengine');
        },
        hasRtcEngineCapabilityEnabled(state, getters) {
            return getters.hasRtcEngineCapability && state.capabilities.rtcengine === true;
        },
        getSubscriberId(state, getters) {
            return state.subscriberId;
        }
    },
    mutations: {
        login(state, options) {
            state.jwt = options.jwt;
            state.subscriberId = options.subscriberId;
        },
        setUserData(state, options) {
            state.subscriber = options.subscriber;
            state.capabilities = options.capabilities;
        },
        logout(state) {
            state.jwt = null;
            state.subscriberId = null;
            state.subscriber = null;
            state.capabilities = null;
        }
    },
    actions: {
        login(context, options) {
            return new Promise((resolve, reject)=>{
                login(options.username, options.password).then((result)=>{
                    localStorage.setItem('jwt', result.jwt);
                    localStorage.setItem('subscriberId', result.subscriberId);
                    context.commit('login', {
                        jwt: localStorage.getItem('jwt'),
                        subscriberId: localStorage.getItem('subscriberId'),
                    });
                }).then(()=>{
                    return context.dispatch('initUser');
                }).then(()=>{
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        },
        logout(context) {
            return new Promise((resolve, reject)=>{
                localStorage.removeItem('jwt');
                localStorage.removeItem('subscriberId');
                context.commit('logout');
                resolve();
            });
        },
        initUser(context) {
            return new Promise((resolve, reject)=>{
                getUserData(localStorage.getItem('subscriberId')).then((result)=>{
                    context.commit('setUserData', {
                        subscriber: result.subscriber,
                        capabilities: result.capabilities
                    });
                    context.dispatch('call/initialize', null, { root: true }).then(()=>{
                        resolve();
                    }).catch((err)=>{
                        resolve();
                    });
                }).catch((err)=>{
                    reject(err);
                });
            });
        }
    }
};
