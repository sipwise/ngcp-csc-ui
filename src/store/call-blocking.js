'use strict';

import _ from 'lodash';
import { enableIncomingCallBlocking,
    disableIncomingCallBlocking,
    getIncomingCallBlocking,
    addNumberToIncomingList,
    removeNumberFromIncomingList,
    enablePrivacyCallBlocking,
    disablePrivacyCallBlocking,
    getPrivacyCallBlocking
} from '../api/call-blocking';

export default {
    namespaced: true,
    state: {
        incomingEnabled: false,
        incomingList: [],
        privacyEnabled: false
    },
    getters: {},
    mutations: {
        enableIncoming (state) {
            state.incomingEnabled = true;
        },
        disableIncoming (state) {
            state.incomingEnabled = false;
        },
        loadIncoming(state, options) {
            state.incomingEnabled = options.enabled;
            state.incomingList = options.list;
        },
        enablePrivacy (state) {
            state.privacyEnabled = true;
        },
        disablePrivacy (state) {
            state.privacyEnabled= false;
        },
        loadPrivacy(state, options) {
            state.privacyEnabled = options.enabled;
        }
    },
    actions: {
        toggleIncoming(context, enabled) {
            return new Promise((resolve, reject)=>{
                if(enabled) {
                    enableIncomingCallBlocking(localStorage.getItem('subscriberId')).then(()=>{
                        context.commit('enableIncoming');
                        resolve();
                    }).catch((err)=>{
                        reject(err);
                    });
                } else {
                    disableIncomingCallBlocking(localStorage.getItem('subscriberId')).then(()=>{
                        context.commit('disableIncoming');
                        resolve();
                    }).catch((err)=>{
                        reject(err);
                    });
                }
            });
        },
        loadIncoming(context) {
            return new Promise((resolve, reject)=>{
                getIncomingCallBlocking(localStorage.getItem('subscriberId')).then((result)=>{
                    context.commit('loadIncoming', result);
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        },
        addNumberToIncoming(context, number) {
            return new Promise((resolve, reject)=>{
                addNumberToIncomingList(localStorage.getItem('subscriberId'), number).then(()=>{
                    return context.dispatch('loadIncoming');
                }).then(()=>{
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        },
        removeNumberFromIncoming(context, index) {
            return new Promise((resolve, reject)=>{
                removeNumberFromIncomingList(localStorage.getItem('subscriberId'), index).then(()=>{
                    return context.dispatch('loadIncoming');
                }).then(()=>{
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        },
        togglePrivacy(context, enabled) {
            return new Promise((resolve, reject)=>{
                if(enabled) {
                    enablePrivacyCallBlocking(localStorage.getItem('subscriberId')).then(()=>{
                        context.commit('enablePrivacy');
                        resolve();
                    }).catch((err)=>{
                        reject(err);
                    });
                } else {
                    disablePrivacyCallBlocking(localStorage.getItem('subscriberId')).then(()=>{
                        context.commit('disablePrivacy');
                        resolve();
                    }).catch((err)=>{
                        reject(err);
                    });
                }
            });
        },
        loadPrivacy(context) {
            return new Promise((resolve, reject)=>{
                getPrivacyCallBlocking(localStorage.getItem('subscriberId')).then((result)=>{
                    context.commit('loadPrivacy', result);
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        }
    }
};
