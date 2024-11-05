import _ from 'lodash'
import { httpApi } from 'src/api/common'
import {
    addToBlockInList,
    addToBlockOutList,
    disableBlockIn,
    disableBlockOut,
    disablePrivacy,
    editBlockInList,
    editBlockOutList,
    enableBlockIn,
    enableBlockOut,
    enablePrivacy,
    getPreferences,
    removeFromBlockInList,
    removeFromBlockOutList
} from 'src/api/subscriber'

export function enableIncomingCallBlocking (id) {
    return enableBlockIn(id)
}

export function disableIncomingCallBlocking (id) {
    return disableBlockIn(id)
}

export function getIncomingCallBlocking (id) {
    return new Promise((resolve, reject) => {
        getPreferences(id).then((result) => {
            resolve({
                enabled: result.block_in_mode,
                list: result.block_in_list,
                blockAnonymous: result.block_in_clir
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function addNumberToIncomingList (id, number) {
    return new Promise((resolve, reject) => {
        if (_.isEmpty(number)) {
            reject(new Error('Number may not be empty'))
        } else {
            addToBlockInList(id, number).then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        }
    })
}

export function editNumberFromIncomingList (id, index, number) {
    return new Promise((resolve, reject) => {
        editBlockInList(id, index, number).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeNumberFromIncomingList (id, index) {
    return new Promise((resolve, reject) => {
        removeFromBlockInList(id, index).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function enableOutgoingCallBlocking (id) {
    return enableBlockOut(id)
}

export function disableOutgoingCallBlocking (id) {
    return disableBlockOut(id)
}

export function getOutgoingCallBlocking (id) {
    return new Promise((resolve, reject) => {
        getPreferences(id).then((result) => {
            resolve({
                enabled: result.block_out_mode,
                list: result.block_out_list
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function addNumberToOutgoingList (id, number) {
    return new Promise((resolve, reject) => {
        if (_.isEmpty(number)) {
            reject(new Error('Number may not be empty'))
        } else {
            addToBlockOutList(id, number).then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        }
    })
}

export function editNumberFromOutgoingList (id, index, number) {
    return new Promise((resolve, reject) => {
        editBlockOutList(id, index, number).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeNumberFromOutgoingList (id, index) {
    return new Promise((resolve, reject) => {
        removeFromBlockOutList(id, index).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function enablePrivacyCallBlocking (id) {
    return enablePrivacy(id)
}

export function disablePrivacyCallBlocking (id) {
    return disablePrivacy(id)
}

export function getPrivacyCallBlocking (id) {
    return new Promise((resolve, reject) => {
        getPreferences(id).then((result) => {
            resolve(result.clir)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeNumberFromList (id, field, value) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getPreferences(id)
        }).then((result) => {
            const prefs = _.cloneDeep(result)
            delete prefs._links
            prefs[field] = _.get(prefs, field, []).filter((number) => {
                return number !== value
            })
            return httpApi.put(`api/subscriberpreferences/${id}`, prefs)
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeFromIncomingListByNumber (id, number) {
    return new Promise((resolve, reject) => {
        removeNumberFromList(id, 'block_in_list', number).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeFromOutgoingListByNumber (id, number) {
    return new Promise((resolve, reject) => {
        removeNumberFromList(id, 'block_out_list', number).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function toggleNumberInBothLists (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getPreferences(options.id)
        }).then((result) => {
            const prefs = _.cloneDeep(result)
            delete prefs._links
            prefs.block_in_list = _.get(prefs, 'block_in_list', [])
            prefs.block_out_list = _.get(prefs, 'block_out_list', [])
            if (options.block_in_list === 'add') {
                prefs.block_in_list = [options.number].concat(prefs.block_in_list)
            } else if (options.block_in_list === 'remove') {
                prefs.block_in_list = prefs.block_in_list.filter((number) => {
                    return number !== options.number
                })
            }
            if (options.block_out_list === 'add') {
                prefs.block_out_list = [options.number].concat(prefs.block_out_list)
            } else if (options.block_out_list === 'remove') {
                prefs.block_out_list = prefs.block_out_list.filter((number) => {
                    return number !== options.number
                })
            }
            return httpApi.put(`api/subscriberpreferences/${options.id}`, prefs)
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}
