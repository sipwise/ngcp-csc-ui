import {
    createSubscriber,
    deleteSubscriber,
    getFullSubscribers,
    getSubscriberAndPreferences,
    getSubscribers,
    setDisplayName,
    setWebUsername,
    setPbxExtension,
    setPbxWebPassword,
    setPbxGroupIds,
    setSubscriberNumbers,
    setPreferenceIntraPbx,
    setPreferenceMusicOnHold,
    setPreferenceCli,
    getPreferences,
    setPbxSIPPassword,
    setPreferenceAnnouncementCfu,
    setPreferenceAnnouncementCallSetup,
    setPreferenceAnnouncementToCallee,
    setPreferenceIgnoreCfWhenHunting,
    setPreferenceCstaClient,
    setPreferenceCstaController
} from './subscriber'
import _ from 'lodash'
import {
    getAllSoundSets,
    getPilot,
    getSoundSet,
    createId,
    PBX_CONFIG_ORDER_BY,
    PBX_CONFIG_ORDER_DIRECTION,
    setSubscriberSoundSet,
    getNcos,
    getNcosSet,
    setSubscriberNcos,
    setSubscriberNcosSet
} from './pbx-config'
import {
    assignNumbers,
    getNumbers
} from './user'
import {
    getGroupsOnly
} from './pbx-groups'
import {
    getSubscriberId
} from 'src/auth'
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
            getNumbers(),
            getSubscribers()
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
                username: seat.sipUsername.trim(),
                display_name: seat.displayName.trim(),
                webusername: seat.webUsername.trim(),
                password: seat.sipPassword ? seat.sipPassword : createId(),
                webpassword: seat.webPassword.length > 0 ? seat.webPassword : null,
                is_pbx_group: false,
                pbx_extension: seat.extension,
                pbx_group_ids: seat.groups
            }, { forceCli: seat.forceCli })
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
 * @param options.displayName
 */
export function setSeatDisplayName (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setDisplayName(options.seatId, options.displayName)
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
 * @param options.webUsername
 */
export function setSeatWebUsername (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setWebUsername(options.seatId, options.webUsername)
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
 * @param seatId
 * @param cli
 */
export function setSeatCli (seatId, cli) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return setPreferenceCli(seatId, cli)
        }).then(() => {
            return getSubscriberAndPreferences(seatId)
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
 * @param announcementCfu
 */
export function setSeatAnnouncementCfu (seatId, announcementCfu) {
    return setPreferenceAnnouncementCfu(seatId, announcementCfu)
}

/**
 * @param seatId
 * @param announcementCallSetup
 */
export function setSeatAnnouncementCallSetup (seatId, announcementCallSetup) {
    return setPreferenceAnnouncementCallSetup(seatId, announcementCallSetup)
}

/**
 * @param seatId
 * @param announcementToCallee
 */
export function setSeatAnnouncementToCallee (seatId, announcementToCallee) {
    return setPreferenceAnnouncementToCallee(seatId, announcementToCallee)
}

/**
 * @param seatId
 * @param ignoreCfWhenHunting
 */
export function setSeatIgnoreCfWhenHunting (seatId, ignoreCfWhenHunting) {
    return setPreferenceIgnoreCfWhenHunting(seatId, ignoreCfWhenHunting)
}

/**
 * @param seatId
 * @param cstaClient
 */
export function setSeatCstaClient (seatId, cstaClient) {
    return setPreferenceCstaClient(seatId, cstaClient)
}

/**
 * @param seatId
 * @param cstaController
 */
export function setSeatCstaController (seatId, cstaController) {
    return setPreferenceCstaController(seatId, cstaController)
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
            if (result.subscriber !== null && result.preferences !== null) {
                return result
            }
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
/**
 * @param options
 * @param options.seatId
 * @param options.ncosId
 */
export function setNcosSet (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            if (options.ncosId !== null && options.ncosId !== undefined) {
                return getNcos(options.ncosId)
            } else {
                return Promise.resolve(null)
            }
        }).then((ncos) => {
            const ncosName = _.get(ncos, 'level', null)
            return setSubscriberNcos(options.seatId, ncosName)
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
 * @param options.ncosId
 */
export function NcosSet (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            if (options.ncosSetId !== null && options.ncosSetId !== undefined) {
                return getNcosSet(options.ncosSetId)
            } else {
                return Promise.resolve(null)
            }
        }).then((ncosSet) => {
            const ncosName = _.get(ncosSet, 'name', null)
            return setSubscriberNcosSet(options.seatId, ncosName)
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
 * @param options.ncosId
 */
export function NcosSets (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            if (options.ncosSetId !== null && options.ncosSetId !== undefined) {
                return getNcosSet(options.ncosSetId)
            } else {
                return Promise.resolve(null)
            }
        }).then((ncosSet) => {
            const ncosName = _.get(ncosSet, 'name', null)
            return setSubscriberNcosSet(getSubscriberId(), ncosName)
        }).then(() => {
            return getSubscriberAndPreferences(getSubscriberId())
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
 * @param options.ncosId
 */
export function setNcosLevelSets (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            if (options.ncosId !== null && options.ncosId !== undefined) {
                return getNcos(options.ncosId)
            } else {
                return Promise.resolve(null)
            }
        }).then((ncos) => {
            const ncosName = _.get(ncos, 'level', null)
            return setSubscriberNcos(getSubscriberId(), ncosName)
        }).then(() => {
            return getSubscriberAndPreferences(getSubscriberId())
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
