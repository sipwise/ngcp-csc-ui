<template>
    <csc-page
        id="csc-page-pbx-sound-sets"
        class="q-pa-lg"
    >
        <csc-list-actions
            class="row justify-center q-mb-xs"
        >
            <template
                v-if="!isSoundSetAddFormEnabled"
                #slot1
            >
                <csc-list-action-button
                    icon="add"
                    color="primary"
                    :label="$t('Add Sound Set')"
                    @click="enableSoundSetAddForm"
                />
            </template>
        </csc-list-actions>
        <q-separator />
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
                :model-value="soundSetListCurrentPage"
                :max="soundSetListLastPage"
                @update:model-value="loadSoundSetListPaginated"
            />
        </div>
        <csc-list-spinner
            v-if="isSoundSetListRequesting || isSoundSetUpdating || isSoundSetRemoving || isSoundSetCreating"
        />
        <q-list
            v-if="!isSoundSetListRequesting && soundSetListVisible && !isSoundSetCreating"
            class="row justify-start items-start"
        >
            <csc-fade
                v-for="(soundSet, index) in soundSetList"
                :key="'csc-fade-' + soundSet.id"
            >
                <csc-pbx-sound-set
                    :key="soundSet.id"
                    :class="'col-xs-12 col-md-6 col-lg-4 csc-item-' + ((index % 2 === 0)?'odd':'even')"
                    :odd="(index % 2) === 0"
                    :loading="isSoundSetLoading(soundSet.id) || isSoundSetUpdating || isSoundSetRemoving"
                    :sound-set="soundSet"
                    @save-as-default="setAsDefaultSoundSet"
                    @remove="openSoundSetRemovalDialog(soundSet.id)"
                />
            </csc-fade>
        </q-list>
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
import CscFade from 'components/transitions/CscFade'
import CscListActions from 'components/CscListActions'
import CscListActionButton from 'components/CscListActionButton'
import CscPbxSoundSet from 'components/pages/PbxConfiguration/CscPbxSoundSet'
import CscListSpinner from 'components/CscListSpinner'
import CscPbxSoundSetAddForm from 'components/pages/PbxConfiguration/CscPbxSoundSetAddForm'
import CscRemoveDialog from 'components/CscRemoveDialog'

export default {
    name: 'CscPagePbxSoundSets',
    components: {
        CscRemoveDialog,
        CscPbxSoundSetAddForm,
        CscListSpinner,
        CscPbxSoundSet,
        CscListActionButton,
        CscListActions,
        CscFade,
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
            'soundSetCreationState',
            'soundSetCreationError',
            'soundSetRemovalState',
            'soundSetRemovalError',
            'soundSetUpdateState',
            'soundSetUpdateError'
        ]),
        ...mapGetters('pbxSoundSets', [
            'isSoundSetListEmpty',
            'isSoundSetListRequesting',
            'isSoundSetAddFormEnabled',
            'isSoundSetListPaginationActive',
            'isSoundSetCreating',
            'isSoundSetLoading',
            'getSoundSetRemoveDialogMessage',
            'getSoundSetCreationToastMessage',
            'getSoundSetRemovalToastMessage',
            'getSoundSetUpdateToastMessage',
            'isSoundSetUpdating',
            'isSoundSetRemoving'
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
            'soundSetRemovalCanceled'
        ]),
        ...mapActions('pbxSoundSets', [
            'loadSoundSetList',
            'createSoundSet',
            'removeSoundSet',
            'setAsDefaultSoundSet'
        ]),
        loadSoundSetListPaginated (page) {
            this.loadSoundSetList({
                page: page
            })
        },
        openSoundSetRemovalDialog (soundSetId) {
            if (this.$refs.removeDialog) {
                this.$refs.removeDialog.show()
            }
            this.soundSetRemovalRequesting(soundSetId)
        },
        closeSoundSetRemovalDialog () {
            this.soundSetRemovalCanceled()
        }
    }
}
</script>
