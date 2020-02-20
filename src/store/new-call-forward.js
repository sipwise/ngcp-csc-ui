'use strict';


export default {
    namespaced: true,
    getters: {
        subscriberDisplayName(state, getters, rootState, rootGetters) {
            return rootGetters['user/getUsername'];
        }
    },
    mutations: {},
    actions: {}
};
