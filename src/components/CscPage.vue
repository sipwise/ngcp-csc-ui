<template>
    <div :class="componentClasses">
        <div class="csc-page-content">
            <slot></slot>
        </div>
    </div>
</template>

<script>

    import platformMixin from '../mixins/platform'
    import {
        QIcon,
        QFixedPosition,
        QFab,
        QFabAction,
        QTooltip
    } from 'quasar-framework'

    export default {
        name: 'csc-page',
        props: [
            'title',
            'isList'
        ],
        mixins: [
            platformMixin
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
            componentClasses() {
                let classes = ['csc-page'];
                if(this.isMobile) {
                    classes.push('csc-page-mobile');
                }
                if(this.isList) {
                    classes.push('csc-page-list');
                }
                return classes;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl';
    .csc-page
        position relative
        padding $flex-gutter-lg
        padding-top $header-height
        margin 0
    .csc-page.csc-page-mobile
        padding-left $flex-gutter-sm * 1.4
        padding-right $flex-gutter-sm * 1.4
    .csc-page.csc-page-mobile.csc-page-list
        padding-left 0
        padding-right 0
</style>
