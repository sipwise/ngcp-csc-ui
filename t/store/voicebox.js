
'use strict';

import VoiceboxModule from '../../src/store/voicebox';
import { assert } from 'chai';

describe('Voicebox', function(){

    it('should load all voicebox settings into store', function(){
        let state = {
            voiceboxSettings: {
                attach: null,
                delete: null,
                email: '',
                id: null,
                pin: null,
                sms_number: ''
            }
        };
        let settings = {
            attach: true,
            delete: false,
            email: '',
            id: 123,
            pin: 1234,
            sms_number: ''
        };
        VoiceboxModule.mutations.loadSettingsSucceeded(state, settings);
        assert.deepEqual(state.voiceboxSettings, settings);
    });

    it('should load all busy greeting id into store', function(){
        let state = {
            busyGreetingId: null
        };
        let greetings = [
            {
                id: 1
            }
        ];
        VoiceboxModule.mutations.loadBusyGreetingSucceeded(state, greetings);
        assert.deepEqual(state.busyGreetingId, greetings[0].id);
    });

});
