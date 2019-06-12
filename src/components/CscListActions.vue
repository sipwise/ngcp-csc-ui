<template>
    <q-slide-transition>
        <div
            class="csc-list-actions row justify-center"
        >
            <slot/>
        </div>
    </q-slide-transition>
</template>

<script>
    import {
        QSlideTransition
    } from 'quasar-framework'
    export default {
        name: 'csc-list-actions',
        data () {
            return {}
        },
        props: [
            'label'
        ],
        components: {
            QSlideTransition
        },
        methods: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'
    .csc-list-actions
        margin-bottom $flex-gutter-sm
</style>
