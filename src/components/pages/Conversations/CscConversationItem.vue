<template>
    <csc-call-item
        v-if="item.type == 'call'"
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
        v-else-if="item.type == 'fax'"
        :fax="item"
        :call-available="callAvailable"
        @download-fax="downloadFax"
        @start-call="startCall"
    />
    <!--TODO: Replicate blocked menu also for voicemails-->
    <csc-voice-mail-item
        v-else-if="item.type == 'voicemail'"
        :voice-mail="item"
        :call-available="callAvailable"
        @download-voice-mail="downloadVoiceMail"
        @play-voice-mail="playVoiceMail"
        @start-call="startCall"
    />
</template>

<script>
    import {
        mapGetters
    } from 'vuex'
    import CscCallItem from './CscCallItem'
    import CscFaxItem from './CscFaxItem'
    import CscVoiceMailItem from './CscVoiceMailItem'
    export default {
        name: 'csc-conversation-item',
        props: [
            'item',
            'callAvailable'
        ],
        components: {
            CscCallItem,
            CscFaxItem,
            CscVoiceMailItem
        },
        data () {
            return {}
        },
        computed: {
            // TODO: Move these getters to parent, and pass as props - provided
            // you find an elegant solution using methods on item of
            // conversations.items
            ...mapGetters('conversations', [
                'callerIsBlockedIncoming',
                'callerIsBlockedOutgoing',
                'blockedNumbersIncoming',
                'blockedNumbersOutgoing'
            ]),
            number() {
                if(this.item.direction === 'out') {
                    return this.item.callee;
                }
                else {
                    return this.item.caller;
                }
            },
            blockedIncoming() {
                return this.callerIsBlockedIncoming(this.number + '');
            },
            blockedOutgoing() {
                return this.callerIsBlockedOutgoing(this.number + '');
            },
            blockIncomingLabel() {
                if (this.blockedIncoming) {
                    return this.$t('pages.conversations.buttons.unblockIncoming');
                }
                else {
                    return this.$t('pages.conversations.buttons.blockIncoming');
                }
            },
            blockOutgoingLabel() {
                if (this.blockedOutgoing) {
                    return this.$t('pages.conversations.buttons.unblockOutgoing');
                }
                else {
                    return this.$t('pages.conversations.buttons.blockOutgoing');
                }
            },
            blockBothLabel() {
                if (this.blockedBoth) {
                    return this.$t('pages.conversations.buttons.unblockBoth');
                }
                else if (this.unblockedBoth) {
                    return this.$t('pages.conversations.buttons.blockBoth');
                }
            },
            blockedBoth() {
                return this.blockedIncoming && this.blockedOutgoing;
            },
            unblockedBoth() {
                return !this.blockedIncoming && !this.blockedOutgoing;
            }
        },
        methods: {
            startCall(number) {
                this.$emit('start-call', number);
            },
            downloadFax(fax) {
                this.$emit('download-fax', fax);
            },
            downloadVoiceMail(voiceMail) {
                this.$emit('download-voice-mail', voiceMail);
            },
            playVoiceMail(voiceMail) {
                this.$emit('play-voice-mail', voiceMail);
            },
            toggleBlockIncoming() {
                this.$emit('toggle-block-incoming', this.number);
            },
            toggleBlockOutgoing() {
                this.$emit('toggle-block-outgoing', this.number);
            },
            toggleBlockBoth() {
                this.$emit('toggle-block-both', this.number);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
