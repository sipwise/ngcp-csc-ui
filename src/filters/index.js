
import Vue from 'vue';
import NumberFilter from './number'
import NumberFormatFilter from './number-format'
import { normalizeDestination } from './number-format'
import DateFilter from './date'
import { smartTime } from './date'

Vue.filter('number', NumberFilter);
Vue.filter('readableDate', DateFilter);
Vue.filter('numberFormat', NumberFormatFilter);
Vue.filter('destinationFormat', normalizeDestination);
Vue.filter('smartTime', smartTime);
