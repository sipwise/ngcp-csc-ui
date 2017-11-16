
'use strict';

import _ from 'lodash';
import { getSourcesetsCount, getDestinationsetsCount,
    getTimesetsCount, getSourcesets, getDestinationsets, getTimesets,
    getMappings } from '../api/call-forward';

export default {
    namespaced: true,
    state: {
        count: null
    },
    mutations: {
        loadConversations(state, count) {
            state.sourcesetsCount = count;
        }
    },
    actions: {
        loadSourcesetsCount(context) {
            return new Promise((resolve, reject)=>{
                getSourcesetsCount(localStorage.getItem('subscriberId'))
                    .then((result)=>{
                        context.commit('loadConversations', result);
                        resolve();
                    })
                .catch((err)=>{
                    reject(err);
                });
            });
        }
    }
};
