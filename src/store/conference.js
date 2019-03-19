
import Vue from 'vue'
import {
    RequestState
} from "./common";

export default {
    namespaced: true,
    state: {
        conferencingEnabled: false,
        microphoneEnabled: true,
        cameraEnabled: false,
        screenEnabled: false,
        localMediaState: RequestState.initiated,
        localMediaError: null,
        localMediaStream: null,
        remoteMediaStreams: []
    },
    getters: {
        isJoined() {
            return false;
        },
        isConferencingEnabled(state) {
            return state.conferencingEnabled;
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
        isMicrophoneEnabled(state) {
            return state.microphoneEnabled;
        },
        enableCamera(state) {
            state.cameraEnabled = true;
        },
        disableCamera(state) {
            state.cameraEnabled = false;
        },
        isCameraEnabled(state) {
            return state.cameraEnabled;
        },
        enableScreen(state) {
            state.screenEnabled = true;
        },
        disableScreen(state) {
            state.screenEnabled = false;
        },
        isScreenEnabled(state) {
            return state.screenEnabled;
        },
        localMediaRequesting(state) {
            state.localMediaState = RequestState.requesting;
            state.localMediaError = null;
        },
        localMediaSucceeded(state, localMediaStream) {
            state.localMediaState = RequestState.succeeded;
            state.localMediaStream = localMediaStream;
            state.localMediaError = null;
        },
        localMediaFailed(state, error) {
            state.localMediaState = RequestState.failed;
            state.localMediaError = error;
        }
    },
    actions: {
        createLocalMedia(context, type) {
            let media = Vue.$rtcEngine.createMedia();
            context.commit('localMediaRequesting');
            switch(type) {
                default:
                case 'audio':
                    media.enableMicrophone();
                    break;
                case 'audioVideo':
                    media.enableMicrophone();
                    media.enableCamera();
                    break;
                case 'audioScreen':
                    media.enableMicrophone();
                    break;
                case 'video':
                    media.enableCamera();
                    break;
                case 'screen':
                    media.enableScreen();
                    break;
            }
            media.build().then((localMediaStream)=>{
                context.commit('localMediaSucceeded', localMediaStream);
                switch(type) {
                    default:
                    case 'audio':
                        context.commit('enableMicrophone');
                        context.commit('disableCamera');
                        context.commit('disableScreen');
                        break;
                    case 'audioVideo':
                        context.commit('enableMicrophone');
                        context.commit('enableCamera');
                        context.commit('disableScreen');
                        break;
                    case 'audioScreen':
                        context.commit('enableMicrophone');
                        context.commit('disableCamera');
                        context.commit('enableScreen');
                        break;
                    case 'video':
                        context.commit('disableMicrophone');
                        context.commit('enableCamera');
                        context.commit('disableScreen');
                        break;
                    case 'screen':
                        context.commit('disableMicrophone');
                        context.commit('disableCamera');
                        context.commit('enableScreen');
                        break;
                }
            }).catch((err)=>{
                context.commit('localMediaFailed', err.message);
            });
        }
    }
}
