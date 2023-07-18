
import _ from 'lodash'
import {
    get,
    getList,
    patchReplace,
    httpApi
} from './common'

export function getVoiceboxSettings (subscriberId) {
    return new Promise((resolve, reject) => {
        get({
            path: `api/voicemailsettings/${subscriberId}`
        }).then((result) => {
            const settings = _.clone(result)
            delete settings._links
            resolve(settings)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setVoiceboxDelete (options) {
    return patchReplace({
        path: `api/voicemailsettings/${options.subscriberId}`,
        fieldPath: 'delete',
        value: options.value
    })
}

export function setVoiceboxAttach (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            if (options.value === false) {
                return setVoiceboxDelete(options)
            } else {
                return Promise.resolve()
            }
        }).then(() => {
            return patchReplace({
                path: `api/voicemailsettings/${options.subscriberId}`,
                fieldPath: 'attach',
                value: options.value
            })
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setVoiceboxPin (options) {
    return patchReplace({
        path: `api/voicemailsettings/${options.subscriberId}`,
        fieldPath: 'pin',
        value: options.value
    })
}

export function setVoiceboxEmail (options) {
    return patchReplace({
        path: `api/voicemailsettings/${options.subscriberId}`,
        fieldPath: 'email',
        value: options.value
    })
}

export function getVoiceboxGreetingByType (options) {
    return new Promise((resolve, reject) => {
        getList({
            path: 'api/voicemailgreetings/',
            root: '_embedded.ngcp:voicemailgreetings',
            params: { subscriber_id: options.id, type: options.type }
        }).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function deleteVoiceboxGreetingById (id) {
    return new Promise((resolve, reject) => {
        httpApi.delete(`api/voicemailgreetings/${id}`).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function createNewGreeting (formData, onProgress, cancelToken) {
    return new Promise((resolve, reject) => {
        httpApi.post('api/voicemailgreetings/', formData, {
            cancelToken,
            onUploadProgress (e) {
                if (e.lengthComputable) {
                    onProgress(Math.ceil((e.loaded / e.total) * 100))
                }
            }
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function uploadGreeting (options) {
    return new Promise((resolve, reject) => {
        const formData = new FormData()
        const fields = _.clone(options.data)
        delete fields.file
        const json = JSON.stringify(fields)
        formData.append('json', json)
        if (options.data.file) {
            formData.append('greetingfile', options.data.file)
        }
        Promise.resolve().then(() => {
            return getVoiceboxGreetingByType({
                id: options.data.subscriber_id,
                type: options.data.dir
            })
        }).then((greetings) => {
            if (_.some(greetings.items, { dir: options.data.dir })) {
                deleteVoiceboxGreetingById(greetings.items[0].id)
            }
            return createNewGreeting(formData, options.onProgress, options.cancelToken)
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function playGreeting (options) {
    return new Promise((resolve, reject) => {
        const params = { format: options.format }
        httpApi.get(`api/voicemailgreetings/${options.id}`, { params: params, responseType: 'blob' })
            .then((res) => {
                resolve(URL.createObjectURL(res.data))
            }).catch((err) => {
                reject(err)
            })
    })
}
