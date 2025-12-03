import sipUriParse from 'src/sip-uri-parse'

export const DestinationType = {
    VoiceBox: 'VoiceBox',
    Conference: 'Conference',
    Fax2Mail: 'Fax2Mail',
    CallingCard: 'CallingCard',
    CallThrough: 'CallThrough',
    AutoAttendant: 'AutoAttendant',
    OfficeHoursAnnouncement: 'OfficeHoursAnnouncement',
    CustomAnnouncement: 'CustomAnnouncement',
    LocalSubscriber: 'LocalSubscriber',
    ManagerSecretary: 'ManagerSecretary',
    Application: 'Application',
    Number: 'Number'
}

export function parseSipUri (sipUri) {
    const parsedUri = sipUriParse(sipUri)
    const host = parsedUri.host
    const username = parsedUri.username
    let destinationType

    if (host.endsWith('voicebox.local')) {
        destinationType = DestinationType.VoiceBox
    } else if (host.endsWith('conference.local')) {
        destinationType = DestinationType.Conference
    } else if (host.endsWith('fax2mail.local')) {
        destinationType = DestinationType.Fax2Mail
    } else if (username === 'callingcard' && host.endsWith('app.local')) {
        destinationType = DestinationType.CallingCard
    } else if (username === 'callthrough' && host.endsWith('app.local')) {
        destinationType = DestinationType.CallThrough
    } else if (username === 'auto-attendant' && host.endsWith('app.local')) {
        destinationType = DestinationType.AutoAttendant
    } else if (username === 'office-hours' && host.endsWith('app.local')) {
        destinationType = DestinationType.OfficeHoursAnnouncement
    } else if (username === 'custom-hours' && host.endsWith('app.local')) {
        destinationType = DestinationType.CustomAnnouncement
    } else if (username === 'localuser' && host.endsWith('local')) {
        destinationType = DestinationType.LocalSubscriber
    } else if (host.endsWith('managersecretary.local')) {
        destinationType = DestinationType.ManagerSecretary
    } else if (host.endsWith('app.local')) {
        destinationType = DestinationType.Application
    } else {
        destinationType = DestinationType.Number
    }

    return {
        destinationType,
        parsedUri
    }
}

export function isDestinationType (sipUri, destinationType) {
    const parsedSipUri = parseSipUri(sipUri)
    return parsedSipUri.destinationType === destinationType
}

export function isDestinationTypeVoiceBox (sipUri) {
    return isDestinationType(sipUri, DestinationType.VoiceBox)
}

export function isDestinationTypeConference (sipUri) {
    return isDestinationType(sipUri, DestinationType.Conference)
}

export function isDestinationTypeFax2Mail (sipUri) {
    return isDestinationType(sipUri, DestinationType.Fax2Mail)
}

export function isDestinationTypeCallingCard (sipUri) {
    return isDestinationType(sipUri, DestinationType.CallingCard)
}

export function isDestinationTypeCallThrough (sipUri) {
    return isDestinationType(sipUri, DestinationType.CallThrough)
}

export function isDestinationTypeAutoAttendant (sipUri) {
    return isDestinationType(sipUri, DestinationType.AutoAttendant)
}

export function isDestinationTypeOfficeHoursAnnouncement (sipUri) {
    return isDestinationType(sipUri, DestinationType.OfficeHoursAnnouncement)
}

export function isDestinationTypeCustomAnnouncement (sipUri) {
    return isDestinationType(sipUri, DestinationType.CustomAnnouncement)
}

export function isDestinationTypeLocalSubscriber (sipUri) {
    return isDestinationType(sipUri, DestinationType.LocalSubscriber)
}

export function isDestinationTypeManagerSecretary (sipUri) {
    return isDestinationType(sipUri, DestinationType.ManagerSecretary)
}

export function isDestinationTypeApplication (sipUri) {
    return isDestinationType(sipUri, DestinationType.Application)
}

export function isDestinationTypeNumber (sipUri) {
    return isDestinationType(sipUri, DestinationType.Number)
}

export function getDestinationIcon (destinationType) {
    switch (destinationType) {
        case DestinationType.VoiceBox: return 'voicemail'
        case DestinationType.Conference: return 'groups'
        case DestinationType.Fax2Mail: return 'email'
        case DestinationType.CallingCard: return 'credit_card'
        case DestinationType.CallThrough: return 'double_arrow'
        case DestinationType.AutoAttendant: return 'dialpad'
        case DestinationType.OfficeHoursAnnouncement: return 'schedule'
        case DestinationType.CustomAnnouncement: return 'music_note'
        case DestinationType.LocalSubscriber: return 'person_pin'
        case DestinationType.ManagerSecretary: return 'support_agent'
        case DestinationType.Application: return 'apps'
        case DestinationType.Number: return 'phone_forwarded'
        default: return 'phone_forwarded'
    }
}

// Note: This needs i18n, so it stays in the mixin
// export function formatDestination(sipUri, t) { ... }
