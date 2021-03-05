
export default function (number, extension) {
    let constructedNumber = ''
    if (number === null || number === undefined) {
        return ''
    }
    if (number.is_devid && number.is_devid === true) {
        constructedNumber = '' + number.devid_alias
    } else {
        constructedNumber = '' + number.cc + number.ac + number.sn
    }
    if (extension) {
        return constructedNumber.replace(new RegExp(extension + '$'), '')
    } else {
        return constructedNumber
    }
}
