
'use strict';

import VoiceboxModule from '../../src/store/voicebox';
import localeEn from 'src/i18n/en.json'
import { i18n } from '../../src/i18n';
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

    it('should load busy greeting id into store', function(){
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

    it('should load unavailable greeting id into store', function(){
        let state = {
            unavailGreetingId: null
        };
        let greetings = [
            {
                id: 1
            }
        ];
        VoiceboxModule.mutations.loadUnavailGreetingSucceeded(state, greetings);
        assert.deepEqual(state.unavailGreetingId, greetings[0].id);
    });

    it('should load busy greeting url into store', function(){
        let state = {
            playBusyGreetingUrl: null
        };
        let url = "blob:https://1.2.3.4/6341147c-3ed2-4112-876b-331e834a4821";
        VoiceboxModule.mutations.playBusyGreetingSucceeded(state, url);
        assert.deepEqual(state.playBusyGreetingUrl, url);
    });

    it('should load unavailable greeting id into store', function(){
        let state = {
            playUnavailGreetingUrl: null
        };
        let url = "blob:https://1.2.3.4/6341147c-3ed2-4112-876b-331e834a4821";
        VoiceboxModule.mutations.playUnavailGreetingSucceeded(state, url);
        assert.deepEqual(state.playUnavailGreetingUrl, url);
    });

    it('should get right label for busy greeting to indicate if it\'s custom or default', function(){
        let state = {
            busyGreetingId: null
        };
        let getterObject = VoiceboxModule.getters.busyGreetingLabel(state);
        assert.equal(getterObject, i18n.t('voicebox.label.defaultSoundActive'));
    });

    it('should get right label for unavailable greeting to indicate if it\'s custom or default', function(){
        let state = {
            unavailGreetingId: 1
        };
        let getterObject = VoiceboxModule.getters.unavailGreetingLabel(state);
        assert.equal(getterObject, i18n.t('voicebox.label.customSoundActive'));
    });

});
