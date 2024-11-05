import _ from 'lodash'
import sipUriParse from 'src/sip-uri-parse'

const DestinationType = {
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

function parseSipUri (sipUri) {
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

export default {
    methods: {
        isDestinationType (sipUri, destinationType) {
            const parsedSipUri = parseSipUri(sipUri)
            return parsedSipUri.destinationType === destinationType
        },
        isDestinationTypeVoiceBox (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.VoiceBox)
        },
        isDestinationTypeConference (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.Conference)
        },
        isDestinationTypeFax2Mail (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.Fax2Mail)
        },
        isDestinationTypeCallingCard (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.CallingCard)
        },
        isDestinationTypeCallThrough (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.CallThrough)
        },
        isDestinationTypeAutoAttendant (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.AutoAttendant)
        },
        isDestinationTypeOfficeHoursAnnouncement (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.OfficeHoursAnnouncement)
        },
        isDestinationTypeCustomAnnouncement (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.CustomAnnouncement)
        },
        isDestinationTypeLocalSubscriber (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.LocalSubscriber)
        },
        isDestinationTypeManagerSecretary (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.ManagerSecretary)
        },
        isDestinationTypeApplication (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.Application)
        },
        isDestinationTypeNumber (sipUri) {
            return this.isDestinationType(sipUri, DestinationType.Number)
        },
        destinationIconBySipUri (sipUri) {
            const parsedSipUri = parseSipUri(sipUri)
            return this.destinationIconByType(parsedSipUri.destinationType)
        },
        destinationIconByType (destinationType) {
            switch (destinationType) {
            case DestinationType.VoiceBox:
                return 'voicemail'
            case DestinationType.Conference:
                return 'groups'
            case DestinationType.Fax2Mail:
                return 'email'
            case DestinationType.CallingCard:
                return 'credit_card'
            case DestinationType.CallThrough:
                return 'double_arrow'
            case DestinationType.AutoAttendant:
                return 'dialpad'
            case DestinationType.OfficeHoursAnnouncement:
                return 'schedule'
            case DestinationType.CustomAnnouncement:
                return 'music_note'
            case DestinationType.LocalSubscriber:
                return 'person_pin'
            case DestinationType.ManagerSecretary:
                return 'support_agent'
            case DestinationType.Application:
                return 'apps'
            case DestinationType.Number:
                return 'phone_forwarded'
            }
        },
        destinationFormattedBySipUri (sipUri) {
            const parsedSipUri = parseSipUri(sipUri)
            switch (parsedSipUri.destinationType) {
            case DestinationType.VoiceBox:
                return this.$t('Voicebox')
            case DestinationType.Conference:
                return this.$t('Conference')
            case DestinationType.Fax2Mail:
                return this.$t('Fax2Mail')
            case DestinationType.CallingCard:
                return this.$t('Calling Card')
            case DestinationType.CallThrough:
                return this.$t('Call Through')
            case DestinationType.AutoAttendant:
                return this.$t('Auto Attendant')
            case DestinationType.OfficeHoursAnnouncement:
                return this.$t('Office Hours Announcement')
            case DestinationType.CustomAnnouncement:
                return this.$t('Custom Announcement')
            case DestinationType.LocalSubscriber:
                return this.$t('Local Subscriber')
            case DestinationType.ManagerSecretary:
                return this.$t('Manager Secretary')
            case DestinationType.Application:
                return _.words(parsedSipUri.parsedUri.username).map((word) => _.upperFirst(word)).join(' ')
            case DestinationType.Number:
            default:
                return parsedSipUri.parsedUri.username
            }
        }
    }
}
