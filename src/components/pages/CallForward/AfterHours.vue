<template>
    <csc-page>
        <csc-call-forward-timeset
            timesetName="After Hours"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscCallForwardTimeset from './CscCallForwardTimeset'
    export default {
        components: {
            CscPage,
            CscCallForwardTimeset
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
