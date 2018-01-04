
'use strict';

import CallForwardModule  from '../../src/store/call-forward';
import { assert } from 'chai';

describe('CallForward', function(){

    it('should load always everybody destinations', function(){
        let state = {
            alwaysEverybodyDestinations: [
            ]
        };
        let data = {
            busy: [],
            offline: [{
                destinations: [{
                    "announcement_id": null,
                    "destination": "sip:3333@192.168.178.23",
                    "priority": 1,
                    "simple_destination": "3333",
                    "timeout": 60
                },
                {
                    "announcement_id": null,
                    "destination": "sip:2222@192.168.178.23",
                    "priority": 1,
                    "simple_destination": "2222",
                    "timeout": 300
                }],
                id: 3,
                name: "csc_destinationset_1"
            }],
            online: []
        };
        CallForwardModule.mutations.loadAlwaysEverybodyDestinations(state, data);
        assert.deepEqual(state.alwaysEverybodyDestinations, data);
    });

    it(' should reset destination form', function() {
        let state = {
            conversations: [
            ]
        };
        let data = {
            announcement_id: null,
            destination: '',
            priority: 1,
            timeout: ''
        };
        CallForwardModule.mutations.resetFormState(state);
        assert.deepEqual(state.form, data);
    });

});
