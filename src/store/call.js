
import _ from 'lodash'
import Vue from 'vue'
import {
	normalizeDestination
} from '../filters/number-format'
import {
	startCase
} from '../filters/string'
import {
	i18n
} from 'src/boot/i18n'

export var CallState = {
	input: 'input',
	initiating: 'initiating',
	ringing: 'ringing',
	incoming: 'incoming',
	established: 'established',
	ended: 'ended'
}
export var CallStateTitle = {
	input: i18n.t('Start new call'),
	initiating: i18n.t('Calling'),
	ringing: i18n.t('Ringing at'),
	incoming: i18n.t('Incoming call from'),
	established: i18n.t('In call with'),
	ended: i18n.t('Call ended')
}

export var MediaType = {
	audioOnly: 'audioOnly',
	audioVideo: 'audioVideo',
	audioScreen: 'audioScreen'
}

export const errorVisibilityTimeout = 5000
export const reinitializeTimeout = 5000

function handleUserMediaError (context, err) {
	const errName = _.get(err, 'name', null)
	const errMessage = _.get(err, 'message', null)
	if (errName === 'UserMediaError' && errMessage === 'Permission denied') {
		context.commit('endCall', 'userMediaPermissionDenied')
	}
	if (errMessage === 'plugin not detected') {
		context.commit('desktopSharingInstall')
		context.commit('hangUpCall')
	} else if (errMessage === 'PermissionDenied') {
		context.commit('endCall', 'desktopSharingPermissionDenied')
	} else {
		context.commit('endCall', errName)
	}
}

export default {
	namespaced: true,
	state: {
		callEnabled: false,
		endedReason: null,
		callState: CallState.input,
		number: '',
		numberInput: '',
		localMediaStream: null,
		remoteMediaStream: null,
		caller: false,
		callee: false,
		desktopSharingInstall: false,
		microphoneEnabled: true,
		cameraEnabled: true,
		remoteVolumeEnabled: true,
		maximized: false,
		dialpadOpened: false
	},
	getters: {
		isCallEnabled (state) {
			return state.callEnabled
		},
		endedReason (state) {
			return state.endedReason
		},
		callNumber (state) {
			return state.number
		},
		callNumberInput (state) {
			return state.numberInput
		},
		// isNetworkConnected(state) {
		//     return state.initializationState === RequestState.succeeded;
		// },
		// isCallAvailable(state, getters) {
		//     return getters.isNetworkConnected;
		// },
		// isCallInitializing(state, getters, rootState, rootGetters) {
		//     return state.initializationState === RequestState.requesting ||
		//         rootGetters['user/userDataRequesting'];
		// },
		// isCallInitialized(state) {
		//     return state.initializationState === RequestState.succeeded
		// },
		// hasCallInitError(state) {
		//     return state.initializationError !== null;
		// },
		// callInitError(state) {
		//     return state.initializationError;
		// },
		isCallInitializing (state, getters, rootState, rootGetters) {
			return rootGetters['user/isRtcEngineInitializing']
		},
		isPreparing (state) {
			return state.callState === CallState.input
		},
		isInitiating (state) {
			return state.callState === CallState.initiating
		},
		isIncoming (state) {
			return state.callState === CallState.incoming
		},
		isTrying (state) {
			return state.callState === CallState.initiating ||
                state.callState === CallState.ringing
		},
		isRinging (state) {
			return state.callState === CallState.ringing
		},
		isCalling (state) {
			return state.callState === CallState.initiating ||
                state.callState === CallState.ringing ||
                state.callState === CallState.established ||
                state.callState === CallState.incoming ||
                state.callState === CallState.ended
		},
		isEstablished (state) {
			return state.callState === CallState.established
		},
		isEnded (state) {
			return state.callState === CallState.ended
		},
		hasRtcEngineCapability (state, getters, rootState, rootGetters) {
			return rootGetters['user/hasRtcEngineCapability']
		},
		hasRtcEngineCapabilityEnabled (state, getters, rootState, rootGetters) {
			return rootGetters['user/hasRtcEngineCapabilityEnabled']
		},
		hasRemoteVideo (state) {
			if (state.remoteMediaStream !== null) {
				return Vue.$call.hasRemoteVideo()
			}
		},
		hasLocalVideo (state) {
			if (state.localMediaStream !== null) {
				return Vue.$call.hasLocalVideo()
			}
		},
		hasVideo (state, getters) {
			return getters.hasLocalVideo || getters.hasRemoteVideo
		},
		isAudioEnabled (state) {
			return state.audioEnabled
		},
		isVideoEnabled (state) {
			return state.videoEnabled
		},
		isCaller (state) {
			return state.caller
		},
		isCallee (state) {
			return state.callee
		},
		callState (state) {
			return state.callState
		},
		desktopSharingInstall (state) {
			return state.desktopSharingInstall
		},
		localMediaStream (state) {
			if (state.localMediaStream !== null) {
				return Vue.$call.getLocalMediaStream()
			}
			return null
		},
		remoteMediaStream (state) {
			if (state.remoteMediaStream !== null) {
				return Vue.$call.getRemoteMediaStream()
			}
			return null
		},
		isMicrophoneEnabled (state) {
			return state.microphoneEnabled
		},
		isCameraEnabled (state) {
			return state.cameraEnabled
		},
		isRemoteVolumeEnabled (state) {
			return state.remoteVolumeEnabled
		},
		isMaximized (state) {
			return state.maximized
		},
		isDialpadOpened (state) {
			return state.dialpadOpened
		},
		callNumberFormatted (state, getters) {
			return normalizeDestination(getters.callNumber)
		},
		callEndedReasonFormatted (state, getters) {
			return startCase(getters.endedReason)
		},
		callStateTitle (state) {
			return CallStateTitle[state.callState]
		},
		callStateSubtitle (state, getters) {
			if (state.callState === CallState.initiating ||
                state.callState === CallState.ringing ||
                state.callState === CallState.incoming ||
                state.callState === CallState.established) {
				return getters.callNumberFormatted
			} else if (state.callState === CallState.ended) {
				return getters.callEndedReasonFormatted
			} else {
				return ''
			}
		}
	},
	mutations: {
		numberInputChanged (state, numberInput) {
			state.numberInput = numberInput
		},
		inputNumber (state) {
			state.callState = CallState.input
			state.number = ''
			state.numberInput = ''
			state.endedReason = null
		},
		startCalling (state, number) {
			state.number = number
			state.callState = CallState.initiating
			state.caller = true
			state.callee = false
			state.endedReason = null
		},
		localMediaSuccess (state) {
			state.localMediaStream = Vue.$call.getLocalMediaId()
		},
		startRinging (state) {
			state.callState = CallState.ringing
		},
		stopRinging (state) {
			state.callState = CallState.established
		},
		establishCall (state) {
			state.remoteMediaStream = Vue.$call.getRemoteMediaId()
			state.callState = CallState.established
			state.microphoneEnabled = true
			state.cameraEnabled = true
			state.remoteVolumeEnabled = true
		},
		incomingCall (state, options) {
			state.callState = CallState.incoming
			state.number = options.number
			state.callee = true
			state.caller = false
			state.endedReason = null
		},
		hangUpCall (state) {
			state.callState = CallState.input
			state.number = ''
			state.numberInput = ''
			state.endedReason = null
			Vue.$call.hangUp()
		},
		endCall (state, reason) {
			if (state.endedReason === null) {
				state.callState = CallState.ended
				state.endedReason = reason
			}
			Vue.$call.end()
		},
		sendDTMF (state, value) {
			state.dtmf = value
		},
		toggleMicrophone (state) {
			state.microphoneEnabled = !state.microphoneEnabled
		},
		toggleCamera (state) {
			state.cameraEnabled = !state.cameraEnabled
		},
		toggleRemoteVolume (state) {
			state.remoteVolumeEnabled = !state.remoteVolumeEnabled
		},
		maximize (state) {
			state.dialpadOpened = false
			state.maximized = true
		},
		minimize (state) {
			state.dialpadOpened = false
			state.maximized = false
		},
		toggleDialpad (state) {
			state.dialpadOpened = !state.dialpadOpened
		},
		enableCall (state) {
			state.callEnabled = true
		},
		disableCall (state) {
			state.callEnabled = false
		}
	},
	actions: {
		start (context, localMedia) {
			const number = context.getters.callNumberInput
			context.commit('startCalling', number)
			Promise.resolve().then(() => {
				return Vue.$call.createLocalMedia(localMedia)
			}).then((localMediaStream) => {
				context.commit('localMediaSuccess')
				Vue.$call.onRingingStart(() => {
					context.commit('startRinging')
				}).onRingingStop(() => {
					context.commit('stopRinging')
				}).start(number, localMediaStream)
			}).catch((err) => {
				Vue.$call.end()
				handleUserMediaError(context, err)
				setTimeout(() => {
					context.commit('inputNumber')
				}, errorVisibilityTimeout)
			})
		},
		accept (context, localMedia) {
			Vue.$call.createLocalMedia(localMedia).then((localMediaStream) => {
				Vue.$call.accept(localMediaStream)
				context.commit('localMediaSuccess')
			}).catch((err) => {
				Vue.$call.end()
				handleUserMediaError(context, err)
				setTimeout(() => {
					context.commit('inputNumber')
				}, errorVisibilityTimeout)
			})
		},
		end (context) {
			Vue.$call.end()
			context.commit('hangUpCall')
		},
		sendDTMF (context, value) {
			if (Vue.$call.hasRunningCall()) {
				Vue.$call.sendDTMF(value)
			}
		},
		toggleMicrophone (context) {
			if (context.getters.isMicrophoneEnabled) {
				Vue.$call.disableAudio()
			} else {
				Vue.$call.enableAudio()
			}
			context.commit('toggleMicrophone')
		},
		toggleCamera (context) {
			if (context.getters.isCameraEnabled) {
				Vue.$call.disableVideo()
			} else {
				Vue.$call.enableVideo()
			}
			context.commit('toggleCamera')
		},
		toggleRemoteVolume (context) {
			context.commit('toggleRemoteVolume')
		}
	}
}
