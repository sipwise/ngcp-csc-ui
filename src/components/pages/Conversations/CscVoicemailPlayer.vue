<template>
    <div class="voicemail-player">
        <div class="control-btns">
            <q-btn class="play-pause-btn" round flat small color="primary" :icon="playPauseIcon"></q-btn>
            <q-btn class="stop-btn" round flat small color="primary" icon="stop"></q-btn>
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
                isPlaying: false
            }
        },
        computed: {
            playPauseIcon() {
                return this.isPlaying ? 'pause': 'play_arrow';
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
