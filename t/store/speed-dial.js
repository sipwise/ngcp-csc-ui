
'use strict'

import SpeedDialModule from '../../src/store/speed-dial'
import { assert } from 'chai'

describe('SpeedDial', function () {
	it('should load all assigned speed dial slots', function () {
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
