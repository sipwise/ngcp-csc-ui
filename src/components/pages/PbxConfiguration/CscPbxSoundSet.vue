<template>
    <csc-list-item
        ref="listItem"
        icon="queue_music"
        :odd="odd"
        :loading="loading"
        :expanded="expanded"
        @toggle="toggle"
    >
        <template
            slot="title"
        >
            <csc-list-item-title
            >
                {{ soundSet.name }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded && soundSet.description"
                >
                    {{ soundSet.description }}
                </csc-list-item-subtitle>
            </q-slide-transition>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    <q-checkbox
                        :value="soundSet.contract_default"
                        :label="$t('pbxConfig.soundSetContractDefault')"
                        :left-label="true"
                        @change="saveAsDefault"
                    />
                </csc-list-item-subtitle>
            </q-slide-transition>
        </template>
        <template
            slot="body"
        >
            <q-field
                dark
                :label="$t('pbxConfig.soundSetName')"
            >
                <q-input
                    dark
                    v-model="changes.name"
                    :error="$v.changes.name.$error"
                    @input="$v.changes.name.$touch"
                    @keyup.enter="saveName"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasNameChanged && !$v.changes.name.$error"
                        @click="saveName"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasNameChanged"
                        @click="resetName"
                    />
                </csc-fade>
            </q-field>
            <q-field
                dark
                :label="$t('pbxConfig.soundSetDescription')"
            >
                <q-input
                    dark
                    v-model="changes.description"
                    :error="$v.changes.description.$error"
                    @input="$v.changes.description.$touch"
                    @keyup.enter="saveDescription"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasDescriptionChanged && !$v.changes.description.$error"
                        @click="saveDescription"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasDescriptionChanged"
                        @click="resetDescription"
                    />
                </csc-fade>
            </q-field>
            <q-field
                dark
                :label="$t('pbxConfig.soundSetDefault')"
            >
                <q-checkbox
                    dark
                    :value="soundSet.contract_default"
                    @change="saveAsDefault"
                />
            </q-field>
            <csc-list-spinner
                v-if="soundHandlesLoading || soundFilesLoading"
            />
            <div
                v-if="!soundHandlesLoading && soundHandles.length > 0 && !soundFilesLoading"
                class="csc-pbx-sound-set-sound-list"
            >
                <csc-fade
                    v-for="(soundHandle, index) in soundHandles"
                    :key="'csc-fade-' + soundHandle.id"
                >
                    <csc-pbx-sound-set-sound
                        :key="soundHandle.id"
                        :odd="(index % 2) === 0"
                        :sound-handle="soundHandle"
                        :sound-file="soundFileMap[soundSet.id + '-' + soundHandle.handle]"
                        :sound-file-url="soundFileUrlMap[soundSet.id + '-' + soundHandle.handle]"
                        :sound-file-upload-state="soundFileUploadState[soundSet.id + '-' + soundHandle.handle]"
                        :sound-file-upload-progress="soundFileUploadProgress[soundSet.id + '-' + soundHandle.handle]"
                        :sound-file-update-state="soundFileUpdateState[soundSet.id + '-' + soundHandle.handle]"
                        @play="playSoundFile"
                        @upload="uploadSoundFile"
                        @toggle-loop-play="toggleLoopPlay"
                    />
                </csc-fade>
            </div>
        </template>
        <template slot="menu">
            <csc-list-menu-item
                icon="delete"
                icon-color="negative"
                @click="remove"
            >
                {{ $t('buttons.remove') }}
            </csc-list-menu-item>
        </template>
    </csc-list-item>
</template>

<script>
    import {
        QSlideTransition,
        QCheckbox,
        QField,
        QInput
    } from 'quasar-framework'
    import {
        maxLength
    } from 'vuelidate/lib/validators'
    import CscListItem from "../../CscListItem";
    import CscListItemTitle from "../../CscListItemTitle";
    import CscListItemSubtitle from "../../CscListItemSubtitle";
    import CscListMenuItem from "../../CscListMenuItem";
    import CscFade from "../../transitions/CscFade";
    import CscFormSaveButton from "../../form/CscFormSaveButton";
    import CscFormResetButton from "../../form/CscFormResetButton";
    import CscPbxSoundSetSound from "./CscPbxSoundSetSound";
    import CscListSpinner from "../../CscListSpinner";
    export default {
        name: 'csc-pbx-sound-set',
        props: [
            'odd',
            'loading',
            'expanded',
            'soundSet',
            'soundHandles',
            'soundHandlesLoading',
            'soundFileMap',
            'soundFilesLoading',
            'soundFileUrlMap',
            'soundFileUploadState',
            'soundFileUploadProgress',
            'soundFileUpdateState'
        ],
        components: {
            CscListSpinner,
            CscPbxSoundSetSound,
            CscFormResetButton,
            CscFormSaveButton,
            CscFade,
            CscListMenuItem,
            CscListItemSubtitle,
            CscListItemTitle,
            CscListItem,
            QSlideTransition,
            QCheckbox,
            QField,
            QInput
        },
        data () {
            return {
                changes: this.getDefaultData()
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
            },
        },
        computed: {
            hasNameChanged() {
                return this.changes.name !== this.getDefaultData().name;
            },
            hasDescriptionChanged() {
                return this.changes.description !== this.getDefaultData().description;
            }
        },
        methods: {
            saveAsDefault() {
                this.$emit('save-as-default', {
                    soundSetId: this.soundSet.id,
                    contractDefault: !this.soundSet.contract_default
                });
            },
            remove() {
                if(this.$refs.listItem) {
                    this.$refs.listItem.closePopoverMenu();
                }
                this.$emit('remove', this.soundSet.id);
            },
            toggle() {
                if(this.expanded) {
                    this.$emit('collapse');
                }
                else {
                    this.$emit('expand');
                }
            },
            getDefaultData() {
                return {
                    name: this.soundSet.name,
                    description: this.soundSet.description,
                    contract_default: this.soundSet.contract_default
                }
            },
            saveName() {
                if(this.hasNameChanged) {
                    this.$emit('save-name', {
                        soundSetId: this.soundSet.id,
                        name: this.changes.name
                    });
                }
            },
            resetName() {
                this.changes.name = this.getDefaultData().name;
            },
            saveDescription() {
                if(this.hasDescriptionChanged) {
                    this.$emit('save-description', {
                        soundSetId: this.soundSet.id,
                        description: this.changes.description
                    });
                }
            },
            resetDescription() {
                this.changes.description = this.getDefaultData().description;
            },
            playSoundFile(data) {
                this.$emit('play-sound-file', data);
            },
            uploadSoundFile(options) {
                this.$emit('upload-sound-file', {
                    soundSetId: this.soundSet.id,
                    soundHandle: options.soundHandle,
                    soundFileData: options.soundFileData
                });
            },
            toggleLoopPlay(options) {
                this.$emit('toggle-loop-play', options);
            }
        },
        watch: {
            expanded(expanded) {
                if(expanded) {
                    this.$emit('require-sound-handles');
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
    .csc-pbx-sound-set-sound-list
        margin-top $flex-gutter-sm
</style>
