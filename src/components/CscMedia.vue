<template>
    <div class="csc-media">
        <video ref="media"></video>
    </div>
</template>

<script>
    import _ from 'lodash';
    export default {
        name: 'csc-media',
        props: ['stream'],
        data () {
            return {
                currentStream: this.stream
            }
        },
        mounted() {
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
        },
        components: {},
        methods: {},
        computed: {}
    }
</script>

<style lang="stylus">
    .csc-media {
        width: 100%
    }
    .csc-media video {
        width: 100%
    }
</style>
