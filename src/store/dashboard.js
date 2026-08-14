import { LIST_DEFAULT_ROWS } from 'src/api/common'
import { getAllCallsOrVoicemails } from 'src/api/conversations'
import { getSubscriberRegistrations } from 'src/api/subscriber'
import { getBrowserTimezone } from 'src/helpers/date-helper'

export default {
    namespaced: true,
    getters: {
        getSubscriberId (state, getters, rootState, rootGetters) {
            return parseInt(rootGetters['user/getSubscriberId'])
        }
    },
    actions: {
        async getVoicemailsData (context) {
            const res = await getAllCallsOrVoicemails({
                subscriber_id: context.getters.getSubscriberId,
                rows: LIST_DEFAULT_ROWS,
                order_by: 'timestamp',
                order_by_direction: 'desc',
                type: 'voicemail',
                tz: getBrowserTimezone()
            })
            return res
        },
        async getCallsData (context) {
            const res = await getAllCallsOrVoicemails({
                subscriber_id: context.getters.getSubscriberId,
                rows: LIST_DEFAULT_ROWS,
                order_by: 'timestamp',
                order_by_direction: 'desc',
                type: 'call',
                tz: 'UTC'
            })
            return res
        },
        async getRegisteredDevicesData (context) {
            const res = await getSubscriberRegistrations({
                subscriber_id: context.getters.getSubscriberId,
                rows: LIST_DEFAULT_ROWS,
                order_by: 'timestamp',
                order_by_direction: 'desc',
                tz: getBrowserTimezone()
            })
            return res
        }
    }
}
