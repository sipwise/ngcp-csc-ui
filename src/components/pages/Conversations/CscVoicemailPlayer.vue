<template>
    <div class="voicemail-player">
        <audio :src="soundFileUrl" ref="voiceMailSound" preload="none" />
        <div class="control-btns">
            <q-btn class="play-pause-btn" round flat small color="primary"
                   :icon="playPauseIcon" @click="toggle()" />

            <q-btn class="stop-btn" round flat small color="primary" icon="stop" />
        </div>
        <q-progress class="progress-bar" :indeterminate="isLoading" stripe animate color="primary"/>
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
            });
            this.$refs.voiceMailSound.addEventListener('canplay', ()=>{
                this.$refs.voiceMailSound.play();
            });
        },
        components: {
            QProgress,
            QBtn
        },
        data () {
            return {
                progress: 77,
                platform: this.$q.platform.is,
                voicemail: null,
                playing: false
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
                //console.log(getter(this.id));
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
            },
            pause() {
                this.$refs.voiceMailSound.pause();
                this.playing = false;
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
