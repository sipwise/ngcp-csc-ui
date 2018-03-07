
import _ from 'lodash';
import { normalizeNumber } from './number-format'

export default function(number, extension) {
    let constructedNumber = "" + number.cc + number.ac + number.sn;
    let normalizedNumber = normalizeNumber(constructedNumber);
    let finalNumber;
    if(_.isString(normalizedNumber)) {
        finalNumber = normalizedNumber;
    }
    else {
        finalNumber = constructedNumber;
    }
    if(extension) {
        return finalNumber.replace(new RegExp(extension + '$'), '');
    }
    else {
        return finalNumber;
    }

}
