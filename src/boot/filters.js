
import Vue from 'vue'
import NumberFilter from 'src/filters/number'
import NumberFormatFilter, {
    normalizeDestination
} from 'src/filters/number-format'
import DateFilter, {
    smartTime,
    time,
    weekday
} from 'src/filters/date'
import {
    startCase
} from 'src/filters/string'
import WholeCurrency from 'src/filters/currency'
import {
    displayName
} from 'src/filters/subscriber'
import {
    timeSetDateExact,
    timeSetDateRange, timeSetOfficeHoursSameTime,
    timeSetTimes,
    timeSetWeekdays
} from 'src/filters/time-set'

export default () => {
    Vue.filter('number', NumberFilter)
    Vue.filter('readableDate', DateFilter)
    Vue.filter('numberFormat', NumberFormatFilter)
    Vue.filter('destinationFormat', normalizeDestination)
    Vue.filter('smartTime', smartTime)
    Vue.filter('startCase', startCase)
    Vue.filter('wholeCurrency', WholeCurrency)
    Vue.filter('seatName', displayName)
    Vue.filter('groupName', displayName)
    Vue.filter('displayName', displayName)
    Vue.filter('time', time)
    Vue.filter('weekday', weekday)
    Vue.filter('timeSetDateExact', timeSetDateExact)
    Vue.filter('timeSetWeekdays', timeSetWeekdays)
    Vue.filter('timeSetDateRange', timeSetDateRange)
    Vue.filter('timeSetOfficeHoursSameTime', timeSetOfficeHoursSameTime)
    Vue.filter('timeSetTimes', timeSetTimes)
}
