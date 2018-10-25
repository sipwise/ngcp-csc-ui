
export function anyAscii (value) {
    // NOTE: Also covers ascii above DEL, which I would assume is outside
    // the scope of CHAR
    var regex = new RegExp('\\0*');
    return regex.test(value);
}

export function anyPrintableAscii (value) {
    // NOTE: Not desireable, unless dev-backend corrects us, as bnf points
    // to several non-printable characters
    var regex = new RegExp('[ -~]');
    return regex.test(value);
}

export function anyAsciiNotExtended (value) {
    // NOTE: Idea here is to exclud anything above u007F - needs verification
    var regex = new RegExp(/[^\u000-\u007F]+/, 'g');
    return !regex.test(value);
}
