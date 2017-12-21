
import url from 'url';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
import { format } from 'quasar-framework'
const { capitalize } = format
var phoneUtil = PhoneNumberUtil.getInstance();

export default function(number) {
    try {
        let phoneNumber = url.parse(number, true).auth.split(':')[0];
        if (isNaN(phoneNumber)) {
            phoneNumber = normalizeDestination(url.parse(number, true));
        }
        return normalizeNumber(phoneNumber);
    } catch(err1) {
        return normalizeNumber(number);
    }
}

export function normalizeNumber(number) {
    if(_.isString(number) && number.match(/^\+?[0-9]+$/)) {
        let normalizedNumber = number.replace(/\s*/g, '');
        if(normalizedNumber.match(/^\+/) === null) {
            normalizedNumber = '+' + normalizedNumber;
        }
        try {
            return phoneUtil.format(phoneUtil.parse(normalizedNumber, 'DE'), PhoneNumberFormat.INTERNATIONAL);
        } catch(err) {
            return normalizedNumber;
        }
    } else {
        return number;
    }
}

export function rawNumber(number) {
    if(_.isString(number)) {
        return number.replace(/\s*/g, '').replace(/^\+/, '');
    }
    return '';
}

export function normalizeDestination(destination) {
    let normalizedDestination;
    if (destination.host == 'app.local') {
        normalizedDestination = destination.auth;
    } else if (destination.host == 'voicebox.local') {
        normalizedDestination = 'Voicemail';
    } else {
        normalizedDestination = capitalize(destination.host.split('.')[0]);
    }
    return normalizedDestination;
}
