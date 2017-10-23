
import Vue from 'vue';
import NumberFilter from './number'
import DateFilter from './date'

Vue.filter('number', NumberFilter);
Vue.filter('humanReadableDate', DateFilter);
