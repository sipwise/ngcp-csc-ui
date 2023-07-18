
import { isYesterday, isToday, isWithinLastWeek } from '../helpers/date-helper'
import moment from 'moment'
import { date } from 'quasar'
import { i18n } from 'src/boot/i18n'
const { formatDate } = date

export default function (value) {
    const timeStamp = new Date(value)
    return `${formatDate(timeStamp, 'MMMM D, YYYY')} at ${formatDate(timeStamp, 'h:mm a')}`
}

export function time (dateTime) {
    return moment(dateTime).format('HH:mm')
}

export function smartTime ($date) {
    const today = new Date()
    const date = moment.utc($date, 'YYYY-MM-DD HH:mm:SS').toDate()
    const diffSeconds = Math.floor((today.getTime() - date.getTime()) / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const momentDate = moment(date)

    let seconds = i18n.global.tc('second')
    if (diffSeconds > 1) {
        seconds = i18n.global.tc('seconds')
    }

    let minutes = 'minute'
    if (diffSeconds > 120) {
        minutes = i18n.global.tc('minutes')
    }

    if (diffSeconds < 60) {
        const descriptor = i18n.global.tc('ago')
        return `${diffSeconds} ${seconds} ${descriptor}`
    } else if (diffSeconds < 3600) {
        const descriptor = i18n.global.tc('ago')
        return `${diffMinutes} ${minutes} ${descriptor}`
    } else if (isToday(date)) {
        const descriptor = i18n.global.tc('Today')
        return `${descriptor}, ${momentDate.format('HH:mm')}`
    } else if (isYesterday(date)) {
        const descriptor = i18n.global.tc('Yesterday')
        return `${descriptor}, ${momentDate.format('HH:mm')}`
    } else if (isWithinLastWeek(date)) {
        return momentDate.format('dddd, HH:mm')
    } else {
        return momentDate.format('LLL')
    }
}

export const WeekdayMap = {
    sunday: 1,
    monday: 2,
    tuesday: 3,
    wednesday: 4,
    thursday: 5,
    friday: 6,
    saturday: 7
}

export const WeekdayTranslationMap = {
    sunday: i18n.global.tc('Sunday'),
    monday: i18n.global.tc('Monday'),
    tuesday: i18n.global.tc('Tuesday'),
    wednesday: i18n.global.tc('Wednesday'),
    thursday: i18n.global.tc('Thursday'),
    friday: i18n.global.tc('Friday'),
    saturday: i18n.global.tc('Saturday')
}

export function weekday (weekdayNumber) {
    let weekdayString = ''
    Object.keys(WeekdayMap).forEach((weekday) => {
        if (WeekdayMap[weekday] === weekdayNumber) {
            weekdayString = WeekdayTranslationMap[weekday]
        }
    })
    return weekdayString
}
