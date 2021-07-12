import {
    getAllVoicemails,
    getAllCalls
} from '../api/conversations'
import {
    getSubscriberRegistrations
} from '../api/subscriber'

export default {
    namespaced: true,
    getters: {
        getSubscriberId (state, getters, rootState, rootGetters) {
            return parseInt(rootGetters['user/getSubscriberId'])
        }
    },
    actions: {
        async getVoicemailsData (context) {
            const res = await getAllVoicemails({
                subscriberId: context.getters.getSubscriberId,
                rows: 5
            })
            return res
        },
        async getCallsData (context) {
            const res = await getAllCalls({
                subscriberId: context.getters.getSubscriberId,
                rows: 5
            })
            return res
        },
        async getRegisteredDevicesData (context) {
            const res = await getSubscriberRegistrations({
                subscriber_id: context.getters.getSubscriberId,
                rows: 5
            })
            return res
        }
    }
}
