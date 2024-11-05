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

export function timeSetDateExact (times) {
    return `${times[0].year}/${times[0].month}/${times[0].mday}`
}

export function timeSetDateRange (times) {
    try {
        const hDateset = kamailioDatesetToHuman(times)
        return (hDateset.length === 0)
            ? i18n.global.tc('empty')
            : hDateset.map((d) => (d.from === d.to) ? d.from : `${d.from}-${d.to}`).join(', ')
    } catch (e) {
        return i18n.global.tc('data error')
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

export function timeSetTimes () {
    return '...'
}
