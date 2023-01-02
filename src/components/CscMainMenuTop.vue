<template>
    <csc-main-menu
        :items="items"
    />
</template>

<script>
import {
    mapGetters
} from 'vuex'
import CscMainMenu from 'components/CscMainMenu'
import { PROFILE_ATTRIBUTE_MAP, PROFILE_ATTRIBUTES_MAP } from 'src/constants'

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
            'isPbxEnabled',
            'hasFaxCapability',
            'hasSubscriberProfileAttribute',
            'hasSubscriberProfileAttributes',
            'getCustomerId',
            'isOldCSCProxyingAllowed'
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
                    visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.cscCalls)
                },
                {
                    to: '/user/conversations',
                    icon: 'question_answer',
                    label: this.$t('Conversations'),
                    sublabel: this.$t('Calls, Faxes, VoiceMails'),
                    visible: true
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
                            label: this.$t('Block incoming'),
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
                            visible: this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.callBlockingPrivacy)
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
                            visible: true
                        }
                    ]
                },
                {
                    to: '/user/fax-settings',
                    icon: 'fas fa-fax',
                    label: this.$t('Fax Settings'),
                    visible: this.hasFaxCapability && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.faxServer)
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
                            visible: true
                        },
                        {
                            to: '/user/pbx-configuration/groups',
                            icon: 'group',
                            label: this.$t('Groups'),
                            visible: true
                        },
                        {
                            to: '/user/pbx-configuration/devices',
                            icon: 'fas fa-fax',
                            label: this.$t('Devices'),
                            visible: true
                        },
                        {
                            to: '/user/pbx-configuration/call-queues',
                            icon: 'filter_none',
                            label: this.$t('Call Queues'),
                            visible: true
                        },
                        {
                            to: '/user/pbx-configuration/sound-sets',
                            icon: 'queue_music',
                            label: this.$t('Sound Sets'),
                            visible: true
                        },
                        {
                            to: '/user/pbx-configuration/ms-configs',
                            icon: 'arrow_forward',
                            label: this.$t('Manager Secretary'),
                            visible: true
                        },
                        {
                            to: '/user/pbx-configuration/auto-attendant',
                            icon: 'dialpad',
                            label: this.$t('Auto-attendant'),
                            visible: true
                        }
                    ]
                },
                {
                    icon: 'settings',
                    label: this.$t('PBX Settings'),
                    visible: this.isPbxEnabled && this.hasSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.pbxSettings),
                    children: [
                        {
                            to: '/user/pbx-settings/general',
                            icon: 'settings',
                            label: this.$t('General'),
                            visible: this.isPbxEnabled && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.clir_intrapbx)
                        },
                        {
                            to: '/user/pbx-settings/call-queues',
                            icon: 'filter_none',
                            label: this.$t('Call Queues'),
                            visible: this.isPbxEnabled && this.hasSubscriberProfileAttributes(PROFILE_ATTRIBUTES_MAP.pbxSettingsCallQueue)
                        },
                        {
                            to: '/user/pbx-settings/ms-configs',
                            icon: 'arrow_forward',
                            label: this.$t('Manager Secretary'),
                            visible: this.isPbxEnabled && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.manager_secretary)
                        },
                        {
                            to: '/user/pbx-settings/auto-attendant',
                            icon: 'dialpad',
                            label: this.$t('Auto-attendant'),
                            visible: this.isPbxEnabled && this.hasSubscriberProfileAttribute(PROFILE_ATTRIBUTE_MAP.auto_attendant)
                        }
                    ]
                },
                {
                    to: '/user/registered-devices',
                    icon: 'devices',
                    label: this.$t('Registered Devices'),
                    visible: true
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
