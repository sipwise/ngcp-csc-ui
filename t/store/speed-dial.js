
'use strict';

import SpeedDialModule from '../../src/store/speed-dial';
import { assert } from 'chai';

describe('SpeedDial', function(){

    it('should load all assigned speed dial slots', function(){
        let state = {
            assignedSlots: []
        };
        let data = [
            {
                destination: "sip:111111@192.168.178.23",
                slot: "*1"
            },
            {
                destination: "sip:333333@192.168.178.23",
                slot: "*3"
            }
        ];
        SpeedDialModule.mutations.speedDialSucceeded(state, data);
        assert.deepEqual(state.assignedSlots, data);
    });

});
