
'use strict';

import ConferenceModule from '../../src/store/conference';
import { assert } from 'chai';

describe('ConferenceModule', function(){

    it('should add a participant id to the store if not already stored', () => {
        let state = {
            participants: []
        };
        const participant = {
            getId: () => {
                return '123456789';
            }
        };
        ConferenceModule.mutations.participantJoined(state, participant);
        assert.include(state.participants, participant.getId());

    });

    it('should not add a participant id to the store if already stored', () => {
        let state = {
            participants: ['123456789']
        };
        const participant = {
            getId: () => {
                return '123456789';
            }
        };
        ConferenceModule.mutations.participantJoined(state, participant);
        assert.equal(state.participants.length, 1);

    });

    it('should remove a participant id from the store', () => {
        let state = {
            participants: ['123456789']
        };
        const participant = {
            getId: () => {
                return '123456789';
            }
        };
        ConferenceModule.mutations.participantLeft(state, participant);
        assert.notInclude(state.participants, participant.getId());

    });

    it('should add a participant mediastream to the store', () => {
        let state = {
            remoteMediaStreams: {}
        };
        const participantId = '123456789';

        ConferenceModule.mutations.addRemoteMedia(state, participantId);
        assert.exists(state.remoteMediaStreams[participantId]);

    });

    it('should remove a participant mediastream from the store', () => {
        let state = {
            remoteMediaStreams: {
                123456789: '123456789'
            }
        };
        const participantId = '123456789';

        ConferenceModule.mutations.removeRemoteMedia(state, participantId);
        assert.notExists(state.remoteMediaStreams[participantId]);

    });

    it('should store the selected remote participant as selected', () => {
        let state = {
            selectedParticipant: null
        };
        const participantId = '123456789';

        ConferenceModule.mutations.setSelectedParticipant(state, participantId);
        assert.equal(state.selectedParticipant, participantId);

    });

    it('should store the local participant as selected', () => {
        let state = {
            selectedParticipant: '123456789'
        };
        const participantId = '123456789';

        ConferenceModule.mutations.setSelectedParticipant(state, participantId);
        assert.equal(state.selectedParticipant, 'local');

    });

    it('should reset the selected participant when conference ends', () => {
        let state = {
            selectedParticipant: 'local',
            joinState: false
        };

        ConferenceModule.mutations.setSelectedParticipant(state);
        assert.equal(state.selectedParticipant, null);

    });


});
