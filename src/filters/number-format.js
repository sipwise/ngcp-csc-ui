
import url from 'url';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
import { format } from 'quasar-framework'
const { capitalize } = format
var phoneUtil = PhoneNumberUtil.getInstance();

export default function(number) {
    try {
        let destination = url.parse(number, true);
        return normalizeDestination(destination);
    } catch(err1) {
        return normalizeDestination(destination);
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
    if (destination.host == 'fax2mail.local') {
        normalizedDestination = 'Fax2Mail';
    } else if (destination.host == 'managersecretary.local') {
        normalizedDestination = 'Manager Secretary';
    } else if (!isNaN(destination.auth.split(':')[0])) {
        normalizedDestination = normalizeNumber(destination.auth.split(':')[0]);
    } else if (destination.auth.split(':')[0] == 'custom-hours') {
        normalizedDestination = 'Custom Announcement';
    } else if (destination.host == 'app.local') {
        normalizedDestination = destination.auth;
    } else if (destination.host == 'voicebox.local') {
        normalizedDestination = 'Voicemail';
    } else {
        normalizedDestination = capitalize(destination.host.split('.')[0]);
    }
    return normalizedDestination;
}

export function normalizeTerminationInput(destination) {
    if (destination === 'Voicemail') {
        return 'voicebox';
    } else if (destination = 'Fax2Mail') {
        return 'fax2mail';
    } else {
        return destination;
    }
}
