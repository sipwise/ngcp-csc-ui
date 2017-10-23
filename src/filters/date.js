import { date } from 'quasar'
const { formatDate } = date

export default function(date) {
    var timeStamp = new Date(date);
    return formatDate(timeStamp, 'MMMM D, YYYY') + ' at ' +
        formatDate(timeStamp, 'h:mm a');
}
