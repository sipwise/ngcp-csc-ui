import {
    del,
    get,
    getList,
    patchReplace,
    post,
    putMinimal
} from 'src/api/common'

export async function createPhonebook (data) {
    const payload = {
        name: data.name,
        number: data.number,
        shared: data.shared,
        subscriber_id: Number(data.subscriber_id)
    }
    return post({
        resource: 'subscriberphonebookentries',
        body: payload
    })
}

export async function deleteEntry (id) {
    return del({
        resource: 'subscriberphonebookentries',
        resourceId: id
    })
}

export async function getEntryById (id) {
    return get({
        resource: 'subscriberphonebookentries',
        resourceId: id
    })
}

export async function getPhonebook (options) {
    return getList({
        resource: 'subscriberphonebookentries',
        params: options,
        ...(options.rows === 0 ? { all: true } : {})
    })
}

export function setSharedValue (id, value) {
    return patchReplace({
        resource: 'subscriberphonebookentries',
        resourceId: id,
        fieldPath: 'shared',
        value
    })
}

export async function updateEntry (data) {
    return putMinimal({
        resource: 'subscriberphonebookentries',
        resourceId: data.id,
        body: {
            number: data.number,
            shared: data.shared,
            name: data.name,
            subscriber_id: Number(data.subscriberId)
        }
    })
}
