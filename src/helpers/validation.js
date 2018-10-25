
export function userInfo (value) {
    var regex = new RegExp(/^[-_.!~*'&=+$,;?/%a-zA-Z0-9]+$/, 'g');
    return regex.test(value);
}
