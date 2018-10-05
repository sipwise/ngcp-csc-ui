<template>
    <div class="voicemail-player">
        <audio :src="fileUrl" ref="audio" preload="auto" @timeupdate="timeupdate($event)"/>
        <div class="control-btns">
            <q-btn class="play-pause-btn" round flat small color="primary"
                   :icon="playPauseIcon" @click="toggle()" />

            <q-btn class="stop-btn" round flat small color="primary" icon="stop" @click="stop()"/>
        </div>
        <q-progress class="progress-bar" :percentage="progressPercentage" stripe animate color="primary"/>
    </div>
</template>

<script>
    import { QProgress, QBtn } from 'quasar-framework'

    export default {
        name: 'csc-audio-player',
        props: [
           'fileUrl',
           'loaded'
        ],
        mounted() {
            this.$refs.audio.addEventListener('play', ()=>{
                this.playing = true;
            });
            this.$refs.audio.addEventListener('playing', ()=>{
                this.playing = true;
            });
            this.$refs.audio.addEventListener('ended', ()=>{
                this.playing = false;
                this.stop();
            });
            this.$refs.audio.addEventListener('canplay', ()=>{
                if(!this.paused && this.playing) {
                    this.$refs.audio.play();
                }
            });
        },
        components: {
            QProgress,
            QBtn
        },
        data () {
            return {
                playing: false,
                paused: false,
                progressPercentage: 0
            }
        },
        computed: {
            playPauseIcon() {
                return this.playing ? 'pause': 'play_arrow';
            }
        },
        methods: {
            play() {
                this.$refs.audio.play();
                this.playing = true;
                this.paused = false;
            },
            pause() {
                this.$refs.audio.pause();
                this.playing = false;
                this.paused = true;
            },
            stop() {
                this.$refs.audio.currentTime = 0;
                this.pause();
            },
            setPlayingTrue() {
                this.playing = true;
            },
            setPausedFalse() {
                this.paused = false;
            },
            timeupdate(e) {
                let newPercentage = Math.floor((e.target.currentTime / e.target.duration) * 100);
                this.progressPercentage = newPercentage;
            },
            load() {
                this.$emit('load');
            },
            toggle() {
                if (!this.loaded) {
                    this.load();
                }
                else if (this.$refs.audio.paused) {
                    this.play();
                }
                else {
                    this.pause();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/app.common'

    .voicemail-player
        width 100%
        height 56px
        display flex
        justify-content space-around
        align-items center
        border-radius 4px
        background-color #fff
        .control-btns
            display flex
            justify-content space-between
        .progress-bar
            margin-left 16px
            margin-right 16px

</style>
