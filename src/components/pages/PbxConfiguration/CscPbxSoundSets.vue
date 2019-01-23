<template>
    <csc-page
        :is-list="true"
    >
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    //import { getSoundSets } from '../../../api/pbx-config'
    //import { mapGetters } from 'vuex'
    //import {
    //    QList,
    //    QItem
    //} from 'quasar-framework'
    export default {
        components: {
            CscPage,
        },
        data () {
            return {
            }
        },
        mounted() {
            //getSoundSets();
            this.$store.dispatch('pbxConfig/getSoundSets');
        },
        computed: {
            //...mapGetters('pbxConfig', [
            //    'placeholder'
            //]),
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
