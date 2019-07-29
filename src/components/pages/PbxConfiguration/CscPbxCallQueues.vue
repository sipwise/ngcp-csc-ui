<template>
    <csc-page
        :is-list="true"
    >
        <csc-list-actions>
            <csc-list-action-button
                v-if="!isCallQueueAddFormEnabled"
                slot="slot1"
                icon="add"
                color="primary"
                :label="$t('pbxConfig.addCallQueue')"
                @click="enableCallQueueAddForm"
            />
        </csc-list-actions>
        <q-slide-transition>
            <div
                v-if="isCallQueueAddFormEnabled"
                class="row justify-center"
            >
                <csc-pbx-call-queue-add-form
                    class="csc-list-form col-xs-12 col-md-6"
                    :loading="isCallQueueCreating"
                    :options="getSubscriberOptions"
                    :subscriber-options-loading="isSubscribersRequesting"
                    :default-max-queue-length="defaultMaxQueueLength"
                    :default-wrap-up-time="defaultQueueWrapUpTime"
                    @cancel="disableCallQueueAddForm"
                    @submit="createCallQueue"
                    @ready="loadSubscribers"
                />
            </div>
        </q-slide-transition>
        <csc-list-spinner
            v-if="isCallQueueListRequesting && !callQueueListVisible"
        />
        <csc-list
            v-if="!isCallQueueListRequesting || callQueueListVisible"
        >
            <csc-fade
                v-for="(callQueue, index) in callQueueList"
                :key="'csc-fade-'+callQueue.id"
            >
                <csc-pbx-call-queue
                    :key="callQueue.id"
                    :odd="(index % 2) === 0"
                    :loading="isCallQueueLoading(callQueue.id)"
                    :expanded="isCallQueueExpanded(callQueue.id)"
                    :callQueue="callQueue"
                    :subscriber="subscriberMap[callQueue.id]"
                    :default-max-queue-length="defaultMaxQueueLength"
                    :default-queue-wrap-up-time="defaultQueueWrapUpTime"
                    @remove="openCallQueueRemovalDialog"
                    @expand="expandCallQueue(callQueue.id)"
                    @collapse="collapseCallQueue"
                    @save-max-queue-length="setCallQueueMaxLength"
                    @save-queue-wrap-up-time="setCallQueueWrapUpTime"
                />
            </csc-fade>
        </csc-list>
        <div
            v-if="isCallQueueListEmpty && !isCallQueueListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noCallQueues') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.callQueueRemovalDialogTitle')"
            :message="getCallQueueRemoveDialogMessage"
            @remove="removeCallQueue"
            @cancel="closeCallQueueRemovalDialog"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxCallQueue from './CscPbxCallQueue'
    import CscPbxCallQueueAddForm from './CscPbxCallQueueAddForm'
    import CscRemoveDialog from '../../CscRemoveDialog'
    import CscListSpinner from '../../CscListSpinner'
    import CscListActions from '../../CscListActions'
    import {
        mapState,
        mapActions,
        mapGetters,
        mapMutations
    } from 'vuex'
    import {
        CreationState,
        RequestState
    } from "../../../store/common"
    import {
        showGlobalError,
        showToast
    } from '../../../helpers/ui'
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
        QSpinnerDots,
        QBtn,
        QSlideTransition
    } from 'quasar-framework'
    import CscSpinner from "../../CscSpinner";
    import CscList from "../../CscList";
    import CscFade from "../../transitions/CscFade";
    import CscListActionButton from "../../CscListActionButton";
    export default {
        components: {
            CscListActionButton,
            CscFade,
            CscList,
            CscSpinner,
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
            QBtn,
            QSlideTransition,
            CscListSpinner,
            CscListActions
        },
        data () {
            return {
            }
        },
        mounted() {
            this.loadCallQueueList();
        },
        computed: {
            ...mapGetters('pbx', [
                'isSubscribersRequesting',
                'getSubscriberOptions'
            ]),
            ...mapState('pbxCallQueues', [
                'callQueueList',
                'callQueueListVisible',
                'subscriberMap',
                'defaultMaxQueueLength',
                'defaultQueueWrapUpTime',
                'callQueueCreationState',
                'callQueueUpdateState',
                'callQueueRemovalState',
                'callQueueCreationError',
                'callQueueUpdateError',
                'callQueueRemovalError'
            ]),
            ...mapGetters('pbxCallQueues', [
                'isCallQueueListEmpty',
                'isCallQueueListRequesting',
                'isCallQueueAddFormEnabled',
                'isCallQueueCreating',
                'getCallQueueRemoveDialogMessage',
                'isCallQueueLoading',
                'isCallQueueExpanded',
                'getCallQueueCreationToastMessage',
                'getCallQueueUpdateToastMessage',
                'getCallQueueRemovalToastMessage'
            ])
        },
        methods: {
            ...mapActions('pbx', [
                'loadSubscribers'
            ]),
            ...mapMutations('pbxCallQueues', [
                'enableCallQueueAddForm',
                'disableCallQueueAddForm',
                'callQueueRemovalRequesting',
                'callQueueRemovalCanceled',
                'expandCallQueue',
                'collapseCallQueue'
            ]),
            ...mapActions('pbxCallQueues', [
                'loadCallQueueList',
                'createCallQueue',
                'removeCallQueue',
                'setCallQueueMaxLength',
                'setCallQueueWrapUpTime'
            ]),
            openCallQueueRemovalDialog(callQueueId) {
                if(this.$refs.removeDialog) {
                    this.$refs.removeDialog.open();
                }
                this.callQueueRemovalRequesting(callQueueId);
            },
            closeCallQueueRemovalDialog() {
                if(this.$refs.removeDialog) {
                    this.$refs.removeDialog.close();
                }
                this.callQueueRemovalCanceled();
            }
        },
        watch: {
            callQueueCreationState(state) {
                if(state === CreationState.created) {
                    this.$scrollTo(this.$parent.$el);
                    showToast(this.getCallQueueCreationToastMessage);
                }
                else if(state === CreationState.error) {
                    showGlobalError(this.callQueueCreationError);
                }
            },
            callQueueUpdateState(state) {
                if(state === RequestState.succeeded) {
                    showToast(this.getCallQueueUpdateToastMessage);
                }
                else if(state === RequestState.failed) {
                    showGlobalError(this.callQueueUpdateError);
                }
            },
            callQueueRemovalState(state) {
                if(state === RequestState.succeeded) {
                    this.$scrollTo(this.$parent.$el);
                    showToast(this.getCallQueueRemovalToastMessage);
                }
                else if(state === RequestState.failed) {
                    showGlobalError(this.callQueueRemovalError);
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
