
<template>
    <csc-page
        :is-list="true"
    >
        <div
            v-show="!addFormEnabled"
            class="row justify-center"
        >
            <q-btn
                color="primary"
                icon="add"
                flat
                @click="enableAddForm"
            >
                {{ $t('pbxConfig.addConfig') }}
            </q-btn>
        </div>
        <div
            class="row justify-center"
            v-show="addFormEnabled"
        >
            <csc-pbx-call-queue-add-form
                class="col-xs-12 col-md-6 csc-list-form"
                ref="addForm"
                :options="callQueueGroupsAndSeatsOptions"
                :loading="isAdding"
                @save="addConfig"
                @cancel="disableAddForm"
            />
        </div>
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
    import CscPbxCallQueueAddForm from './CscPbxCallQueueAddForm'
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
        QSpinnerDots,
        QBtn
    } from 'quasar-framework'
    export default {
        components: {
            CscPage,
            CscPbxCallQueue,
            CscPbxCallQueueAddForm,
            CscRemoveDialog,
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
            QSpinnerDots,
            QBtn
        },
        data () {
            return {
                addFormEnabled: false,
                currentRemovingSubscriber: null
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listCallQueueGroupsAndSeats');
            this.$store.dispatch('pbxConfig/getAllGroupsAndSeats');
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'callQueueGroupsAndSeats',
                'isListLoadingVisible',
                'isListRequesting',
                'callQueueGroupsAndSeatsOptions',
                'isAdding',
                'addState',
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
            addConfig(data) {
                let config = {
                    max_queue_length: data.max_queue_length,
                    queue_wrap_up_time: data.queue_wrap_up_time
                };
                this.$store.dispatch('pbxConfig/addCallQueueConfig', {
                    id: data.subscriber_id,
                    config: config
                });
            },
            enableAddForm() {
                this.resetAddForm();
                this.addFormEnabled = true;
            },
            disableAddForm() {
                this.resetAddForm();
                this.addFormEnabled = false;
            },
            resetAddForm() {
                this.$refs.addForm.reset();
            },
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
            addState(state) {
                if (state === 'succeeded') {
                    this.disableAddForm();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
