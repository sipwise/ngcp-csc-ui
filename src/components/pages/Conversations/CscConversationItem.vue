<template>
    <csc-call-item
        v-if="item.type == 'call'"
        :call="item"
        :call-available="callAvailable"
        :blocked-incoming="blockedIncoming"
        :blocked-outgoing="blockedOutgoing"
        @start-call="startCall"
    />
    <csc-fax-item
        v-else-if="item.type == 'fax'"
        :fax="item"
        :call-available="callAvailable"
        @download-fax="downloadFax"
        @start-call="startCall"
    />
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
                console.log('number is', this.number + '');
                console.log('blockedNumbersIncoming', this.blockedNumbersIncoming);
                return this.callerIsBlockedIncoming(this.number + '');
            },
            blockedOutgoing() {
                console.log('number is', this.number + '');
                console.log('blockedNumbersOutgoing', this.blockedNumbersOutgoing);
                return this.callerIsBlockedOutgoing(this.number + '');
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
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
