import _ from 'lodash'
import { Platform } from 'quasar'
import {
    get,
    getAsBlob,
    getList,
    httpApi,
    patchReplaceFull,
    post
} from 'src/api/common'
import {
    PBX_CONFIG_ORDER_BY,
    PBX_CONFIG_ORDER_DIRECTION
} from 'src/api/pbx-config'
import {
    getJwt,
    hasJwt
} from 'src/auth'
import { getCurrentLangAsV1Format } from 'src/i18n'

export function getSoundSets (options) {
    return new Promise((resolve, reject) => {
        const mergedOptions = _.merge(options || {}, {
            path: 'api/soundsets/',
            root: '_embedded.ngcp:soundsets'
        })
        getList(mergedOptions).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getSoundSetList (options) {
    return new Promise((resolve, reject) => {
        const params = {
            page: options.page,
            order_by: PBX_CONFIG_ORDER_BY,
            order_by_direction: PBX_CONFIG_ORDER_DIRECTION
        }
        getSoundSets({
            params
        }).then((soundSets) => {
            resolve({
                soundSets
            })
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

export function removeSoundSet (soundSetId) {
    return new Promise((resolve, reject) => {
        httpApi.delete(`api/soundsets/${soundSetId}`).then(() => {
            resolve()
        }).catch((err) => {
            if (err.response.status >= 400) {
                reject(new Error(err.response.data.message))
            } else {
                reject(err)
            }
        })
    })
}

export function setSoundSetProperty (soundSetId, property, value) {
    return new Promise((resolve, reject) => {
        patchReplaceFull({
            path: `api/soundsets/${soundSetId}`,
            fieldPath: property,
            value
        }).then((soundSet) => {
            resolve(soundSet)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setAsDefault (soundSetId) {
    return setSoundSetProperty(soundSetId, 'contract_default', true)
}

export function unsetAsDefault (soundSetId) {
    return setSoundSetProperty(soundSetId, 'contract_default', false)
}

export function setSoundSetName (soundSetId, name) {
    return setSoundSetProperty(soundSetId, 'name', name)
}

export function setSoundSetDescription (soundSetId, description) {
    return setSoundSetProperty(soundSetId, 'description', description)
}

export function setSoundSetParent (soundSetId, parentId) {
    return setSoundSetProperty(soundSetId, 'parent_id', parentId)
}

export function getSoundHandles (options) {
    return new Promise((resolve, reject) => {
        const mergedOptions = _.merge(options || {}, {
            path: 'api/soundhandles/',
            root: '_embedded.ngcp:soundhandles'
        })
        getList(mergedOptions).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getAllSoundHandles (options) {
    return new Promise((resolve, reject) => {
        const mergedOptions = _.merge(options || {}, {
            all: true
        })
        getSoundHandles(mergedOptions).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getSoundFiles (options) {
    return new Promise((resolve, reject) => {
        const mergedOptions = _.merge(options || {}, {
            path: 'api/soundfiles/',
            root: '_embedded.ngcp:soundfiles'
        })
        getList(mergedOptions).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getAllSoundFilesBySoundSetId (soundSetId) {
    return new Promise((resolve, reject) => {
        getSoundFiles({
            all: true,
            params: {
                set_id: soundSetId
            }
        }).then((soundFiles) => {
            resolve(soundFiles)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getSoundFile (options) {
    return new Promise((resolve, reject) => {
        getAsBlob({
            path: `api/soundfilerecordings/${options.id}`,
            params: {
                format: Platform.mozilla ? 'ogg' : 'mp3'
            }
        }).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function uploadSoundFile (options) {
    return new Promise((resolve, reject) => {
        const formData = new FormData()

        if (options.soundFileData) {
            formData.append('json', JSON.stringify({
                loopplay: options.soundFileData !== null,
                set_id: options.soundSetId,
                handle: options.soundHandle,
                filename: options.soundFileData.name
            }))
            formData.append('soundfile', options.soundFileData)
            const initializedSoundFiles = httpApi.interceptors.request.use((config) => {
                options.initialized(config)
                const updatedConfig = config
                if (hasJwt()) {
                    updatedConfig.headers = {
                        ...updatedConfig.headers,
                        Authorization: `Bearer ${getJwt()}`
                    }
                }
                if (updatedConfig.method === 'POST' && (updatedConfig.data === undefined || updatedConfig.data === null)) {
                    updatedConfig.data = {}
                }
                updatedConfig.params = {
                    ...updatedConfig.params,
                    lang: getCurrentLangAsV1Format()
                }
                return updatedConfig
            })
            httpApi.post('api/soundfiles/', formData, {
                onUploadProgress (progressEvent) {
                    if (progressEvent.lengthComputable) {
                        options.progressed(Math.ceil((progressEvent.loaded / progressEvent.total) * 100))
                    }
                }
            }).then((res) => {
                const fileId = _.last(res.headers.location.split(/\//))
                return Promise.all([
                    get({ path: `api/soundfiles/${fileId}` }),
                    getSoundFile({ id: fileId })
                ])
            }).then((res) => {
                httpApi.interceptors.request.eject(initializedSoundFiles)
                resolve({
                    soundFile: res[0],
                    soundFileUrl: res[1]
                })
            }).catch((err) => {
                httpApi.interceptors.request.eject(initializedSoundFiles)
                reject(err)
            })
        } else {
            post({
                resource: 'soundfiles',
                body: {
                    loopplay: false,
                    set_id: options.soundSetId,
                    handle: options.soundHandle,
                    use_parent: false
                }
            }).then(async (id) => {
                const res = await getSoundFileById({ id })
                resolve({
                    soundFile: res,
                    soundFileUrl: null
                })
            }).catch((err) => {
                reject(err)
            })
        }
    })
}

export function getSoundFileById (options) {
    return new Promise((resolve, reject) => {
        get({
            path: `api/soundfiles/${options.id}`
        }).then((soundfile) => {
            resolve(soundfile)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setLoopPlay (options) {
    return new Promise((resolve, reject) => {
        patchReplaceFull({
            path: `api/soundfiles/${options.soundFileId}`,
            fieldPath: 'loopplay',
            value: (options.loopPlay === true) ? 'true' : 'false'
        }).then((soundFile) => {
            resolve(soundFile)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setUseParent (options) {
    return new Promise((resolve, reject) => {
        patchReplaceFull({
            path: `api/soundfiles/${options.soundFileId}`,
            fieldPath: 'use_parent',
            value: options.useParent
        }).then((soundFile) => {
            resolve(soundFile)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeSoundFile (soundFileId) {
    return new Promise((resolve, reject) => {
        httpApi.delete(`api/soundfiles/${soundFileId}`).then(() => {
            resolve()
        }).catch((err) => {
            if (err.response.status >= 400) {
                reject(new Error(err.response.data.message))
            } else {
                reject(err)
            }
        })
    })
}
