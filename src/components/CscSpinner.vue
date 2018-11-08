<template>
    <div
        class="csc-spinner"
    >
        <q-spinner-dots
            size="32px"
            color="white"
        />
    </div>
</template>

<script>
    import {
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        name: 'csc-spinner',
        data () {
            return {}
        },
        components: {
            QSpinnerDots
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'
    .csc-spinner
        display inline-block
        padding-left $flex-gutter-sm
        padding-right $flex-gutter-sm
</style>
