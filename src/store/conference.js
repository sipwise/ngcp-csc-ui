
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
        localMediaStream: null,
        remoteMediaStreams: []
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
            return state.localMediaStream !== null;
        },
        localMediaStream(state) {
            if(state.localMediaStream !== null) {
                return state.localMediaStream.getStream();
            }
            return null;
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
        localMediaSucceeded(state, localMediaStream) {
            if(state.localMediaStream !== null) {
                state.localMediaStream.stop();
                state.localMediaStream = null;
            }
            state.localMediaState = RequestState.succeeded;
            state.localMediaStream = localMediaStream;
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
            if(state.localMediaStream !== null) {
                state.localMediaStream.stop();
                state.localMediaStream = null;
                state.cameraEnabled = false;
                state.microphoneEnabled = false;
                state.screenEnabled = false;
            }
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
        }
    }
}
