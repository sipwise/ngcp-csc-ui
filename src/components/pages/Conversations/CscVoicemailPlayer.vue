<template>
    <div class="voicemail-player">
        <audio :src="voicemail" ref="voicemailsound" preload="none" />
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
    import _ from 'lodash'
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
                platform: this.$q.platform.is,
                voicemail: null
            }
        },
        computed: {
            playPauseIcon() {
                return this.isPlaying() ? 'pause': 'play_arrow';
            },
        },
        methods: {
            isPlaying() {
                let video = this.$refs.voicemailsound;
                return _.isObject(video) && video.currentTime > 0 &&
                    !video.paused && !video.ended && video.readyState > 2;
            },
            playVoicemail() {
                let format = this.platform.mozilla ? 'ogg' : 'mp3';

                this.$refs.voicemailsound.addEventListener('canplay', ()=>{
                    this.$refs.voicemailsound.play();
                });

                this.$store.dispatch('conversations/playVoiceMail', {
                    id: this.id,
                    format: format
                }).then((url) => {
                    this.voicemail = url;
                });
            },
            pauseVoicemail() {
                this.$refs.voicemailsound.pause();
            },
            toggleVoicemailPlay() {
                if (this.isPlaying()) {
                    this.pauseVoicemail();
                }
                else {
                    this.playVoicemail();
                }
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
