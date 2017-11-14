
import Vue from 'vue';
import NumberFilter from './number'
import NumberFormatFilter from './number-format'
import DateFilter from './date'

Vue.filter('number', NumberFilter);
Vue.filter('readableDate', DateFilter);
Vue.filter('numberFormat', NumberFormatFilter);
