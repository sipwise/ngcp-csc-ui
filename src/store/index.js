import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import { date } from 'quasar'

import CallBlockingModule from './call-blocking'
import CallForwardModule from './call-forward'
import CallForwardingModule from './call-forwarding'
import NewCallForwardModule from './new-call-forward'
import CallModule, { errorVisibilityTimeout } from './call'
import CallRecordingsModule from './call-recordings'
import CallSettingsModule from './call-settings'
import ConversationsModule from './conversations'

import PbxModule from './pbx'
import PbxSeatsModule from './pbx-seats'
import PbxGroupsModule from './pbx-groups'
import PbxDevicesModule from './pbx-devices'
import PbxCallQueuesModule from './pbx-callqueues'
import PbxSoundSetsModule from './pbx-soundsets'
import PbxMsConfigsModule from './pbx-ms-configs'
import PbxAutoAttendants from './pbx-auto-attendants'

import ReminderModule from './reminder'
import SpeedDialModule from './speed-dial'
import UserModule from './user'
import CommunicationModule from './communication'
import FaxModule from './fax'
import VoiceboxModule from './voicebox'
import ConferenceModule from './conference'

import RtcEnginePlugin from 'src/plugins/rtc-engine'
import CallPlugin from 'src/plugins/call'
import ConferencePlugin from 'src/plugins/conference'
import { INTERNAL_DATE_FORMAT_SLASH, INTERNAL_DATE_FORMAT_DASH, INTERNAL_DATE_FORMAT_DASH_HOUR } from 'src/constants'

Vue.use(RtcEnginePlugin)
Vue.use(CallPlugin)
Vue.use(ConferencePlugin)
Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
    const Store = new Vuex.Store({
        modules: {
            callBlocking: CallBlockingModule,
            callForward: CallForwardModule,
            newCallForward: NewCallForwardModule,
            callRecordings: CallRecordingsModule,
            call: CallModule,
            callSettings: CallSettingsModule,
            conversations: ConversationsModule,
            reminder: ReminderModule,
            speedDial: SpeedDialModule,
            user: UserModule,
            communication: CommunicationModule,
            fax: FaxModule,
            voicebox: VoiceboxModule,
            conference: ConferenceModule,
            pbx: PbxModule,
            pbxSeats: PbxSeatsModule,
            pbxGroups: PbxGroupsModule,
            pbxDevices: PbxDevicesModule,
            pbxCallQueues: PbxCallQueuesModule,
            pbxSoundSets: PbxSoundSetsModule,
            pbxMsConfigs: PbxMsConfigsModule,
            callForwarding: CallForwardingModule,
            pbxAutoAttendants: PbxAutoAttendants

        },
        state: {
            route: null
        },
        getters: {
            conferenceId (state) {
                return _.get(state, 'route.params.id', null)
            },
            conferenceUrl (state) {
                // eslint-disable-next-line no-unused-vars
                const id = _.get(state, 'route.params.id', null)
                return window.location.href
            },
            hasConferenceId (state, getters) {
                return getters.conferenceId !== null && getters.conferenceId !== undefined
            },
            isCallForward (state) {
                return _.startsWith(_.get(state, 'route.path', ''), '/user/call-forward')
            },
            isCallBlocking (state) {
                return _.startsWith(_.get(state, 'route.path', ''), '/user/call-blocking')
            },
            isPbxConfiguration (state) {
                return _.startsWith(_.get(state, 'route.path', ''), '/user/pbx-configuration')
            },
            isHome (state) {
                return _.get(state, 'route.path', '') === '/user/home'
            },
            getCurrentFormattedDateWithDash () {
                const currentDate = Date.now()
                return date.formatDate(currentDate, INTERNAL_DATE_FORMAT_DASH)
            },
            getCurrentFormattedDateWithDashAndHour () {
                const currentDate = new Date()
                currentDate.setHours(0, 0, 0, 0)
                return date.formatDate(currentDate, INTERNAL_DATE_FORMAT_DASH_HOUR)
            },
            getCurrentFormattedDateWithSlash () {
                const currentDate = Date.now()
                return date.formatDate(currentDate, INTERNAL_DATE_FORMAT_SLASH)
            }
        },
        mutations: {
            routeChanged (state, route) {
                state.route = route
            }
        },
        plugins: [
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
            },
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
            },
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
        ],
        // enable strict mode (adds overhead!)
        // for dev mode only
        strict: process.env.DEV
    })

    return Store
}
