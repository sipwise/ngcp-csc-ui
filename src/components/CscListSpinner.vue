<template>
    <div
        class="row justify-center"
    >
        <csc-spinner />
    </div>
</template>

<script>
    import CscSpinner from './CscSpinner'
    export default {
        name: 'csc-list-spinner',
        data () {
            return {}
        },
        components: {
            CscSpinner
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'
</style>
