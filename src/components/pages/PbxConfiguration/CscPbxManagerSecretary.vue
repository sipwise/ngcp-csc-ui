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
                @remove="removeConfigDialog"
            />
        </q-list>
        <div
            v-if="isManagerSecretaryGroupsAndSeatsEmpty && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noManagerSecretaryConfigs') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.removeManagerSecretaryTitle')"
            :message="removeDialogMessage"
            @remove="removeConfig"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxManagerSecretaryConfig from './CscPbxManagerSecretaryConfig'
    import CscRemoveDialog from '../../CscRemoveDialog'
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
            CscRemoveDialog,
            QSpinnerDots,
            QList
        },
        data () {
            return {
                currentRemovingSubscriber: null
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
            },
            removeDialogMessage() {
                if (this.currentRemovingSubscriber !== null) {
                    return this.$t('pbxConfig.removeManagerSecretaryText', {
                        subscriber: this.currentRemovingSubscriber.name
                    });
                }
            }
        },
        methods: {
            isItemLoading() {
                return this.isListRequesting;
            },
            removeConfigDialog(subscriber) {
                this.currentRemovingSubscriber = subscriber;
                this.$refs.removeDialog.open();
            },
            removeConfig() {
                this.$store.dispatch('pbxConfig/removeManagerSecretary', this.currentRemovingSubscriber)
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
