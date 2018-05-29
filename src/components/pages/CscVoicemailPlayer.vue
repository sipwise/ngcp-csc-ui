<template>
</template>

<script>
    export default {
        name: 'csc-voicemail-player',
        props: {
        },
        components: {
        },
        methods: {
            playVoicemail() {
                let voicemailAudio = this.$refs.voicemail;
                voicemailAudio.currentTime = 0;
                voicemailAudio.play();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/app.common'
</style>
