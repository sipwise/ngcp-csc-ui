'use strict';

import _ from 'lodash';
import { enableIncomingCallBlocking,
    disableIncomingCallBlocking,
    getIncomingCallBlocking
} from '../api/call-blocking';


export default {
    namespaced: true,
    state: {
        incomingEnabled: false,
        incomingList: []
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
        }
    }
};
