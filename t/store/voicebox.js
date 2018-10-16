
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

    it('should get right class for busy label to indicate if custom greeting is active or not', function(){
        let state = {
            busyGreetingId: null
        };
        let classObject = {
            'inactive-label': true,
            'active-label': false
        };
        let getterObject = VoiceboxModule.getters.busyActiveClass(state);
        assert.deepEqual(getterObject, classObject);
    });

    it('should get right class for unavailable label to indicate if custom greeting is active or not', function(){
        let state = {
            unavailGreetingId: 1
        };
        let classObject = {
            'inactive-label': false,
            'active-label': true
        };
        let getterObject = VoiceboxModule.getters.unavailActiveClass(state);
        assert.deepEqual(getterObject, classObject);
    });

});
