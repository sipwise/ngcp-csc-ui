'use strict';

import PbxConfig from '../../src/store/pbx-config';
import { assert } from 'chai';

describe('PBX Configuration Store', () => {

    it('should list all PBX Groups', () => {
        let state = {};
        let data = {
            pilot: {},
            seats: {
                items: [
                    {
                        id: 2,
                        pbx_group_ids: []
                    },
                    {
                        id: 3,
                        pbx_group_ids: []
                    }
                ],
                lastPage: 1
            },
            groups: {
                items: [
                    {
                        id: 4
                    },
                    {
                        id: 5
                    }
                ],
                lastPage: 1
            },
            numbers: [
                {
                    id: 6
                },
                {
                    id: 7
                }
            ]
        };
        PbxConfig.mutations.listSucceeded(state, data);
        assert.equal(state.seats[2], data.seats.items[0]);
        assert.equal(state.seats[3], data.seats.items[1]);
        assert.equal(state.groups[4], data.groups.items[0]);
        assert.equal(state.groups[5], data.groups.items[1]);
        assert.deepEqual(state.numbers, data.numbers);
    });

    it('should list all Sound Sets', () => {
        let state = {};
        let data = {
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
        };
        PbxConfig.mutations.listSoundSetsSucceeded(state, data);
        assert.equal(state.soundSets[15], data.items[0]);
        assert.equal(state.soundSets[17], data.items[1]);
    });

});
