'use strict';

import CallBlockingModule  from '../../src/store/call-blocking';
import { assert } from 'chai';

describe('CallBlockingModule', ()=>{

    it('should enable/disable incoming call blocking', ()=>{
        var state = {};
        CallBlockingModule.mutations.enableIncoming(state);
        assert.equal(state.incomingEnabled, true);
        CallBlockingModule.mutations.disableIncoming(state);
        assert.equal(state.incomingEnabled, false);
    });

    it('should load incoming call blocking data', ()=>{
        var state = {};
        var list = [
            '+4312345678',
            '+4387654321'
        ];
        CallBlockingModule.mutations.loadIncoming(state, {
            enabled: true,
            list: [
                '+4312345678',
                '+4387654321'
            ]
        });
        assert.equal(state.incomingEnabled, true);
        assert.deepEqual(state.incomingList, list);
    });
});
