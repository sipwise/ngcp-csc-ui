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
            :error="voicemailsError"
        />
        <csc-card-dashboard
            :title="$t('Call List')"
            :count="callsCount"
            :count-title="$t('Recent Calls')"
            :button-title="$t('View Call List')"
            :items-list="callItems"
            :route-to="{ name: 'CscConversations', params: { initialTab: 'call' } }"
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
            this.checkResponses('calls', values[0])
            this.checkResponses('voicemails', values[1])
            this.checkResponses('registered-devices', values[2])
        },
        checkResponses (type, response) {
            if (type === 'calls') {
                if (response.status === 'rejected') {
                    this.callsError = true
                    showGlobalError(response?.reason?.data?.message)
                } else {
                    this.callsCount = response.value.totalCount
                    this.callItems = response.value.items
                }
            } else if (type === 'voicemails') {
                if (response.status === 'rejected') {
                    this.voicemailsError = true
                    showGlobalError(response?.reason?.data?.message)
                } else {
                    this.voicemailsCount = response.value.totalCount
                    this.voicemailItems = response.value.items
                }
            } else if (type === 'registered-devices') {
                if (response.status === 'rejected') {
                    this.registeredDevicesError = true
                    showGlobalError(response?.reason?.data?.message)
                } else {
                    this.registeredDevicesCount = response.value.totalCount
                    this.registeredDevicesItems = response.value.items
                }
            }
        }
    }
}
</script>
