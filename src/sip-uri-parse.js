
export default function (sipUri) {
    const parsedUri = {}
    let sipUriParts1 = null
    if (sipUri.match(/^sip:/g) !== null) {
        sipUriParts1 = sipUri.split(/^sip:/)
    } else if (sipUri.match(/^sips:/g) !== null) {
        sipUriParts1 = sipUri.split(/^sips:/)
    } else {
        sipUriParts1 = ['', sipUri]
    }
    if (sipUriParts1 !== null) {
        const sipUriParts2 = sipUriParts1[1].split('@')
        const sipUriParts3 = sipUriParts2[0].split(':')
        const sipUriParts4 = sipUriParts2[1].split(';')
        const sipUriParts5 = sipUriParts4[0].split(':')
        parsedUri.protocol = 'sip:'
        parsedUri.host = sipUriParts5[0]
        parsedUri.port = sipUriParts5[1]
        parsedUri.username = sipUriParts3[0]
        parsedUri.password = sipUriParts3[1]
        return parsedUri
    } else {
        return null
    }
}
