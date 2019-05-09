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
        <q-list
            striped-odd
            no-border
            multiline
            :highlight="!isMobile"
        >
            <csc-pbx-manager-secretary-config
                v-for="(subscriber, index) in managerSecretaryGroupsAndSeats"
                :key="index"
                :subscriber="subscriber"
                :loading="isItemLoading()"
            />
        </q-list>
        <div
            v-if="isManagerSecretaryGroupsAndSeatsEmpty && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noManagerSecretaryConfigs') }}
        </div>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxManagerSecretaryConfig from './CscPbxManagerSecretaryConfig'
    import {
        mapGetters
    } from 'vuex'
    import {
        Platform,
        QSpinnerDots,
        QList
    } from 'quasar-framework'
    export default {
        components: {
            CscPage,
            CscPbxManagerSecretaryConfig,
            QSpinnerDots,
            QList
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
            },
            isManagerSecretaryGroupsAndSeatsEmpty() {
                return Object.entries(this.managerSecretaryGroupsAndSeats).length === 0;
            }
        },
        methods: {
            isItemLoading() {
                return this.isListRequesting;
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
