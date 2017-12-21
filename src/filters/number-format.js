

import url from 'url';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
var phoneUtil = PhoneNumberUtil.getInstance();

export default function(number) {
    let phoneNumber;
    try {
        if (url.parse(number, true).host.match(/voicebox/)) {
            // TODO: Improve to account for all cases and move switch/case
            // statement into separate function for this
            phoneNumber = 'Voicemail'; 
        } else {
            phoneNumber = url.parse(number, true).auth.split(':')[0];
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
        console.log('if else', number);
        return number;
    }
}

export function rawNumber(number) {
    if(_.isString(number)) {
        return number.replace(/\s*/g, '').replace(/^\+/, '');
    }
    return '';
}
