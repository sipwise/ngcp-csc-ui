<template>
    <csc-page>
        New CallForward entry point
    </csc-page>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    // import {
    //     startLoading,
    //     stopLoading,
    //     showToast,
    //     showGlobalError
    // } from '../../../helpers/ui'
    // import CscPage from '../../CscPage'
    export default {
        data () {},
        components: {},
        created() {},
        computed: {
            ...mapState('callForward', []),
            ...mapGetters('callForward', [])
        },
        watch: {}
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
