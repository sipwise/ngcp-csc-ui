
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
        VoiceboxModule.mutations.loadingSucceeded(state, settings);
        assert.deepEqual(state.voiceboxSettings, settings);
    });

});
