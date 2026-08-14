import actions from 'src/store/conversations/actions'
import getters from 'src/store/conversations/getters'
import mutations from 'src/store/conversations/mutations'
import state from 'src/store/conversations/state'

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
