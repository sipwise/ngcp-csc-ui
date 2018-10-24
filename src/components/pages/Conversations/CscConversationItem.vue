<template>
    <csc-call-item
        v-if="item.type == 'call'"
        :call="item"
        :call-available="callAvailable"
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
