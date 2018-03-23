<template>
    <csc-page :title="$t('pages.callForward.titles.afterHours')">
        <csc-call-forward-timeset timesetName="After Hours" />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscCallForwardTimeset from './CscCallForwardTimeset'
    export default {
        data () {
            return {
            }
        },
        components: {
            CscPage,
            CscCallForwardTimeset
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

</style>
