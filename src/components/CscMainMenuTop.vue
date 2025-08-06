<template>
    <csc-main-menu
        :items="items"
    />
</template>

<script>
import { mapGetters } from 'vuex'
import CscMainMenu from 'components/CscMainMenu'
import { LICENSES, PROFILE_ATTRIBUTE_MAP, PROFILE_ATTRIBUTES_MAP } from 'src/constants'

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
            'isFaxFeatureEnabled',
            'getCustomerId',
            'hasSubscriberProfileAttribute',
            'hasSomeSubscriberProfileAttributes',
            'hasLicenses',
            'isPbxEnabled',
            'isSpCe'
        ]),
        items () {
            const hasCallSettingsSubmenus = this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callSettings) ||
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.voiceMail) ||
                this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callForwarding) ||
                this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callBlockingIncoming) ||
                this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callBlockingOutgoing) ||
                this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callBlockingPrivacy) ||
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.speedDial) ||
                (
                    this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.recordings) &&
                    (this.isSpCe || this.hasLicenses([LICENSES.call_recording]))
                )

            const hasCustomerPreferenceSubmenus = this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.blockInClir) ||
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.blockInList) ||
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.blockOutList) ||
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.blockInMode) ||
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.blockOutMode) ||
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.blockOutOverridePin) ||
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.huntGroups) ||
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.playAnnounceBeforeCallSetup) ||
                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.playAnnounceToCallee)
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
                    visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.cscCalls) &&
                        (this.isSpCe || this.hasLicenses([LICENSES.csc_calls]))
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
                    visible: this.hasLicenses([LICENSES.phonebook])
                },
                {
                    icon: 'settings_phone',
                    label: this.$t('Call Settings'),
                    visible: hasCallSettingsSubmenus,
                    children: [
                        {
                            to: '/user/call-settings',
                            icon: 'settings',
                            label: this.$t('General'),
                            visible: this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callSettings)
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
                            visible: this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callForwarding)
                        },
                        {
                            to: '/user/call-blocking/incoming',
                            icon: 'call_received',
                            label: this.$t('Block Incoming'),
                            visible: this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callBlockingIncoming)
                        },
                        {
                            to: '/user/call-blocking/outgoing',
                            icon: 'call_made',
                            label: this.$t('Block Outgoing'),
                            visible: this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callBlockingOutgoing)
                        },
                        {
                            to: '/user/call-blocking/privacy',
                            icon: 'fas fa-user-secret',
                            label: this.$t('Privacy'),
                            visible: this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.callBlockingPrivacy)
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
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.recordings) &&
                                (this.isSpCe || this.hasLicenses([LICENSES.call_recording]))
                        }
                    ]
                },
                {
                    to: '/user/fax-settings',
                    icon: 'fas fa-fax',
                    label: this.$t('Fax Settings'),
                    visible: this.isFaxFeatureEnabled

                },
                {
                    icon: 'fas fa-chart-line',
                    label: this.$t('PBX Statistics'),
                    visible: this.isPbxAdmin,
                    opened: this.isPbxConfiguration,
                    children: [
                        {
                            to: '/user/pbx-statistics/cdr',
                            icon: 'fas fa-table',
                            label: this.$t('Cdr'),
                            visible: this.isPbxAdmin
                        }
                    ]
                },
                {
                    icon: 'miscellaneous_services',
                    label: this.$t('PBX Configuration'),
                    visible: this.isPbxAdmin,
                    opened: this.isPbxConfiguration,
                    children: [
                        {
                            to: '/user/pbx-configuration/seats',
                            icon: 'person',
                            label: this.$t('Seats'),
                            visible: this.isPbxAdmin
                        },
                        {
                            to: '/user/pbx-configuration/groups',
                            icon: 'group',
                            label: this.$t('Groups'),
                            visible: this.isPbxAdmin && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.huntGroups)
                        },
                        {
                            to: '/user/pbx-configuration/devices',
                            icon: 'fas fa-fax',
                            label: this.$t('Devices'),
                            visible: this.isPbxAdmin &&
                                this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.deviceProvisioning) &&
                                this.hasLicenses([LICENSES.device_provisioning])
                        },
                        {
                            to: '/user/pbx-configuration/call-queues',
                            icon: 'filter_none',
                            label: this.$t('Call Queues'),
                            visible: this.isPbxAdmin && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.cloudPbxCallQueue)
                        },
                        {
                            to: '/user/pbx-configuration/sound-sets',
                            icon: 'queue_music',
                            label: this.$t('Sound Sets'),
                            visible: this.isPbxAdmin && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.soundSet)
                        },
                        {
                            to: '/user/pbx-configuration/ms-configs',
                            icon: 'arrow_forward',
                            label: this.$t('Manager Secretary'),
                            visible: this.isPbxAdmin && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.managerSecretary)
                        },
                        {
                            to: '/user/pbx-configuration/auto-attendant',
                            icon: 'dialpad',
                            label: this.$t('Auto Attendant'),
                            visible: this.isPbxAdmin && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.autoAttendant)
                        },
                        {
                            to: '/user/pbx-configuration/customer-phonebook',
                            icon: 'person',
                            label: this.$t('Customer Phonebook'),
                            visible: this.isPbxAdmin && this.hasLicenses([LICENSES.phonebook])
                        },
                        {
                            to: '/user/pbx-configuration/customer-preferences',
                            icon: 'fas fa-user-cog',
                            label: this.$t('Customer Preferences'),
                            visible: this.isPbxAdmin && this.hasLicenses([LICENSES.phonebook]) && hasCustomerPreferenceSubmenus
                        }
                    ]
                },
                {
                    icon: 'settings',
                    label: this.$t('Extension Settings'),
                    visible: this.isPbxEnabled &&
                        this.hasSomeSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.pbxSettings),
                    children: [
                        {
                            to: '/user/extension-settings/call-queues',
                            icon: 'filter_none',
                            label: this.$t('Call Queues'),
                            visible: this.isPbxEnabled && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.cloudPbxCallQueue)
                        },
                        {
                            to: '/user/extension-settings/ms-configs',
                            icon: 'arrow_forward',
                            label: this.$t('Manager Secretary'),
                            visible: this.isPbxEnabled && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTES_MAP.manager_secretary)
                        },
                        {
                            to: '/user/extension-settings/auto-attendant',
                            icon: 'dialpad',
                            label: this.$t('Auto Attendant'),
                            visible: this.isPbxEnabled && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTES_MAP.autoAttendant)
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
                    to: '/customer/' + this.getCustomerId + '/details',
                    icon: 'far fa-address-card',
                    label: this.$t('Customer Details'),
                    visible: this.isOldCSCProxyingAllowed
                }
            ]
        }
    }
}
</script>
