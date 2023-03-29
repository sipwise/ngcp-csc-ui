<template>
    <csc-page
        id="csc-page-pbx-sound-sets"
        class="q-pa-lg"
    >
        <csc-list-actions
            class="row justify-center q-mb-lg"
        >
            <csc-list-action-button
                v-if="!isSoundSetAddFormEnabled"
                slot="slot1"
                icon="add"
                color="primary"
                :label="$t('Add Sound Set')"
                @click="enableSoundSetAddForm"
            />
        </csc-list-actions>
        <q-slide-transition>
            <div
                v-if="isSoundSetAddFormEnabled"
                class="row justify-center q-mb-lg"
            >
                <csc-pbx-sound-set-add-form
                    class="csc-list-form col-xs-12 col-md-6"
                    :loading="isSoundSetCreating"
                    @cancel="disableSoundSetAddForm"
                    @save="createSoundSet"
                />
            </div>
        </q-slide-transition>
        <div
            v-if="isSoundSetListPaginationActive && soundSetListVisible"
            class="row justify-center"
        >
            <q-pagination
                :value="soundSetListCurrentPage"
                :max="soundSetListLastPage"
                @input="loadSoundSetListPaginated"
            />
        </div>
        <csc-list-spinner
            v-if="isSoundSetListRequesting && !soundSetListVisible"
        />
        <csc-list
            v-if="!isSoundSetListRequesting || soundSetListVisible"
        >
            <csc-fade
                v-for="(soundSet, index) in soundSetList"
                :key="'csc-fade-' + soundSet.id"
            >
                <csc-pbx-sound-set
                    :key="soundSet.id"
                    :odd="(index % 2) === 0"
                    :expanded="isSoundSetExpanded(soundSet.id)"
                    :loading="isSoundSetLoading(soundSet.id)"
                    :sound-set="soundSet"
                    :sound-handles="soundHandleList"
                    :sound-handles-loading="isSoundHandleListRequesting"
                    :sound-files-loading="isSoundFileListRequesting(soundSet.id)"
                    :sound-file-map="soundFileMap"
                    :sound-file-url-map="soundFileUrlMap"
                    :sound-file-upload-state="soundFileUploadState"
                    :sound-file-upload-progress="soundFileUploadProgress"
                    :sound-file-update-state="soundFileUpdateState"
                    @require-sound-handles="loadSoundSetResources(soundSet.id)"
                    @remove="openSoundSetRemovalDialog(soundSet.id)"
                    @save-as-default="setAsDefaultSoundSet"
                    @save-name="setSoundSetName"
                    @save-description="setSoundSetDescription"
                    @save-parent="setSoundSetParent"
                    @expand="expandSoundSet(soundSet.id)"
                    @collapse="collapseSoundSet"
                    @play-sound-file="playSoundFile"
                    @upload-sound-file="uploadSoundFile"
                    @toggle-loop-play="setLoopPlay"
                />
            </csc-fade>
        </csc-list>
        <div
            v-if="isSoundSetListEmpty && !isSoundSetListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('No sound sets created yet') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('Remove sound set')"
            :message="getSoundSetRemoveDialogMessage"
            @remove="removeSoundSet"
            @cancel="closeSoundSetRemovalDialog"
        />
    </csc-page>
</template>

<script>
import {
    showGlobalError,
    showToast
} from 'src/helpers/ui'
import {
    CreationState,
    RequestState
} from 'src/store/common'
import {
    mapMutations,
    mapActions,
    mapState,
    mapGetters
} from 'vuex'
import CscPage from 'components/CscPage'
import CscList from 'components/CscList'
import CscFade from 'components/transitions/CscFade'
import CscListActions from 'components/CscListActions'
import CscListActionButton from 'components/CscListActionButton'
import CscPbxSoundSet from 'components/pages/PbxConfiguration/CscPbxSoundSet'
import CscListSpinner from 'components/CscListSpinner'
import CscPbxSoundSetAddForm from 'components/pages/PbxConfiguration/CscPbxSoundSetAddForm'
import CscRemoveDialog from 'components/CscRemoveDialog'

export default {
    components: {
        CscRemoveDialog,
        CscPbxSoundSetAddForm,
        CscListSpinner,
        CscPbxSoundSet,
        CscListActionButton,
        CscListActions,
        CscFade,
        CscList,
        CscPage
    },
    data () {
        return {
        }
    },
    computed: {
        ...mapState('pbxSoundSets', [
            'soundSetListVisible',
            'soundSetList',
            'soundSetListCurrentPage',
            'soundSetListLastPage',
            'soundHandleList',
            'soundFileMap',
            'soundFileUrlMap',
            'soundFileUploadState',
            'soundFileUploadProgress',
            'soundFileUpdateState',
            'soundSetCreationState',
            'soundSetCreationError',
            'soundSetUpdateState',
            'soundSetUpdateError',
            'soundSetRemovalState',
            'soundSetRemovalError'
        ]),
        ...mapGetters('pbxSoundSets', [
            'isSoundSetListEmpty',
            'isSoundSetListRequesting',
            'isSoundSetAddFormEnabled',
            'isSoundSetListPaginationActive',
            'isSoundSetCreating',
            'isSoundSetUpdating',
            'isSoundSetLoading',
            'isSoundSetExpanded',
            'getSoundSetRemoveDialogMessage',
            'isSoundHandleListRequesting',
            'isSoundFileListRequesting',
            'getSoundSetCreationToastMessage',
            'getSoundSetUpdateToastMessage',
            'getSoundSetRemovalToastMessage'
        ])
    },
    watch: {
        soundSetCreationState (state) {
            if (state === CreationState.created) {
                this.$scrollTo(this.$parent.$el)
                showToast(this.getSoundSetCreationToastMessage)
            } else if (state === CreationState.error) {
                showGlobalError(this.soundSetCreationError)
            }
        },
        soundSetUpdateState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.getSoundSetUpdateToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.soundSetUpdateError)
            }
        },
        soundSetRemovalState (state) {
            if (state === RequestState.succeeded) {
                this.$scrollTo(this.$parent.$el)
                showToast(this.getSoundSetRemovalToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.soundSetRemovalError)
            }
        }
    },
    mounted () {
        this.loadSoundSetList()
    },
    methods: {
        ...mapMutations('pbxSoundSets', [
            'enableSoundSetAddForm',
            'disableSoundSetAddForm',
            'soundSetRemovalRequesting',
            'soundSetRemovalCanceled',
            'expandSoundSet',
            'collapseSoundSet'
        ]),
        ...mapActions('pbxSoundSets', [
            'loadSoundSetList',
            'createSoundSet',
            'removeSoundSet',
            'setAsDefaultSoundSet',
            'setSoundSetName',
            'setSoundSetDescription',
            'setSoundSetParent',
            'loadSoundSetResources',
            'playSoundFile',
            'uploadSoundFile',
            'setLoopPlay'
        ]),
        loadSoundSetListPaginated (page) {
            this.loadSoundSetList({
                page: page
            })
        },
        openSoundSetRemovalDialog (soundSetId) {
            if (this.$refs.removeDialog) {
                this.$refs.removeDialog.open()
            }
            this.soundSetRemovalRequesting(soundSetId)
        },
        closeSoundSetRemovalDialog () {
            this.soundSetRemovalCanceled()
        }
    }
}
</script>
