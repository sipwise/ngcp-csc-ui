
export function userInfo (value) {
    var regex = new RegExp(/^[-_.!~*'&=+$,;?/%a-zA-Z0-9]+$/);
    return regex.test(value);
}

export function customMacAddress (value) {
    var regex = new RegExp(/^(?:(?:[0-9A-Fa-f]{2}(?=([-:]|))(?:\1[0-9A-Fa-f]{2}){5}))$/);
    return regex.test(value);
}
