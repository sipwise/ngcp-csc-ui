<template>
    <div
        class="csc-list-actions row justify-center"
    >
        <q-slide-transition
            appear
        >
            <slot
                name="slot1"
            />
        </q-slide-transition>
        <q-slide-transition
            appear
        >
            <slot
                name="slot2"
            />
        </q-slide-transition>
        <q-slide-transition
            appear
        >
            <slot
                name="slot3"
            />
        </q-slide-transition>
    </div>
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
