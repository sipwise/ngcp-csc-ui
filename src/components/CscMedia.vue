<template>
    <div class="csc-media">
        <div v-show="loading" class="csc-spinner">
            <q-spinner-mat color="primary" :size="60" />
        </div>
        <video v-show="!loading && hasVideo" ref="media" autoplay :muted="muted"></video>
    </div>
</template>

<script>

    import _ from 'lodash';
    import { QSpinnerMat, QIcon } from 'quasar-framework'

    export default {
        name: 'csc-media',
        props: ['stream', 'muted'],
        data () {
            return {
                currentStream: this.stream,
                loading: true,
            }
        },
        mounted() {},
        components: {
            QSpinnerMat,
            QIcon
        },
        methods: {
            assignStream(stream) {
                this.currentStream = stream;
                if(_.isObject(this.currentStream) && _.isObject(this.$refs.media) &&
                    !_.isUndefined(this.$refs.media.srcObject)) {
                    this.$refs.media.srcObject = this.currentStream;
                } else if(_.isObject(this.currentStream) && _.isObject(this.$refs.media) &&
                    !_.isUndefined(this.$refs.media.mozSrcObject)) {
                    this.$refs.media.mozSrcObject = this.currentStream;
                } else if(_.isObject(this.currentStream) && _.isObject(this.$refs.media) &&
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
            stream() {
                if(_.isObject(this.stream) && this.currentStream !== this.stream) {
                    this.loading = true;
                    this.assignStream(this.stream);
                }
            },
            muted() {
                this.$refs.media.muted = this.muted;
            }
        },
        computed: {
            hasVideo() {
                return this.currentStream !== null && _.isArray(this.currentStream.getVideoTracks()) &&
                    this.currentStream.getVideoTracks().length > 0;
            }
        }
    }
</script>

<style lang="stylus">
    .csc-media {
        position: relative;
    }
    .csc-media video {
        position: relative;
        width: 100%;
    }
</style>
