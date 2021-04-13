import Vue from 'vue'
import { patchReplaceFull } from 'src/api/common'

export async function getAutoAttendants (options) {
    const params = { ...options, ...{ expand: 1 } }
    const res = await Vue.http.get('api/autoattendants/', {
        params: params
    })
    return res.body.total_count > 0 ? res.body : []
}

export async function editSubscriberSlots (options) {
    const res = await patchReplaceFull({
        resource: 'autoattendants',
        resourceId: options.subscriberId,
        fieldPath: 'slots',
        value: options.slots
    })
    return res.slots
}
