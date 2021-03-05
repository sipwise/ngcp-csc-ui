'use strict'

import PbxConfig from '../../src/store/pbx-config'
import { assert } from 'chai'

describe('PBX Configuration Store', () => {
    it('should list all PBX Groups', () => {
        const state = {}
        const data = {
            pilot: {},
            seats: {
                2: {
                    id: 2,
                    pbx_group_ids: []
                },
                3:
                    {
                        id: 3,
                        pbx_group_ids: []
                    }
            },
            lastPage: 1,
            groups: {
                4: {
                    id: 4,
                    display_name: 'Marketing'
                }
            },
            numbers: [
                {
                    id: 6
                },
                {
                    id: 7
                }
            ]
        }
        PbxConfig.mutations.listSucceeded(state, data)
        assert.equal(state.seats, data.seats)
        assert.equal(state.groups, data.groups)
        assert.deepEqual(state.numbers, data.numbers)
    })

    it('should list all Sound Sets', () => {
        const state = {}
        const data = {
            items: [
                {
                    contract_defaults: true,
                    customer_id: null,
                    description: 'Set description 1',
                    groups: [],
                    id: 15,
                    name: 'Set 1'
                },
                {
                    contract_defaults: false,
                    customer_id: null,
                    description: 'Set description 2',
                    groups: [],
                    id: 17,
                    name: 'Set 2'
                }
            ]
        }
        PbxConfig.mutations.listSoundSetsSucceeded(state, data)
        assert.equal(state.soundSets[15], data.items[0])
        assert.equal(state.soundSets[17], data.items[1])
    })
})
