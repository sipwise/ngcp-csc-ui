<template>
    <csc-call-item
        v-if="item.type === 'call'"
        :call="item"
        :call-available="callAvailable"
        :block-incoming-label="blockIncomingLabel"
        :block-outgoing-label="blockOutgoingLabel"
        :block-both-label="blockBothLabel"
        :block-both-possible="unblockedBoth || blockedBoth"
        @start-call="startCall"
        @toggle-block-incoming="toggleBlockIncoming"
        @toggle-block-outgoing="toggleBlockOutgoing"
        @toggle-block-both="toggleBlockBoth"
    />
    <csc-fax-item
        v-else-if="item.type === 'fax'"
        :fax="item"
        :call-available="callAvailable"
        @download-fax="downloadFax"
        @start-call="startCall"
        @delete-fax="$emit('delete-fax', $event)"
    />
    <csc-voice-mail-item
        v-else-if="item.type === 'voicemail'"
        :voice-mail="item"
        :call-available="callAvailable"
        :block-incoming-label="blockIncomingLabel"
        :block-outgoing-label="blockOutgoingLabel"
        :block-both-label="blockBothLabel"
        :block-both-possible="unblockedBoth || blockedBoth"
        @download-voice-mail="downloadVoiceMail"
        @play-voice-mail="playVoiceMail"
        @start-call="startCall"
        @toggle-block-incoming="toggleBlockIncoming"
        @toggle-block-outgoing="toggleBlockOutgoing"
        @toggle-block-both="toggleBlockBoth"
        @delete-voicemail="$emit('delete-voicemail', $event)"
    />
</template>

<script>
import CscCallItem from './CscCallItem'
import CscFaxItem from './CscFaxItem'
import CscVoiceMailItem from './CscVoiceMailItem'
export default {
    name: 'CscConversationItem',
    components: {
        CscCallItem,
        CscFaxItem,
        CscVoiceMailItem
    },
    props: {
        item: {
            type: Object,
            default: null
        },
        callAvailable: {
            type: Boolean,
            default: false
        },
        blockedIncoming: {
            type: Boolean,
            default: false
        },
        blockedOutgoing: {
            type: Boolean,
            default: false
        }
    },
    emits: [
        'download-fax',
        'delete-voicemail',
        'toggle-block-both',
        'toggle-block-outgoing',
        'toggle-block-incoming',
        'start-call',
        'download-voice-mail',
        'play-voice-mail',
        'delete-fax'
    ],
    data () {
        return {}
    },
    computed: {
        number () {
            if (this.item.direction === 'out') {
                return this.item.callee
            } else {
                return this.item.caller
            }
        },
        toggleActionIncoming () {
            return this.blockedIncoming ? 'unblock' : 'block'
        },
        toggleActionOutgoing () {
            return this.blockedOutgoing ? 'unblock' : 'block'
        },
        blockIncomingLabel () {
            if (this.blockedIncoming) {
                return this.$t('Unblock Incoming')
            } else {
                return this.$t('Block Incoming')
            }
        },
        blockOutgoingLabel () {
            if (this.blockedOutgoing) {
                return this.$t('Unblock Outgoing')
            } else {
                return this.$t('Block Outgoing')
            }
        },
        blockBothLabel () {
            if (this.blockedBoth) {
                return this.$t('Unblock Incoming/Outgoing')
            } else if (this.unblockedBoth) {
                return this.$t('Block Incoming/Outgoing')
            } else {
                return ''
            }
        },
        blockedBoth () {
            return this.blockedIncoming && this.blockedOutgoing
        },
        unblockedBoth () {
            return !this.blockedIncoming && !this.blockedOutgoing
        }
    },
    methods: {
        startCall (number) {
            this.$emit('start-call', number)
        },
        downloadFax (fax) {
            this.$emit('download-fax', fax)
        },
        downloadVoiceMail (voiceMail) {
            this.$emit('download-voice-mail', voiceMail)
        },
        playVoiceMail (voiceMail) {
            this.$emit('play-voice-mail', voiceMail)
        },
        toggleBlockIncoming () {
            this.$emit('toggle-block-incoming', {
                number: this.number,
                type: this.toggleActionIncoming
            })
        },
        toggleBlockOutgoing () {
            this.$emit('toggle-block-outgoing', {
                number: this.number,
                type: this.toggleActionOutgoing
            })
        },
        toggleBlockBoth () {
            this.$emit('toggle-block-both', {
                number: this.number,
                type: this.toggleActionIncoming
            })
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
</style>
