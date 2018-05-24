<template>
    <div class="voicemail-player">
        <audio :src="voicemail" ref="voicemailsound" />
        <div class="control-btns">
            <q-btn
                class="play-pause-btn"
                round
                flat
                small
                color="primary"
                :icon="playPauseIcon"
                @click="toggleVoicemailPlay()"
            />
            <q-btn
                class="stop-btn"
                round
                flat
                small
                color="primary"
                icon="stop"
            />
        </div>
        <q-progress
            class="progress-bar"
            :percentage="progress"
            stripe
            animate
            color="primary"
        />
    </div>
</template>

<script>
    import { QProgress, QBtn } from 'quasar-framework'
    export default {
        name: 'csc-voicemail-player',
        props: {
            id: Number
        },
        components: {
            QProgress,
            QBtn
        },
        data () {
            return {
                progress: 77,
                isPlaying: false,
                platform: this.$q.platform.is,
                voicemail: null
            }
        },
        computed: {
            playPauseIcon() {
                return this.isPlaying ? 'pause': 'play_arrow';
            }
        },
        methods: {
            playVoicemail() {
                let format = this.platform.mozilla ? 'ogg' : 'mp3';
                this.$store.dispatch('conversations/playVoiceMail', {
                    id: this.id,
                    format: format
                }).then((url) => {
                    this.voicemail = url;
                });
                // NOTE: Does currently only work if rtcengine is disabled in
                // ngcp-panel "Settings > Resellers", due to conflict with
                // ringing audio in call component - cdk-prod.js throws
                // "interrupted by a new load request error: https://goo.gl/LdLk22
                this.$refs.voicemailsound.currentTime = 0;
                this.$refs.voicemailsound.play();
            },
            pauseVoicemail() {
                this.$refs.voicemailsound.pause();
            },
            toggleVoicemailPlay() {
                if (this.isPlaying) {
                    this.pauseVoicemail();
                }
                else {
                    this.playVoicemail();
                }
                this.isPlaying = !this.isPlaying;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common'

    .voicemail-player
        width 100%
        height 56px
        display flex
        justify-content space-around
        align-items center
        padding-left 16px
        padding-right 16px
        border-radius 4px
        background-color #fff
        .control-btns
            display flex
            justify-content space-between
        .progress-bar
            margin-left 16px
            margin-right 16px

</style>
