import WholeCurrency from 'src/filters/currency'
import DateFilter, {
    smartTime,
    time,
    weekday
} from 'src/filters/date'
import NumberFilter from 'src/filters/number'
import NumberFormatFilter, { normalizeDestination } from 'src/filters/number-format'
import { startCase } from 'src/filters/string'
import { displayName } from 'src/filters/subscriber'
import {
    timeSetDateExact,
    timeSetDateRange, timeSetOfficeHoursSameTime,
    timeSetTimes,
    timeSetWeekdays
} from 'src/filters/time-set'

export default ({ app }) => {
    app.config.globalProperties.$filters = {
        number: NumberFilter,
        readableDate: DateFilter,
        numberFormat: NumberFormatFilter,
        destinationFormat: normalizeDestination,
        smartTime,
        startCase,
        wholeCurrency: WholeCurrency,
        seatName: displayName,
        groupName: displayName,
        displayName,
        time,
        weekday,
        timeSetDateExact,
        timeSetWeekdays,
        timeSetDateRange,
        timeSetOfficeHoursSameTime,
        timeSetTimes
    }
}
