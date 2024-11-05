import { saveAs } from 'file-saver'
import _ from 'lodash'
import {
    getIncomingCallBlocking,
    getOutgoingCallBlocking
} from 'src/api/call-blocking'
import {
    LIST_DEFAULT_ROWS,
    getList,
    httpApi
} from 'src/api/common'

export function getConversations (options) {
    return new Promise((resolve, reject) => {
        const type = _.get(options, 'type', null)
        const from = _.get(options, 'from', '')
        const to = _.get(options, 'to', '')
        const direction = _.get(options, 'direction', '')
        const subscriberId = _.get(options, 'subscriberId')
        const noCount = _.get(options, 'no_count')
        const params = {
            order_by: _.get(options, 'order_by', 'timestamp'),
            order_by_direction: 'desc',
            tz: 'UTC',
            page: _.get(options, 'page', 1),
            rows: _.get(options, 'rows', LIST_DEFAULT_ROWS)
        }
        if (noCount !== null) {
            params.no_count = noCount
        }
        if (subscriberId !== null) {
            params.subscriber_id = subscriberId
        }
        if (type !== null) {
            params.type = type
        }
        if (from !== '') {
            params.from = from
        }
        if (to !== '') {
            params.to = to
        }
        if (direction !== '') {
            params.direction = direction
        }
        getList({
            path: 'api/conversations/',
            root: '_embedded.ngcp:conversations',
            params,
            all: false
        }).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function downloadVoiceMail (id) {
    return new Promise((resolve, reject) => {
        httpApi.get(`api/voicemailrecordings/${id}`, { responseType: 'blob' })
            .then((res) => {
                return res.data
            }).then((voicemail) => {
                saveAs((voicemail), `voicemail-${id}.wav`)
                resolve()
            }).catch((err) => {
                reject(err)
            })
    })
}

export function downloadFax (id) {
    return new Promise((resolve, reject) => {
        httpApi.get(`api/faxrecordings/${id}`, { responseType: 'blob' })
            .then((res) => {
                return res.data
            }).then((fax) => {
                saveAs((fax), `fax-${id}.tif`)
                resolve()
            }).catch((err) => {
                reject(err)
            })
    })
}

export function playVoiceMail (options) {
    return new Promise((resolve, reject) => {
        const params = { format: options.format }
        httpApi.get(`api/voicemailrecordings/${options.id}`, { params, responseType: 'blob' })
            .then((res) => {
                resolve(URL.createObjectURL(res.data))
            }).catch((err) => {
                reject(err)
            })
    })
}

export function getIncomingBlocked (id) {
    return new Promise((resolve, reject) => {
        getIncomingCallBlocking(id).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getOutgoingBlocked (id) {
    return new Promise((resolve, reject) => {
        getOutgoingCallBlocking(id).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function deleteVoicemail (id) {
    const res = await httpApi.delete(`api/voicemails/${id}`)
    return res.status >= 200
}

export async function getAllCallsOrVoicemails (options) {
    return await getList({
        resource: 'conversations',
        params: options
    })
}

export async function deleteFax (id) {
    const res = await httpApi.delete(`api/faxes/${id}`)
    return res.status >= 200
}
