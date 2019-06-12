<template>
    <div class="audio-player">
        <audio
            :src="fileUrl"
            ref="audio"
            preload="auto"
            @timeupdate="timeUpdate"
        />
        <div class="control-btns">
            <q-btn
                v-if="pausable"
                :disable="disable"
                round
                flat
                small
                color="primary"
                :icon="playPauseIcon"
                @click="toggle()"
            />
            <q-btn
                v-else
                :disable="disable || playing"
                round
                flat
                small
                color="primary"
                icon="play_arrow"
                @click="playLoad()"
            />
            <q-btn
                :disable="disable || !pausable && !playing"
                round
                flat
                small
                color="primary"
                icon="stop"
                @click="stop()"
            />
        </div>
        <q-progress
            class="progress-bar"
            :percentage="progressPercentage"
            stripe
            animate
            color="primary"
        />
    </div>
</template>

<script>
    import {
        QProgress,
        QBtn
    } from 'quasar-framework'

    export default {
        name: 'csc-audio-player',
        props: [
            'fileUrl',
            'loaded',
            'disable',
            'pausable'
        ],
        mounted() {
            this.$refs.audio.addEventListener('play', ()=> {
                this.playing = true;
            });
            this.$refs.audio.addEventListener('playing', ()=> {
                this.playing = true;
            });
            this.$refs.audio.addEventListener('ended', ()=> {
                this.playing = false;
                this.stop();
            });
            this.$refs.audio.addEventListener('canplay', ()=> {
                if (!this.paused && this.playing) {
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
            },
            isLoaded() {
                return this.loaded || this.fileUrl;
            }
        },
        methods: {
            play() {
                let playPromise = this.$refs.audio.play();
                if(playPromise && playPromise.then) {
                    playPromise.then(()=>{
                        this.playing = true;
                        this.paused = false;
                        this.$emit('playing');
                    }).catch(()=>{
                        this.playing = true;
                        this.paused = false;
                        this.$emit('loading');
                    });
                }
                else {
                    this.playing = true;
                    this.paused = false;
                    this.$emit('playing');
                }
            },
            pause() {
                this.$refs.audio.pause();
                this.playing = false;
                this.paused = true;
            },
            stop() {
                this.$refs.audio.currentTime = 0;
                this.pause();
                this.$emit('stopped');
            },
            setPlayingTrue() {
                this.playing = true;
            },
            setPausedFalse() {
                this.paused = false;
            },
            timeUpdate() {
                this.progressPercentage = this.$refs.audio.currentTime * 100 / this.$refs.audio.duration;
            },
            load() {
                this.$emit('load');
            },
            toggle() {
                if (this.$refs.audio.paused) {
                    this.playLoad();
                }
                else {
                    this.pause();
                }
            },
            playLoad() {
                if (!this.isLoaded) {
                    this.load();
                }
                else if (this.$refs.audio.paused) {
                    this.play();
                }
            }
        },
        watch: {
            fileUrl() {
                if(this.fileUrl) {
                    this.play();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/app.common'

    .audio-player
        width 100%
        display flex
        justify-content space-around
        align-items center

        .control-btns
            display flex
            justify-content space-between

        .progress-bar
            margin-left 16px
            margin-right 16px

</style>
