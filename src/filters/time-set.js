
import { i18n } from 'boot/i18n'
import { getKamailioRangeElements, kamailioDatesetToHuman } from 'src/helpers/kamailio-timesets-converter'

export const DAY_MAP = [2, 3, 4, 5, 6, 7, 1]
export const DEFAULT_WEEKDAYS = [
    DAY_MAP[0],
    DAY_MAP[1],
    DAY_MAP[2],
    DAY_MAP[3],
    DAY_MAP[4]
]

export function getDayNameByNumber (dayNumber, isShortName = false) {
    const daysNamesMap = [
        i18n.global.tc('Monday'),
        i18n.global.tc('Tuesday'),
        i18n.global.tc('Wednesday'),
        i18n.global.tc('Thursday'),
        i18n.global.tc('Friday'),
        i18n.global.tc('Saturday'),
        i18n.global.tc('Sunday')
    ]
    // NOTE: in some languages the short days names may be not just first two letters of the full day's name
    const daysShortNamesMap = [
        i18n.global.tc('Mo'),
        i18n.global.tc('Tu'),
        i18n.global.tc('We'),
        i18n.global.tc('Th'),
        i18n.global.tc('Fr'),
        i18n.global.tc('Sa'),
        i18n.global.tc('Su')
    ]
    return isShortName ? daysShortNamesMap[dayNumber] : daysNamesMap[dayNumber]
}

export function getMonthNameByNumber (monthNumber) {
    const monthsNamesMap = [
        i18n.global.tc('January'),
        i18n.global.tc('February'),
        i18n.global.tc('March'),
        i18n.global.tc('April'),
        i18n.global.tc('May'),
        i18n.global.tc('June'),
        i18n.global.tc('July'),
        i18n.global.tc('August'),
        i18n.global.tc('September'),
        i18n.global.tc('October'),
        i18n.global.tc('November'),
        i18n.global.tc('December')
    ]

    return monthsNamesMap[monthNumber]
}

export function timeSetDateExact (times) {
    return times[0].year + '/' + times[0].month + '/' + times[0].mday
}

export function timeSetDateRange (times) {
    try {
        const hDateset = kamailioDatesetToHuman(times)
        return (hDateset.length === 0)
            ? i18n.global.tc('empty')
            : hDateset.map(d => (d.from === d.to) ? d.from : d.from + '-' + d.to).join(', ')
    } catch (e) {
        return i18n.global.tc('data error')
    }
}

export function timeSetWeekdays (times) {
    const mappedWeekdays = times.map((time) => {
        return DAY_MAP.indexOf(parseInt(time.wday))
    })
    mappedWeekdays.sort()
    const weekdaysStr = mappedWeekdays.map(weekday => getDayNameByNumber(weekday)).join(', ')
    return weekdaysStr
}

export function timeSetOfficeHoursSameTime (times) {
    const weekdays = new Set()
    times.forEach(kamailioTimeRange => {
        const wdayRange = getKamailioRangeElements(kamailioTimeRange.wday)[0]
        for (let day = wdayRange.from; day <= wdayRange.to; day++) {
            // To have Monday the first day of a week we are mapping days to change order
            weekdays.add(DAY_MAP.indexOf(day))
        }
    })
    const weekdaysSorted = Array.from(weekdays)
    weekdaysSorted.sort()
    const weekdaysStr = weekdaysSorted.map(weekday => getDayNameByNumber(weekday)).join(', ')
    return weekdaysStr
}

export function timeSetTimes (timeSets) {
    return timeSets.map((timeSet) => {
        const timeSetMap = createTimeSetMap(timeSet)

        const from = formatTimeSetValues(timeSetMap, 'from')
        const to = formatTimeSetValues(timeSetMap, 'to')

        return {
            from: formatTimeString(from),
            to: formatTimeString(to)
        }
    })
}

function createTimeSetMap (timeSet) {
    const timeSetMap = {
        hour: { from: null, to: null },
        mday: { from: null, to: null },
        minute: { from: null, to: null },
        month: { from: null, to: null },
        wday: { from: null, to: null },
        year: { from: null, to: null }
    }

    Object.keys(timeSet).forEach((key) => {
        // 1. Case: not set
        if (timeSet[key] === null) {
            timeSetMap[key] = { from: null, to: null }
        // 2. Case: range
        } else if (timeSet[key].includes('-')) {
            const [from, to] = timeSet[key].split('-')
            timeSetMap[key] = { from, to }
        // 3. Case: single value
        } else {
            timeSetMap[key] = { from: timeSet[key], to: null }
        }
    })

    return timeSetMap
}

function formatTimeSetValues (timeSetMap, type) {
    const defaultTime = '00'
    const defaultDay = 'DD'
    const defaultMonth = 'MM'
    const defaultYear = 'YYYY'

    return {
        year: timeSetMap.year[type] || defaultYear,
        month: getMonthNameByNumber(timeSetMap.month[type]) || defaultMonth,
        wDay: getDayNameByNumber(timeSetMap.wday[type]) ? `${getDayNameByNumber(timeSetMap.wday[type])},` : '',
        mDay: timeSetMap.mday[type] || defaultDay,
        hour: formatTime(timeSetMap.hour[type]) || defaultTime,
        minutes: formatTime(timeSetMap.minute[type]) || defaultTime
    }
}

function formatTimeString (timeSetValues) {
    return `${timeSetValues.mDay} ${timeSetValues.month} ${timeSetValues.year}, ${timeSetValues.wDay} ${timeSetValues.hour}:${timeSetValues.minutes}`
}

function formatTime (time) {
    return (time !== null && time < 10) ? `0${time}` : time
}
