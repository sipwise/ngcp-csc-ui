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

    it('should list all group/seat/pilot call queue configs', function(){
        let state = {
            callQueueGroupsAndSeats: []
        };
        let data = {
            items: [
                {
                    display_name: "123",
                    id: 123,
                    is_pbx_group: false,
                    max_queue_length: "10",
                    queue_wrap_up_time: "5"
                },
                {
                    display_name: "456",
                    id: 456,
                    is_pbx_group: false,
                    max_queue_length: "5",
                    queue_wrap_up_time: "10"
                }
            ]
        };
        PbxConfig.mutations.callQueueListSucceeded(state, data);
        assert.deepEqual(state.callQueueGroupsAndSeats[0], data.items[0]);
        assert.deepEqual(state.callQueueGroupsAndSeats[1], data.items[1]);
    });

});
