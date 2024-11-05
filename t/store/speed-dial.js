'use strict'

import { assert } from 'chai'
import SpeedDialModule from 'src/store/speed-dial'

describe('SpeedDial', () => {
    it('should load all assigned speed dial slots', () => {
        const state = {
            assignedSlots: []
        }
        const data = [
            {
                destination: 'sip:111111@192.168.178.23',
                slot: '*1'
            },
            {
                destination: 'sip:333333@192.168.178.23',
                slot: '*3'
            }
        ]
        SpeedDialModule.mutations.speedDialSucceeded(state, data)
        assert.deepEqual(state.assignedSlots, data)
    })
})
