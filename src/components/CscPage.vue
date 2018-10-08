<template>
    <div class="page">
        <div class="page-content">
            <slot></slot>
        </div>
    </div>
</template>

<script>

    import { QIcon, QFixedPosition, QFab, QFabAction, QTooltip } from 'quasar-framework'
    import { mapGetters } from 'vuex'

    export default {
        name: 'csc-page',
        props: [
            'title'
        ],
        data () {
            return {}
        },
        components: {
            QIcon,
            QFixedPosition,
            QFab,
            QFabAction,
            QTooltip
        },
        computed: {
            ...mapGetters('layout', ['left', 'right'])
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl';

    .page
        position relative
        padding 48px
        margin 0px

    .page .page-button
        padding-top 20px
        padding-right 60px

    @media (max-width: $breakpoint-sm)
        .page
            padding 16px
            padding-top 32px
            margin 0px

        .page .page-content
            margin: 0px
            padding: 0px

    .page-title-icon
        margin-right 10px
        font-size 24px !important

</style>
