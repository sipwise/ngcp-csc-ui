import * as DestinationHelpers from 'src/helpers/destination'

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
    const parsedUri = DestinationHelpers.parseSipUri(sipUri)
    return {
        destinationType: parsedUri.destinationType,
        parsedUri
    }
}

export function isDestinationType (sipUri, destinationType) {
    return DestinationHelpers.isDestinationType(sipUri, destinationType)
}

export function isDestinationTypeVoiceBox (sipUri) {
    return DestinationHelpers.isDestinationTypeVoiceBox(sipUri)
}

export function isDestinationTypeConference (sipUri) {
    return DestinationHelpers.isDestinationTypeConference(sipUri)
}

export function isDestinationTypeFax2Mail (sipUri) {
    return DestinationHelpers.isDestinationTypeFax2Mail(sipUri)
}

export function isDestinationTypeCallingCard (sipUri) {
    return DestinationHelpers.isDestinationTypeCallingCard(sipUri)
}

export function isDestinationTypeCallThrough (sipUri) {
    return DestinationHelpers.isDestinationTypeCallThrough(sipUri)
}

export function isDestinationTypeAutoAttendant (sipUri) {
    return DestinationHelpers.isDestinationTypeAutoAttendant(sipUri)
}

export function isDestinationTypeOfficeHoursAnnouncement (sipUri) {
    return DestinationHelpers.isDestinationTypeOfficeHoursAnnouncement(sipUri)
}

export function isDestinationTypeCustomAnnouncement (sipUri) {
    return DestinationHelpers.isDestinationTypeCustomAnnouncement(sipUri)
}

export function isDestinationTypeLocalSubscriber (sipUri) {
    return DestinationHelpers.isDestinationTypeLocalSubscriber(sipUri)
}

export function isDestinationTypeManagerSecretary (sipUri) {
    return DestinationHelpers.isDestinationTypeManagerSecretary(sipUri)
}

export function isDestinationTypeApplication (sipUri) {
    return DestinationHelpers.isDestinationTypeApplication(sipUri)
}

export function isDestinationTypeNumber (sipUri) {
    return DestinationHelpers.isDestinationTypeNumber(sipUri)
}

export function getDestinationIcon (destinationType) {
    return DestinationHelpers.getDestinationIcon(destinationType)
}

export default {
    methods: {
        isDestinationType (sipUri, destinationType) {
            return DestinationHelpers.isDestinationType(sipUri, destinationType)
        },
        isDestinationTypeVoiceBox (sipUri) {
            return DestinationHelpers.isDestinationTypeVoiceBox(sipUri)
        },
        isDestinationTypeConference (sipUri) {
            return DestinationHelpers.isDestinationTypeConference(sipUri)
        },
        isDestinationTypeFax2Mail (sipUri) {
            return DestinationHelpers.isDestinationTypeFax2Mail(sipUri)
        },
        isDestinationTypeCallingCard (sipUri) {
            return DestinationHelpers.isDestinationTypeCallingCard(sipUri)
        },
        isDestinationTypeCallThrough (sipUri) {
            return DestinationHelpers.isDestinationTypeCallThrough(sipUri)
        },
        isDestinationTypeAutoAttendant (sipUri) {
            return DestinationHelpers.isDestinationTypeAutoAttendant(sipUri)
        },
        isDestinationTypeOfficeHoursAnnouncement (sipUri) {
            return DestinationHelpers.isDestinationTypeOfficeHoursAnnouncement(sipUri)
        },
        isDestinationTypeCustomAnnouncement (sipUri) {
            return DestinationHelpers.isDestinationTypeCustomAnnouncement(sipUri)
        },
        isDestinationTypeLocalSubscriber (sipUri) {
            return DestinationHelpers.isDestinationTypeLocalSubscriber(sipUri)
        },
        isDestinationTypeManagerSecretary (sipUri) {
            return DestinationHelpers.isDestinationTypeManagerSecretary(sipUri)
        },
        isDestinationTypeApplication (sipUri) {
            return DestinationHelpers.isDestinationTypeApplication(sipUri)
        },
        isDestinationTypeNumber (sipUri) {
            return DestinationHelpers.isDestinationTypeNumber(sipUri)
        },
        destinationIconBySipUri (sipUri) {
            const parsedSipUri = DestinationHelpers.parseSipUri(sipUri)
            return this.destinationIconByType(parsedSipUri.destinationType)
        },
        destinationIconByType (destinationType) {
            return DestinationHelpers.getDestinationIcon(destinationType)
        },
        destinationFormattedBySipUri (sipUri) {
            const parsedSipUri = DestinationHelpers.parseSipUri(sipUri)
            switch (parsedSipUri.destinationType) {
                case DestinationHelpers.DestinationType.VoiceBox:
                    return this.$t('Voicebox')
                case DestinationHelpers.DestinationType.Conference:
                    return this.$t('Conference')
                case DestinationHelpers.DestinationType.Fax2Mail:
                    return this.$t('Fax2Mail')
                case DestinationHelpers.DestinationType.CallingCard:
                    return this.$t('CallingCard')
                case DestinationHelpers.DestinationType.CallThrough:
                    return this.$t('CallThrough')
                case DestinationHelpers.DestinationType.AutoAttendant:
                    return this.$t('AutoAttendant')
                case DestinationHelpers.DestinationType.OfficeHoursAnnouncement:
                    return this.$t('OfficeHoursAnnouncement')
                case DestinationHelpers.DestinationType.CustomAnnouncement:
                    return this.$t('CustomAnnouncement')
                case DestinationHelpers.DestinationType.LocalSubscriber:
                    return this.$t('LocalSubscriber')
                case DestinationHelpers.DestinationType.ManagerSecretary:
                    return this.$t('ManagerSecretary')
                case DestinationHelpers.DestinationType.Application:
                    return this.$t('Application')
                case DestinationHelpers.DestinationType.Number:
                    return this.$t('Number')
                default:
                    return this.$t('Unknown')
            }
        }
    }
}
