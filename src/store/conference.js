
export default {
    namespaced: true,
    state: {
        conferencingEnabled: false
    },
    getters: {
        isJoined() {
            return false;
        },
        isConferencingEnabled(state) {
            return state.conferencingEnabled;
        }
    },
    mutations: {
        enableConferencing(state) {
            state.conferencingEnabled = true;
        },
        disableConferencing(state) {
            state.conferencingEnabled = false;
        }
    },
    actions: {}
}
