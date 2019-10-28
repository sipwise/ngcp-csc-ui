<template>
    <div
        :class="componentClasses"
        :style="componentStyles"
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
            class="csc-media-video"
            autoplay
            playsinline
            :width="mediaWidth"
            :height="mediaHeight"
            :style="mediaStyles"
            :muted="muted"
            @click="fitMedia"
            @resize="fitMedia"
        ></video>
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
            'preview',
            'width'
        ],
        data () {
            return {
                currentStream: null,
                loading: true,
                mediaHeight: 0,
                mediaWidth: 0,
                mediaTop: 0,
                mediaLeft: 0
            }
        },
        mounted () {
            this.assignStream(this.stream);
            let fitMedia = ()=>{ this.fitMedia(); };
            this.$root.$on('window-resized', fitMedia);
            this.$root.$on('content-resized', fitMedia);
            this.$root.$on('orientation-changed', fitMedia);
        },
        components: {
            QSpinnerDots,
            QIcon
        },
        methods: {
            assignStream(stream) {
                if(stream !== this.currentStream && stream !== null && stream !== undefined) {
                    this.loading = true;
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
                        if(this.currentStream !== null && (this.$refs.media  && (this.$refs.media.currentTime > 0 ||
                            this.$refs.media.readyState > 2))) {
                            this.loading = false;
                            clearInterval(timer);
                            this.fitMedia();
                        }
                    }, 100);
                }
                let timer = setInterval(()=>{
                    if(this.currentStream !== null && (this.$refs.media  && (this.$refs.media.currentTime > 0 ||
                        this.$refs.media.readyState > 2))) {
                        this.loading = false;
                        clearInterval(timer);
                        this.fitMedia();
                    }
                }
            },
            fitMediaToParent() {
                if(this.$refs.media && this.$refs.media &&
                    this.$refs.media.videoWidth && this.$refs.media.videoHeight &&
                    typeof(this.$refs.media.videoWidth) === 'number' &&
                    typeof(this.$refs.media.videoHeight) === 'number') {
                    let parentAspectRatio = this.$parent.$el.clientWidth / this.$parent.$el.clientHeight;
                    let isParentLandscape = parentAspectRatio >= 1;
                    let isParentPortrait = !isParentLandscape;
                    let videoAspectRatio = this.$refs.media.videoWidth / this.$refs.media.videoHeight;
                    let isVideoLandscape = videoAspectRatio >= 1;
                    let isVideoPortrait = !isVideoLandscape;
                    if(isParentLandscape && isVideoLandscape && parentAspectRatio > videoAspectRatio) {
                        this.mediaWidth = this.$parent.$el.clientWidth;
                        this.mediaHeight = this.$parent.$el.clientWidth / videoAspectRatio;
                        this.mediaLeft = 0;
                        this.mediaTop = (this.$parent.$el.clientHeight - this.mediaHeight) / 2;
                    }
                    else if (isParentLandscape && isVideoLandscape && parentAspectRatio < videoAspectRatio) {
                        this.mediaWidth = this.$parent.$el.clientHeight * videoAspectRatio;
                        this.mediaHeight = this.$parent.$el.clientHeight;
                        this.mediaLeft = (this.$parent.$el.clientWidth - this.mediaWidth) / 2;
                        this.mediaTop = 0;
                    }
                    else if (isParentLandscape && isVideoPortrait) {
                        this.mediaWidth = this.$parent.$el.clientHeight * videoAspectRatio;
                        this.mediaHeight = this.$parent.$el.clientHeight;
                        this.mediaLeft = (this.$parent.$el.clientWidth - this.mediaWidth) / 2;
                        this.mediaTop = 0;
                    }
                    else if(isParentPortrait && isVideoPortrait && parentAspectRatio < videoAspectRatio) {
                        this.mediaWidth = this.$parent.$el.clientHeight * videoAspectRatio;
                        this.mediaHeight = this.$parent.$el.clientHeight;
                        this.mediaLeft = (this.$parent.$el.clientWidth - this.mediaWidth) / 2;
                        this.mediaTop = 0;
                    }
                    else if(isParentPortrait && isVideoPortrait && parentAspectRatio > videoAspectRatio) {
                        this.mediaWidth = this.$parent.$el.clientWidth;
                        this.mediaHeight = this.$parent.$el.clientWidth / videoAspectRatio;
                        this.mediaLeft = 0;
                        this.mediaTop = (this.$parent.$el.clientHeight - this.mediaHeight) / 2;
                    }
                    else if (isParentPortrait && isVideoLandscape) {
                        this.mediaWidth = this.$parent.$el.clientWidth;
                        this.mediaHeight = this.$parent.$el.clientWidth / videoAspectRatio;
                        this.mediaLeft = 0;
                        this.mediaTop = (this.$parent.$el.clientHeight - this.mediaHeight) / 2;
                    }
                    else {
                        this.mediaWidth = this.$parent.$el.clientWidth;
                        this.mediaHeight = this.$parent.$el.clientHeight;
                        this.mediaLeft = 0;
                        this.mediaTop = 0;
                    }
                }
            },
            fitMediaHeightToParent() {
                if(this.$refs.media && this.$refs.media &&
                    this.$refs.media.videoWidth && this.$refs.media.videoHeight &&
                    typeof(this.$refs.media.videoWidth) === 'number' &&
                    typeof(this.$refs.media.videoHeight) === 'number') {
                    let videoAspectRatio = this.$refs.media.videoWidth / this.$refs.media.videoHeight;
                    this.mediaWidth = this.width;
                    this.mediaHeight = this.mediaWidth / videoAspectRatio;
                    this.mediaLeft = 0;
                    this.mediaTop = 0;
                }
            },
            fitMedia() {
                if(this.preview) {
                    this.fitMediaHeightToParent();
                }
                else {
                    this.fitMediaToParent();
                }
            }
        },
        watch: {
            stream(stream) {
                this.assignStream(stream);
            },
            muted(muted) {
                this.$refs.media.muted = muted;
            },
            preview() {
                this.$nextTick(()=>{
                    this.fitMedia();
                });
            }
        },
        computed: {
            hasVideo() {
                return this.currentStream !== null && _.isArray(this.currentStream.getVideoTracks()) &&
                    this.currentStream.getVideoTracks().length > 0;
            },
            componentClasses(){
                return ['csc-media'];
            },
            mediaStyles() {
                let styles = {};
                styles.left = this.mediaLeft + 'px';
                styles.top = this.mediaTop + 'px';
                return styles;
            },
            componentStyles() {
                let styles = {};
                if(this.preview) {
                    styles.width = this.mediaWidth + 'px';
                    styles.height = this.mediaHeight + 'px';
                }
                else {
                    styles.width = '100%';
                    styles.height = '100%';
                }
                return styles;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables'
    .csc-media
        position relative
        overflow hidden
        .csc-media-spinner
            position absolute
            top 50%
            left 50%
            margin-top -12px
            margin-left -12px
        video.csc-media-video
            position: absolute;
</style>
