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
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.callQueueRemovalDialogTitle')"
            :message="getCallQueueRemoveDialogMessage"
            @remove="removeCallQueue"
            @cancel="closeCallQueueRemovalDialog"
        />
    </csc-page>
    <!--<csc-page-->
        <!--:is-list="true"-->
    <!--&gt;-->
        <!--<div-->
            <!--v-show="!addFormEnabled"-->
            <!--class="row justify-center"-->
        <!--&gt;-->
            <!--<q-btn-->
                <!--color="primary"-->
                <!--icon="add"-->
                <!--flat-->
                <!--@click="enableAddForm"-->
            <!--&gt;-->
                <!--{{ $t('pbxConfig.addConfig') }}-->
            <!--</q-btn>-->
        <!--</div>-->
        <!--<div-->
            <!--class="row justify-center"-->
            <!--v-show="addFormEnabled"-->
        <!--&gt;-->
            <!--<csc-pbx-call-queue-add-form-->
                <!--class="col-xs-12 col-md-6 csc-list-form"-->
                <!--ref="addForm"-->
                <!--:options="callQueueGroupsAndSeatsOptions"-->
                <!--:loading="isAdding"-->
                <!--@save="addConfig"-->
                <!--@cancel="disableAddForm"-->
            <!--/>-->
        <!--</div>-->
        <!--<div-->
            <!--v-if="isListLoadingVisible"-->
            <!--class="row justify-center"-->
        <!--&gt;-->
            <!--<csc-spinner />-->
        <!--</div>-->
        <!--<div>-->
            <!--<q-list-->
                <!--striped-odd-->
                <!--no-border-->
                <!--multiline-->
                <!--:highlight="!isMobile"-->
            <!--&gt;-->
                <!--<csc-pbx-call-queue-->
                    <!--v-for="(subscriber, index) in callQueueGroupsAndSeats"-->
                    <!--:id="`queue-${subscriber.id}`"-->
                    <!--:key="index"-->
                    <!--:subscriber="subscriber"-->
                    <!--:loading="isItemLoading(subscriber.id)"-->
                    <!--@save-queue-length="setQueueLength"-->
                    <!--@save-wrap-up-time="setWrapUpTime"-->
                    <!--:highlight="highlight(subscriber)"-->
                    <!--@remove="removeConfigDialog"-->
                <!--/>-->
            <!--</q-list>-->
        <!--</div>-->
        <!--<div-->
            <!--v-if="callQueueGroupsAndSeats.length === 0 && !isListRequesting"-->
            <!--class="row justify-center csc-no-entities"-->
        <!--&gt;-->
            <!--{{ $t('pbxConfig.noCallQueues') }}-->
        <!--</div>-->
        <!--<csc-remove-dialog-->
            <!--ref="removeDialog"-->
            <!--:title="$t('pbxConfig.removeConfigTitle')"-->
            <!--:message="removeDialogMessage"-->
            <!--@remove="removeConfig"-->
        <!--/>-->
    <!--</csc-page>-->
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
        // Platform,
        QSpinnerDots,
        QBtn,
        QSlideTransition
    } from 'quasar-framework'
    // import {
    //     showToast
    // } from '../../../helpers/ui'
    // import {
    //     scroll
    // } from 'quasar-framework'
    import CscSpinner from "../../CscSpinner";
    import CscList from "../../CscList";
    import CscFade from "../../transitions/CscFade";
    import CscListActionButton from "../../CscListActionButton";
    // const {
    //     getScrollTarget,
    //     setScrollPosition
    // } = scroll
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
                // addFormEnabled: false,
                // currentRemovingSubscriber: null
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
            ]),
            ...mapGetters('pbxCallQueues', [
                'isCallQueueListRequesting',
                'isCallQueueAddFormEnabled',
                'isCallQueueCreating',
                'getCallQueueRemoveDialogMessage',
                'isCallQueueLoading',
                'isCallQueueExpanded'
            ])
            // ...mapGetters('pbxConfig', [
            //     'callQueueGroupsAndSeats',
            //     'isListLoadingVisible',
            //     'isListRequesting',
            //     'callQueueGroupsAndSeatsOptions',
            //     'isAdding',
            //     'addState',
            //     'isUpdating',
            //     'updateItemId',
            //     'removeState',
            //     'isRemoving',
            //     'lastAddedCallQueue'
            // ]),
            // isMobile() {
            //     return Platform.is.mobile;
            // },
            // callQueueItem() {
            //     return this.$route.query.item;
            // },
            // handleScroll () {
            //     const el = document.getElementById(`queue-${this.callQueueItem}`)
            //     const target = el ? getScrollTarget(el) : null;
            //     const offset = el ? el.offsetTop - el.scrollHeight : null;
            //     const duration = 200
            //     if (this.callQueueItem && target) {
            //         setScrollPosition(target, offset, duration)
            //     }
            // },
            // removeDialogMessage() {
            //     if (this.currentRemovingSubscriber !== null) {
            //         return this.$t('pbxConfig.removeConfigText', {
            //             subscriber: this.currentRemovingSubscriber.display_name
            //         });
            //     }
            // }
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
            // addConfig(data) {
            //     let config = {
            //         max_queue_length: data.max_queue_length,
            //         queue_wrap_up_time: data.queue_wrap_up_time
            //     };
            //     this.$store.dispatch('pbxConfig/addCallQueueConfig', {
            //         id: data.subscriber_id,
            //         config: config
            //     });
            // },
            // enableAddForm() {
            //     this.resetAddForm();
            //     this.addFormEnabled = true;
            // },
            // disableAddForm() {
            //     this.resetAddForm();
            //     this.addFormEnabled = false;
            // },
            // resetAddForm() {
            //     this.$refs.addForm.reset();
            // },
            // setQueueLength(subscriber) {
            //     this.$store.dispatch('pbxConfig/setQueueLength', subscriber);
            // },
            // setWrapUpTime(subscriber) {
            //     this.$store.dispatch('pbxConfig/setWrapUpTime', subscriber);
            // },
            // isItemLoading(subscriberId) {
            //     return (this.isUpdating && this.updateItemId + "" === subscriberId + "") ||
            //         (this.isRemoving && this.currentRemovingSubscriber.id + "" === subscriberId + "");
            // },
            // highlight(subscriber) {
            //     return subscriber.id == this.$route.query.item;
            // },
            // removeConfigDialog(subscriber) {
            //     this.currentRemovingSubscriber = subscriber;
            //     this.$refs.removeDialog.open();
            // },
            // removeConfig() {
            //     this.$store.dispatch('pbxConfig/removeCallQueue', this.currentRemovingSubscriber)
            // }
        },
        watch: {
            // addState(state) {
            //     if (state === 'succeeded') {
            //         this.disableAddForm();
            //         showToast(this.$t('pbxConfig.toasts.addedCallQueueToast',
            //             { name: this.lastAddedCallQueue }));
            //     }
            // },
            // callQueueGroupsAndSeats(state) {
            //     if (state.length > 0) {
            //         setTimeout(() => {
            //             this.handleScroll;
            //         }, 500);
            //     }
            // }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
