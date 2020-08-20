
import { isYesterday, isToday, isWithinLastWeek } from '../helpers/date-helper'
import moment from 'moment'
import { date } from 'quasar'
import { i18n } from 'src/boot/i18n'
const { formatDate } = date

export default function (value) {
	var timeStamp = new Date(value)
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

	let seconds = i18n.t('filters.second')
	if (diffSeconds > 1) {
		seconds = i18n.t('filters.seconds')
	}

	let minutes = 'minute'
	if (diffSeconds > 120) {
		minutes = i18n.t('filters.minutes')
	}

	if (diffSeconds < 60) {
		const descriptor = i18n.t('filters.ago')
		return `${diffSeconds} ${seconds} ${descriptor}`
	} else if (diffSeconds < 3600) {
		const descriptor = i18n.t('filters.ago')
		return `${diffMinutes} ${minutes} ${descriptor}`
	} else if (isToday(date)) {
		const descriptor = i18n.t('filters.today')
		return `${descriptor}, ${momentDate.format('HH:mm')}`
	} else if (isYesterday(date)) {
		const descriptor = i18n.t('filters.yesterday')
		return `${descriptor}, ${momentDate.format('HH:mm')}`
	} else if (isWithinLastWeek(date)) {
		return momentDate.format('dddd, HH:mm')
	} else {
		return momentDate.format('LLL')
	}
}
