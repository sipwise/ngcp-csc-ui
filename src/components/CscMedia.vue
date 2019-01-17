<template>
    <div
        class="csc-media"
    >
        <div
            v-show="loading"
            class="csc-media-spinner"
        >
            <q-spinner-dots
                color="primary"
                :size="24"
            />
        </div>
        <video
            ref="media"
            autoplay
            playsinline
            :class="videoClasses"
            :muted="muted"
        />
    </div>
</template>

<script>
    import _ from 'lodash';
    import {
        QSpinnerDots,
        QIcon
    } from 'quasar-framework'
    export default {
        name: 'csc-media',
        props: [
            'stream',
            'muted',
            'fit'
        ],
        data () {
            return {
                currentStream: this.stream,
                loading: true,
            }
        },

        components: {
            QSpinnerDots,
            QIcon
        },
        methods: {
            assignStream(stream) {
                this.currentStream = stream;
                if(_.isObject(this.currentStream) && _.isObject(this.$refs.media) &&
                    !_.isUndefined(this.$refs.media.srcObject)) {
                    this.$refs.media.srcObject = this.currentStream;
                }
                else if(_.isObject(this.currentStream) && _.isObject(this.$refs.media) &&
                    !_.isUndefined(this.$refs.media.mozSrcObject)) {
                    this.$refs.media.mozSrcObject = this.currentStream;
                }
                else if(_.isObject(this.currentStream) && _.isObject(this.$refs.media) &&
                    _.isObject(URL) && _.isFunction(URL.createObjectURL)) {
                    this.$refs.media.src = URL.createObjectURL(this.currentStream);
                }
                let timer = setInterval(()=>{
                    if(this.currentStream !== null || this.$refs.media.currentTime > 0) {
                        this.loading = false;
                        clearInterval(timer);
                    }
                }, 100);
            }
        },
        watch: {
            stream(stream) {
                if(stream !== null && stream !== this.currentStream) {
                    this.loading = true;
                    this.assignStream(stream);
                }
                else {
                    this.currentStream = null;
                    if(this.$refs.media.srcObject) {
                        this.$refs.media.srcObject = null;
                    }
                    else if(this.$refs.media.mozSrcObject) {
                        this.$refs.media.mozSrcObject = null;
                    }
                    else {
                        this.$refs.media.src = null;
                    }
                }
            },
            muted(muted) {
                this.$refs.media.muted = muted;
            }
        },
        computed: {
            hasVideo() {
                return this.currentStream !== null && _.isArray(this.currentStream.getVideoTracks()) &&
                    this.currentStream.getVideoTracks().length > 0;
            },
            videoClasses() {
                let classes = [];
                if(this.fit === 'full') {
                    classes.push('fit-full');
                }
                else if(this.fit === 'width') {
                    classes.push('fit-width');
                }
                return classes;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables'
    .csc-media
        position relative
        height 100%
        width 100%
        .csc-media-spinner
            position absolute
            top 50%
            left 50%
            margin-top -12px
            margin-left -12px
        video.fit-full
            position: absolute;
            top: 0;
            left: 0;
            min-width: 100%;
            min-height: 100%;
            width: auto;
            height: auto;
            background-size: cover;
        video.fit-width
            position: relative;
            width: 100%;
            height: auto;
            font-size 0
</style>
