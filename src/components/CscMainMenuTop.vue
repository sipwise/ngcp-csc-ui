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
            'isRtcEngineUiVisible',
            'isPbxEnabled',
            'hasFaxCapability',
            'hasSubscriberProfileAttribute'
        ]),
        items () {
            return [
                {
                    to: '/user/home',
                    icon: 'call',
                    label: this.callStateTitle,
                    sublabel: this.callStateSubtitle,
                    visible: this.isRtcEngineUiVisible
                },
                {
                    to: '/conference',
                    icon: 'videocam',
                    label: this.$t('Join conference'),
                    visible: this.isRtcEngineUiVisible
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
                            visible: true
                        },
                        {
                            to: '/user/voicebox',
                            icon: 'voicemail',
                            label: this.$t('Voicebox'),
                            visible: true
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
                            visible: true
                        },
                        {
                            to: '/user/call-blocking/outgoing',
                            icon: 'call_made',
                            label: this.$t('Block outgoing'),
                            visible: true
                        },
                        {
                            to: '/user/call-blocking/privacy',
                            icon: 'fas fa-user-secret',
                            label: this.$t('Privacy'),
                            visible: true
                        },
                        {
                            to: '/user/speeddial',
                            icon: 'touch_app',
                            label: this.$t('Speed Dial'),
                            visible: true
                        },
                        {
                            to: '/user/reminder',
                            icon: 'notification_important',
                            label: this.$t('Reminder'),
                            visible: this.hasSubscriberProfileAttribute('reminder')
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
                    visible: this.hasFaxCapability
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
                    to: '/user/pbx-settings',
                    icon: 'settings',
                    label: this.$t('PBX Settings'),
                    visible: this.isPbxEnabled
                },
                {
                    to: '/user/registered-devices',
                    icon: 'devices',
                    label: this.$t('Registered Devices'),
                    visible: true
                }
            ]
        }
    }
}
</script>
