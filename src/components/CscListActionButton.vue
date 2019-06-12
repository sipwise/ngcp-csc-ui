<template>
    <div
        class="csc-list-action-button"
    >
        <q-btn
            dark
            flat
            :icon="icon"
            :color="color"
            :disable="disable"
            @click="$emit('click')"
        >
            {{ label }}
        </q-btn>
    </div>
</template>

<script>
    import {
        QBtn
    } from 'quasar-framework'
    export default {
        name: 'csc-list-action-button',
        components: {
            QBtn
        },
        data () {
            return {}
        },
        props: [
            'disable',
            'icon',
            'color',
            'label'
        ]
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'
</style>
