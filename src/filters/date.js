
import { isYesterday, isToday, isWithinLastWeek } from '../helpers/date-helper'
import moment from 'moment'
import { date } from 'quasar-framework'
import { i18n } from '../i18n';
const { formatDate } = date;

export default function(value) {
    var timeStamp = new Date(value);
    return `${formatDate(timeStamp, 'MMMM D, YYYY')} at ${formatDate(timeStamp, 'h:mm a')}`;
}

export function smartTime($date) {

    let today = new Date();
    let date = moment.utc($date, 'YYYY-MM-DD HH:mm:SS').toDate();
    let diffSeconds = Math.floor((today.getTime() - date.getTime()) / 1000);
    let diffMinutes = Math.floor(diffSeconds / 60);
    let momentDate = moment(date);

    let seconds = i18n.t('filters.second');
    if (diffSeconds > 1) {
        seconds = i18n.t('filters.seconds');
    }

    let minutes = 'minute';
    if (diffSeconds > 120) {
        minutes = i18n.t('filters.minutes');
    }

    if (diffSeconds < 60) {
        let descriptor = i18n.t('filters.ago');
        return `${diffSeconds} ${seconds} ${descriptor}`;
    }
    else if (diffSeconds < 3600) {
        let descriptor = i18n.t('filters.ago');
        return `${diffMinutes} ${minutes} ${descriptor}`;
    }
    else if (isToday(date)) {
        let descriptor = i18n.t('filters.today');
        return `${descriptor}, ${momentDate.format('HH:mm')}`;
    }
    else if (isYesterday(date)) {
        let descriptor = i18n.t('filters.yesterday');
        return `${descriptor}, ${momentDate.format('HH:mm')}`;
    }
    else if (isWithinLastWeek(date)) {
        return momentDate.format('dddd, HH:mm');
    }
    else {
        return momentDate.format('LLL');
    }
}
