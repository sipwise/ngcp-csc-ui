
import { isYesterday, isToday, isWithinLastWeek } from '../helpers/date-helper'
import moment from 'moment'
import { date } from 'quasar-framework'
const { formatDate } = date;

export default function(value) {
    var timeStamp = new Date(value);
    return `${formatDate(timeStamp, 'MMMM D, YYYY')} at ${formatDate(timeStamp, 'h:mm a')}`;
}

export function smartTime($date, $today) {

    // TODO: Refactor to use momentjs for all timestamps, by defining our
    // own replacement strings for all the fromNow() cases:
    // https://momentjs.com/docs/#/customization/relative-time/

    let today = $today || new Date();
    let date = new Date($date);
    let diffSeconds = Math.floor((today.getTime() - date.getTime()) / 1000);
    let diffMinutes = Math.floor(diffSeconds / 60);
    let momentDate = moment(date);

    let seconds = 'second';
    if(diffSeconds > 1) {
        seconds = seconds + "s";
    }

    let minutes = 'minute';
    if(diffSeconds > 120) {
        minutes = minutes + "s";
    }

    if(diffSeconds < 60) {
        // TODO: For Chrome, all cases are evaluated as less than 60 seconds,
        // and therefore seconds returned for all
        return diffSeconds + ' ' + seconds + ' ago';
    }
    else if (diffSeconds < 3600) {
        return diffMinutes + ' ' + minutes + ' ago';
    }
    else if(isToday(date)) {
        return 'Today, ' + momentDate.format('HH:mm');
    }
    else if (isYesterday(date)) {
        return 'Yesterday, ' + momentDate.format('HH:mm');
    }
    else if (isWithinLastWeek(date)) {
        return momentDate.format('dddd, HH:mm');
    }
    else {
        // TODO: For Safari, all cases are evaluated as belonging to this last
        // else condition, and it returns "Invalid date"
        return momentDate.format('LLL');
    }
}
