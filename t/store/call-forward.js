
'use strict'

import CallForwardModule from '../../src/store/call-forward'
import { assert } from 'chai'

describe('CallForward', function () {
    it('should load always type destinations', function () {
        const state = {
            destinations: {
                online: [],
                busy: [],
                offline: []
            }
        }
        const data = {
            online: [],
            busy: [],
            offline: [{
                destinations: [{
                    announcement_id: null,
                    destination: 'sip:3333@192.168.178.23',
                    priority: 1,
                    simple_destination: '3333',
                    timeout: 60
                },
                {
                    announcement_id: null,
                    destination: 'sip:2222@192.168.178.23',
                    priority: 1,
                    simple_destination: '2222',
                    timeout: 300
                }],
                id: 3,
                name: 'csc_destinationset_1'
            }]
        }
        CallForwardModule.mutations.loadDestinations(state, data)
        assert.deepEqual(state.destinations, data)
    })

    it('should load timeset times', function () {
        const state = {
            timesetTimes: []
        }
        const result = {
            times: [
                { weekday: 'Monday', from: '8', to: '16' },
                { weekday: 'Tuesday', from: '8', to: '16' },
                { weekday: 'Wednesday', from: '8', to: '16' }
            ],
            timesetIsCompatible: null,
            timesetExists: null,
            timesetHasReverse: null,
            timesetHasDuplicate: null,
            timesetId: null
        }
        CallForwardModule.mutations.loadTimesSucceeded(state, result)
        assert.equal(state.timesetTimes, result.times)
    })
})
