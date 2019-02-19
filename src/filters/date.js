
import { isYesterday, isToday, isWithinLastWeek } from '../helpers/date-helper'
import moment from 'moment'
import { date } from 'quasar-framework'
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

    let seconds = 'second';
    if (diffSeconds > 1) {
        seconds = seconds + "s";
    }

    let minutes = 'minute';
    if (diffSeconds > 120) {
        minutes = minutes + "s";
    }

    if (diffSeconds < 60) {
        return diffSeconds + ' ' + seconds + ' ago';
    }
    else if (diffSeconds < 3600) {
        return diffMinutes + ' ' + minutes + ' ago';
    }
    else if (isToday(date)) {
        return 'Today, ' + momentDate.format('HH:mm');
    }
    else if (isYesterday(date)) {
        return 'Yesterday, ' + momentDate.format('HH:mm');
    }
    else if (isWithinLastWeek(date)) {
        return momentDate.format('dddd, HH:mm');
    }
    else {
        return momentDate.format('LLL');
    }
}
