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
    timeSetDateRange,
    timeSetOfficeHoursSameTime,
    timeSetTimes,
    timeSetWeekdays
} from 'src/filters/time-set'

// Filters object
const filters = {
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

// Export composable for Composition API
export function useFilters () {
    return filters
}

// Export individual filters for direct import
export {
    DateFilter as readableDate,
    NumberFilter as number,
    NumberFormatFilter as numberFormat,
    WholeCurrency as wholeCurrency,
    displayName,
    normalizeDestination as destinationFormat,
    smartTime,
    startCase,
    time,
    timeSetDateExact,
    timeSetDateRange,
    timeSetOfficeHoursSameTime,
    timeSetTimes,
    timeSetWeekdays,
    weekday
}

export default ({ app }) => {
    // Add to global properties for Options API
    app.config.globalProperties.$filters = filters

    // Provide for Composition API inject
    app.provide('filters', filters)
}
