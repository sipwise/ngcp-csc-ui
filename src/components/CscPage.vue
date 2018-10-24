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
            pageTitleClasses() {
                var classes = ['page-title', 'transition-generic'];
                if(this.right) {
                    classes.push('page-title-right');
                }
                return classes;
            },
            ...mapGetters('layout', ['left', 'right'])
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl';

    .page {
        position: relative;
        padding: 48px;
        margin: 0px;
    }

    .page h2 {
        margin: 0px;
        font-size: 26px;
        line-height: 26px;
        color: #68A44E;
    }

    .page .page-title {
        padding: 30px;
        padding-left: 60px;
        padding-right: 60px;
        z-index: 1000;
        right: 0;
        background: -moz-linear-gradient(top, rgba(255,255,255,1) 44%, rgba(255,255,255,0.86) 71%, rgba(255,255,255,0) 100%);
        background: -webkit-linear-gradient(top, rgba(255,255,255,1) 44%,rgba(255,255,255,0.86) 71%,rgba(255,255,255,0) 100%);
        background: linear-gradient(to bottom, rgba(255,255,255,1) 44%,rgba(255,255,255,0.86) 71%,rgba(255,255,255,0) 100%);
    }

    .page .page-title.page-title-right {
        right: $layout-aside-right-width;
    }

    .page .page-button {
        padding-top: 20px;
        padding-right: 60px;
    }

    @media (max-width: $breakpoint-sm) {
        .page {
            padding: 16px;
            padding-top: 32px;
            margin: 0px;
        }
        .page .page-content {
            margin: 0px;
            padding: 0px;
        }

        .page h2 {
            margin: 0px;
            font-size: 22px;
            line-height: 22px;
        }

        .page .page-title {
            padding: 16px;
        }
    }

    .page-title-icon {
        margin-right: 10px;
        font-size: 24px !important;
    }
</style>
