<template>
    <csc-call-item
        v-if="item.type == 'call'"
        :call="item"
        @init-call="initCall"
    />
    <csc-fax-item
        v-else-if="item.type == 'fax'"
        :fax="item"
        @init-call="initCall"
        @download-fax="downloadFax"
    />
    <csc-voice-mail-item
        v-else-if="item.type == 'voicemail'"
        :voice-mail="item"
        @init-call="initCall"
        @download-voice-mail="downloadVoiceMail"
        @play-voice-mail="playVoiceMail"
    />
</template>

<script>
    import CscCallItem from './CscCallItem'
    import CscFaxItem from './CscFaxItem'
    import CscVoiceMailItem from './CscVoiceMailItem'
    export default {
        name: 'csc-conversation-item',
        props: [
            'item'
        ],
        components: {
            CscCallItem,
            CscFaxItem,
            CscVoiceMailItem
        },
        mounted() {},
        data () {
            return {}
        },
        methods: {
            initCall(call) {
                this.$emit('init-call', call);
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
