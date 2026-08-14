import * as actions from 'src/store/call-forwarding/actions'
import * as getters from 'src/store/call-forwarding/getters'
import * as mutations from 'src/store/call-forwarding/mutations'
import state from 'src/store/call-forwarding/state'

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
