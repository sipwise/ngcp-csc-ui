import {
    createSubscriber,
    deleteSubscriber,
    getFullSubscribers,
    getSubscriberAndPreferences, getSubscribers,
    setDisplayName,
    setPbxExtension,
    setPbxWebPassword,
    setPbxGroupIds,
    setSubscriberNumbers,
    setPreferenceIntraPbx,
    setPreferenceMusicOnHold,
    getPreferences,
    setPbxSIPPassword
} from './subscriber'
import _ from 'lodash'
import {
    getAllSoundSets,
    getPilot,
    getSoundSet,
    createId,
    PBX_CONFIG_ORDER_BY,
    PBX_CONFIG_ORDER_DIRECTION,
    setSubscriberSoundSet
} from './pbx-config'
import {
    assignNumbers,
    getNumbers
} from './user'
import {
    getGroupsOnly
} from './pbx-groups'

export function getSeats (options) {
    return new Promise((resolve, reject) => {
        options = options || {}
        options = _.merge(options, {
            params: {
                is_pbx_group: 0,
                is_pbx_pilot: 0
            }
        })
        Promise.resolve().then(() => {
            return Promise.all([
                getFullSubscribers(options),
                getAllSoundSets()
            ])
        }).then((result) => {
            resolve({
                subscribers: result[0].subscribers,
                preferences: {
                    items: result[0].preferences
                },
                soundSets: result[1]
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getSeatsOnly (options) {
    return new Promise((resolve, reject) => {
        options = options || {}
        options = _.merge(options, {
            params: {
                is_pbx_group: 0,
                is_pbx_pilot: 0
            }
        })
        Promise.resolve().then(() => {
            return getSubscribers(options)
        }).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getSeatList (options) {
    return new Promise((resolve, reject) => {
        const page = _.get(options, 'page', 1)
        const displayName = _.get(options, 'display_name', null)
        const pbxExtension = _.get(options, 'pbx_extension', null)
        const primaryNumber = _.get(options, 'primary_number', null)
        const aliasNumber = _.get(options, 'alias_number', null)
        const params = {
            page: page,
            order_by: PBX_CONFIG_ORDER_BY,
            order_by_direction: PBX_CONFIG_ORDER_DIRECTION
        }
        if (displayName) {
            params.display_name = displayName
        }
        if (pbxExtension) {
            params.pbx_extension = pbxExtension
        }
        if (primaryNumber) {
            params.primary_number = primaryNumber
        }
        if (aliasNumber) {
            params.alias_number = aliasNumber
        }
        Promise.all([
            getSeats({
                params: params
            }),
            getGroupsOnly({
                all: true
            }),
            getPilot(),
            getNumbers()
        ]).then((result) => {
            resolve({
                seats: result[0].subscribers,
                preferences: result[0].preferences,
                soundSets: result[0].soundSets,
                groups: result[1],
                pilot: result[2],
                numbers: result[3]
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function createSeat (seat) {
    return new Promise((resolve, reject) => {
        let subscriberId
        Promise.resolve().then(() => {
            return createSubscriber({
                username: _.kebabCase(seat.name),
                password: seat.sipPassword ? seat.sipPassword : createId(),
                display_name: seat.name,
                webpassword: seat.webPassword.length > 0 ? seat.webPassword : null,
                is_pbx_group: false,
                pbx_extension: seat.extension,
                pbx_group_ids: seat.groups
            })
        }).then(($subscriberId) => {
            subscriberId = $subscriberId
            setSeatIntraPbx(subscriberId, seat.clirIntrapbx)
            if (seat.soundSet !== null && seat.soundSet !== undefined) {
                return getSoundSet(seat.soundSet)
            } else {
                return Promise.resolve(null)
            }
        }).then((soundSet) => {
            const promises = [
                assignNumbers(seat.aliasNumbers, subscriberId)
            ]
            if (soundSet !== null) {
                promises.push(setSubscriberSoundSet(subscriberId, soundSet.name))
            }
            return Promise.all(promises)
        }).then(() => {
            resolve(subscriberId)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeSeat (id) {
    return deleteSubscriber(id)
}

/**
 * @param options
 * @param options.seatId
 * @param options.seatName
 */
export function setSeatName (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setDisplayName(options.seatId, options.seatName)
        }).then(() => {
            return getSubscriberAndPreferences(options.seatId)
        }).then((result) => {
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * @param options
 * @param options.seatId
 * @param options.seatExtension
 */
export function setSeatExtension (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setPbxExtension(options.seatId, options.seatExtension)
        }).then(() => {
            return getSubscriberAndPreferences(options.seatId)
        }).then((result) => {
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * @param options
 * @param options.seatId
 * @param options.seatWebPassword
 */
export function setSeatWebPassword (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setPbxWebPassword(options.seatId, options.seatWebPassword)
        }).then(() => {
            return getSubscriberAndPreferences(options.seatId)
        }).then((result) => {
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * @param options
 * @param options.seatId
 * @param options.seatSIPPassword
 */
export function setSeatSIPPassword (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setPbxSIPPassword(options.seatId, options.seatSIPPassword)
        }).then(() => {
            return getSubscriberAndPreferences(options.seatId)
        }).then((result) => {
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * @param seatId
 * @param clirIntrapbx
 */
export function setSeatIntraPbx (seatId, clirIntrapbx) {
    return setPreferenceIntraPbx(seatId, clirIntrapbx)
}

/**
 * @param seatId
 * @param musicOnHold
 */
export function setSeatMusicOnHold (seatId, musicOnHold) {
    return setPreferenceMusicOnHold(seatId, musicOnHold)
}

/**
 * @param options
 * @param options.seatId
 * @param options.groupIds
 */
export function setSeatGroups (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setPbxGroupIds(options.seatId, options.groupIds)
        }).then(() => {
            return getSubscriberAndPreferences(options.seatId)
        }).then((result) => {
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * @param options
 * @param options.seatId
 * @param options.pilotId
 * @param options.assignedNumbers
 * @param options.unassignedNumbers
 * @return {Promise<any>}
 */
export function setSeatNumbers (options) {
    return new Promise((resolve, reject) => {
        setSubscriberNumbers({
            subscriberId: options.seatId,
            pilotId: options.pilotId,
            assignedNumbers: options.assignedNumbers,
            unassignedNumbers: options.unassignedNumbers
        }).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * @param options
 * @param options.seatId
 * @param options.soundSetId
 */
export function setSeatSoundSet (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            if (options.soundSetId !== null && options.soundSetId !== undefined) {
                return getSoundSet(options.soundSetId)
            } else {
                return Promise.resolve(null)
            }
        }).then((soundSet) => {
            const soundSetName = _.get(soundSet, 'name', null)
            return setSubscriberSoundSet(options.seatId, soundSetName)
        }).then(() => {
            return getSubscriberAndPreferences(options.seatId)
        }).then((result) => {
            resolve({
                seat: result.subscriber,
                preferences: result.preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * @param seatId
 */
export async function getSeatPreferences (seatId) {
    try {
        return await getPreferences(seatId)
    } catch (err) {
        return err
    }
}
