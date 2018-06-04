<template>
    <div class="voicemail-player">
        <audio :src="soundFileUrl" ref="voiceMailSound" preload="none" @timeupdate="timeupdate($event)"/>
        <div class="control-btns">
            <q-btn class="play-pause-btn" round flat small color="primary"
                   :icon="playPauseIcon" @click="toggle()" />

            <q-btn class="stop-btn" round flat small color="primary" icon="stop" @click="stop()"/>
        </div>
        <q-progress class="progress-bar" :percentage="progressPercentage" stripe animate color="primary"/>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { QProgress, QBtn } from 'quasar-framework'

    export default {
        name: 'csc-voicemail-player',
        props: {
            id: Number
        },
        mounted() {
            this.$refs.voiceMailSound.addEventListener('play', ()=>{
                this.playing = true;
            });
            this.$refs.voiceMailSound.addEventListener('playing', ()=>{
                this.playing = true;
            });
            this.$refs.voiceMailSound.addEventListener('ended', ()=>{
                this.playing = false;
                this.stop();
            });
            this.$refs.voiceMailSound.addEventListener('canplay', ()=>{
                if(!this.paused) {
                    this.$refs.voiceMailSound.play();
                }
            });
        },
        components: {
            QProgress,
            QBtn
        },
        data () {
            return {
                platform: this.$q.platform.is,
                playing: false,
                paused: false,
                progressPercentage: 0
            }
        },
        computed: {
            playPauseIcon() {
                return this.playing ? 'pause': 'play_arrow';
            },
            soundFileFormat() {
                return this.platform.mozilla ? 'ogg' : 'mp3';
            },
            soundFileUrl() {
                let getter = this.playVoiceMailUrl;
                return getter(this.id);
            },
            isLoading() {
                let getter = this.playVoiceMailState;
                return getter(this.id) === 'requesting';
            },
            ...mapGetters('conversations', [
                'playVoiceMailState',
                'playVoiceMailUrl'
            ]),
        },
        methods: {
            play() {
                this.$refs.voiceMailSound.play();
                this.playing = true;
                this.paused = false;
            },
            pause() {
                this.$refs.voiceMailSound.pause();
                this.playing = false;
                this.paused = true;
            },
            stop() {
                this.$refs.voiceMailSound.currentTime = 0;                
                this.pause();
            },
            load() {
                this.$store.dispatch('conversations/playVoiceMail', {
                    id: this.id,
                    format: this.soundFileFormat
                });
            },
            toggle() {
                if(this.playVoiceMailState(this.id) !== 'succeeded') {
                    this.load();
                }
                else if (this.$refs.voiceMailSound.paused) {
                    this.play();
                }
                else {
                    this.pause();
                }
            },
            timeupdate(e) {
                let newPercentage = Math.floor((e.target.currentTime / e.target.duration) * 100);
                this.progressPercentage = newPercentage;
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
