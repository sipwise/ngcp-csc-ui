<template>
    <div
        :class="componentClasses"
    >
        <div
            class="csc-call-actions row justify-center"
        >
            <q-fab
                class="csc-call-button"
                color="primary"
                icon="call"
                direction="up"
            >
                <q-fab-action
                    color="primary"
                    icon="computer"
                />
                <q-fab-action
                    color="primary"
                    icon="videocam"
                />
                <q-fab-action
                    color="primary"
                    icon="microphone"
                />
            </q-fab>
        </div>

    </div>
</template>

<script>
    import {
        QFab,
        QFabAction
    } from 'quasar-framework'
    export default {
        name: 'csc-call',
        data() {
            return {
            }
        },
        props: [
            'callState',
            'minimized'
        ],
        components: {
            QFab,
            QFabAction
        },
        mounted() {
        },
        computed: {
            componentClasses() {
                return [
                    'csc-call',
                    'csc-call-' + this.callState
                ];
            }
        },
        methods: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables'
    .csc-call
        left $layout-aside-left-width
        top $toolbar-min-height
        position fixed
        bottom 0
        right 0
        z-index 9999
        .csc-call-actions
            position absolute
            bottom 0
            left 0
            right 0
            height $toolbar-min-height
            background-color $secondary
        .csc-call-button
            margin-top -27px

    .csc-call.csc-call.csc-call-input
        top auto

    .csc-call.csc-call-full-width
        left 0
</style>
