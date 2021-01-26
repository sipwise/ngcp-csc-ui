// /* eslint-disable */

/*
humanReadableTimeset = [{
  weekday: 1..7,
  from: '0:00',
  to: '23:59'

  //Seconds are NOT SUPPORTED !!!
  //Time "23:59" in "to" field is considering as "24:00" !!!
}, ...
]

kamailioTimeset = [{
    //SUPPORTED
    wday - Day of the week, either a number between 1 and 7, or at least the first 2 letters of a spelled out weekday name (analogous to the “month” scale). Sunday is the first day of the week.
    hour - A number between 0 and 23. Unlike the Perl Time::Period module, “am” or “pm” specifications are not supported.
    minute  - A number between 0 and 59.

        //NOT SUPPORTED !!!
        reversed ranges, like: "hour {15-3}"
        complex ranges, like: "hour {1 2 5-8}"
        Aliases: wd, hr, min

        year or yr - Either given as a full 4-digit number >= 1970, or as a 2-digit number, in which case it will be understood to be within the current century.
        month or mo - Month of the year, either a number between 1 and 12, or at least the first 3 letters of a spelled out month name, e.g. “jan”, “janua” or “january” will all work.
        week or wk - Week of the month, a number between 1 and 6. The first day of the week is Sunday.
        yday or yd - Day of the year, a number between 1 and 366.
        mday or md - Day of the month, a number between 1 and 31.
        second or sec - A number between 0 and 60 (to allow for leap seconds).
}, ...
]
*/

export function getTimeStrElements(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(t => parseInt(t, 10))
    return { hours, minutes }
}

/**
 * @param timeStr - a string with hour and minutes divided by colon, like "0:00" or "23:59"
 * @returns {number}
 */
export function timeStrToMinutes(timeStr) {
    const { hours, minutes } = getTimeStrElements(timeStr)
    return hours * 60 + minutes
}

export function isTimeStrValid(timeStr) {
    if (typeof timeStr === 'string') {
        const { hours, minutes } = getTimeStrElements(timeStr)
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
    }
    return false
}

export function validateHumanTimesets(hTimeset) {
    hTimeset.forEach(timesetItem => {
        const { weekday, from, to } = timesetItem
        if (typeof weekday !== 'number' || isNaN(weekday) || weekday < 1 || weekday > 7 ||
            !isTimeStrValid(from) || !isTimeStrValid(to)
        ) {
            throw Error('A human timeset item has invalid format: ' + JSON.stringify(timesetItem))
        }
        else if (timeStrToMinutes(from) > timeStrToMinutes(to)) {
            throw Error('A human timeset item should have "from" time < or = "to" time: ' + JSON.stringify(timesetItem))
        }
    })
}

/**
 * Function resort timesets by "weekday" and "from" and combines closest timesets or duplicates
 * Important! Before use this function please validate you timeses for correctness.
 * @param hTimeset {humanReadableTimeset}
 * @returns {humanReadableTimeset}
 */
export function getHumanTimesetsNormalized(hTimeset = []) {
    //sort timeset by "weekday" and "from" columns
    //clone input data to prevent original data object mutation
    const hTimesetCloned = hTimeset.map(i => ({...i}))
    const htSorted = hTimesetCloned.sort((a, b) => {
        const dayDiff = a.weekday - b.weekday
        if (dayDiff)
            return dayDiff
        else
            return timeStrToMinutes(a.from) - timeStrToMinutes(b.from)
    })

    //combine, merge periods for a day. For example 0:00-2:00 and 1:00-4:00 should be merged into 0:00-4:00
    //Important: the timeset should be sorted by "weekday" and "from"!
    const htNormalized = htSorted.reduce((acc, currentItem) => {
        const prevItem = acc.pop()
        if (!prevItem) {
            acc.push(currentItem)
        }
        else if (prevItem.weekday !== currentItem.weekday) {
            acc.push(prevItem)
            acc.push(currentItem)
        }
        else {
            const prevItemMinutes = { fromM: timeStrToMinutes(prevItem.from), toM: timeStrToMinutes(prevItem.to) }
            const currentItemMinutes = { fromM: timeStrToMinutes(currentItem.from), toM: timeStrToMinutes(currentItem.to) }

            if (prevItemMinutes.fromM <= currentItemMinutes.fromM && currentItemMinutes.toM <= prevItemMinutes.toM) {
                //current time range is completely inside previous time range --> just skipping current timeSet item
                acc.push(prevItem)
            }
            else if (prevItemMinutes.toM < currentItemMinutes.fromM) {
                //current time range is not part of previous time range --> adding both as separate time ranges
                acc.push(prevItem)
                acc.push(currentItem)
            }
            else if (prevItemMinutes.toM >= currentItemMinutes.fromM) {
                //current time range is the next chunk\part of the previous time range
                // OR they are intercepting --> extending\combining previous time range with current time range
                prevItem.to = currentItem.to
                acc.push(prevItem)
            }
            else {
                console.info('Acc:', acc, 'prevItem:', prevItem, 'currentItem:', currentItem)
                console.info('prevItemMinutes:', prevItemMinutes, 'currentItemMinutes:', currentItemMinutes)
                throw Error('Internal error in "getHumanTimesetsNormalized"')
            }
        }
        return acc
    }, [])

    return htNormalized
}

export function humanTimesetToKamailio(hTimeset = []) {
    validateHumanTimesets(hTimeset)

    const htNormalized = getHumanTimesetsNormalized(hTimeset)
    const kamailioTimesetRaw = htNormalized.map(timesetItem => {
        const { weekday, from } = timesetItem
        const to = timesetItem.to === '23:59' ? '24:00' : timesetItem.to

        const fromHM = getTimeStrElements(from)
        const toHM = getTimeStrElements(to)

        const result = []
        if (fromHM.hours === toHM.hours) {
            if (fromHM.minutes === toHM.minutes || fromHM.minutes + 1 === toHM.minutes)
                result.push({ wday: weekday, hour: `${fromHM.hours}`, minute: `${fromHM.minutes}` })
            else
                result.push({ wday: weekday, hour: `${fromHM.hours}`, minute: `${fromHM.minutes}-${toHM.minutes-1}` })
        }
        else {
            //NOTE: any human readable time range for a day can be represented as next set of Kamailio ranges
            //for example "1:10-5:35" can be represented as "1:10-2:00", "2:00-5:00", "5:00-5:35" and than coded in Kamailio format
            //    [
            //      { wday: weekday, hour: `${fromHM.hours}`, minute: `${fromHM.minutes}-59` },
            //      { wday: weekday, hour: `${fromHM.hours+1}-${toHM.hours-1}` },
            //      { wday: weekday, hour: `${toHM.hours}`, minute: `0-${toHM.minutes-1}` }
            //    ]
            //but code below will output a little more optimized version

            //"Starting" range
            if (fromHM.minutes > 0) {
                result.push({ wday: weekday, hour: `${fromHM.hours}`, minute: `${fromHM.minutes}-59` })
            }
            else fromHM.hours -= 1

            //"Middle" range
            if (fromHM.hours + 1 <= toHM.hours-1) {
                result.push({ wday: weekday, hour: `${fromHM.hours + 1}-${toHM.hours - 1}` })
            }

            //"Ending" range
            if (toHM.minutes > 0) {
                result.push({ wday: weekday, hour: `${toHM.hours}`, minute: `0-${toHM.minutes-1}` })
            }
        }
        return result
    })

    const kamailioTimeset = kamailioTimesetRaw.reduce((acc, item) => {
        const optimizedItemRanges = item.map(item => {
            //if minute or hour contains range like "a-a" convert to just "a"
            if (item.hour) {
                let [hourF, hourT] = item.hour.split('-')
                if (hourF === hourT) item.hour = hourF
            }

            if (item.minute) {
                let [minuteF, minuteT] = item.minute.split('-')
                if (minuteF === minuteT) item.minute = minuteF
            }

            return item
        })
        //similar to flatMap
        return [...acc, ...optimizedItemRanges]
    }, [])
        .reduce((acc, item) => {
            //combine the same time ranges by "wday"
            if (acc.length === 0)
                acc.push(item)
            else {
                const mergeCandidate = acc.find(accItem =>
                    accItem.hour === item.hour &&
                    accItem.minute === item.minute &&
                    getKamailioRangeElements(accItem.wday)[0].to + 1 === getKamailioRangeElements(item.wday)[0].from
                )
                if (mergeCandidate) {
                    const mergeCandidateWday = getKamailioRangeElements(mergeCandidate.wday)[0]
                    mergeCandidate.wday = `${mergeCandidateWday.from}-${mergeCandidateWday.to + 1}`
                }
                else {
                    acc.push(item)
                }
            }
            return acc
        }, [])

    return kamailioTimeset
}

//---------------

export function getKamailioRangeElements(kamailioRangeStr = '') {
    const ranges = String(kamailioRangeStr).trim().split(' ').map(r => r.trim()).filter(r => r.length)
    return ranges.map(r => {
        const rangeElements = r.split('-').map(r => r.trim()).map(r => parseInt(r, 10))

        if (rangeElements.length > 2)
            throw Error('Invalid Kamailio range format: "' + kamailioRangeStr + '"')

        return {
            from: rangeElements[0],
            to: rangeElements.length === 2 ? rangeElements[1] : rangeElements[0]
        }
    })
}

export function validateKamailioRange(kamailioRangeStr = '', minValue, maxValue) {
    const rangeElements = getKamailioRangeElements(kamailioRangeStr)
    if (rangeElements.length === 0)
        throw Error('Kamailio range should not be empty')
    else if (rangeElements.length > 1)
        throw Error('Kamailio multiple ranges are not supported: "' + kamailioRangeStr + '"')
    else {
        if (isNaN(rangeElements[0].from) || isNaN(rangeElements[0].to))
            throw Error('Kamailio range has invalid characters or a wrong format: "' + kamailioRangeStr + '"')
        if (rangeElements[0].from > rangeElements[0].to)
            throw Error('Kamailio reversed ranges are not supported: "' + kamailioRangeStr + '"')
        if (minValue !== undefined && maxValue !== undefined) {
            if (rangeElements[0].from < minValue || maxValue < rangeElements[0].from ||
                rangeElements[0].to < minValue || maxValue < rangeElements[0].to) {
                throw Error(`Kamailio range elements are out of allowed values range (${minValue}..${maxValue}) : "${kamailioRangeStr}"`)
            }
        }
    }
}

export function validateKamailioTimesets(kTimeset) {
    kTimeset.forEach(timesetItem => {
        let { wday, hour, minute } = timesetItem
        wday = (wday === null || wday === undefined) ? '' : String(wday).trim()
        hour = (hour === null || hour === undefined) ? '' : String(hour).trim()
        minute = (minute === null || minute === undefined) ? '' : String(minute).trim()
        if (wday !== '')
            validateKamailioRange(wday, 1, 7)
        else
            throw Error('A Kamailio timeset should have "wday" range: ' + JSON.stringify(timesetItem))
        if (hour !== '')
            validateKamailioRange(hour, 0, 23)
        if (minute !== '')
            validateKamailioRange(minute, 0, 59)

        Object.entries(timesetItem)
            .filter(([key]) => !['wday', 'hour', 'minute'].includes(key))
            .forEach(([key, value]) => {
                if (!(value === null || value === undefined || String(value).trim().length === 0))
                    throw Error(`The "${key}" scale of Kamailio timesets is not supported: ${JSON.stringify(timesetItem)}`)
            })
    })
}

export function kamailioTimesetToHuman(kTimeset = []) {
    validateKamailioTimesets(kTimeset)

    //convert Kamailio timeset into Human readable format
    const hTimesetRaw = kTimeset.map(timesetItem => {
        let { wday, hour, minute } = timesetItem
        hour = (hour === null || hour === undefined) ? '' : String(hour).trim()
        minute = (minute === null || minute === undefined) ? '' : String(minute).trim()

        wday = getKamailioRangeElements(wday)[0]
        if (hour !== '')
            hour = getKamailioRangeElements(hour)[0]
        else
            hour = { from: 0, to: 23 }
        if (minute !== '')
            minute = getKamailioRangeElements(minute)[0]
        else
            minute = { from: 0, to: 59 }

        const nestedRules = [wday, hour, minute].reverse()
        const rulesOutput = nestedRules.reduce((acc, range) => {
            const newAcc = []
            if (acc.length === 0) {
                newAcc.push({ from: String(range.from), to: String(range.to + 1) })
            }
            else {
                for (let i = range.from; i <= range.to; i++) {
                    acc.forEach(accItem =>
                        newAcc.push({ from: [i, accItem.from].join('_'), to: [i, accItem.to].join('_') })
                    )
                }
            }
            return newAcc
        }, [])
        const hTimeset = rulesOutput.map(ruleOutput => {
            const [fromWday, fromHour, fromMinute] = ruleOutput.from.split('_').map(i => Number(i))
            const [, toHour, toMinute] = ruleOutput.to.split('_').map(i => Number(i))
            const from = [fromHour, fromMinute]
                .map((i, index) => String(i).padStart((index === 1) ? 2 : 1, '0')).join(':')
            const to = [
                (toMinute === 60) ? toHour + 1 : toHour,
                (toMinute === 60) ? 0 : toMinute
            ].map((i, index) => String(i).padStart((index === 1) ? 2 : 1, '0')).join(':')

            return {
                weekday: fromWday,
                from,
                to: (to === '24:00') ? '23:59': to
            }
        })

        return hTimeset
    })
        .reduce((acc, item) => [...acc, ...item], [])

    return getHumanTimesetsNormalized(hTimesetRaw)
}
