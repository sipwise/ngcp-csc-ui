import { i18n } from 'boot/i18n'
import moment from 'moment'
import { date } from 'quasar'
import { isToday, isWithinLastWeek, isYesterday } from 'src/helpers/date-helper'
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

    let seconds = i18n.global.t('second')
    if (diffSeconds > 1) {
        seconds = i18n.global.t('seconds')
    }

    let minutes = 'minute'
    if (diffSeconds > 120) {
        minutes = i18n.global.t('minutes')
    }

    if (diffSeconds < 60) {
        const descriptor = i18n.global.t('ago')
        return `${diffSeconds} ${seconds} ${descriptor}`
    } else if (diffSeconds < 3600) {
        const descriptor = i18n.global.t('ago')
        return `${diffMinutes} ${minutes} ${descriptor}`
    } else if (isToday(date)) {
        const descriptor = i18n.global.t('Today')
        return `${descriptor}, ${momentDate.format('HH:mm')}`
    } else if (isYesterday(date)) {
        const descriptor = i18n.global.t('Yesterday')
        return `${descriptor}, ${momentDate.format('HH:mm')}`
    } else if (isWithinLastWeek(date)) {
        return momentDate.format('dddd, HH:mm')
    }
    return momentDate.format('LLL')
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
    sunday: i18n.global.t('Sunday'),
    monday: i18n.global.t('Monday'),
    tuesday: i18n.global.t('Tuesday'),
    wednesday: i18n.global.t('Wednesday'),
    thursday: i18n.global.t('Thursday'),
    friday: i18n.global.t('Friday'),
    saturday: i18n.global.t('Saturday')
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
