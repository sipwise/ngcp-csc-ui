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

function getAsTrimmedString (data) {
    return (data === null || data === undefined) ? '' : String(data).trim()
}

export function getTimeStrElements (timeStr) {
    const [hours, minutes] = timeStr.split(':').map((t) => Number(t))
    return { hours, minutes }
}

/**
 * @param timeStr - a string with hour and minutes divided by colon, like "0:00" or "23:59"
 * @returns {number}
 */
export function timeStrToMinutes (timeStr) {
    const { hours, minutes } = getTimeStrElements(timeStr)
    return hours * 60 + minutes
}

export function isTimeStrValid (timeStr) {
    if (typeof timeStr === 'string') {
        const { hours, minutes } = getTimeStrElements(timeStr)
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
    }
    return false
}

export function validateHumanTimesets (hTimeset) {
    hTimeset.forEach((timesetItem) => {
        const { weekday, from, to } = timesetItem
        if (typeof weekday !== 'number' || isNaN(weekday) || weekday < 1 || weekday > 7 ||
            !isTimeStrValid(from) || !isTimeStrValid(to)
        ) {
            throw Error(`A human timeset item has invalid format: ${JSON.stringify(timesetItem)}`)
        } else if (timeStrToMinutes(from) > timeStrToMinutes(to)) {
            throw Error(`A human timeset item should have "from" time < or = "to" time: ${JSON.stringify(timesetItem)}`)
        }
    })
}

/**
 * Function resort timesets by "weekday" and "from" and combines closest timesets or duplicates
 * Important! Before use this function please validate you timeses for correctness.
 * @param hTimeset {humanReadableTimeset}
 * @returns {humanReadableTimeset}
 */
export function getHumanTimesetsNormalized (hTimeset = []) {
    // sort timeset by "weekday" and "from" columns
    // clone input data to prevent original data object mutation
    const hTimesetCloned = hTimeset.map((i) => ({ ...i }))
    const htSorted = hTimesetCloned.sort((a, b) => {
        const dayDiff = a.weekday - b.weekday
        if (dayDiff) {
            return dayDiff
        }
        return timeStrToMinutes(a.from) - timeStrToMinutes(b.from)
    })

    // combine, merge periods for a day. For example 0:00-2:00 and 1:00-4:00 should be merged into 0:00-4:00
    // Important: the timeset should be sorted by "weekday" and "from"!
    const htNormalized = htSorted.reduce((acc, currentItem) => {
        const prevItem = acc.pop()
        if (!prevItem) {
            acc.push(currentItem)
        } else if (prevItem.weekday !== currentItem.weekday) {
            acc.push(prevItem)
            acc.push(currentItem)
        } else {
            const prevItemMinutes = { fromM: timeStrToMinutes(prevItem.from), toM: timeStrToMinutes(prevItem.to) }
            const currentItemMinutes = { fromM: timeStrToMinutes(currentItem.from), toM: timeStrToMinutes(currentItem.to) }

            if (prevItemMinutes.fromM <= currentItemMinutes.fromM && currentItemMinutes.toM <= prevItemMinutes.toM) {
                // current time range is completely inside previous time range --> just skipping current timeSet item
                acc.push(prevItem)
            } else if (prevItemMinutes.toM < currentItemMinutes.fromM) {
                // current time range is not part of previous time range --> adding both as separate time ranges
                acc.push(prevItem)
                acc.push(currentItem)
            } else if (prevItemMinutes.toM >= currentItemMinutes.fromM) {
                // current time range is the next chunk\part of the previous time range
                // OR they are intercepting --> extending\combining previous time range with current time range
                prevItem.to = currentItem.to
                acc.push(prevItem)
            } else {
                // eslint-disable-next-line no-console
                console.info('Acc:', acc, 'prevItem:', prevItem, 'currentItem:', currentItem)
                // eslint-disable-next-line no-console
                console.info('prevItemMinutes:', prevItemMinutes, 'currentItemMinutes:', currentItemMinutes)
                throw Error('Internal error in "getHumanTimesetsNormalized"')
            }
        }
        return acc
    }, [])

    return htNormalized
}

export function humanTimesetToKamailio (hTimeset = []) {
    validateHumanTimesets(hTimeset)

    const htNormalized = getHumanTimesetsNormalized(hTimeset)
    const kamailioTimesetRaw = htNormalized.map((timesetItem) => {
        const { weekday, from } = timesetItem
        const to = timesetItem.to === '23:59' ? '24:00' : timesetItem.to

        const fromHM = getTimeStrElements(from)
        const toHM = getTimeStrElements(to)

        const result = []
        if (fromHM.hours === toHM.hours) {
            if (fromHM.minutes === toHM.minutes || fromHM.minutes + 1 === toHM.minutes) {
                result.push({ wday: weekday, hour: `${fromHM.hours}`, minute: `${fromHM.minutes}` })
            } else {
                result.push({ wday: weekday, hour: `${fromHM.hours}`, minute: `${fromHM.minutes}-${toHM.minutes - 1}` })
            }
        } else {
            // NOTE: any human readable time range for a day can be represented as next set of Kamailio ranges
            // for example "1:10-5:35" can be represented as "1:10-2:00", "2:00-5:00", "5:00-5:35" and than coded in Kamailio format
            //    [
            //      { wday: weekday, hour: `${fromHM.hours}`, minute: `${fromHM.minutes}-59` },
            //      { wday: weekday, hour: `${fromHM.hours+1}-${toHM.hours-1}` },
            //      { wday: weekday, hour: `${toHM.hours}`, minute: `0-${toHM.minutes-1}` }
            //    ]
            // but code below will output a little more optimized version

            // "Starting" range
            if (fromHM.minutes > 0) {
                result.push({ wday: weekday, hour: `${fromHM.hours}`, minute: `${fromHM.minutes}-59` })
            } else {
                fromHM.hours -= 1
            }

            // "Middle" range
            if (fromHM.hours + 1 <= toHM.hours - 1) {
                result.push({ wday: weekday, hour: `${fromHM.hours + 1}-${toHM.hours - 1}` })
            }

            // "Ending" range
            if (toHM.minutes > 0) {
                result.push({ wday: weekday, hour: `${toHM.hours}`, minute: `0-${toHM.minutes - 1}` })
            }
        }
        return result
    })

    let kamailioTimeset = kamailioTimesetRaw.reduce((acc, item) => {
        const optimizedItemRanges = item.map((item) => {
            // if minute or hour contains range like "a-a" convert to just "a"
            if (item.hour) {
                const [hourF, hourT] = item.hour.split('-')
                if (hourF === hourT) {
                    item.hour = hourF
                }
            }

            if (item.minute) {
                const [minuteF, minuteT] = item.minute.split('-')
                if (minuteF === minuteT) {
                    item.minute = minuteF
                }
            }

            return item
        })
        // similar to flatMap
        return [...acc, ...optimizedItemRanges]
    }, [])
    kamailioTimeset = kamailioTimeset.reduce((acc, item) => {
        // combine the same time ranges by "wday"
        if (acc.length === 0) {
            acc.push(item)
        } else {
            const mergeCandidate = acc.find((accItem) => accItem.minute === item.minute &&
                accItem.hour === item.hour &&
                getKamailioRangeElements(accItem.wday)[0].to + 1 === getKamailioRangeElements(item.wday)[0].from
            )
            if (mergeCandidate) {
                const mergeCandidateWday = getKamailioRangeElements(mergeCandidate.wday)[0]
                mergeCandidate.wday = `${mergeCandidateWday.from}-${mergeCandidateWday.to + 1}`
            } else {
                acc.push(item)
            }
        }
        return acc
    }, [])
    kamailioTimeset = kamailioTimeset.reduce((acc, item) => {
        // combine the same time ranges by "hour"
        if (acc.length === 0) {
            acc.push(item)
        } else {
            const mergeCandidate = acc.find((accItem) => accItem.minute === item.minute &&
                getKamailioRangeElements(accItem.hour)[0].to + 1 === getKamailioRangeElements(item.hour)[0].from &&
                accItem.wday === item.wday
            )
            if (mergeCandidate) {
                const mergeCandidateHour = getKamailioRangeElements(mergeCandidate.hour)[0]
                mergeCandidate.hour = `${mergeCandidateHour.from}-${mergeCandidateHour.to + 1}`
            } else {
                acc.push(item)
            }
        }
        return acc
    }, [])

    return kamailioTimeset
}

// ---------------

// TODO: does it used?
export function getSimpleRangeElements (rangeStr = '') {
    const range = String(rangeStr).trim()
    const rangeElements = range.split('-').map((r) => r.trim()).filter((r) => r.length).map((r) => Number(r))

    if (rangeElements.length === 0) {
        return undefined
    }
    if (rangeElements.length > 2) {
        throw Error(`Invalid range format: "${rangeStr}"`)
    }
    return {
        from: rangeElements[0],
        to: rangeElements.length === 2 ? rangeElements[1] : rangeElements[0]
    }
}

export function getKamailioRangeElements (kamailioRangeStr = '') {
    const ranges = String(kamailioRangeStr).trim().split(' ').map((r) => r.trim()).filter((r) => r.length)
    return ranges.map((r) => {
        const rangeElements = r.split('-').map((r) => r.trim()).map((r) => Number(r))

        if (rangeElements.length > 2) {
            throw Error(`Invalid Kamailio range format: "${kamailioRangeStr}"`)
        }

        return {
            from: rangeElements[0],
            to: rangeElements.length === 2 ? rangeElements[1] : rangeElements[0]
        }
    })
}

// eslint-disable-next-line default-param-last
export function validateKamailioRange (kamailioRangeStr = '', minValue, maxValue) {
    const rangeElements = getKamailioRangeElements(kamailioRangeStr)
    if (rangeElements.length === 0) {
        throw Error('Kamailio range should not be empty')
    } else if (rangeElements.length > 1) {
        throw Error(`Kamailio multiple ranges are not supported: "${kamailioRangeStr}"`)
    } else {
        if (isNaN(rangeElements[0].from) || isNaN(rangeElements[0].to)) {
            throw Error(`Kamailio range has invalid characters or a wrong format: "${kamailioRangeStr}"`)
        }
        if (rangeElements[0].from > rangeElements[0].to) {
            throw Error(`Kamailio reversed ranges are not supported: "${kamailioRangeStr}"`)
        }
        if (minValue !== undefined && maxValue !== undefined) {
            if (rangeElements[0].from < minValue || maxValue < rangeElements[0].from ||
                rangeElements[0].to < minValue || maxValue < rangeElements[0].to) {
                throw Error(`Kamailio range elements are out of allowed values range (${minValue}..${maxValue}) : "${kamailioRangeStr}"`)
            }
        }
    }
}

export function validateKamailioTimesets (kTimeset) {
    kTimeset.forEach((timesetItem) => {
        let { wday, hour, minute } = timesetItem
        wday = getAsTrimmedString(wday)
        hour = getAsTrimmedString(hour)
        minute = getAsTrimmedString(minute)
        if (wday !== '') {
            validateKamailioRange(wday, 1, 7)
        } else {
            throw Error(`A Kamailio timeset should have "wday" range: ${JSON.stringify(timesetItem)}`)
        }
        if (hour !== '') {
            validateKamailioRange(hour, 0, 23)
        }
        if (minute !== '') {
            validateKamailioRange(minute, 0, 59)
        }

        Object.entries(timesetItem)
            .filter(([key]) => !['wday', 'hour', 'minute'].includes(key))
            .forEach(([key, value]) => {
                if (getAsTrimmedString(value).length !== 0) {
                    throw Error(`The "${key}" scale of Kamailio timesets is not supported: ${JSON.stringify(timesetItem)}`)
                }
            })
    })
}

export function kamailioTimesetToHuman (kTimeset = []) {
    validateKamailioTimesets(kTimeset)

    // convert Kamailio timeset into Human readable format
    const hTimesetRaw = kTimeset.map((timesetItem) => {
        let { wday, hour, minute } = timesetItem
        hour = getAsTrimmedString(hour)
        minute = getAsTrimmedString(minute)

        wday = getKamailioRangeElements(wday)[0]
        if (hour !== '') {
            hour = getKamailioRangeElements(hour)[0]
        } else {
            hour = { from: 0, to: 23 }
        }
        if (minute !== '') {
            minute = getKamailioRangeElements(minute)[0]
        } else {
            minute = { from: 0, to: 59 }
        }

        const nestedRules = [wday, hour, minute]
        const rulesOutput = nestedRules.reduceRight((acc, range) => {
            const newAcc = []
            if (acc.length === 0) {
                newAcc.push({ from: String(range.from), to: String(range.to + 1) })
            } else {
                for (let i = range.from; i <= range.to; i++) {
                    acc.forEach((accItem) => newAcc.push({ from: [i, accItem.from].join('_'), to: [i, accItem.to].join('_') })
                    )
                }
            }
            return newAcc
        }, [])
        const hTimeset = rulesOutput.map((ruleOutput) => {
            const [fromWday, fromHour, fromMinute] = ruleOutput.from.split('_').map((i) => Number(i))
            const [, toHour, toMinute] = ruleOutput.to.split('_').map((i) => Number(i))
            const from = [fromHour, fromMinute]
                .map((i, index) => String(i).padStart((index === 1) ? 2 : 1, '0')).join(':')
            const to = [
                (toMinute === 60) ? toHour + 1 : toHour,
                (toMinute === 60) ? 0 : toMinute
            ].map((i, index) => String(i).padStart((index === 1) ? 2 : 1, '0')).join(':')

            return {
                weekday: fromWday,
                from,
                to: (to === '24:00') ? '23:59' : to
            }
        })

        return hTimeset
    })
        .reduce((acc, item) => [...acc, ...item], [])

    const res = getHumanTimesetsNormalized(hTimesetRaw)
    return res
}

// ----  implementation for date ranges  ----
// ------------------------------------------

/*
humanReadableDateset = [{
  from: '2020/01/01'
  to: '2020/12/30'

  //Date format is 'YYYY/MM/DD'
}, ...
]

kamailioDateset = [{
    //SUPPORTED
    year - Either given as a full 4-digit number >= 1970, or as a 2-digit number, in which case it will be understood to be within the current century.
    month - Month of the year, either a number between 1 and 12, or at least the first 3 letters of a spelled out month name, e.g. “jan”, “janua” or “january” will all work.
    mday - Day of the month, a number between 1 and 31.

        //NOT SUPPORTED !!!
        reversed ranges, like: "mday {15-3}"
        complex ranges, like: "mday {1 2 5-8}"
        Aliases: yr, mo, md, wd, hr, min,  etc

        wday - Day of the week, either a number between 1 and 7, or at least the first 2 letters of a spelled out weekday name (analogous to the “month” scale). Sunday is the first day of the week.
        hour - A number between 0 and 23. Unlike the Perl Time::Period module, “am” or “pm” specifications are not supported.
        minute  - A number between 0 and 59.

        week or wk - Week of the month, a number between 1 and 6. The first day of the week is Sunday.
        yday or yd - Day of the year, a number between 1 and 366.
        second or sec - A number between 0 and 60 (to allow for leap seconds).
}, ...
]
*/

export function getDateStrElements (dateStr) {
    const [year, month, date] = dateStr.split('/').map((t) => Number(t))
    return { year, month, date }
}

export function isDateExist (year, month, date) {
    const dateObj = new Date(year, month - 1, date)
    return dateObj.getFullYear() === year && dateObj.getMonth() === (month - 1) && dateObj.getDate() === date
}

export function isDateStrValid (dateStr) {
    if (typeof dateStr === 'string') {
        const { year, month, date } = getDateStrElements(dateStr)
        let isValid = year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && date >= 1 && date <= 31
        // recheck that passed date is really exist in that year
        isValid = isValid && isDateExist(year, month, date)
        return isValid
    }
    return false
}

export function dateStrToDays (dateStr) {
    const { year, month, date } = getDateStrElements(dateStr)
    const dateObj = new Date(year, month - 1, date)
    const dateAsMilliseconds = dateObj.valueOf()
    const millisecondsInOneDay = 24 * 60 * 60 * 1000
    return Math.round(dateAsMilliseconds / millisecondsInOneDay)
}

export function validateHumanDatesets (hDateset) {
    hDateset.forEach((datesetItem) => {
        const { from, to } = datesetItem
        if (
            !isDateStrValid(from) || !isDateStrValid(to)
        ) {
            throw Error(`A human dateset item has invalid format: ${JSON.stringify(datesetItem)}`)
        } else if (dateStrToDays(from) > dateStrToDays(to)) {
            throw Error(`A human dateset item should have "from" date < or = "to" date: ${JSON.stringify(datesetItem)}`)
        }
    })
}

export function getHumanDatesetsNormalized (hDateset = []) {
    // sort dateset by "from" columns
    // clone input data to prevent original data object mutation
    const hDatesetCloned = hDateset.map((i) => ({ ...i }))
    const hdSorted = hDatesetCloned.sort((a, b) => dateStrToDays(a.from) - dateStrToDays(b.from))

    // combine, merge periods. For example 2020/01/01-2020/10/10 and 2020/05/05-2020/11/11 should be merged into 2020/01/01-2020/11/11
    // Important: the dateset should be sorted by "from"!
    const hdNormalized = hdSorted.reduce((acc, currentItem) => {
        const prevItem = acc.pop()
        if (!prevItem) {
            acc.push(currentItem)
        } else {
            const prevItemDays = { fromD: dateStrToDays(prevItem.from), toD: dateStrToDays(prevItem.to) }
            const currentItemDays = { fromD: dateStrToDays(currentItem.from), toD: dateStrToDays(currentItem.to) }

            if (prevItemDays.fromD <= currentItemDays.fromD && currentItemDays.toD <= prevItemDays.toD) {
                // current date range is completely inside previous date range --> just skipping current dateSet item
                acc.push(prevItem)
            } else if ((prevItemDays.toD + 1) < currentItemDays.fromD) {
                // current date range is not part of previous date range --> adding both as separate date ranges
                acc.push(prevItem)
                acc.push(currentItem)
            } else if ((prevItemDays.toD + 1) >= currentItemDays.fromD) {
                // current time range is the next chunk\part of the previous date range
                // OR they are intercepting --> extending\combining previous date range with current date range
                prevItem.to = currentItem.to
                acc.push(prevItem)
            } else {
                // eslint-disable-next-line no-console
                console.info('Acc:', acc, 'prevItem:', prevItem, 'currentItem:', currentItem)
                // eslint-disable-next-line no-console
                console.info('prevItemDays:', prevItemDays, 'currentItemDays:', currentItemDays)
                throw Error('Internal error in "getHumanDatesetsNormalized"')
            }
        }
        return acc
    }, [])

    return hdNormalized
}

export function getLastDayOfMonth (year, month) {
    return (new Date(year, (month - 1) + 1, 0)).getDate()
}

export function humanDatesetToKamailio (hDateset = []) {
    validateHumanDatesets(hDateset)

    const hdNormalized = getHumanDatesetsNormalized(hDateset)
    const kamailioDatesetRaw = hdNormalized.map((datesetItem) => {
        const { from, to } = datesetItem

        const fromYMD = getDateStrElements(from)
        const toYMD = getDateStrElements(to)

        const result = []
        if (fromYMD.year === toYMD.year) {
            if (fromYMD.month === toYMD.month) {
                if (fromYMD.date === toYMD.date) {
                    result.push({ year: fromYMD.year, month: fromYMD.month, mday: fromYMD.date })
                } else {
                    result.push({ year: fromYMD.year, month: fromYMD.month, mday: `${fromYMD.date}-${toYMD.date}` })
                }
            } else {
                if ((fromYMD.month + 1) === toYMD.month) {
                    result.push({ year: fromYMD.year, month: fromYMD.month, mday: `${fromYMD.date}-31` })
                    result.push({ year: fromYMD.year, month: toYMD.month, mday: `1-${toYMD.date}` })
                } else {
                    result.push({ year: fromYMD.year, month: fromYMD.month, mday: `${fromYMD.date}-31` })
                    result.push({ year: fromYMD.year, month: `${fromYMD.month + 1}-${toYMD.month - 1}` })
                    result.push({ year: fromYMD.year, month: toYMD.month, mday: `1-${toYMD.date}` })
                }
            }
        } else {
            // NOTE: any other human readable date range can be represented as next set of Kamailio ranges
            // for example "2020/02/02 - 2022/03/03" can be represented as "2020/02/02 - 2020/02/29(31)",
            // "2020/03/01 - 2020/12/31", "2021/01/01 - 2021/12/31", "2022/01/01 - 2022/02/28(31)", "2022/03/01 - 2022/03/03"
            // and than coded in Kamailio format
            //    [
            //      { year: fromYMD.year, month: fromYMD.month, mday: `${fromYMD.date}-31` },
            //      { year: fromYMD.year, month: `${fromYMD.month + 1}-12` },
            //      { year: `${fromYMD.year+1}-${toYMD.year-1}` },
            //      { year: toYMD.year, month: `1-${toYMD.month - 1}` },
            //      { year: toYMD.year, month: `${toYMD.month}`, mday: `1-${toYMD.date}` }
            //    ]
            // but code below will output a little more optimized version

            // "Starting (month day)" range
            if (fromYMD.date > 1) {
                result.push({ year: fromYMD.year, month: fromYMD.month, mday: `${fromYMD.date}-31` })
            } else {
                fromYMD.month -= 1
            }

            // "Starting (months)" range
            if (fromYMD.month > 0) {
                result.push({ year: fromYMD.year, month: `${fromYMD.month + 1}-12` })
            } else {
                fromYMD.year -= 1
            }

            // "Middle" range
            if (fromYMD.year + 1 <= toYMD.year - 1) {
                result.push({ year: `${fromYMD.year + 1}-${toYMD.year - 1}` })
            }

            // "Ending (months)" range
            if (toYMD.month > 1) {
                result.push({ year: toYMD.year, month: `1-${toYMD.month - 1}` })
            }

            // "Ending (month day)" range
            result.push({ year: toYMD.year, month: toYMD.month, mday: `1-${toYMD.date}` })
        }
        return result
    })

    let kamailioDateset = kamailioDatesetRaw.reduce((acc, item) => {
        const optimizedItemRanges = item.map((item) => {
            // if year or month or date contains range like "a-a" convert to just "a"
            if (typeof item.year === 'string') {
                const [yearF, yearT] = item.year.split('-')
                if (yearF === yearT) {
                    item.year = Number(yearF)
                }
            }

            if (typeof item.month === 'string') {
                const [monthF, monthT] = item.month.split('-')
                if (monthF === monthT) {
                    item.month = Number(monthF)
                }
            }

            if (typeof item.mday === 'string') {
                const [mdayF, mdayT] = item.mday.split('-')
                if (mdayF === mdayT) {
                    item.mday = Number(mdayF)
                }
            }

            return item
        })
        // similar to flatMap
        return [...acc, ...optimizedItemRanges]
    }, [])
    kamailioDateset = kamailioDateset.reduce((acc, item) => {
        // Kamailio considers the date range condition "Feb 1..29" almost equal to "Feb 1..31" so we can transform days of
        // the month like 28,29,30 into 31 if it is the last day of the month. It will help to optimize ranges better
        // in other optimization functions
        if (item.year && item.month && item.mday) {
            const yearRange = getKamailioRangeElements(item.year)[0]
            const monthRange = getKamailioRangeElements(item.month)[0]
            const mdayRange = getKamailioRangeElements(item.mday)[0]
            if (yearRange.from === yearRange.to && monthRange.from === monthRange.to &&
                mdayRange.from !== mdayRange.to && [28, 29, 30].includes(mdayRange.to)) {
                const lastDayOfMonth = getLastDayOfMonth(yearRange.from, monthRange.from)
                if (lastDayOfMonth === mdayRange.to) {
                    // replacing "mdayRange.to" with 31.
                    item.mday = `${mdayRange.from}-31`
                }
            }
        }
        acc.push(item)
        return acc
    }, [])
    kamailioDateset = kamailioDateset.reduce((acc, item) => {
        // a rule defined as "full range" can be omitted: a {x} b {min-max} c {y} --> a {x} c {y}
        // For example: year {2020} month {1-12} mday {1-31} --->  year {2020}
        if (item.month) {
            const monthRange = getKamailioRangeElements(item.month)[0]
            if (monthRange.from === 1 && monthRange.to === 12) {
                delete item.month
            }
        }

        if (item.mday) {
            const mdayRange = getKamailioRangeElements(item.mday)[0]
            if (mdayRange.from === 1 && mdayRange.to === 31) {
                delete item.mday
            }
        }

        acc.push(item)
        return acc
    }, [])
    kamailioDateset = kamailioDateset.reduce((acc, item) => {
        // combine the same date ranges by "year"
        if (acc.length === 0) {
            acc.push(item)
        } else {
            const mergeCandidate = acc.find((accItem) => getKamailioRangeElements(accItem.year)[0].to + 1 === getKamailioRangeElements(item.year)[0].from &&
                accItem.month === item.month &&
                accItem.mday === item.mday
            )
            if (mergeCandidate) {
                const mergeCandidateYear = getKamailioRangeElements(mergeCandidate.year)[0]
                mergeCandidate.year = `${mergeCandidateYear.from}-${mergeCandidateYear.to + 1}`
            } else {
                acc.push(item)
            }
        }
        return acc
    }, [])
    kamailioDateset = kamailioDateset.reduce((acc, item) => {
        // combine the same date ranges by "month"
        if (acc.length === 0) {
            acc.push(item)
        } else {
            const mergeCandidate = acc.find((accItem) => accItem.year === item.year &&
                getKamailioRangeElements(accItem.month)[0].to + 1 === getKamailioRangeElements(item.month)[0].from &&
                accItem.mday === item.mday
            )
            if (mergeCandidate) {
                const mergeCandidateMonth = getKamailioRangeElements(mergeCandidate.month)[0]
                mergeCandidate.month = `${mergeCandidateMonth.from}-${mergeCandidateMonth.to + 1}`
            } else {
                acc.push(item)
            }
        }
        return acc
    }, [])

    return kamailioDateset
}

export function validateKamailioDatesets (kDateset) {
    kDateset.forEach((datesetItem) => {
        let { year, month, mday } = datesetItem
        year = getAsTrimmedString(year)
        month = getAsTrimmedString(month)
        mday = getAsTrimmedString(mday)
        if (year !== '') {
            validateKamailioRange(year, 1900, 2100)
        } else {
            throw Error(`A Kamailio dateset should have "year" range: ${JSON.stringify(datesetItem)}`)
        }
        if (month !== '') {
            validateKamailioRange(month, 1, 12)
        }
        if (mday !== '') {
            validateKamailioRange(mday, 1, 31)
        }

        Object.entries(datesetItem)
            .filter(([key]) => !['year', 'month', 'mday'].includes(key))
            .forEach(([key, value]) => {
                if (getAsTrimmedString(value).length !== 0) {
                    throw Error(`The "${key}" scale of Kamailio datesets is not supported: ${JSON.stringify(datesetItem)}`)
                }
            })
    })
}

export function kamailioDatesetToHuman (kDateset = []) {
    validateKamailioDatesets(kDateset)

    // convert Kamailio dateset into Human readable format
    const hDatesetRaw = kDateset.map((datesetItem) => {
        let { year, month, mday } = datesetItem
        year = getAsTrimmedString(year)
        month = getAsTrimmedString(month)
        mday = getAsTrimmedString(mday)

        year = getKamailioRangeElements(year)[0]
        if (month !== '') {
            month = getKamailioRangeElements(month)[0]
        } else {
            month = { from: 1, to: 12 }
        }
        if (mday !== '') {
            mday = getKamailioRangeElements(mday)[0]
        } else {
            mday = { from: 1, to: 31 }
        }

        const nestedRules = [year, month, mday]
        const rulesOutput = nestedRules.reduceRight((acc, range) => {
            const newAcc = []
            if (acc.length === 0) {
                newAcc.push({ from: String(range.from), to: String(range.to) })
            } else {
                for (let i = range.from; i <= range.to; i++) {
                    acc.forEach((accItem) => newAcc.push({ from: [i, accItem.from].join('_'), to: [i, accItem.to].join('_') })
                    )
                }
            }
            return newAcc
        }, [])
        const hDateset = rulesOutput.reduce((acc, ruleOutput) => {
            const [fromYear, fromMonth, fromDate] = ruleOutput.from.split('_').map((i) => Number(i))
            const [toYear, toMonth, toDate] = ruleOutput.to.split('_').map((i) => Number(i))

            // if "from" date of the range is not exist (like "Feb 31")
            // we are considering that entire range is not valid and just SKIPPING it
            if (isDateExist(fromYear, fromMonth, fromDate)) {
                const from = [fromYear, fromMonth, fromDate]
                    .map((i) => String(i).padStart(2, '0')).join('/')

                // if "to" date of the range is not exist (like "Feb 31")
                // we are considering that the range is valid but it was optimized for creating smaller Kamailio rule
                // so we need NORMALIZE it by using last day of the month
                const lastDayOfMonth = getLastDayOfMonth(toYear, toMonth)
                const to = [
                    toYear,
                    toMonth,
                    (toDate > lastDayOfMonth) ? lastDayOfMonth : toDate
                ].map((i) => String(i).padStart(2, '0')).join('/')

                acc.push({ from, to })
            }
            return acc
        }, [])

        return hDateset
    })
        .reduce((acc, item) => [...acc, ...item], [])

    const res = getHumanDatesetsNormalized(hDatesetRaw)
    return res
}
