<template>
    <csc-page
        id="csc-page-dashboard"
        class="row justify-center"
    >
        <csc-card-dashboard
            :title="$t('Voicebox Messages')"
            :count="voicemailsCount"
            :count-title="$t('New Messages')"
            :button-title="$t('View Voicebox Messages')"
            :items-list="voicemailItems"
            :route-to="{ name: 'CscConversations', params: { initialTab: 'voicemail' } }"
            :loading="$wait.is('getVoicemailsData')"
            :no-items-message="$t('No new messages')"
            :error="voicemailsError"
            @action="downloadVoicemail"
        />
        <csc-card-dashboard
            :title="$t('Call List')"
            :count="callsCount"
            :count-title="$t('Recent Calls')"
            :button-title="$t('View Call List')"
            :items-list="callItems"
            :route-to="{ name: 'CscConversations', params: { initialTab: 'call' } }"
            :no-items-message="$t('No calls yet')"
            :loading="$wait.is('getCallsData')"
            :error="callsError"
        />
        <csc-card-dashboard
            :title="$t('Registered Devices')"
            :count="registeredDevicesCount"
            :count-title="$t('Registered Devices')"
            :button-title="$t('View All Registered Devices')"
            :items-list="registeredDevicesItems"
            :route-to="{ name: 'RegisteredDevices', params: { initialTab: 'null' } }"
            :no-items-message="$t('No devices registered')"
            :loading="$wait.is('getRegisteredDevicesData')"
            :error="registeredDevicesError"
        />
    </csc-page>
</template>

<script>
import CscCardDashboard from 'components/pages/Dashboard/CscCardDashboard'
import CscPage from 'components/CscPage'
import { mapWaitingActions } from 'vue-wait'
import {
    showGlobalError
} from 'src/helpers/ui'
import {
    date
} from 'quasar'
import { INTERNAL_DATE_FORMAT_DASH_HOUR } from 'src/constants'
import {
    callIconColor,
    callIcon
} from 'src/helpers/call-utils'
import { mapState } from 'vuex'
export default {
    name: 'CscPageDashboard',
    components: {
        CscCardDashboard,
        CscPage
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
        ])
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
                this.callItems = calls.value.items.map((item) => {
                    return {
                        id: item.id,
                        icon: { name: callIcon(item), color: callIconColor(item) },
                        clickable_icon: false,
                        title: this.checkTitleToShow(item),
                        sub_title: date.formatDate(item.start_time, INTERNAL_DATE_FORMAT_DASH_HOUR),
                        extra_text: item.duration.split('.')[0]
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
                        title: item.caller,
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
                return 'vmu' + call.caller
            } else if (call.direction === 'out') {
                return call.callee
            } else if (call.direction === 'in') {
                return call.caller
            } else {
                return call.caller
            }
        },
        downloadVoicemail (id) {
            this.$store.dispatch('conversations/downloadVoiceMail', id)
        }
    }
}
</script>