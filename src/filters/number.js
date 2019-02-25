
export default function(number, extension) {
    let constructedNumber = "" + number.cc + number.ac + number.sn;
    if (extension) {
        return constructedNumber.replace(new RegExp(extension + '$'), '');
    }
    else {
        return constructedNumber;
    }
}
