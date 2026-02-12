import { date } from 'quasar'
import CommunicationModule from 'src/communication'
import { INTERNAL_DATE_FORMAT_DASH, INTERNAL_DATE_FORMAT_DASH_HOUR, INTERNAL_DATE_FORMAT_SLASH } from 'src/constants'
import CallModule from 'src/store/call'
import CallBlockingModule from 'src/store/call-blocking'
import CallForwardingModule from 'src/store/call-forwarding'
import CallRecordingsModule from 'src/store/call-recordings'
import CallSettingsModule from 'src/store/call-settings'
import ConversationsModule from 'src/store/conversations'
import Customer from 'src/store/customer'
import DashboardModule from 'src/store/dashboard'
import FaxModule from 'src/store/fax'
import PbxModule from 'src/store/pbx'
import PbxAutoAttendants from 'src/store/pbx-auto-attendants'
import PbxCallQueuesModule from 'src/store/pbx-callqueues'
import PbxDevicesModule from 'src/store/pbx-devices'
import PbxGroupsModule from 'src/store/pbx-groups'
import PbxMsConfigsModule from 'src/store/pbx-ms-configs'
import PbxSeatsModule from 'src/store/pbx-seats'
import PbxSoundSetsModule from 'src/store/pbx-soundsets'
import ReminderModule from 'src/store/reminder'
import SpeedDialModule from 'src/store/speed-dial'
import SubscriberPhonebookModule from 'src/store/subscriber-phonebook'
import TranscriptionsModule from 'src/store/transcriptions'
import UserModule from 'src/store/user'
import VoiceboxModule from 'src/store/voicebox'
import { createStore } from 'vuex'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
    const Store = createStore({
        modules: {
            callBlocking: CallBlockingModule,
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
            pbx: PbxModule,
            pbxSeats: PbxSeatsModule,
            pbxGroups: PbxGroupsModule,
            pbxDevices: PbxDevicesModule,
            pbxCallQueues: PbxCallQueuesModule,
            pbxSoundSets: PbxSoundSetsModule,
            pbxMsConfigs: PbxMsConfigsModule,
            callForwarding: CallForwardingModule,
            pbxAutoAttendants: PbxAutoAttendants,
            dashboard: DashboardModule,
            customer: Customer,
            transcriptions: TranscriptionsModule,
            'subscriber-phonebook': SubscriberPhonebookModule
        },
        state: {
            route: null
        },
        getters: {
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
        actions: {
            async reloadLanguageRelatedData (context) {
                /* NOTE: this action will be called after UI language change. So you could place here actions calls for
                   refreshing language related data in the store */

                if (Object.keys(context.state.callSettings.preferencesDefs).length > 0) {
                    // preferencesDefs were loaded already so we need updated them for a new language
                    await context.dispatch('callSettings/loadPreferencesDefsAction')
                }
            }
        },
        // enable strict mode (adds overhead!)
        // for dev mode only
        strict: process.env.DEV
    })

    return Store
}
