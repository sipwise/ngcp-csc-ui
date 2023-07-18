<template>
    <csc-page
        id="csc-page-pbx-call-queues"
        class="q-pa-lg"
    >
        <csc-list-actions
            class="row justify-center q-mb-lg"
        >
            <template
                v-if="!isCallQueueAddFormEnabled"
                #slot1
            >
                <csc-list-action-button
                    icon="add"
                    color="primary"
                    :label="$t('Add call queue')"
                    @click="enableCallQueueAddForm"
                />
            </template>
        </csc-list-actions>
        <q-slide-transition>
            <div
                v-if="isCallQueueAddFormEnabled"
                class="row justify-center q-mb-lg"
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
                    :call-queue="callQueue"
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
            {{ $t('No call queues created yet') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('Remove call queue')"
            :message="getCallQueueRemoveDialogMessage"
            @remove="removeCallQueue"
            @cancel="closeCallQueueRemovalDialog"
        />
    </csc-page>
</template>

<script>
import CscPage from 'components/CscPage'
import CscPbxCallQueue from 'components/pages/PbxConfiguration/CscPbxCallQueue'
import CscPbxCallQueueAddForm from 'components/pages/PbxConfiguration/CscPbxCallQueueAddForm'
import CscRemoveDialog from 'components/CscRemoveDialog'
import CscListSpinner from 'components/CscListSpinner'
import CscListActions from 'components/CscListActions'
import {
    mapState,
    mapActions,
    mapGetters,
    mapMutations
} from 'vuex'
import {
    CreationState,
    RequestState
} from 'src/store/common'
import {
    showGlobalError,
    showToast
} from 'src/helpers/ui'
import CscList from 'components/CscList'
import CscFade from 'components/transitions/CscFade'
import CscListActionButton from 'components/CscListActionButton'

export default {
    components: {
        CscListActionButton,
        CscFade,
        CscList,
        CscPage,
        CscPbxCallQueue,
        CscPbxCallQueueAddForm,
        CscRemoveDialog,
        CscListSpinner,
        CscListActions
    },
    data () {
        return {
        }
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
    watch: {
        callQueueCreationState (state) {
            if (state === CreationState.created) {
                this.$scrollTo(this.$parent.$el)
                showToast(this.getCallQueueCreationToastMessage)
            } else if (state === CreationState.error) {
                showGlobalError(this.callQueueCreationError)
            }
        },
        callQueueUpdateState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.getCallQueueUpdateToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.callQueueUpdateError)
            }
        },
        callQueueRemovalState (state) {
            if (state === RequestState.succeeded) {
                this.$scrollTo(this.$parent.$el)
                showToast(this.getCallQueueRemovalToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.callQueueRemovalError)
            }
        }
    },
    mounted () {
        this.loadCallQueueList()
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
        openCallQueueRemovalDialog (callQueueId) {
            if (this.$refs.removeDialog) {
                this.$refs.removeDialog.show()
            }
            this.callQueueRemovalRequesting(callQueueId)
        },
        closeCallQueueRemovalDialog () {
            if (this.$refs.removeDialog) {
                this.$refs.removeDialog.hide()
            }
            this.callQueueRemovalCanceled()
        }
    }
}
</script>
