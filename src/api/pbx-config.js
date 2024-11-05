import _ from 'lodash'
import {
    get,
    getList,
    httpApi,
    patchAdd,
    patchRemove
} from 'src/api/common'
import { getSubscribers } from 'src/api/subscriber'

export const PBX_CONFIG_ORDER_BY = 'create_timestamp'
export const PBX_CONFIG_ORDER_DIRECTION = 'desc'

export function getPilot (options) {
    return new Promise((resolve, reject) => {
        const requestConfig = _.merge(options, {
            params: {
                is_pbx_group: 0,
                is_pbx_pilot: 1,
                rows: 1
            }
        })

        getSubscribers(requestConfig).then((subscribers) => {
            if (subscribers.items.length === 1) {
                resolve(subscribers.items[0])
            } else {
                resolve(null)
            }
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getProfiles (options) {
    return new Promise((resolve, reject) => {
        const requestConfig = _.merge(options, {
            path: 'api/pbxdeviceprofiles/',
            root: '_embedded.ngcp:pbxdeviceprofiles'
        })
        getList(requestConfig).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getAllProfiles () {
    // Replace 1000 rows with 300 as we expect to have max 150 profiles.
    return getProfiles({
        page: 1,
        rows: 300
    })
}

export function getProfile (id) {
    return get({
        path: `api/pbxdeviceprofiles/${id}`
    })
}

export function getModel (id) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return get({
                path: `api/pbxdevicemodels/${id}`
            })
        }).then((model) => {
            resolve(model)
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function getModelImage (id, type) {
    try {
        const res = await httpApi.get(`api/pbxdevicemodelimages/${id}`, {
            responseType: 'blob',
            params: {
                type
            }
        })
        return {
            id,
            url: URL.createObjectURL(res.data),
            blob: res.data
        }
    } catch (err) {
        return {
            id,
            url: null,
            blob: null
        }
    }
}

export async function getModelFrontImage (id) {
    return getModelImage(id, 'front')
}

export async function getModelFrontThumbnailImage (id) {
    return getModelImage(id, 'front_thumb')
}

export function getAllSoundSets (options) {
    return new Promise((resolve, reject) => {
        const requestConfig = _.merge(options, {
            path: 'api/soundsets/',
            root: '_embedded.ngcp:soundsets',
            all: true
        })
        getList(requestConfig).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeSoundSet (id) {
    return httpApi.delete(`api/soundsets/${id}`)
}

export function getSoundSet (id) {
    return new Promise((resolve, reject) => {
        get({
            path: `api/soundsets/${id}`
        }).then((soundSet) => {
            resolve(soundSet)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function editSoundSetFields (id, fields) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getSoundSet(id)
        }).then((result) => {
            const prefs = Object.assign(result, fields)
            delete fields._links
            return httpApi.put(`api/soundsets/${id}`, prefs)
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function createSoundSet (soundSet) {
    return new Promise((resolve, reject) => {
        httpApi.post('api/soundsets/', soundSet).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setSoundSetName (id, value) {
    return editSoundSetFields(id, { name: value })
}

export function setSoundSetDescription (id, value) {
    return editSoundSetFields(id, { description: value })
}

export function playSoundFile (options) {
    return new Promise((resolve, reject) => {
        const params = { format: options.format }
        httpApi.get(`api/soundfilerecordings/${options.id}`, { params, responseType: 'blob' })
            .then((res) => {
                resolve(URL.createObjectURL(res.data))
            }).catch((err) => {
                reject(err)
            })
    })
}

export function uploadSoundFile (options, onProgress) {
    return new Promise((resolve, reject) => {
        const formData = new FormData()
        const loopplay = options.item.loopplay ? 1 : 2
        const fields = {
            loopplay,
            filename: options.file.name,
            set_id: options.item.set_id,
            handle: options.item.handle
        }
        const json = JSON.stringify(fields)
        formData.append('json', json)
        if (options.file) {
            formData.append('soundfile', options.file)
        }
        httpApi.post('api/soundfiles/', formData, {
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

export function setSubscriberSoundSet (id, soundSet) {
    return new Promise((resolve, reject) => {
        let promise
        const path = `api/subscriberpreferences/${id}`
        const fieldPath = 'contract_sound_set'
        if (soundSet === null || soundSet === undefined) {
            promise = patchRemove({
                path,
                fieldPath: 'contract_sound_set'
            })
        } else {
            promise = patchAdd({
                path,
                fieldPath,
                value: soundSet
            })
        }
        promise.then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}
export function getNcos (id) {
    return new Promise((resolve, reject) => {
        get({
            path: `api/ncoslevels/${id}`
        }).then((ncos) => {
            resolve(ncos)
        }).catch((err) => {
            reject(err)
        })
    })
}
export function getNcosSet (id) {
    return new Promise((resolve, reject) => {
        get({
            path: `api/v2/ncos/sets/${id}`
        }).then((ncosSet) => {
            resolve(ncosSet)
        }).catch((err) => {
            reject(err)
        })
    })
}
export function setSubscriberNcos (id, ncos) {
    return new Promise((resolve, reject) => {
        let promise
        const path = `api/subscriberpreferences/${id}`
        const fieldPath = 'ncos'
        if (ncos === null || ncos === undefined) {
            promise = patchRemove({
                path,
                fieldPath: 'ncos'
            })
        } else {
            promise = patchAdd({
                path,
                fieldPath,
                value: ncos
            })
        }
        promise.then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}
export function setSubscriberNcosSet (id, ncosSet) {
    return new Promise((resolve, reject) => {
        let promise
        const path = `api/subscriberpreferences/${id}`
        const fieldPath = 'ncos_set'
        if (ncosSet === null || ncosSet === undefined) {
            promise = patchRemove({
                path,
                fieldPath: 'ncos_set'
            })
        } else {
            promise = patchAdd({
                path,
                fieldPath,
                value: ncosSet
            })
        }
        promise.then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}
