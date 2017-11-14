

import url from 'url';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
var phoneUtil = PhoneNumberUtil.getInstance();

export default function(number) {
    try {
        let phoneNumber = url.parse(number, true).auth.split(':')[0];
        return normalizeNumber(phoneNumber);
    } catch(err1) {
        return normalizeNumber(number);
    }
}

function normalizeNumber(number) {
    let normalizedNumber = number.replace(/\s*/, '');
    if(normalizedNumber.match(/^\+?[0-9]+$/)) {
        if(normalizedNumber.match(/^\+/) === null) {
            normalizedNumber = '+' + normalizedNumber;
        }
        try {
            return phoneUtil.format(phoneUtil.parse(normalizedNumber, 'DE'),
                PhoneNumberFormat.INTERNATIONAL);
        } catch(err) {
            return number;
        }
    } else {
        return number
    }
}
