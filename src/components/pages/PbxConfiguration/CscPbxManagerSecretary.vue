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
                :id="`config-${subscriber.id}`"
                :key="index"
                :subscriber="subscriber"
                :loading="isItemLoading(subscriber.id)"
            />
        </q-list>
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
                'isListLoadingVisible',
                'isUpdating',
                'updateItemId'
            ]),
            isMobile() {
                return !!Platform.is.mobile;
            }
        },
        methods: {
            isItemLoading(subscriberId) {
                return (this.isUpdating && this.updateItemId + "" === subscriberId + "");
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
