'use strict';

import _ from 'lodash';
import { login, getCapabilities, getUserData} from '../api/user';
import Vue from 'vue';

// import cdk from 'cdk';

var rtcEngineClient = '';

export const UserModule = {
    namespaced: true,
    state: {
        username: '',
        password: '',
        jwt: localStorage.getItem('jwt') || null,
        subscriberId: localStorage.getItem('subscriberId') || null,
        loggedUsername: '',
        subscriber: null,
        capabilities: null,
        numbers: null
    },
    getters: {
        isLogged(state, getters) {
            return !_.isEmpty(state.jwt) && !_.isEmpty(state.subscriberId);
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
            state.numbers = options.numbers;
        },
        logout(state) {
            state.jwt = null;
            state.subscriberId = null;
        },
        updatePassword (state, password) {
            state.password = password;
        },
        updateUsername (state, username) {
            state.username = username;
        }
    },
    actions: {
        login(context) {
            return new Promise((resolve, reject)=>{
                login(context.state.username, context.state.password).then((result)=>{
                    localStorage.setItem('jwt', result.jwt);
                    localStorage.setItem('subscriberId', result.subscriberId);
                    context.commit('login', {
                        jwt: localStorage.getItem('jwt'),
                        subscriberId: localStorage.getItem('subscriberId')
                    });
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
                context.dispatch('disconnectRtcEngine', null, {root: true}).then(()=>{
                    context.commit('disconnectRtcEngine');
                });
                context.commit('logout');
                resolve();
            });
        },
        initUser(context) {
            return new Promise((resolve, reject)=>{
                getUserData(localStorage.getItem('subscriberId')).then((result)=>{
                    context.commit('setUserData', {
                        subscriber: result.subscriber,
                        capabilities: result.capabilities,
                        numbers: result.numbers
                    });
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        }
    }
};
