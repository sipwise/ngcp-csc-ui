'use strict'

import { assert } from 'chai'
import numberFormat, { normalizeDestination } from '../../src/filters/number-format'

const numbers = {
    valid1: '43993004',
    invalid1: '43993004+',
    invalid2: 'a43993004'
}

const sipUris = {
    valid1: 'sip:43993004@sipwise.com',
    invalid1: 'sip:a43993004@sipwise.com'
}

const destinations = {
    voiceMail: 'sip:vmu@voicebox.local',
    fax2Mail: 'sip:@fax2mail.local',
    managerSecretary: 'sip:@managersecretary.local',
    app: 'sip:app@app.local',
    customHours: 'sip:custom-hours@app.local',
    conference: 'sip:@conference.local',
    number: 'sip:43993004@sipwise.com'
}

describe('NumberFormatFilter', function () {
    it('should format a number or sip uri', function () {
        assert.equal(numberFormat(sipUris.valid1), numbers.valid1)
        assert.equal(numberFormat(sipUris.invalid1), numbers.invalid2)
    })

    it('should format a call forward destination', function () {
        assert.equal(normalizeDestination(destinations.voiceMail), 'Voicebox')
        assert.equal(normalizeDestination(destinations.fax2Mail), 'Fax2Mail')
        assert.equal(normalizeDestination(destinations.managerSecretary), 'Manager Secretary')
        assert.equal(normalizeDestination(destinations.app), 'App')
        assert.equal(normalizeDestination(destinations.customHours), 'Custom Announcement')
        assert.equal(normalizeDestination(destinations.conference), 'Conference')
        assert.equal(normalizeDestination(destinations.number), numbers.valid1)
    })
})
