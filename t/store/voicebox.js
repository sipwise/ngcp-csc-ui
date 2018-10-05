
'use strict';

import VoiceboxModule from '../../src/store/voicebox';
import { assert } from 'chai';

describe('Voicebox', function(){

    it('should load all voicebox settings into store', function(){
        let state = {
            voiceboxSettingDelete: false,
            voiceboxSettingAttach: false,
            voiceboxSettingPin: '',
            voiceboxSettingEmail: '',
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
        assert.equal(state.voiceboxSettingDelete, settings.delete);
        assert.equal(state.voiceboxSettingAttach, settings.attach);
        assert.equal(state.voiceboxSettingEmail, settings.email);
        assert.equal(state.voiceboxSettingPin, settings.pin);

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
