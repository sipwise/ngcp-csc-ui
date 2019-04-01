
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
        participants: []
    },
    getters: {
        isJoined() {
            return false;
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
        joinRequesting(state) {
            state.joinState = RequestState.requesting;
            state.joinError = null;
        },
        joinSucceeded(state) {
            state.joinState = RequestState.succeeded;
            state.joinError = null;
        },
        joinFailed(state, error) {
            state.joinState = RequestState.failed;
            state.joinError = error;
        },
        participantJoined(state, participant) {
            state.participants.push(participant.getId());

        },
        participantLeft(state, participant) {
            state.participants = state.participants.filter(($participant)=>{
                return participant.getId() !== $participant.getId();
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
            media.build().then((localMediaStream)=>{
                Vue.$conference.setLocalMediaStream(localMediaStream);
                context.commit('localMediaSucceeded', localMediaStream);
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
            }).catch((err)=>{
                context.commit('localMediaFailed', err.message);
            });
        },
        enableMicrophone(context) {
            if(!context.getters.isLocalMediaRequesting) {
                let mediaType = MediaTypes.mic;
                if(context.getters.isCameraEnabled) {
                    mediaType = MediaTypes.micCam;
                }
                else if(context.getters.isScreenEnabled) {
                    mediaType = MediaTypes.micScreen;
                }
                context.dispatch('createLocalMedia', mediaType);
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
                Vue.$conference.onLeft((conference)=>{
                    context.commit('leftSuccessfully', conference);
                }).onParticipantJoined((participant)=>{
                    context.commit('participantJoined', participant);
                }).onParticipantLeft((participant)=>{
                    context.commit('participantLeft', participant);
                }).join(conferenceId, context.getters.localMediaStream).then(()=>{
                    context.commit('joinSucceeded');
                }).catch((err)=>{
                    context.commit('joinFailed', err.message);
                });
            }
        }
    }
}
