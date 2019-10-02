
import Vue from 'vue'
import {
    RequestState
} from "./common";

const MediaTypes = {
    mic: 'mic',
    micCam: 'micCam',
    cam: 'cam',
    micScreen: 'micScreen',
    screen: 'screen'
};

export default {
    namespaced: true,
    state: {
        conferencingEnabled: false,
        microphoneEnabled: false,
        cameraEnabled: false,
        screenEnabled: false,
        localMediaState: RequestState.initiated,
        localMediaError: null,
        joinState: RequestState.initiated,
        joinError: null,
        leaveState: RequestState.initiated,
        leaveError: null,
        participants: [],
        remoteMediaStreams: []
    },
    getters: {
        username(state, getters, rootState, rootGetters) {
            return rootGetters['user/getUsername'];
        },
        conferenceId(state, getters, rootState, rootGetters) {
            return rootGetters['conferenceId'];
        },
        conferenceUrl(state, getters, rootState, rootGetters) {
            return rootGetters['conferenceUrl'];
        },
        hasConferenceId(state, getters, rootState, rootGetters) {
            return rootGetters['hasConferenceId'];
        },
        isJoined(state) {
            return state.joinState === RequestState.succeeded;
        },
        isJoining(state) {
            return state.joinState === RequestState.requesting;
        },
        isLeft(state) {
            return state.leaveState === RequestState.succeeded;
        },
        isLeaving(state) {
            return state.leaveState === RequestState.requesting;
        },
        isConferencingEnabled(state) {
            return state.conferencingEnabled;
        },
        isMicrophoneEnabled(state) {
            return state.microphoneEnabled;
        },
        isCameraEnabled(state) {
            return state.cameraEnabled;
        },
        isScreenEnabled(state) {
            return state.screenEnabled;
        },
        isMediaEnabled(state) {
            return (state.localMediaState === RequestState.succeeded ||
                state.localMediaState === RequestState.requesting) && Vue.$conference.hasLocalMediaStream();
        },
        localMediaStream(state) {
            if((state.localMediaState === RequestState.succeeded ||
                state.localMediaState === RequestState.requesting) && Vue.$conference.hasLocalMediaStream()) {
                return Vue.$conference.getLocalMediaStreamNative();
            }
            return null;
        },
        hasLocalMediaStream(state) {
            return (state.localMediaState === RequestState.succeeded ||
                state.localMediaState === RequestState.requesting) && Vue.$conference.hasLocalMediaStream();
        },
        localParticipant(state) {
          if(state.joinState === RequestState.succeeded){
            return Vue.$conference.getLocalParticipant();
          }
        },
        remoteParticipant:  () => (participantId) => {
          return Vue.$conference.getRemoteParticipant(participantId);
        },
        remoteMediaStream:  (state) => (participantId) => {
          if(state.remoteMediaStreams.includes(participantId)){
            const participant =  Vue.$conference.getRemoteParticipant(participantId);
            return participant.mediaStream ? participant.mediaStream.getStream() :  null;
          }
          return null;

        },
        participantsList(state) {
          return state.participants;
        },
        remoteMediaStreams(state) {
          return state.remoteMediaStreams;
        },
        hasRemoteMediaStream: (state) => (participantId) => {
          return state.remoteMediaStreams.includes(participantId)
        }

    },
    mutations: {
        enableConferencing(state) {
            state.conferencingEnabled = true;
        },
        disableConferencing(state) {
            state.conferencingEnabled = false;
        },
        enableMicrophone(state) {
            state.microphoneEnabled = true;
        },
        disableMicrophone(state) {
            state.microphoneEnabled = false;
        },
        enableCamera(state) {
            state.cameraEnabled = true;
        },
        disableCamera(state) {
            state.cameraEnabled = false;
        },
        enableScreen(state) {
            state.screenEnabled = true;
        },
        disableScreen(state) {
            state.screenEnabled = false;
        },
        localMediaRequesting(state) {
            state.localMediaState = RequestState.requesting;
            state.localMediaError = null;
        },
        localMediaSucceeded(state) {
            state.localMediaState = RequestState.succeeded;
            state.localMediaError = null;
        },
        localMediaFailed(state, error) {
            state.localMediaState = RequestState.failed;
            state.localMediaError = error;
        },
        isLocalMediaRequesting(state) {
            return state.localMediaState === RequestState.requesting;
        },
        disposeLocalMedia(state) {
            Vue.$conference.removeLocalMediaStream();
            state.cameraEnabled = false;
            state.microphoneEnabled = false;
            state.screenEnabled = false;
        },
        addRemoteMedia(state, participantId) {
          if(state.remoteMediaStreams.includes(participantId)){
            state.remoteMediaStreams = state.remoteMediaStreams.filter(($participant)=>{
                return participantId !== $participant;
            });
          }
          state.remoteMediaStreams.push(participantId);

        },
        removeRemoteMedia(state, participant) {
          state.remoteMediaStreams = state.remoteMediaStreams.filter(($participant)=>{
              return participant !== $participant;
          });
        },
        joinRequesting(state) {
            state.joinState = RequestState.requesting;
            state.joinError = null;
        },
        joinSucceeded(state) {
            state.joinState = RequestState.succeeded;
            state.joinError = null;
            state.leaveState = null;
        },
        joinFailed(state, error) {
            state.joinState = RequestState.failed;
            state.joinError = error;
        },
        leaveRequesting(state) {
            state.leaveState = RequestState.requesting;
            state.leaveError = null;
            state.joinState = null;
        },
        leaveSucceeded(state) {
            state.leaveState = RequestState.succeeded;
            state.leaveError = null;
            state.joinState = RequestState.initiated;
            state.joinError = null;
        },
        leaveFailed(state, error) {
            state.leaveState = RequestState.failed;
            state.leaveError = error;
        },
        participantJoined(state, participant) {
          if(state.participants.includes(participant.getId())){
            state.participants = state.participants.filter(($participant)=>{
                return participant.getId() !== $participant;
            });
          }
          state.participants.push(participant.getId())
        },
        participantLeft(state, participant) {
            state.participants = state.participants.filter(($participant)=>{
                return participant.getId() !== $participant;
            });
        }
    },
    actions: {
        createLocalMedia(context, type) {
            let media = Vue.$rtcEngine.createMedia();
            context.commit('localMediaRequesting');
            switch(type) {
                default:
                case MediaTypes.mic:
                    media.enableMicrophone();
                    break;
                case MediaTypes.micCam:
                    media.enableMicrophone();
                    media.enableCamera();
                    break;
                case MediaTypes.micScreen:
                    media.enableMicrophone();
                    media.enableScreen();
                    break;
                case MediaTypes.cam:
                    media.enableCamera();
                    break;
                case MediaTypes.screen:
                    media.enableScreen();
                    break;
            }
            let localMediaStream;
            return media.build().then(($localMediaStream)=>{
                localMediaStream = $localMediaStream;
                localMediaStream.onVideoEnded(()=>{
                    context.dispatch('createLocalMedia', MediaTypes.mic);
                });
                Vue.$conference.setLocalMediaStream(localMediaStream);
                switch(type) {
                    default:
                    case MediaTypes.mic:
                        context.commit('enableMicrophone');
                        context.commit('disableCamera');
                        context.commit('disableScreen');
                        break;
                    case MediaTypes.micCam:
                        context.commit('enableMicrophone');
                        context.commit('enableCamera');
                        context.commit('disableScreen');
                        break;
                    case MediaTypes.micScreen:
                        context.commit('enableMicrophone');
                        context.commit('disableCamera');
                        context.commit('enableScreen');
                        break;
                    case MediaTypes.cam:
                        context.commit('disableMicrophone');
                        context.commit('enableCamera');
                        context.commit('disableScreen');
                        break;
                    case MediaTypes.screen:
                        context.commit('disableMicrophone');
                        context.commit('disableCamera');
                        context.commit('enableScreen');
                        break;
                }
                return Promise.resolve();
            }).then(()=>{
                if(context.getters.isJoined) {
                    return Vue.$conference.changeConferenceMedia();
                }
                else {
                    return Promise.resolve();
                }
            }).then(()=>{
                context.commit('localMediaSucceeded', localMediaStream);
            }).catch((err)=>{
                if(!context.getters.hasLocalMediaStream) {
                    context.commit('localMediaFailed', err.message);
                }
            });
        },
        async enableMicrophone(context) {
            if(!context.getters.isLocalMediaRequesting) {
                let mediaType = MediaTypes.mic;
                if(context.getters.isCameraEnabled) {
                    mediaType = MediaTypes.micCam;
                }
                else if(context.getters.isScreenEnabled) {
                    mediaType = MediaTypes.micScreen;
                }
                await context.dispatch('createLocalMedia', mediaType);
            }
        },
        disableMicrophone(context) {
            if(!context.getters.isLocalMediaRequesting) {
                let mediaType = null;
                if(context.getters.isCameraEnabled) {
                    mediaType = MediaTypes.cam;
                }
                else if(context.getters.isScreenEnabled) {
                    mediaType = MediaTypes.screen;
                }
                if(mediaType === null) {
                    context.commit('disposeLocalMedia');
                }
                else {
                    context.dispatch('createLocalMedia', mediaType);
                }
            }
        },
        toggleMicrophone(context) {
            if(!context.getters.isMicrophoneEnabled) {
                context.dispatch('enableMicrophone');
            }
            else {
                context.dispatch('disableMicrophone');
            }
        },
        enableCamera(context) {
            if(!context.getters.isLocalMediaRequesting) {
                context.dispatch('createLocalMedia', MediaTypes.micCam);
            }
        },
        disableCamera(context) {
            if(!context.getters.isLocalMediaRequesting) {
                let mediaType = null;
                if(context.getters.isMicrophoneEnabled) {
                    mediaType = MediaTypes.mic;
                }
                if(mediaType === null) {
                    context.commit('disposeLocalMedia');
                }
                else {
                    context.dispatch('createLocalMedia', mediaType);
                }
            }
        },
        toggleCamera(context) {
            if(!context.getters.isCameraEnabled) {
                context.dispatch('enableCamera');
            }
            else {
                context.dispatch('disableCamera');
            }
        },
        enableScreen(context) {
            if(!context.getters.isLocalMediaRequesting) {
                context.dispatch('createLocalMedia', MediaTypes.micScreen);
            }
        },
        disableScreen(context) {
            if(!context.getters.isLocalMediaRequesting) {
                let mediaType = null;
                if(context.getters.isMicrophoneEnabled) {
                    mediaType = MediaTypes.mic;
                }
                if(mediaType === null) {
                    context.commit('disposeLocalMedia');
                }
                else {
                    context.dispatch('createLocalMedia', mediaType);
                }
            }
        },
        toggleScreen(context) {
            if(!context.getters.isScreenEnabled) {
                context.dispatch('enableScreen');
            }
            else {
                context.dispatch('disableScreen');
            }
        },
        join(context, conferenceId) {
            if(context.getters.hasLocalMediaStream) {
                context.commit('joinRequesting');
                Vue.$conference.joinConference({
                    conferenceName: conferenceId,
                    displayName: context.getters.username
                }).then(()=>{
                    context.commit('joinSucceeded');
                }).catch((err)=>{
                    context.commit('joinFailed', err.message);
                });
            }
        },
        leave(context) {
            if(context.getters.isJoined) {
                context.commit('leaveRequesting');
                Vue.$conference.leaveConference().then(()=>{
                    context.commit('leaveSucceeded');
                    context.commit('disposeLocalMedia');
                }).catch((err)=>{
                    context.commit('leaveFailed', err.message);
                });
            }
        }
    }
}
