
import { getGroups } from '../../api/pbx-config'

export const PbxGroups = {
    state: {
        groups: [],
        page: 1
    },
    getters: {

    },
    mutations: {
        showGroups: function(state, options) {
            state.groups = options.groups;
        }
    },
    actions: {
        loadGroups: function(context, options) {
            return new Promise((resolve, reject)=>{
                getGroups().then((groups)=>{
                    context.commit('showGroups', {
                        groups: groups
                    });
                }).catch((err)=>{
                    reject(err);
                });
            });
        }
    }
};
