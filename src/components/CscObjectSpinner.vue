<template>
    <q-inner-loading
        :visible="loading"
        :style="{zIndex: 12}"
    >
        <q-spinner-dots
            size="32px"
            color="primary"
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
