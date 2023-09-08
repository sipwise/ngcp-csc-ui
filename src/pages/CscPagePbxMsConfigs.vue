<template>
    <csc-page
        id="csc-page-pbx-ms-config"
        class="q-pa-lg"
    >
        <csc-list-actions
            class="row justify-center q-mb-lg"
        >
            <template
                v-if="!isMsConfigAddFormEnabled"
                #slot1
            >
                <csc-list-action-button
                    icon="add"
                    color="primary"
                    :label="$t('Add Config')"
                    @click="enableMsConfigAddForm"
                />
            </template>
        </csc-list-actions>
        <div
            v-if="isMsConfigAddFormEnabled"
            class="row justify-center q-mb-lg"
        >
            <csc-pbx-ms-config-add-form
                class="csc-list-form col-xs-12 col-md-6"
                :loading="isMsConfigCreating"
                :subscriber-options="getSubscriberOptions"
                :subscriber-options-loading="isSubscribersRequesting"
                :number-options="getFullNumberOptions"
                :numbers-options-loading="isNumbersRequesting"
                @cancel="disableMsConfigAddForm"
                @submit="createMsConfig"
                @ready="addFormReady"
            />
        </div>
        <csc-list-spinner
            v-if="isMsConfigListRequesting && !msConfigListVisible"
        />
        <csc-list
            v-if="!isMsConfigListRequesting || msConfigListVisible"
        >
            <csc-fade
                v-for="(msConfig, index) in msConfigList"
                :key="'csc-fade-'+msConfig.id"
            >
                <csc-pbx-ms-config
                    :key="msConfig.id"
                    :odd="(index % 2) === 0"
                    :loading="isMsConfigLoading(msConfig.id)"
                    :expanded="isMsConfigExpanded(msConfig.id)"
                    :ms-config="msConfig"
                    :subscriber="subscriberMap[msConfig.id]"
                    :number-options="getFullNumberOptions"
                    :numbers-options-loading="isNumbersRequesting"
                    @remove="openMsConfigRemovalDialog"
                    @expand="expandMsConfig(msConfig.id)"
                    @collapse="collapseMsConfig"
                    @ready="addFormReady"
                    @save-secretary-numbers="setSecretaryNumbers"
                />
            </csc-fade>
        </csc-list>
        <div
            v-if="isMsConfigListEmpty && !isMsConfigListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('No manager secretary configuration created yet') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('Remove manager secretary config')"
            :message="getMsConfigRemoveDialogMessage"
            @remove="removeMsConfig"
            @cancel="closeMsConfigRemovalDialog"
        />
    </csc-page>
</template>

<script>
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
import CscPage from 'components/CscPage'
import CscPbxMsConfig from 'components/pages/PbxConfiguration/CscPbxMsConfig'
import CscPbxMsConfigAddForm from 'components/pages/PbxConfiguration/CscPbxMsConfigAddForm'
import CscRemoveDialog from 'components/CscRemoveDialog'
import CscListSpinner from 'components/CscListSpinner'
import CscListActions from 'components/CscListActions'
import CscList from 'components/CscList'
import CscFade from 'components/transitions/CscFade'
import CscListActionButton from 'components/CscListActionButton'

export default {
    name: 'CscPagePbxMsConfigs',
    components: {
        CscListActionButton,
        CscFade,
        CscList,
        CscPage,
        CscPbxMsConfig,
        CscPbxMsConfigAddForm,
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
            'getSubscriberOptions',
            'isNumbersRequesting',
            'getFullNumberOptions'
        ]),
        ...mapState('pbxMsConfigs', [
            'msConfigList',
            'msConfigListVisible',
            'subscriberMap',
            'msConfigCreationState',
            'msConfigUpdateState',
            'msConfigRemovalState',
            'msConfigCreationError',
            'msConfigUpdateError',
            'msConfigRemovalError'
        ]),
        ...mapGetters('pbxMsConfigs', [
            'isMsConfigListEmpty',
            'isMsConfigListRequesting',
            'isMsConfigAddFormEnabled',
            'isMsConfigCreating',
            'getMsConfigRemoveDialogMessage',
            'isMsConfigLoading',
            'isMsConfigExpanded',
            'getMsConfigCreationToastMessage',
            'getMsConfigUpdateToastMessage',
            'getMsConfigRemovalToastMessage'
        ])
    },
    watch: {
        msConfigCreationState (state) {
            if (state === CreationState.created) {
                this.$scrollTo(this.$parent.$el)
                showToast(this.getMsConfigCreationToastMessage)
            } else if (state === CreationState.error) {
                showGlobalError(this.msConfigCreationError)
            }
        },
        msConfigUpdateState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.getMsConfigUpdateToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.msConfigUpdateError)
            }
        },
        msConfigRemovalState (state) {
            if (state === RequestState.succeeded) {
                this.$scrollTo(this.$parent.$el)
                showToast(this.getMsConfigRemovalToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.msConfigRemovalError)
            }
        }
    },
    mounted () {
        this.loadMsConfigList()
    },
    methods: {
        ...mapActions('pbx', [
            'loadSubscribers',
            'loadNumbers'
        ]),
        ...mapMutations('pbxMsConfigs', [
            'enableMsConfigAddForm',
            'disableMsConfigAddForm',
            'msConfigRemovalRequesting',
            'msConfigRemovalCanceled',
            'expandMsConfig',
            'collapseMsConfig'
        ]),
        ...mapActions('pbxMsConfigs', [
            'loadMsConfigList',
            'createMsConfig',
            'removeMsConfig',
            'setSecretaryNumbers'
        ]),
        openMsConfigRemovalDialog (msConfigId) {
            if (this.$refs.removeDialog) {
                this.$refs.removeDialog.show()
            }
            this.msConfigRemovalRequesting(msConfigId)
        },
        closeMsConfigRemovalDialog () {
            if (this.$refs.removeDialog) {
                this.$refs.removeDialog.hide()
            }
            this.msConfigRemovalCanceled()
        },
        addFormReady () {
            this.loadSubscribers()
            this.loadNumbers()
        }
    }
}
</script>
