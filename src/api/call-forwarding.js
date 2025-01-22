import _ from 'lodash'
import {
    del,
    get,
    getList,
    patchReplace,
    post,
    putMinimal
} from 'src/api/common'
import { showGlobalError } from 'src/helpers/ui'
import { v4 } from 'uuid'

export async function cfLoadMappings (subscriberId) {
    return get({
        resource: 'cfmappings',
        resourceId: subscriberId
    })
}

export async function cfLoadBNumberSets (subscriberId) {
    return getList({
        resource: 'cfbnumbersets',
        all: true,
        params: (subscriberId) ? { subscriber_id: subscriberId } : {}
    })
}

export async function cfLoadDestinationSets (subscriberId) {
    return getList({
        resource: 'cfdestinationsets',
        all: true,
        params: (subscriberId) ? { subscriber_id: subscriberId } : {}
    })
}

export async function cfLoadSourceSets (subscriberId) {
    return getList({
        resource: 'cfsourcesets',
        params: (subscriberId) ? { subscriber_id: subscriberId } : {},
        all: true
    })
}

export async function cfLoadTimeSets (subscriberId) {
    return getList({
        resource: 'cftimesets',
        params: (subscriberId) ? { subscriber_id: subscriberId } : {},
        all: true
    })
}

export async function cfLoadMappingsFull (subscriberId) {
    return await Promise.all([
        cfLoadMappings(subscriberId),
        cfLoadDestinationSets(),
        cfLoadSourceSets(),
        cfLoadTimeSets(),
        cfLoadBNumberSets()
    ])
}

export async function cfCreateDestinationSet (payload) {
    return post({
        resource: 'cfdestinationsets',
        body: payload
    })
}

export async function cfDeleteDestinationSet (id) {
    return del({
        resource: 'cfdestinationsets',
        resourceId: id
    })
}

export async function cfCreateBNumberSet (id, payload) {
    const bNumbers = []
    payload.numbers.forEach((number) => {
        bNumbers.push({
            bnumber: number
        })
    })
    try {
        const res = await post({
            resource: 'cfbnumbersets',
            body: {
                name: payload.name,
                subscriber_id: id,
                is_regex: true,
                bnumbers: bNumbers,
                mode: payload.mode
            }
        })
        if (!_.isString(res)) {
            return `${res.id}`
        }
        return res
    } catch (e) {
        showGlobalError(e)
    }
}

export async function cfDeleteBNumberSet (id) {
    return del({
        resource: 'cfbnumbersets',
        resourceId: id
    })
}

export async function cfUpdateBNumberSet (id, payload) {
    const bnumbers = []
    payload.numbers.forEach((number) => {
        bnumbers.push({
            bnumber: number
        })
    })
    return putMinimal({
        resource: 'cfbnumbersets',
        resourceId: payload.id,
        body: {
            name: payload.name,
            subscriber_id: id,
            is_regex: true,
            bnumbers,
            mode: payload.mode
        }
    })
}

export async function cfCreateSourceSet (id, payload) {
    const sources = []
    payload.numbers.forEach((number) => {
        sources.push({
            source: number
        })
    })
    try {
        const res = await post({
            resource: 'cfsourcesets',
            body: {
                name: payload.name,
                subscriber_id: id,
                is_regex: true,
                sources,
                mode: payload.mode
            }
        })
        if (!_.isString(res)) {
            return `${res.id}`
        }
        return res
    } catch (e) {
        showGlobalError(e)
    }
}

export async function cfUpdateSourceSet (id, payload) {
    const sources = []
    payload.numbers.forEach((number) => {
        sources.push({
            source: number
        })
    })
    return putMinimal({
        resource: 'cfsourcesets',
        resourceId: payload.id,
        body: {
            name: payload.name,
            subscriber_id: id,
            is_regex: true,
            sources,
            mode: payload.mode
        }
    })
}

export async function cfDeleteSourceSet (id) {
    return del({
        resource: 'cfsourcesets',
        resourceId: id
    })
}

export async function cfCreateTimeSetDate (subscriberId, date) {
    return post({
        resource: 'cftimesets',
        body: {
            subscriber_id: subscriberId,
            name: `csc-date-exact-${v4()}`,
            times: [
                {
                    minute: null,
                    month: date.month,
                    hour: null,
                    mday: date.date,
                    year: date.year,
                    wday: null
                }
            ]
        }
    })
}

export async function cfUpdateTimeSetDate (timeSetId, date) {
    return patchReplace({
        resource: 'cftimesets',
        resourceId: timeSetId,
        fieldPath: 'times',
        value: [
            {
                minute: null,
                month: date.month,
                hour: null,
                mday: date.date,
                year: date.year,
                wday: null
            }
        ]
    })
}

export async function cfDeleteTimeSet (timesetId) {
    return del({
        resource: 'cftimesets',
        resourceId: timesetId
    })
}

export async function cfCreateTimeSetDateRange (subscriberId, times) {
    return post({
        resource: 'cftimesets',
        body: {
            subscriber_id: subscriberId,
            name: `csc-date-range-${v4()}`,
            times
        }
    })
}

export async function cfUpdateTimeSetDateRange (timeSetId, times) {
    return patchReplace({
        resource: 'cftimesets',
        resourceId: timeSetId,
        fieldPath: 'times',
        value: times
    })
}

export async function cfCreateTimeSetWeekdays (subscriberId, weekdays) {
    const times = []
    weekdays.forEach((weekday) => {
        times.push({
            minute: null,
            month: null,
            hour: null,
            mday: null,
            year: null,
            wday: weekday
        })
    })
    return post({
        resource: 'cftimesets',
        body: {
            subscriber_id: subscriberId,
            name: `csc-weekdays-${v4()}`,
            times
        }
    })
}

export async function cfUpdateTimeSetWeekdays (timeSetId, weekdays) {
    const times = []
    weekdays.forEach((weekday) => {
        times.push({
            minute: null,
            month: null,
            hour: null,
            mday: null,
            year: null,
            wday: weekday
        })
    })
    return patchReplace({
        resource: 'cftimesets',
        resourceId: timeSetId,
        fieldPath: 'times',
        value: times
    })
}

export async function cfCreateOfficeHours (subscriberId, times) {
    return post({
        resource: 'cftimesets',
        body: {
            subscriber_id: subscriberId,
            name: `csc-office-hours-${v4()}`,
            times
        }
    })
}

export async function cfUpdateOfficeHours (timeSetId, times) {
    return patchReplace({
        resource: 'cftimesets',
        resourceId: timeSetId,
        fieldPath: 'times',
        value: times
    })
}
