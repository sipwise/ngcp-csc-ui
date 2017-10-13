'use strict';

import CallBlockingModule  from '../../src/store/call-blocking';
import { assert } from 'chai';

describe('CallBlocking', function(){

    describe('Incoming', function(){

        it('should enable list', function(){
            var state = {};
            CallBlockingModule.mutations.enableIncoming(state);
            assert.equal(state.incomingEnabled, true);
        });

        it('should disable list', function(){
            var state = {};
            CallBlockingModule.mutations.disableIncoming(state);
            assert.equal(state.incomingEnabled, false);
        });

        it('should load list and flag', function(){
            var state = {};
            var list = [
                '0123456789',
                '0987654321'
            ];
            CallBlockingModule.mutations.loadIncoming(state, {
                enabled: true,
                list: list
            });
            assert.equal(state.incomingEnabled, true);
            assert.deepEqual(state.incomingList, list);
        });
    });

    describe('Outgoing', function(){

        it('should enable list', function(){
            var state = {};
            CallBlockingModule.mutations.enableOutgoing(state);
            assert.equal(state.outgoingEnabled, true);
        });

        it('should disable list', function(){
            var state = {};
            CallBlockingModule.mutations.disableOutgoing(state);
            assert.equal(state.outgoingEnabled, false);
        });

        it('should load list and flag', function(){
            var state = {};
            var list = [
                '0123456789',
                '0987654321'
            ];
            CallBlockingModule.mutations.loadOutgoing(state, {
                enabled: true,
                list: list
            });
            assert.equal(state.outgoingEnabled, true);
            assert.deepEqual(state.outgoingList, list);
        });
    });

    it('should enable/disable privacy call blocking', ()=>{
        var state = {};
        CallBlockingModule.mutations.enablePrivacy(state);
        assert.equal(state.privacyEnabled, true);
        CallBlockingModule.mutations.disablePrivacy(state);
        assert.equal(state.privacyEnabled, false);
    });
});
