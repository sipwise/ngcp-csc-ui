
<template>
    <csc-page
        :is-list="true"
    >
        <div
            v-if="isListLoadingVisible"
            class="row justify-center"
        >
            <q-spinner-dots
                color="primary"
                :size="40"
            />
        </div>
        <!--<q-list-->
            <!--striped-odd-->
            <!--no-border-->
            <!--multiline-->
            <!--:highlight="!isMobile">-->
            <!--<csc-pbx-manager-secretary-config />-->
        <!--</q-list>-->
        <div>
            <ul>
                <li v-for="config in managerSecretaryGroupsAndSeats">
                    {{ config.display_name || config.webusername }}
                    <ul>
                        <li v-for="number in config.secretary_numbers">
                            {{ number }}
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <div
            v-if="managerSecretaryGroupsAndSeats.length === 0 && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noManagerSecretaryConfigs') }}
        </div>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    //import CscPbxManagerSecretaryConfig from './CscPbxManagerSecretaryConfig'
    import {
        mapGetters
    } from 'vuex'
    import {
        Platform,
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        components: {
            CscPage,
            QSpinnerDots
        },
        data () {
            return {
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listManagerSecretaryGroupsAndSeats');
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'managerSecretaryGroupsAndSeats',
                'isListRequesting',
                'isListLoadingVisible'
            ]),
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
