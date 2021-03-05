import _ from 'lodash'
import {
    getList,
    patchReplaceFull,
    getAsBlob,
    get
} from './common'
import {
    PBX_CONFIG_ORDER_BY,
    PBX_CONFIG_ORDER_DIRECTION
} from './pbx-config'
import Vue from 'vue'
import {
    Platform
} from 'quasar'

export function getSoundSets (options) {
    return new Promise((resolve, reject) => {
        options = options || {}
        options = _.merge(options, {
            path: 'api/soundsets/',
            root: '_embedded.ngcp:soundsets'
        })
        getList(options).then((list) => {
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
            params: params
        }).then((soundSets) => {
            resolve({
                soundSets: soundSets
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function createSoundSet (soundSet) {
    return new Promise((resolve, reject) => {
        Vue.http.post('api/soundsets/', soundSet).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeSoundSet (soundSetId) {
    return new Promise((resolve, reject) => {
        Vue.http.delete('api/soundsets/' + soundSetId).then(() => {
            resolve()
        }).catch((err) => {
            if (err.status >= 400) {
                reject(new Error(err.body.message))
            } else {
                reject(err)
            }
        })
    })
}

export function setSoundSetProperty (soundSetId, property, value) {
    return new Promise((resolve, reject) => {
        patchReplaceFull({
            path: 'api/soundsets/' + soundSetId,
            fieldPath: property,
            value: value
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

export function getSoundHandles (options) {
    return new Promise((resolve, reject) => {
        options = options || {}
        options = _.merge(options, {
            path: 'api/soundhandles/',
            root: '_embedded.ngcp:soundhandles'
        })
        getList(options).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getAllSoundHandles (options) {
    return new Promise((resolve, reject) => {
        options = options || {}
        options = _.merge(options, {
            all: true
        })
        getSoundHandles(options).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getSoundFiles (options) {
    return new Promise((resolve, reject) => {
        options = options || {}
        options = _.merge(options, {
            path: 'api/soundfiles/',
            root: '_embedded.ngcp:soundfiles'
        })
        getList(options).then((list) => {
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
            path: 'api/soundfilerecordings/' + options.id,
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
        formData.append('json', JSON.stringify({
            loopplay: true,
            filename: options.soundFileData.name,
            set_id: options.soundSetId,
            handle: options.soundHandle
        }))
        formData.append('soundfile', options.soundFileData)
        Vue.http.post('api/soundfiles/', formData, {
            before (request) {
                options.initialized(request)
            },
            progress (progressEvent) {
                if (progressEvent.lengthComputable) {
                    options.progressed(Math.ceil((progressEvent.loaded / progressEvent.total) * 100))
                }
            }
        }).then((res) => {
            const fileId = _.last(res.headers.get('location').split(/\//))
            return Promise.all([
                get({ path: 'api/soundfiles/' + fileId }),
                getSoundFile({ id: fileId })
            ])
        }).then((res) => {
            resolve({
                soundFile: res[0],
                soundFileUrl: res[1]
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setLoopPlay (options) {
    return new Promise((resolve, reject) => {
        patchReplaceFull({
            path: 'api/soundfiles/' + options.soundFileId,
            fieldPath: 'loopplay',
            value: (options.loopPlay === true) ? 'true' : 'false'
        }).then((soundFile) => {
            resolve(soundFile)
        }).catch((err) => {
            reject(err)
        })
    })
}
