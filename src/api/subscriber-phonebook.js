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
        path: `api/v2/subscribers/${data.subscriber_id}/phonebook`,
        body: payload
    })
}

export async function deleteEntry (subscriberId, entryId) {
    return del({
        path: `api/v2/subscribers/${subscriberId}/phonebook/${entryId}`
    })
}

export async function getEntryById (subscriberId, id) {
    return get({
        path: `api/v2/subscribers/${subscriberId}/phonebook/${id}`
    })
}

export async function getPhonebook (options) {
    return getList({
        path: `api/v2/subscribers/${options.subscriber_id}/phonebook`,
        params: options
    })
}

export function setSharedValue (subscriberId, phonebookId, value) {
     return patchReplace({
            path: `api/v2/subscribers/${subscriberId}/phonebook/${phonebookId}`,
            fieldPath: 'shared',
            value
        })
}

export async function updateEntry (data) {
    return putMinimal({
        path: `api/v2/subscribers/${data.subscriberId}/phonebook/${data.id}`,
        body: {
            number: data.number,
            shared: data.shared,
            name: data.name,
            subscriber_id: Number(data.subscriberId)
        }
    })
}
