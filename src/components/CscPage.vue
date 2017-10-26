<template>
    <div class="page">
        <q-fixed-position corner="top-left" :offset="[0,0]" class="page-title transition-generic">
            <h2>{{ title }}</h2>
        </q-fixed-position>
        <div class="page-content">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import { QIcon, QFixedPosition, QFab, QFabAction, QTooltip } from 'quasar-framework'
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
        }
    }
</script>

<style lang="stylus">
    @import '../../src/themes/app.variables.styl';
    @import '../../src/themes/quasar.variables.styl';
    .page {
        position: relative;
        padding: 60px;
        padding-top: 100px;
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
        background-color: white;
        z-index: 1000;
    }

    .page .page-button {
        padding-top: 20px;
        padding-right: 60px;
    }

    @media (max-width: $breakpoint-sm) {
        .page {
            padding: 30px;
            padding-top: 100px;
        }
        .page h2 {
            margin: 0px;
            font-size: 22px;
            line-height: 22px;
        }

        .page .page-title {
            padding: 30px;
            background-color: white;
            z-index: 1000;
        }
    }

    .page-title-icon {
        margin-right: 10px;
        font-size: 24px !important;
    }
</style>
