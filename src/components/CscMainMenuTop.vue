<template>
    <csc-main-menu
        :items="items"
    />
</template>

<script>
import CscMainMenu from 'components/CscMainMenu'
import { LICENSES, PROFILE_ATTRIBUTES_MAP, PROFILE_ATTRIBUTE_MAP } from 'src/constants'
import { mapGetters } from 'vuex'

export default {
    name: 'CscMainMenuTop',
    components: {
        CscMainMenu
    },
    props: {
        callStateTitle: {
            type: String,
            default: ''
        },
        callStateSubtitle: {
            type: String,
            default: ''
        },
        isCallForward: {
            type: Boolean,
            default: false
        },
        isCallBlocking: {
            type: Boolean,
            default: false
        },
        isPbxAdmin: {
            type: Boolean,
            default: false
        },
        isPbxConfiguration: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {}
    },
    computed: {
        ...mapGetters('user', [
            'getCustomerId',
            'hasFaxCapability',
            'hasSubscriberProfileAttribute',
            'hasSubscriberProfileAttributes',
            'isLicenseActive',
            'isOldCSCProxyingAllowed',
            'isPbxEnabled',
            'isSpCe'
        ]),
        items () {
            return [
                {
                    to: '/user/dashboard',
                    icon: 'fas fa-tachometer-alt',
                    label: this.$t('Dashboard'),
                    visible: true
                },
                {
                    to: '/user/home',
                    icon: 'call',
                    label: this.callStateTitle,
                    sublabel: this.callStateSubtitle,
                    visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.cscCalls && (this.isSpCe || this.isLicenseActive(LICENSES.csc_calls)))
                },
                {
                    to: '/user/conversations',
                    icon: 'question_answer',
                    label: this.$t('Conversations'),
                    sublabel: this.$t('Calls, Faxes, VoiceMails'),
                    visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.conversations)
                },
                {
                    to: '/user/subscriber-phonebook',
                    icon: 'fas fa-user',
                    label: this.$t('Subscriber Phonebook'),
                    visible: this.isLicenseActive(LICENSES.phonebook)
                },
                {
                    icon: 'settings_phone',
                    label: this.$t('Call Settings'),
                    visible: true,
                    children: [
                        {
                            to: '/user/call-settings',
                            icon: 'settings',
                            label: this.$t('General'),
                            visible: this.hasSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callSettings)
                        },
                        {
                            to: '/user/voicebox',
                            icon: 'voicemail',
                            label: this.$t('Voicebox'),
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.voiceMail)
                        },
                        {
                            to: '/user/call-forwarding',
                            icon: 'phone_forwarded',
                            label: this.$t('Forwarding'),
                            visible: true
                        },
                        {
                            to: '/user/call-blocking/incoming',
                            icon: 'call_received',
                            label: this.$t('Block Incoming'),
                            visible: this.hasSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callBlockingIncoming)
                        },
                        {
                            to: '/user/call-blocking/outgoing',
                            icon: 'call_made',
                            label: this.$t('Block outgoing'),
                            visible: this.hasSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callBlockingOutgoing)
                        },
                        {
                            to: '/user/call-blocking/privacy',
                            icon: 'fas fa-user-secret',
                            label: this.$t('Privacy'),
                            visible: this.hasSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callBlockingPrivacy)
                        },
                        {
                            to: '/user/speeddial',
                            icon: 'touch_app',
                            label: this.$t('Speed Dial'),
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.speedDial)
                        },
                        {
                            to: '/user/reminder',
                            icon: 'notification_important',
                            label: this.$t('Reminder'),
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.reminder)
                        },
                        {
                            to: '/user/recordings',
                            icon: 'play_circle',
                            label: this.$t('Recordings'),
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.recordings) && (this.isSpCe || this.isLicenseActive(LICENSES.call_recording))
                        }
                    ]
                },
                {
                    to: '/user/fax-settings',
                    icon: 'fas fa-fax',
                    label: this.$t('Fax Settings'),
                    visible: this.hasFaxCapability &&
                        this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.faxServer) &&
                        this.isLicenseActive(LICENSES.fax)

                },
                {
                    icon: 'fas fa-chart-line',
                    label: this.$t('PBX Statistics'),
                    visible: this.isPbxAdmin && this.isLicenseActive(LICENSES.pbx),
                    opened: this.isPbxConfiguration,
                    children: [
                        {
                            to: '/user/pbx-statistics/cdr',
                            icon: 'fas fa-table',
                            label: this.$t('Cdr'),
                            visible: true
                        }
                    ]
                },
                {
                    icon: 'miscellaneous_services',
                    label: this.$t('PBX Configuration'),
                    visible: this.isPbxAdmin && this.isLicenseActive(LICENSES.pbx),
                    opened: this.isPbxConfiguration,
                    children: [
                        {
                            to: '/user/pbx-configuration/seats',
                            icon: 'person',
                            label: this.$t('Seats'),
                            visible: true
                        },
                        {
                            to: '/user/pbx-configuration/groups',
                            icon: 'group',
                            label: this.$t('Groups'),
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.huntGroups)
                        },
                        {
                            to: '/user/pbx-configuration/devices',
                            icon: 'fas fa-fax',
                            label: this.$t('Devices'),
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.deviceProvisioning) && this.isLicenseActive(LICENSES.device_provisioning)
                        },
                        {
                            to: '/user/pbx-configuration/call-queues',
                            icon: 'filter_none',
                            label: this.$t('Call Queues'),
                            visible: this.hasSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.pbxSettingsCallQueue)
                        },
                        {
                            to: '/user/pbx-configuration/sound-sets',
                            icon: 'queue_music',
                            label: this.$t('Sound Sets'),
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.soundSet)
                        },
                        {
                            to: '/user/pbx-configuration/ms-configs',
                            icon: 'arrow_forward',
                            label: this.$t('Manager Secretary'),
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.manager_secretary)
                        },
                        {
                            to: '/user/pbx-configuration/auto-attendant',
                            icon: 'dialpad',
                            label: this.$t('Auto Attendant'),
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.auto_attendant)
                        },
                        {
                            to: '/user/pbx-configuration/customer-phonebook',
                            icon: 'person',
                            label: this.$t('Customer Phonebook'),
                            visible: this.isLicenseActive(LICENSES.phonebook)
                        },
                        {
                            to: '/user/pbx-configuration/customer-preferences',
                            icon: 'fas fa-user-cog',
                            label: this.$t('Customer Preferences'),
                            visible: true
                        }
                    ]
                },
                {
                    icon: 'settings',
                    label: this.$t('Extension Settings'),
                    visible: this.isPbxEnabled &&
                        this.hasSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.pbxSettings) &&
                        this.isLicenseActive(LICENSES.pbx),
                    children: [
                        {
                            to: '/user/extension-settings/call-queues',
                            icon: 'filter_none',
                            label: this.$t('Call Queues'),
                            visible: this.isPbxEnabled && this.hasSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.pbxSettingsCallQueue)
                        },
                        {
                            to: '/user/extension-settings/ms-configs',
                            icon: 'arrow_forward',
                            label: this.$t('Manager Secretary'),
                            visible: this.isPbxEnabled && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.manager_secretary)
                        },
                        {
                            to: '/user/extension-settings/auto-attendant',
                            icon: 'dialpad',
                            label: this.$t('Auto Attendant'),
                            visible: this.isPbxEnabled && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.auto_attendant)
                        }
                    ]
                },
                {
                    to: '/user/registered-devices',
                    icon: 'devices',
                    label: this.$t('Registered Devices'),
                    visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.registeredDevices)
                },
                {
                    to: `/customer/${this.getCustomerId}/details`,
                    icon: 'far fa-address-card',
                    label: this.$t('Customer Details'),
                    visible: this.isOldCSCProxyingAllowed
                }
            ]
        }
    }
}
</script>
