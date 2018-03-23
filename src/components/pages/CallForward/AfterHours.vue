<template>
    <csc-page :title="$t('pages.callForward.titles.afterHours')">
        <csc-timeset-submodule timesetName="After Hours" />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscTimesetSubmodule from './CscTimesetSubmodule'
    export default {
        data () {
            return {
            }
        },
        components: {
            CscPage,
            CscTimesetSubmodule
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

</style>
