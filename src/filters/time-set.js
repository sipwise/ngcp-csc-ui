
import { i18n } from 'boot/i18n'

export const DAY_MAP = [2, 3, 4, 5, 6, 7, 1]
export const DAY_NAME_MAP = [
	i18n.t('Monday'),
	i18n.t('Tuesday'),
	i18n.t('Wednesday'),
	i18n.t('Thursday'),
	i18n.t('Friday'),
	i18n.t('Saturday'),
	i18n.t('Sunday')
]

export const DEFAULT_WEEKDAYS = [
	DAY_MAP[0],
	DAY_MAP[1],
	DAY_MAP[2],
	DAY_MAP[3],
	DAY_MAP[4]
]

export function timeSetDateExact (times) {
	return times[0].year + '/' + times[0].month + '/' + times[0].mday
}

export function timeSetDateRange (times) {
	const years = times[0].year.split('-')
	const months = times[0].month.split('-')
	const dates = times[0].mday.split('-')
	return years[0] + '/' + months[0] + '/' + dates[0] + '-' +
		years[1] + '/' + months[1] + '/' + dates[1]
}

export function timeSetWeekdays (times) {
	const mappedWeekdays = times.map((time) => {
		return DAY_MAP.indexOf(parseInt(time.wday))
	})
	mappedWeekdays.sort()
	let weekdays = ''
	mappedWeekdays.forEach((weekday, index) => {
		if (index > 0) {
			weekdays = weekdays + ', '
		}
		weekdays = weekdays + DAY_NAME_MAP[weekday]
	})
	return weekdays
}

export function timeSetOfficeHoursSameTime (times) {
	const weekdays = new Set()
	let weekdaysStr = ''
	times.forEach((time) => {
		weekdays.add(parseInt(time.wday))
	})
	const weekdaysSorted = Array.from(weekdays)
	weekdaysSorted.sort((a, b) => {
		if (a === 1) {
			return 1
		} else if (a > b) {
			return 1
		} else if (a < b) {
			return -1
		} else {
			return 0
		}
	})
	weekdaysSorted.forEach((weekday, index) => {
		if (index > 0) {
			weekdaysStr += ', '
		}
		weekdaysStr += DAY_NAME_MAP[DAY_MAP.indexOf(weekday)]
	})
	return weekdaysStr
}

export function timeSetTimes () {

}
