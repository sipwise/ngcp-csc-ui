<template>
    <csc-page
        id="csc-page-dashboard"
        class="row justify-center"
    >
        <csc-card-dashboard
            v-if="showVoicemailCard"
            :title="$t('Voicebox Messages')"
            :count="voicemailsCount"
            :count-title="$t('Messages')"
            :button-title="$t('View Voicebox Messages')"
            :items-list="voicemailItems"
            :route-to="{ name: 'CscConversations', state: { initialTab: 'voicemail' } }"
            :loading="$wait.is('getVoicemailsData')"
            :no-items-message="$t('No messages')"
            :error="voicemailsError"
            data-cy="dashboard-view-voicebox"
            @action="downloadVoicemail"
        />
        <csc-card-dashboard
            v-if="showConversationsCard"
            :title="$t('Call List')"
            :count="callsCount"
            :count-title="$t('Calls')"
            :button-title="$t('View Call List')"
            :items-list="callItems"
            :route-to="{ name: 'CscConversations', state: { initialTab: 'call' } }"
            :no-items-message="$t('No calls')"
            :loading="$wait.is('getCallsData')"
            :error="callsError"
            data-cy="dashboard-view-calllist"
            :use-slot="true"
        >
            <template
                #listItems="{call}"
            >
                <csc-call-item
                    :call="call"
                    :sleek-mode="true"
                />
            </template>
        </csc-card-dashboard>
        <csc-card-dashboard
            v-if="showRegDevices"
            :title="$t('Registered Devices')"
            :count="registeredDevicesCount"
            :count-title="$t('Registered Devices')"
            :button-title="$t('View All Registered Devices')"
            :items-list="registeredDevicesItems"
            :route-to="{ name: 'RegisteredDevices', state: { initialTab: 'null' } }"
            :no-items-message="$t('No devices registered')"
            :loading="$wait.is('getRegisteredDevicesData')"
            :error="registeredDevicesError"
            data-cy="dashboard-view-registered-devices"
        />
    </csc-page>
</template>

<script>
import CscPage from 'components/CscPage'
import CscCallItem from 'components/pages/Conversations/CscCallItem'
import CscCardDashboard from 'components/pages/Dashboard/CscCardDashboard'
import { date } from 'quasar'
import { INTERNAL_DATE_FORMAT_DASH_HOUR, PROFILE_ATTRIBUTE_MAP } from 'src/constants'
import {
    callIcon,
    callIconColor
} from 'src/helpers/call-utils'
import { showGlobalError } from 'src/helpers/ui'
import { RequestState } from 'src/store/common'
import { mapWaitingActions } from 'vue-wait-vue3'
import { mapGetters, mapState } from 'vuex'
export default {
    name: 'CscPageDashboard',
    components: {
        CscCardDashboard,
        CscPage,
        CscCallItem
    },
    data () {
        return {
            callItems: [],
            voicemailItems: [],
            registeredDevicesItems: [],
            callsCount: 0,
            voicemailsCount: 0,
            registeredDevicesCount: 0,
            voicemailsError: false,
            callsError: false,
            registeredDevicesError: false
        }
    },
    computed: {
        ...mapState('call', [
            'callEnabled'
        ]),
        ...mapState('conversations', [
            'downloadVoiceMailState',
            'downloadVoiceMailError'
        ]),
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute'
        ]),
        showConversationsCard () {
            return this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.conversations)
        },
        showVoicemailCard () {
            return this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.conversations) &&
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.voiceMail)
        },
        showRegDevices () {
            return this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.registeredDevices)
        }
    },
    watch: {
        async callEnabled () {
            try {
                const registeredDevices = await this.getRegisteredDevicesData()
                this.manageDevicesData(registeredDevices)
            } catch (err) {
                this.registeredDevicesError = true
                showGlobalError(err.message)
            }
        },
        downloadVoiceMailState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.downloadVoiceMailError)
            }
        }
    },
    mounted () {
        this.loadDatas()
    },
    methods: {
        ...mapWaitingActions('dashboard', {
            getCallsData: 'getCallsData',
            getVoicemailsData: 'getVoicemailsData',
            getRegisteredDevicesData: 'getRegisteredDevicesData'
        }),
        async loadDatas () {
            const values = await Promise.allSettled([
                this.getCallsData(),
                this.getVoicemailsData(),
                this.getRegisteredDevicesData()
            ])
            this.manageCallsData(values[0])
            this.manageVoicemailsData(values[1])
            this.manageDevicesData(values[2])
        },
        manageCallsData (calls) {
            if (calls.status === 'rejected') {
                this.callsError = true
                showGlobalError(calls?.reason?.data?.message)
            } else {
                this.callsCount = calls.value.totalCount
                this.callItems = calls.value.items.slice(0, 5).map((item) => {
                    return {
                        id: item.id,
                        icon: { name: callIcon(item), color: callIconColor(item) },
                        clickable_icon: false,
                        title: this.checkTitleToShow(item),
                        sub_title: date.formatDate(item.start_time, INTERNAL_DATE_FORMAT_DASH_HOUR),
                        extra_text: item.duration.split('.')[0],
                        call: item
                    }
                })
            }
        },
        manageVoicemailsData (voicemails) {
            if (voicemails.status === 'rejected') {
                this.voicemailsError = true
                showGlobalError(voicemails?.reason?.data?.message)
            } else {
                this.voicemailsCount = voicemails.value.totalCount
                this.voicemailItems = voicemails.value.items.map((item) => {
                    return {
                        id: item.id,
                        icon: { name: 'download', color: 'primary' },
                        clickable_icon: true,
                        title: item.caller_phonebook_name || item.caller,
                        sub_title: date.formatDate(item.start_time, INTERNAL_DATE_FORMAT_DASH_HOUR),
                        extra_text: new Date(item.duration * 1000).toISOString().substr(11, 8)
                    }
                })
            }
        },
        manageDevicesData (devices) {
            if (devices?.status === 'rejected') {
                this.registeredDevicesError = true
                showGlobalError(devices?.reason?.data?.message)
            } else {
                const registeredDevices = devices?.value || devices
                this.registeredDevicesCount = registeredDevices.totalCount
                this.registeredDevicesItems = registeredDevices.items.map((item) => {
                    return {
                        id: item.id,
                        icon: { name: 'devices', color: 'primary' },
                        clickable_icon: false,
                        title: item.user_agent,
                        sub_title: date.formatDate(item.expires, INTERNAL_DATE_FORMAT_DASH_HOUR),
                        extra_text: ''
                    }
                })
            }
        },
        checkTitleToShow (call) {
            if (call.call_type === 'cfu' || call.call_type === 'cfna' ||
                call.call_type === 'cfb' || call.call_type === 'cft') {
                return `vmu${call.caller}`
            } else if (call.direction === 'out') {
                return call.callee_phonebook_name || call.callee
            } else if (call.direction === 'in') {
                return call.caller_phonebook_name || call.caller
            }
            return call.caller
        },
        downloadVoicemail (id) {
            this.$store.dispatch('conversations/downloadVoiceMail', id)
        }
    }
}
</script>
