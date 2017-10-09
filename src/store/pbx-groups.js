
import { getGroups } from '../api/pbx-config'

export default {
    namespaced: true,
    state: {
        groups: [],
        page: 1
    },
    getters: {

    },
    mutations: {
        show: function(state, options) {
            state.groups = options.groups;
        }
    },
    actions: {
        load: function(context, options) {
            return new Promise((resolve, reject)=>{
                getGroups().then((groups)=>{
                    context.commit('show', {
                        groups: groups
                    });
                }).catch((err)=>{
                    reject(err);
                });
            });
        }
    }
};
