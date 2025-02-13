<template>
    <csc-page-sticky
        id="csc-page-pbx-sound-set-details"
        ref="pageSticky"
    >
        <template
            #header
        >
            <q-breadcrumbs
                v-if="soundSetSelected"
                class="absolute-left q-ml-md text-weight-light"
                active-color="primary"
                separator-color="primary"
            >
                <q-breadcrumbs-el
                    key="soundSets"
                    class="cursor-pointer"
                    to="/user/pbx-configuration/sound-sets"
                    :label="$t('Sound Sets')"
                    icon="queue_music"
                />
                <q-breadcrumbs-el
                    key="soundSet"
                    :label="soundSetSelected.name"
                />
            </q-breadcrumbs>
        </template>
        <q-item
            class="col col-xs-12"
        >
            <q-list
                v-if="changes"
                class="col col-xs-12"
                side
                top
                no-wrap
            >
                <q-input
                    v-model="changes.name"
                    :error="v$.changes.name.$errors.length > 0"
                    :label="$t('Name')"
                    :disable="!soundSetSelected.customer_id || isSoundSetUpdating"
                    @update:model-value="v$.changes.name.$touch()"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasNameChanged"
                        #append
                    >
                        <csc-input-button-save
                            v-if="v$.changes.name.$errors.length <= 0"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetName"
                        />
                    </template>
                </q-input>
                <q-input
                    v-model="changes.description"
                    :error="v$.changes.description.$errors.length > 0"
                    :label="$t('Description')"
                    :disable="!soundSetSelected.customer_id || isSoundSetUpdating"
                    @update:model-value="v$.changes.description.$touch()"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasDescriptionChanged"
                        #append
                    >
                        <csc-input-button-save
                            v-if="v$.changes.description.$errors.length <= 0"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetDescription"
                        />
                    </template>
                </q-input>

                <q-select
                    v-if="(changes.parent_id && parent) || !changes.parent_id"
                    v-model="changes.parent_id"
                    emit-value
                    map-options
                    :disable="!soundSetSelected.customer_id || isSoundSetUpdating"
                    :options="getParentOptions"
                    :label="$t('Parent')"
                >
                    <template
                        v-if="hasParentChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetParent"
                        />
                    </template>
                </q-select>
                <q-checkbox
                    :label="$t('Default sound set for all seats and groups')"
                    :model-value="soundSetSelected.contract_default"
                    :disable="!soundSetSelected.customer_id || isSoundSetUpdating"
                    @update:model-value="saveAsDefault"
                />
                <csc-list-spinner
                    v-if="isSoundHandleListRequesting || isSoundFileListRequesting(soundSetSelected.id)"
                />
                <div
                    v-if="!isSoundHandleListRequesting && !isSoundFileListRequesting(soundSetSelected.id) && soundHandleGroups.length > 0"
                    class="csc-pbx-sound-set-sound-list"
                >
                    <csc-list-item
                        v-for="(group, index) in soundHandleGroups"
                        :key="group"
                        ref="soundFiles"
                        :odd="(index % 2) === 0"
                        icon="music_note"
                        :expanded="expanded[group]"
                        :show-more-menu="false"
                        @toggle="toggle(group)"
                    >
                        <template
                            #title
                        >
                            <csc-list-item-title>
                                {{ group }}
                            </csc-list-item-title>
                        </template>
                        <template
                            #body
                        >
                            <csc-pbx-sound-set-sound
                                v-for="(soundHandle, indexSoundHandle) in soundHandleList[group]"
                                :key="soundHandle.id"
                                :odd="(indexSoundHandle % 2) === 0"
                                :sound-handle="soundHandle"
                                :sound-file="soundFileMap[soundSetSelected.id + '-' + soundHandle.handle]"
                                :sound-file-url="soundFileUrlMap[soundSetSelected.id + '-' + soundHandle.handle]"
                                :sound-file-upload-state="soundFileUploadState[soundSetSelected.id + '-' + soundHandle.handle]"
                                :sound-file-upload-progress="soundFileUploadProgress[soundSetSelected.id + '-' + soundHandle.handle]"
                                :sound-file-update-state="soundFileUpdateState[soundSetSelected.id + '-' + soundHandle.handle]"
                                :has-parent="soundSetSelected.parent_id"
                                :read-only="!soundSetSelected.customer_id"
                                @play="playSoundFile"
                                @upload="uploadFile"
                                @toggle-loop-play="setLoopPlay"
                                @toggle-use-parent="setUseParent"
                                @remove-uploaded-file="removeUploadedFile"
                            />
                        </template>
                        <template
                            #actions
                        >
                            <q-btn
                                size="md"
                                color="primary"
                                round
                                flat
                                :icon="expanded[group] ? 'expand_less' : 'expand_more'"
                                @click.stop="toggle(group)"
                            />
                        </template>
                    </csc-list-item>
                </div>
            </q-list>
        </q-item>
    </csc-page-sticky>
</template>

<script>
import useValidate from '@vuelidate/core'
import { maxLength } from '@vuelidate/validators'
import CscListItem from 'components/CscListItem'
import CscListItemTitle from 'components/CscListItemTitle'
import CscListSpinner from 'components/CscListSpinner'
import CscPageSticky from 'components/CscPageSticky'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscPbxSoundSetSound from 'components/pages/PbxConfiguration/CscPbxSoundSetSound'
import _ from 'lodash'
import {
    showGlobalError,
    showToast
} from 'src/helpers/ui'
import { RequestState } from 'src/store/common'
import {
    mapActions,
    mapGetters, mapMutations,
    mapState
} from 'vuex'
export default {
    name: 'CscPagePbxSoundSetDetails',
    components: {
        CscInputButtonReset,
        CscInputButtonSave,
        CscListSpinner,
        CscPbxSoundSetSound,
        CscPageSticky,
        CscListItemTitle,
        CscListItem
    },
    data () {
        return {
            changes: null,
            expanded: {},
            v$: useValidate()
        }
    },
    computed: {
        ...mapState('pbxSoundSets', [
            'soundSetList',
            'soundSetUpdateState',
            'soundSetUpdateError',
            'soundSetSelected',
            'soundHandleList',
            'soundFileMap',
            'soundFileUrlMap',
            'soundFileUploadState',
            'soundFileUploadProgress',
            'soundFileUpdateState',
            'soundHandleGroups',
            'soundHandleListState',
            'soundHandleListError',
            'soundFileListStates',
            'soundFileError',
            'soundFileRemoveError',
            'soundFileState',
            'soundFileUploadState',
            'soundFileUploadError',
            'soundFileUpdateError',
            'soundFileRemoveState'
        ]),
        ...mapGetters('pbxSoundSets', [
            'isSoundFileListRequesting',
            'getSoundSetUpdateToastMessage',
            'isSoundHandleListRequesting',
            'isSoundSetUpdating'
        ]),
        hasNameChanged () {
            return this.changes.name !== this.getSoundSetData().name
        },
        hasDescriptionChanged () {
            return this.changes.description !== this.getSoundSetData().description
        },
        parent () {
            return this.changes.parent_id ? this.soundSetList.find((soundSet) => this.changes.parent_id === soundSet.id)
                : null
        },
        getParentOptions () {
            const parentOptions = [
                {
                    label: this.$t('Unassigned'),
                    value: null
                }
            ]
            this.soundSetList.map((soundSet) => {
                if (soundSet.id !== this.soundSetSelected.id) {
                    parentOptions.push({
                        label: soundSet.name,
                        value: soundSet.id
                    })
                }
                return soundSet
            })
            return parentOptions
        },
        hasParentChanged () {
            return this.changes.parent_id !== this.getSoundSetData().parent_id
        }
    },
    watch: {
        soundSetUpdateState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.getSoundSetUpdateToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.soundSetUpdateError)
            }
        },
        soundSetSelected () {
            this.changes = this.getSoundSetData()
        },
        soundHandleGroups (state) {
            if (state.length > 0) {
                state.map((group) => {
                    _.set(this.expanded, group, false)
                    return group
                })
            }
        },
        soundHandleListState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.soundHandleListError)
            }
        },
        soundFileListStates: {
            deep: true,
            handler (state) {
                if (state[state.soundSetId] === RequestState.failed) {
                    showGlobalError(this.soundFileError)
                }
            }
        },
        soundFileState: {
            deep: true,
            handler (state) {
                if (state[this.soundSetSelected.id] === RequestState.failed) {
                    showGlobalError(this.soundFileError)
                }
            }
        },
        soundFileUploadState: {
            deep: true,
            handler (state) {
                if (Object.values(state).includes(RequestState.failed)) {
                    showGlobalError(this.soundFileUploadError)
                }
            }
        },
        soundFileUpdateState: {
            deep: true,
            handler (state) {
                if (Object.values(state).includes(RequestState.failed)) {
                    showGlobalError(this.soundFileUpdateError)
                }
            }
        },
        soundFileRemoveState: {
            deep: true,
            handler (state) {
                if (Object.values(state).includes(RequestState.failed)) {
                    showGlobalError(this.soundFileRemoveError)
                }
            }
        }
    },
    async mounted () {
        this.selectSoundSet(this.$route.params.id)
        await this.loadSoundSetResources(this.$route.params.id)
        if (this.soundHandleGroups.length > 0) {
            this.soundHandleGroups.map((group) => {
                _.set(this.expanded, group, false)
                return group
            })
        }
    },
    validations: {
        changes: {
            name: {
                maxLength: maxLength(64)
            },
            description: {
                maxLength: maxLength(255)
            }
        }
    },
    methods: {
        ...mapMutations('pbxSoundSets', [
            'selectSoundSet'
        ]),
        ...mapActions('pbxSoundSets', [
            'loadSoundSetResources',
            'setAsDefaultSoundSet',
            'playSoundFile',
            'uploadSoundFile',
            'setLoopPlay',
            'setUseParent',
            'removeSoundFile',
            'setSoundSetName',
            'setSoundSetDescription',
            'setSoundSetParent'
        ]),
        saveAsDefault () {
            this.setAsDefaultSoundSet({
                soundSetId: this.soundSetSelected.id,
                contractDefault: !this.soundSetSelected.contract_default
            })
        },
        getSoundSetData () {
            return {
                name: this.soundSetSelected.name,
                description: this.soundSetSelected.description,
                contract_default: this.soundSetSelected.contract_default,
                parent_id: this.soundSetSelected.parent_id,
                customer_id: this.soundSetSelected.customer_id
            }
        },
        resetName () {
            this.changes.name = this.getSoundSetData().name
        },
        resetDescription () {
            this.changes.description = this.getSoundSetData().description
        },
        resetParent () {
            this.changes.parent_id = this.getSoundSetData().parent_id
        },
        uploadFile (options) {
            this.uploadSoundFile({
                soundSetId: this.soundSetSelected.id,
                soundHandle: options.soundHandle,
                soundFileData: options.soundFileData
            })
        },
        removeUploadedFile (options) {
            this.removeSoundFile(options)
        },
        toggle (group) {
            _.set(this.expanded, group, !this.expanded[group])
        },
        save () {
            if (this.hasNameChanged) {
                this.setSoundSetName({
                    soundSetId: this.soundSetSelected.id,
                    name: this.changes.name
                })
            }
            if (this.hasDescriptionChanged) {
                this.setSoundSetDescription({
                    soundSetId: this.soundSetSelected.id,
                    description: this.changes.description
                })
            }
            if (this.hasParentChanged) {
                this.setSoundSetParent({
                    soundSetId: this.soundSetSelected.id,
                    parent_id: this.changes.parent_id
                })
            }
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
.csc-pbx-sound-set-sound-list
    margin-top: $flex-gutter-sm
</style>
