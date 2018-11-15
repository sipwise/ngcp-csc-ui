
<template>
    <csc-page
        class="csc-list-page"
    >
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import {
        getAllCallQueues
    } from '../../../api/pbx-config'
    export default {
        components: {
            CscPage
        },
        data () {
            return {
            }
        },
        mounted() {
            //this.$store.dispatch('pbxConfig/getAllCallQueues');
            getAllCallQueues();
        },
        computed: {
        },
        methods: {
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
