import { httpApi, patchReplaceFull } from 'src/api/common'

export async function getAutoAttendants (options) {
    const params = { ...options, ...{ expand: 'all' } }
    const res = await httpApi.get('api/autoattendants/', {
        params
    })
    return res.data.total_count > 0 ? res.data : []
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
