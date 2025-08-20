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
        i18n.global.t('Monday'),
        i18n.global.t('Tuesday'),
        i18n.global.t('Wednesday'),
        i18n.global.t('Thursday'),
        i18n.global.t('Friday'),
        i18n.global.t('Saturday'),
        i18n.global.t('Sunday')
    ]
    // NOTE: in some languages the short days names may be not just first two letters of the full day's name
    const daysShortNamesMap = [
        i18n.global.t('Mo'),
        i18n.global.t('Tu'),
        i18n.global.t('We'),
        i18n.global.t('Th'),
        i18n.global.t('Fr'),
        i18n.global.t('Sa'),
        i18n.global.t('Su')
    ]
    return isShortName ? daysShortNamesMap[dayNumber] : daysNamesMap[dayNumber]
}

// This logic is aligned with admin-ui where
// * January has value 1
// * December has value 12
export function getMonthNameByNumber (monthNumber) {
    const monthsNamesMap = [
        i18n.global.t('January'),
        i18n.global.t('February'),
        i18n.global.t('March'),
        i18n.global.t('April'),
        i18n.global.t('May'),
        i18n.global.t('June'),
        i18n.global.t('July'),
        i18n.global.t('August'),
        i18n.global.t('September'),
        i18n.global.t('October'),
        i18n.global.t('November'),
        i18n.global.t('December')
    ]

    return monthsNamesMap[monthNumber - 1]
}

// This logic is aligned with admin-ui where
// * Sunday has value 1
// * Saturday has value 7
function getWeekDayByNumber (dayNumber) {
    const daysNamesMap = [
        i18n.global.t('Sunday'),
        i18n.global.t('Monday'),
        i18n.global.t('Tuesday'),
        i18n.global.t('Wednesday'),
        i18n.global.t('Thursday'),
        i18n.global.t('Friday'),
        i18n.global.t('Saturday')
    ]

    return daysNamesMap[dayNumber - 1]
}

export function timeSetDateExact (times) {
    return `${times[0].year}/${times[0].month}/${times[0].mday}`
}

export function timeSetDateRange (times) {
    try {
        const hDateset = kamailioDatesetToHuman(times)
        return (hDateset.length === 0)
            ? i18n.global.t('empty')
            : hDateset.map((d) => (d.from === d.to) ? d.from : `${d.from}-${d.to}`).join(', ')
    } catch (e) {
        return i18n.global.t('data error')
    }
}

export function timeSetWeekdays (times) {
    const mappedWeekdays = times.map((time) => DAY_MAP.indexOf(parseInt(time.wday)))
    mappedWeekdays.sort()
    const weekdaysStr = mappedWeekdays.map((weekday) => getDayNameByNumber(weekday)).join(', ')
    return weekdaysStr
}

export function timeSetOfficeHoursSameTime (times) {
    const weekdays = new Set()
    times.forEach((kamailioTimeRange) => {
        const wdayRange = getKamailioRangeElements(kamailioTimeRange.wday)[0]
        for (let day = wdayRange.from; day <= wdayRange.to; day++) {
            // To have Monday the first day of a week we are mapping days to change order
            weekdays.add(DAY_MAP.indexOf(day))
        }
    })
    const weekdaysSorted = Array.from(weekdays)
    weekdaysSorted.sort()
    const weekdaysStr = weekdaysSorted.map((weekday) => getDayNameByNumber(weekday)).join(', ')
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
        wDay: getWeekDayByNumber(timeSetMap.wday[type]) || '',
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
