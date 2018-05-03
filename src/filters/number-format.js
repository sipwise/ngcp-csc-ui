
import _ from 'lodash';
import url from 'url';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

var phoneUtil = PhoneNumberUtil.getInstance();

export default function numberFormat(number) {
    try {
        let destination = url.parse(number, true);
        let extractedNumber = destination.auth.split(':')[0];
        let normalizedNumber = normalizeNumber(extractedNumber);
        if(normalizedNumber !== extractedNumber) {
            return normalizedNumber;
        }
        else {
            return extractedNumber;
        }
    }
    catch(err) {
        return normalizeNumber(number);
    }
}

export function normalizeNumber(number, excludeLibPhoneNumber) {
    if(_.isString(number)) {
        let normalizedNumber = number.replace(/\s*/g, '');
        if(normalizedNumber.match(/^\+?[0-9]+$/)) {
            if(normalizedNumber.match(/^\+/) === null) {
                normalizedNumber = '+' + normalizedNumber;
            }
            if(excludeLibPhoneNumber === true) {
                return normalizedNumber;
            }
            else {
                try {
                    return phoneUtil.format(phoneUtil.parse(normalizedNumber, 'DE'),
                        PhoneNumberFormat.INTERNATIONAL);
                }
                catch(err) {
                    return normalizedNumber;
                }
            }
        }
        else {
            return number;
        }
    }
    else {
        return number;
    }
}

export function rawNumber(number) {
    return "" + number.replace(/\s*/g, '').replace(/^\+/, '');
}

export function normalizeDestination(destination) {
    try {
        let parsedDestination = url.parse(destination, true);
        let authParts = parsedDestination.auth.split(':');
        let host = parsedDestination.host;
        let normalizedNumber = normalizeNumber(authParts[0]);
        let isNumber = normalizedNumber !== authParts[0];
        if (host === 'voicebox.local') {
            return 'Voicemail';
        }
        else if (host === 'fax2mail.local') {
            return 'Fax2Mail';
        }
        else if (host === 'managersecretary.local') {
            return 'Manager Secretary';
        }
        else if (authParts[0] === 'custom-hours') {
            return 'Custom Announcement';
        }
        else if (host === 'app.local') {
            return _.capitalize(authParts[0]);
        }
        else if (!isNumber) {
            return _.capitalize(host.split('.')[0]);
        }
        else {
            return normalizedNumber;
        }
    }
    catch(err) {
        return normalizeNumber(destination);
    }
}

export function normalizeTerminationInput(destination) {
    if (destination === 'Voicemail') {
        return 'voicebox';
    }
    else if (destination === 'Fax2Mail') {
        return 'fax2mail';
    }
    else {
        return destination;
    }
}
