
<template>
    <csc-page
        :is-list="true"
    >
        <!--<div-->
            <!--v-if="isListLoadingVisible"-->
            <!--class="row justify-center">-->
            <!--<q-spinner-dots-->
                <!--color="primary"-->
                <!--:size="40"-->
            <!--/>-->
        <!--</div>-->
        <!--<q-list-->
            <!--striped-odd-->
            <!--no-border-->
            <!--multiline-->
            <!--:highlight="!isMobile">-->
            <!--<csc-pbx-manager-secretary-config />-->
        <!--</q-list>-->
        <!--<div-->
            <!--v-if="managerSecretaryList.length === 0 && !isManagerSecretaryRequesting"-->
            <!--class="row justify-center csc-no-entities">-->
            <!--{{ $t('pbxConfig.noManagerSecretary') }}-->
        <!--</div>-->
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    //import CscPbxManagerSecretaryConfig from './CscPbxManagerSecretaryConfig'
    //import {
    //    mapGetters
    //} from 'vuex'
    import {
        Platform
    } from 'quasar-framework'
    export default {
        components: {
            CscPage
        },
        data () {
            return {
            }
        },
        mounted() {
            //this.$store.dispatch('pbxConfig/listManagerSecretary');
        },
        computed: {
            //...mapGetters('pbxConfig', [
            //    'managerSecretaryList',
            //    'isManagerSecretaryRequesting',
            //    'isListLoadingVisible'
            //]),
            isMobile() {
                return !!Platform.is.mobile;
            }
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
