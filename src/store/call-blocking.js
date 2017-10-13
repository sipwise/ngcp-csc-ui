'use strict';

import { enableIncomingCallBlocking,
    disableIncomingCallBlocking,
    getIncomingCallBlocking,
    addNumberToIncomingList,
    editNumberFromIncomingList,
    removeNumberFromIncomingList,
    enableOutgoingCallBlocking,
    disableOutgoingCallBlocking,
    getOutgoingCallBlocking,
    addNumberToOutgoingList,
    editNumberFromOutgoingList,
    removeNumberFromOutgoingList,
    enablePrivacyCallBlocking,
    disablePrivacyCallBlocking,
    getPrivacyCallBlocking
} from '../api/call-blocking';


export default {
    namespaced: true,
    state: {
        incomingEnabled: false,
        incomingList: [],
        outgoingEnabled: false,
        outgoingList: [],
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
        },
        enableOutgoing (state) {
            state.outgoingEnabled = true;
        },
        disableOutgoing (state) {
            state.outgoingEnabled = false;
        },
        loadOutgoing(state, options) {
            state.outgoingEnabled = options.enabled;
            state.outgoingList = options.list;
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
        addNumberIncoming(context, number) {
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
        editNumberIncoming(context, options) {
            return new Promise((resolve, reject)=>{
                editNumberFromIncomingList(localStorage.getItem('subscriberId'), options.index, options.number).then(()=>{
                    return context.dispatch('loadIncoming');
                }).then(()=>{
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        },
        removeNumberIncoming(context, index) {
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
        toggleOutgoing(context, enabled) {
            return new Promise((resolve, reject)=>{
                if(enabled) {
                    enableOutgoingCallBlocking(localStorage.getItem('subscriberId')).then(()=>{
                        context.commit('enableOutgoing');
                        resolve();
                    }).catch((err)=>{
                        reject(err);
                    });
                } else {
                    disableOutgoingCallBlocking(localStorage.getItem('subscriberId')).then(()=>{
                        context.commit('disableOutgoing');
                        resolve();
                    }).catch((err)=>{
                        reject(err);
                    });
                }
            });
        },
        loadOutgoing(context) {
            return new Promise((resolve, reject)=>{
                getOutgoingCallBlocking(localStorage.getItem('subscriberId')).then((result)=>{
                    context.commit('loadOutgoing', result);
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        },
        addNumberOutgoing(context, number) {
            return new Promise((resolve, reject)=>{
                addNumberToOutgoingList(localStorage.getItem('subscriberId'), number).then(()=>{
                    return context.dispatch('loadOutgoing');
                }).then(()=>{
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        },
        editNumberOutgoing(context, options) {
            return new Promise((resolve, reject)=>{
                editNumberFromOutgoingList(localStorage.getItem('subscriberId'), options.index, options.number).then(()=>{
                    return context.dispatch('loadOutgoing');
                }).then(()=>{
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        },
        removeNumberOutgoing(context, index) {
            return new Promise((resolve, reject)=>{
                removeNumberFromOutgoingList(localStorage.getItem('subscriberId'), index).then(()=>{
                    return context.dispatch('loadOutgoing');
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
