
import Vue from 'vue';
import NumberFilter from './number'
import NumberFormatFilter from './number-format'
import {
    normalizeDestination
} from './number-format'
import DateFilter from './date'
import {
    smartTime
} from './date'
import {
    startCase
} from './string'
import WholeCurrency from './currency'
import {
    displayName
} from './subscriber'

Vue.filter('number', NumberFilter);
Vue.filter('readableDate', DateFilter);
Vue.filter('numberFormat', NumberFormatFilter);
Vue.filter('destinationFormat', normalizeDestination);
Vue.filter('smartTime', smartTime);
Vue.filter('startCase', startCase);
Vue.filter('wholeCurrency', WholeCurrency);
Vue.filter('seatName', displayName);
Vue.filter('groupName', displayName);
