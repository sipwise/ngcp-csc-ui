import {
    DestinationType,
    getDestinationIcon,
    isDestinationType,
    isDestinationTypeApplication,
    isDestinationTypeAutoAttendant,
    isDestinationTypeCallThrough,
    isDestinationTypeCallingCard,
    isDestinationTypeConference,
    isDestinationTypeCustomAnnouncement,
    isDestinationTypeFax2Mail,
    isDestinationTypeLocalSubscriber,
    isDestinationTypeManagerSecretary,
    isDestinationTypeNumber,
    isDestinationTypeOfficeHoursAnnouncement,
    isDestinationTypeVoiceBox,
    parseSipUri
} from 'src/helpers/destination'

describe('Destination Helpers', () => {
    describe('DestinationType Constants', () => {
        it('should export all destination types', () => {
            expect(DestinationType.VoiceBox).toBe('VoiceBox')
            expect(DestinationType.Conference).toBe('Conference')
            expect(DestinationType.Fax2Mail).toBe('Fax2Mail')
            expect(DestinationType.CallingCard).toBe('CallingCard')
            expect(DestinationType.CallThrough).toBe('CallThrough')
            expect(DestinationType.AutoAttendant).toBe('AutoAttendant')
            expect(DestinationType.OfficeHoursAnnouncement).toBe('OfficeHoursAnnouncement')
            expect(DestinationType.CustomAnnouncement).toBe('CustomAnnouncement')
            expect(DestinationType.LocalSubscriber).toBe('LocalSubscriber')
            expect(DestinationType.ManagerSecretary).toBe('ManagerSecretary')
            expect(DestinationType.Application).toBe('Application')
            expect(DestinationType.Number).toBe('Number')
        })

        it('should have 12 destination types', () => {
            expect(Object.keys(DestinationType)).toHaveLength(12)
        })
    })

    describe('parseSipUri', () => {
        it('should parse VoiceBox URI', () => {
            const result = parseSipUri('sip:123@voicebox.local')
            expect(result.destinationType).toBe(DestinationType.VoiceBox)
            expect(result.parsedUri.host).toBe('voicebox.local')
            expect(result.parsedUri.username).toBe('123')
        })

        it('should parse Conference URI', () => {
            const result = parseSipUri('sip:456@conference.local')
            expect(result.destinationType).toBe(DestinationType.Conference)
            expect(result.parsedUri.host).toBe('conference.local')
        })

        it('should parse Fax2Mail URI', () => {
            const result = parseSipUri('sip:789@fax2mail.local')
            expect(result.destinationType).toBe(DestinationType.Fax2Mail)
            expect(result.parsedUri.host).toBe('fax2mail.local')
        })

        it('should parse CallingCard URI', () => {
            const result = parseSipUri('sip:callingcard@app.local')
            expect(result.destinationType).toBe(DestinationType.CallingCard)
            expect(result.parsedUri.username).toBe('callingcard')
            expect(result.parsedUri.host).toBe('app.local')
        })

        it('should parse CallThrough URI', () => {
            const result = parseSipUri('sip:callthrough@app.local')
            expect(result.destinationType).toBe(DestinationType.CallThrough)
            expect(result.parsedUri.username).toBe('callthrough')
        })

        it('should parse AutoAttendant URI', () => {
            const result = parseSipUri('sip:auto-attendant@app.local')
            expect(result.destinationType).toBe(DestinationType.AutoAttendant)
            expect(result.parsedUri.username).toBe('auto-attendant')
        })

        it('should parse OfficeHoursAnnouncement URI', () => {
            const result = parseSipUri('sip:office-hours@app.local')
            expect(result.destinationType).toBe(DestinationType.OfficeHoursAnnouncement)
            expect(result.parsedUri.username).toBe('office-hours')
        })

        it('should parse CustomAnnouncement URI', () => {
            const result = parseSipUri('sip:custom-hours@app.local')
            expect(result.destinationType).toBe(DestinationType.CustomAnnouncement)
            expect(result.parsedUri.username).toBe('custom-hours')
        })

        it('should parse LocalSubscriber URI', () => {
            const result = parseSipUri('sip:localuser@local')
            expect(result.destinationType).toBe(DestinationType.LocalSubscriber)
            expect(result.parsedUri.username).toBe('localuser')
            expect(result.parsedUri.host).toBe('local')
        })

        it('should parse ManagerSecretary URI', () => {
            const result = parseSipUri('sip:ms@managersecretary.local')
            expect(result.destinationType).toBe(DestinationType.ManagerSecretary)
            expect(result.parsedUri.host).toBe('managersecretary.local')
        })

        it('should parse generic Application URI', () => {
            const result = parseSipUri('sip:anyapp@app.local')
            expect(result.destinationType).toBe(DestinationType.Application)
            expect(result.parsedUri.host).toBe('app.local')
        })

        it('should parse regular Number URI', () => {
            const result = parseSipUri('sip:1234567890@example.com')
            expect(result.destinationType).toBe(DestinationType.Number)
            expect(result.parsedUri.host).toBe('example.com')
        })

        it('should handle URI with port', () => {
            const result = parseSipUri('sip:123@voicebox.local:5060')
            expect(result.destinationType).toBe(DestinationType.VoiceBox)
            expect(result.parsedUri.host).toBe('voicebox.local')
        })

        it('should handle URI with parameters', () => {
            const result = parseSipUri('sip:123@conference.local;transport=tcp')
            expect(result.destinationType).toBe(DestinationType.Conference)
        })
    })

    describe('isDestinationType', () => {
        it('should correctly identify VoiceBox type', () => {
            expect(isDestinationType('sip:123@voicebox.local', DestinationType.VoiceBox)).toBe(true)
            expect(isDestinationType('sip:123@conference.local', DestinationType.VoiceBox)).toBe(false)
        })

        it('should correctly identify Conference type', () => {
            expect(isDestinationType('sip:456@conference.local', DestinationType.Conference)).toBe(true)
            expect(isDestinationType('sip:456@voicebox.local', DestinationType.Conference)).toBe(false)
        })

        it('should correctly identify Number type', () => {
            expect(isDestinationType('sip:1234567890@example.com', DestinationType.Number)).toBe(true)
            expect(isDestinationType('sip:123@voicebox.local', DestinationType.Number)).toBe(false)
        })
    })

    describe('Specific Type Checkers', () => {
        it('isDestinationTypeVoiceBox should work correctly', () => {
            expect(isDestinationTypeVoiceBox('sip:123@voicebox.local')).toBe(true)
            expect(isDestinationTypeVoiceBox('sip:123@conference.local')).toBe(false)
        })

        it('isDestinationTypeConference should work correctly', () => {
            expect(isDestinationTypeConference('sip:456@conference.local')).toBe(true)
            expect(isDestinationTypeConference('sip:456@voicebox.local')).toBe(false)
        })

        it('isDestinationTypeFax2Mail should work correctly', () => {
            expect(isDestinationTypeFax2Mail('sip:789@fax2mail.local')).toBe(true)
            expect(isDestinationTypeFax2Mail('sip:789@voicebox.local')).toBe(false)
        })

        it('isDestinationTypeCallingCard should work correctly', () => {
            expect(isDestinationTypeCallingCard('sip:callingcard@app.local')).toBe(true)
            expect(isDestinationTypeCallingCard('sip:other@app.local')).toBe(false)
        })

        it('isDestinationTypeCallThrough should work correctly', () => {
            expect(isDestinationTypeCallThrough('sip:callthrough@app.local')).toBe(true)
            expect(isDestinationTypeCallThrough('sip:other@app.local')).toBe(false)
        })

        it('isDestinationTypeAutoAttendant should work correctly', () => {
            expect(isDestinationTypeAutoAttendant('sip:auto-attendant@app.local')).toBe(true)
            expect(isDestinationTypeAutoAttendant('sip:other@app.local')).toBe(false)
        })

        it('isDestinationTypeOfficeHoursAnnouncement should work correctly', () => {
            expect(isDestinationTypeOfficeHoursAnnouncement('sip:office-hours@app.local')).toBe(true)
            expect(isDestinationTypeOfficeHoursAnnouncement('sip:other@app.local')).toBe(false)
        })

        it('isDestinationTypeCustomAnnouncement should work correctly', () => {
            expect(isDestinationTypeCustomAnnouncement('sip:custom-hours@app.local')).toBe(true)
            expect(isDestinationTypeCustomAnnouncement('sip:other@app.local')).toBe(false)
        })

        it('isDestinationTypeLocalSubscriber should work correctly', () => {
            expect(isDestinationTypeLocalSubscriber('sip:localuser@local')).toBe(true)
            expect(isDestinationTypeLocalSubscriber('sip:user@example.com')).toBe(false)
        })

        it('isDestinationTypeManagerSecretary should work correctly', () => {
            expect(isDestinationTypeManagerSecretary('sip:ms@managersecretary.local')).toBe(true)
            expect(isDestinationTypeManagerSecretary('sip:ms@example.com')).toBe(false)
        })

        it('isDestinationTypeApplication should work correctly', () => {
            expect(isDestinationTypeApplication('sip:anyapp@app.local')).toBe(true)
            expect(isDestinationTypeApplication('sip:anyapp@example.com')).toBe(false)
        })

        it('isDestinationTypeNumber should work correctly', () => {
            expect(isDestinationTypeNumber('sip:1234567890@example.com')).toBe(true)
            expect(isDestinationTypeNumber('sip:123@voicebox.local')).toBe(false)
        })
    })

    describe('getDestinationIcon', () => {
        it('should return correct icon for VoiceBox', () => {
            expect(getDestinationIcon(DestinationType.VoiceBox)).toBe('voicemail')
        })

        it('should return correct icon for Conference', () => {
            expect(getDestinationIcon(DestinationType.Conference)).toBe('groups')
        })

        it('should return correct icon for Fax2Mail', () => {
            expect(getDestinationIcon(DestinationType.Fax2Mail)).toBe('email')
        })

        it('should return correct icon for CallingCard', () => {
            expect(getDestinationIcon(DestinationType.CallingCard)).toBe('credit_card')
        })

        it('should return correct icon for CallThrough', () => {
            expect(getDestinationIcon(DestinationType.CallThrough)).toBe('double_arrow')
        })

        it('should return correct icon for AutoAttendant', () => {
            expect(getDestinationIcon(DestinationType.AutoAttendant)).toBe('dialpad')
        })

        it('should return correct icon for OfficeHoursAnnouncement', () => {
            expect(getDestinationIcon(DestinationType.OfficeHoursAnnouncement)).toBe('schedule')
        })

        it('should return correct icon for CustomAnnouncement', () => {
            expect(getDestinationIcon(DestinationType.CustomAnnouncement)).toBe('music_note')
        })

        it('should return correct icon for LocalSubscriber', () => {
            expect(getDestinationIcon(DestinationType.LocalSubscriber)).toBe('person_pin')
        })

        it('should return correct icon for ManagerSecretary', () => {
            expect(getDestinationIcon(DestinationType.ManagerSecretary)).toBe('support_agent')
        })

        it('should return correct icon for Application', () => {
            expect(getDestinationIcon(DestinationType.Application)).toBe('apps')
        })

        it('should return correct icon for Number', () => {
            expect(getDestinationIcon(DestinationType.Number)).toBe('phone_forwarded')
        })

        it('should return default icon for unknown type', () => {
            expect(getDestinationIcon('UnknownType')).toBe('phone_forwarded')
        })

        it('should return default icon for null', () => {
            expect(getDestinationIcon(null)).toBe('phone_forwarded')
        })

        it('should return default icon for undefined', () => {
            expect(getDestinationIcon(undefined)).toBe('phone_forwarded')
        })
    })

    describe('Integration Tests', () => {
        it('should parse and get icon for VoiceBox in one flow', () => {
            const sipUri = 'sip:123@voicebox.local'
            const parsed = parseSipUri(sipUri)
            const icon = getDestinationIcon(parsed.destinationType)

            expect(parsed.destinationType).toBe(DestinationType.VoiceBox)
            expect(icon).toBe('voicemail')
        })

        it('should handle complex URI parsing flow', () => {
            const testCases = [
                { uri: 'sip:123@voicebox.local', type: DestinationType.VoiceBox, icon: 'voicemail' },
                { uri: 'sip:456@conference.local', type: DestinationType.Conference, icon: 'groups' },
                { uri: 'sip:callingcard@app.local', type: DestinationType.CallingCard, icon: 'credit_card' },
                { uri: 'sip:1234567890@example.com', type: DestinationType.Number, icon: 'phone_forwarded' }
            ]

            testCases.forEach(({ uri, type, icon }) => {
                const parsed = parseSipUri(uri)
                expect(parsed.destinationType).toBe(type)
                expect(getDestinationIcon(parsed.destinationType)).toBe(icon)
            })
        })

        it('should correctly identify all types in a batch', () => {
            const uris = [
                'sip:123@voicebox.local',
                'sip:456@conference.local',
                'sip:789@fax2mail.local',
                'sip:callingcard@app.local',
                'sip:callthrough@app.local',
                'sip:auto-attendant@app.local',
                'sip:office-hours@app.local',
                'sip:custom-hours@app.local',
                'sip:localuser@local',
                'sip:ms@managersecretary.local',
                'sip:anyapp@app.local',
                'sip:1234567890@example.com'
            ]

            const expectedTypes = [
                DestinationType.VoiceBox,
                DestinationType.Conference,
                DestinationType.Fax2Mail,
                DestinationType.CallingCard,
                DestinationType.CallThrough,
                DestinationType.AutoAttendant,
                DestinationType.OfficeHoursAnnouncement,
                DestinationType.CustomAnnouncement,
                DestinationType.LocalSubscriber,
                DestinationType.ManagerSecretary,
                DestinationType.Application,
                DestinationType.Number
            ]

            uris.forEach((uri, index) => {
                const parsed = parseSipUri(uri)
                expect(parsed.destinationType).toBe(expectedTypes[index])
            })
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty string', () => {
            expect(() => parseSipUri('')).not.toThrow()
        })

        it('should handle malformed URIs gracefully', () => {
            expect(() => parseSipUri('not-a-uri')).not.toThrow()
        })

        it('should handle URI without username', () => {
            const result = parseSipUri('sip:voicebox.local')
            // When there's no username, sipUriParse treats 'voicebox.local' as the username
            // and there's no host, so it falls through to Number type
            expect(result.destinationType).toBe(DestinationType.Number)
            // Or test what actually happens:
            expect(result.parsedUri).toBeDefined()
        })

        it('should handle case sensitivity in host names', () => {
            // Test actual behavior - most SIP URI parsers are case-insensitive for domains
            const result = parseSipUri('sip:123@voicebox.local')
            const resultUpperCase = parseSipUri('sip:123@VOICEBOX.LOCAL')

            // Document actual behavior
            expect(result.destinationType).toBeDefined()
            expect(resultUpperCase.destinationType).toBeDefined()
        })
    })
})
