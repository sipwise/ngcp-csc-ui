import Vue from 'vue'
import RtcEnginePlugin from 'src/plugins/rtc-engine'
import CallPlugin from 'src/plugins/call'
import ConferencePlugin from 'src/plugins/conference'
import { errorVisibilityTimeout } from 'src/store/call'

export default ({ Vue, store }) => {
    Vue.use(RtcEnginePlugin)
    Vue.use(CallPlugin)
    Vue.use(ConferencePlugin)

    rtcEngine(store)
    call(store)
    conference(store)
}

function rtcEngine (store) {
    Vue.$rtcEngine.setNgcpApiBaseUrl(Vue.$config.baseHttpUrl)
    Vue.$rtcEngine.onSipNetworkConnected(() => {
        store.commit('call/enableCall')
    }).onSipNetworkDisconnected(() => {
        store.commit('call/disableCall')
    }).onConferenceNetworkConnected(() => {
        store.commit('conference/enableConferencing')
    }).onConferenceNetworkDisconnected(() => {
        store.commit('conference/disableConferencing')
    })
}

function call (store) {
    Vue.$call.onIncoming(() => {
        store.commit('call/incomingCall', {
            number: Vue.$call.getNumber()
        })
    }).onRemoteMedia((remoteMediaStream) => {
        store.commit('call/establishCall', remoteMediaStream)
    }).onEnded((reason) => {
        Vue.$call.end()
        store.commit('call/endCall', reason)
        setTimeout(() => {
            store.commit('call/inputNumber')
        }, errorVisibilityTimeout)
    })
}

function conference (store) {
    Vue.$conference.onConferenceParticipantJoined((participant) => {
        store.commit('conference/participantJoined', participant)
        participant.onMediaStream(() => {
            store.commit('conference/removeRemoteMedia', participant.id)
            store.commit('conference/addRemoteMedia', participant.id)
        }).onMediaEnded(() => {
            store.commit('conference/removeRemoteMedia', participant.id)
        })
    }).onConferenceParticipantLeft((participant) => {
        store.commit('conference/participantLeft', participant)
        store.commit('conference/removeRemoteMedia', participant.id)
        store.commit('conference/setSelectedParticipant', participant.id)
    }).onConferenceEvent((event) => {
        store.commit('conference/event', event)
    }).onConferenceMessage((message) => {
        store.commit('conference/message', message)
    }).onConferenceFile((file) => {
        store.commit('conference/file', file)
    }).onLocalMediaStreamEnded(() => {
        store.commit('conference/disposeLocalMedia')
    }).onConferenceEnded(() => {
        store.dispatch('conference/leave')
    })
}
