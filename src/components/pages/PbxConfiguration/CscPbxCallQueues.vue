
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
        <div>
            <q-list
                striped-odd
                no-border
                multiline
                :highlight="!isMobile"
            >
                <csc-pbx-call-queue
                    v-for="(subscriber, index) in callQueueGroupsAndSeats"
                    :key="index"
                    :subscriber="subscriber"
                    :loading="isItemLoading(subscriber.id)"
                    @remove="removeConfigDialog"
                />
            </q-list>
        </div>
        <div
            v-if="callQueueGroupsAndSeats.length === 0 && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noCallQueues') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.removeConfigTitle')"
            :message="removeDialogMessage"
            @remove="removeConfig"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxCallQueue from './CscPbxCallQueue'
    import CscRemoveDialog from '../../CscRemoveDialog'
    import { mapGetters } from 'vuex'
    import {
        QField,
        QInput,
        QIcon,
        QSelect,
        QChip,
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        Platform,
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        components: {
            CscRemoveDialog,
            CscPbxCallQueue,
            CscPage,
            QField,
            QInput,
            QIcon,
            QSelect,
            QChip,
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QSpinnerDots
        },
        data () {
            return {
                currentRemovingSubscriber: null
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listCallQueueGroupsAndSeats');
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'callQueueGroupsAndSeats',
                'isListLoadingVisible',
                'isListRequesting',
                'removeState',
                'isRemoving'
            ]),
            isMobile() {
                return Platform.is.mobile;
            },
            removeDialogMessage() {
                if (this.currentRemovingSubscriber !== null) {
                    return this.$t('pbxConfig.removeConfigText', {
                        subscriber: this.currentRemovingSubscriber.display_name
                    });
                }
            }
        },
        methods: {
            isItemLoading(subscriberId) {
                return (this.isRemoving && this.currentRemovingSubscriber.id + "" === subscriberId + "");
            },
            removeConfigDialog(subscriber) {
                this.currentRemovingSubscriber = subscriber;
                this.$refs.removeDialog.open();
            },
            removeConfig() {
                this.$store.dispatch('pbxConfig/removeCallQueue', this.currentRemovingSubscriber)
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
