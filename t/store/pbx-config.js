'use strict';

import PbxConfig from '../../src/store/pbx-config';
import { assert } from 'chai';

describe('PBX Configuration Store', () => {

    it('should list all PBX Groups', () => {
        let state = {};
        let data = {
            pilot: {},
            seats: [
                {
                    id: 2,
                    pbx_group_ids: []
                },
                {
                    id: 3,
                    pbx_group_ids: []
                }
            ],
            groups: [
                {
                    id: 4
                },
                {
                    id: 5
                }
            ],
            numbers: [
                {
                    id: 6
                },
                {
                    id: 7
                }
            ]
        };
        PbxConfig.mutations.listAllSucceeded(state, data);
        assert.equal(state.seats[2], data.seats[0]);
        assert.equal(state.seats[3], data.seats[1]);
        assert.equal(state.groups[4], data.groups[0]);
        assert.equal(state.groups[5], data.groups[1]);
        assert.deepEqual(state.numbers, data.numbers);
    });
});
