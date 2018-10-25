
export function anyAscii (value) {
    var regex = new RegExp('\\0*');
    return regex.test(value);
}

export function anyPrintableAscii (value) {
    var regex = new RegExp('[ -~]');
    return regex.test(value);
}
