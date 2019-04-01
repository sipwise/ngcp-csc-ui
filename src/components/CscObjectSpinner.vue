<template>
    <q-inner-loading
        :visible="loading">
        <q-spinner-dots
            size="32px"
            color="white"
        />
    </q-inner-loading>
</template>

<script>
    import {
        QSpinnerDots,
        QInnerLoading
    } from 'quasar-framework'
    export default {
        name: 'csc-object-spinner',
        data () {
            return {}
        },
        components: {
            QSpinnerDots,
            QInnerLoading
        },
        props: [
            'loading'
        ]
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'
</style>
