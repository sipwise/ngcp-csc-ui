<template>
   <csc-page-sticky
        id="csc-page-pbx-sound-set-details"
        ref="pageSticky"
    >
        <template
            v-slot:header
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
                    :error="$v.changes.name.$error"
                    :label="$t('Name')"
                    :disable="!soundSetSelected.customer_id || isSoundSetUpdating"
                    @input="$v.changes.name.$touch"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasNameChanged"
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="!$v.changes.name.$error"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetName"
                        />
                    </template>
                </q-input>
                <q-input
                    v-model="changes.description"
                    :error="$v.changes.description.$error"
                    :label="$t('Description')"
                    :disable="!soundSetSelected.customer_id || isSoundSetUpdating"
                    @input="$v.changes.description.$touch"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasDescriptionChanged"
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="!$v.changes.description.$error"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetDescription"
                        />
                    </template>
                </q-input>

                <q-select
                    v-model="changes.parent_id"
                    v-if="(changes.parent_id && parent) || !changes.parent_id"
                    emit-value
                    map-options
                    :disable="!soundSetSelected.customer_id || isSoundSetUpdating"
                    :options="getParentOptions"
                    :label="$t('Parent')"
                >
                    <template
                        v-if="hasParentChanged"
                        v-slot:append
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
                    :value="soundSetSelected.contract_default"
                    :disable="!soundSetSelected.customer_id || isSoundSetUpdating"
                    @input="saveAsDefault"
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
                        :odd="(index % 2) === 0"
                        ref="soundFiles"
                        icon="music_note"
                        :expanded="expanded[group]"
                        :show-more-menu="false"
                        @toggle="toggle(group)"
                    >
                        <template
                            slot="title"
                        >
                            <csc-list-item-title>
                                {{ group }}
                            </csc-list-item-title>
                        </template>
                        <template
                            slot="body"
                        >
                            <csc-pbx-sound-set-sound
                                v-for="(soundHandle, index) in soundHandleList[group]"
                                :key="soundHandle.id"
                                :odd="(index % 2) === 0"
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
                            slot="actions"
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
import _ from 'lodash'
import {
    mapState, mapGetters, mapMutations, mapActions
} from 'vuex'
import {
    showGlobalError,
    showToast
} from 'src/helpers/ui'
import {
    RequestState
} from 'src/store/common'
import {
    maxLength
} from 'vuelidate/lib/validators'
import CscPbxSoundSetSound from 'components/pages/PbxConfiguration/CscPbxSoundSetSound'
import CscListSpinner from 'components/CscListSpinner'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscPageSticky from 'components/CscPageSticky'
import CscListItem from 'components/CscListItem'
import CscListItemTitle from 'components/CscListItemTitle'

export default {
    name: 'CscPbxSoundSet',
    components: {
        CscInputButtonReset,
        CscInputButtonSave,
        CscListSpinner,
        CscPbxSoundSetSound,
        CscPageSticky,
        CscListItemTitle,
        CscListItem
    },
    async mounted () {
        this.selectSoundSet(this.$route.params.id)
        await this.loadSoundSetResources(this.$route.params.id)
        if (this.soundHandleGroups.length > 0) {
            this.soundHandleGroups.map((group) => {
                this.$set(this.expanded, group, false)
            })
        }
    },
    data () {
        return {
            changes: null,
            expanded: {}
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
            'soundHandleGroups'
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
            return this.changes.parent_id ? this.soundSetList.find((soundSet) => this.changes.parent_id === soundSet.id) : null
        },
        getParentOptions () {
            let parentOptions = [
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
                    this.$set(this.expanded, group, false)

                })
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
            this.$set(this.expanded, group, !this.expanded[group])
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

<style lang="stylus" rel="stylesheet/stylus">
    .csc-pbx-sound-set-sound-list
        margin-top $flex-gutter-sm
</style>
