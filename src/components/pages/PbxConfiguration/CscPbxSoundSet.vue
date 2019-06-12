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
    <!--<q-item-->
        <!--:class="itemClasses"-->
    <!--&gt;-->
        <!--<q-item-side-->
            <!--v-show="!expanded"-->
        <!--&gt;-->
            <!--<q-icon-->
                <!--size="24px"-->
                <!--name="queue_music"-->
                <!--color="white"-->
            <!--/>-->
        <!--</q-item-side>-->
        <!--<q-item-main>-->
            <!--<q-item-tile-->
                <!--v-show="!expanded"-->
                <!--class="csc-item-title"-->
                <!--label-->
            <!--&gt;-->
                <!--{{ set.name }}-->
            <!--</q-item-tile>-->
            <!--<q-item-tile-->
                <!--v-show="!expanded"-->
                <!--class="csc-item-subtitle"-->
                <!--sublabel-->
            <!--&gt;-->
                <!--<div>-->
                    <!--<span class="csc-item-label">-->
                        <!--{{ $t('pbxConfig.description') }}:-->
                    <!--</span>-->
                    <!--<span class="csc-item-value">-->
                        <!--{{ setDescription }}-->
                    <!--</span>-->
                <!--</div>-->
            <!--</q-item-tile>-->
            <!--<q-item-tile-->
                <!--v-show="!expanded"-->
                <!--class="csc-item-subtitle"-->
                <!--sublabel-->
            <!--&gt;-->
                <!--<div-->
                    <!--v-if="invalid"-->
                    <!--class="csc-form-info"-->
                <!--&gt;-->
                    <!--<q-icon name="info" color="negative" size="24px"/>-->
                    <!--<span class="csc-info-text">{{ validityLabel }}</span>-->
                <!--</div>-->
            <!--</q-item-tile>-->
            <!--<q-item-tile-->
                <!--v-show="expanded"-->
                <!--class="csc-list-item-main"-->
            <!--&gt;-->
                <!--<q-field-->
                    <!--class="csc-form-field"-->
                    <!--:label="$t('pbxConfig.name')"-->
                    <!--:error-label="nameErrorMessage"-->
                <!--&gt;-->
                    <!--<q-input-->
                        <!--dark-->
                        <!--v-model="changes.name"-->
                        <!--:after="nameButtons"-->
                        <!--@keyup.enter="saveName"-->
                        <!--@input="$v.changes.name.$touch"-->
                        <!--@blur="$v.changes.name.$touch"-->
                        <!--:error="$v.changes.name.$error"-->
                    <!--/>-->
                <!--</q-field>-->
                <!--<q-field-->
                    <!--class="csc-form-field"-->
                    <!--:label="$t('pbxConfig.description')"-->
                    <!--:error-label="descriptionErrorMessage"-->
                <!--&gt;-->
                    <!--<q-input-->
                        <!--dark-->
                        <!--v-model="changes.description"-->
                        <!--:after="descriptionButtons"-->
                        <!--@keyup.enter="saveDescription"-->
                        <!--@input="$v.changes.description.$touch"-->
                        <!--@blur="$v.changes.description.$touch"-->
                        <!--:error="$v.changes.description.$error"-->
                    <!--/>-->
                <!--</q-field>-->
                <!--<q-field-->
                    <!--dark-->
                    <!--class="csc-form-field"-->
                    <!--:label="$t('pbxConfig.defaultForSubscribers')"-->
                <!--&gt;-->
                    <!--<q-toggle-->
                        <!--:class="contractDefaultClasses"-->
                        <!--v-model="changes.contract_default"-->
                        <!--@input="toggleContractDefault"-->
                        <!--checked-icon="check_circle"-->
                        <!--unchecked-icon="check_circle"-->
                    <!--/>-->
                <!--</q-field>-->
            <!--</q-item-tile>-->
            <!--<q-item-tile-->
                <!--class="csc-list-collapsible"-->
                <!--v-show="expanded"-->
            <!--&gt;-->
                <!--<div class="csc-sublabel">-->
                    <!--{{ $t('pbxConfig.groups') }}-->
                <!--</div>-->
                <!--<csc-pbx-sound-group-->
                    <!--v-for="(group, index) in set.groups"-->
                    <!--:invalid-group="invalidGroup(group)"-->
                    <!--:group="group"-->
                    <!--:group-label="groupLabel(group.name)"-->
                    <!--:set-id="set.id"-->
                    <!--:key="index"-->
                    <!--@remove-file="removeFile"-->
                    <!--@toggle-loop="toggleLoop"-->
                <!--/>-->
            <!--</q-item-tile>-->
        <!--</q-item-main>-->
        <!--<q-item-side-->
            <!--right-->
            <!--class="csc-list-actions-pinned"-->
        <!--&gt;-->
            <!--<q-item-tile>-->
                <!--<q-btn-->
                    <!--v-show="expanded"-->
                    <!--icon="delete"-->
                    <!--:big="mobile"-->
                    <!--color="negative"-->
                    <!--flat-->
                    <!--@click="remove()"-->
                <!--/>-->
                <!--<q-btn-->
                    <!--:icon="titleIcon"-->
                    <!--:big="mobile"-->
                    <!--color="primary"-->
                    <!--flat-->
                    <!--@click="toggleMain()"-->
                <!--/>-->
            <!--</q-item-tile>-->
        <!--</q-item-side>-->
        <!--<csc-object-spinner-->
            <!--v-if="loading"-->
            <!--:loading="loading"-->
        <!--/>-->
    <!--</q-item>-->
</template>

<script>
    // import CscPbxSoundGroup from './CscPbxSoundGroup'
    import {
        // QItem,
        // QItemSide,
        // QItemMain,
        // QItemTile,
        // QBtn,
        // QIcon,
        // QField,
        // QInput,
        // QInnerLoading,
        // QSpinnerDots,
        // QToggle,
        // QTooltip
        QSlideTransition,
        QCheckbox,
        QField,
        QInput
    } from 'quasar-framework'
    import {
        maxLength
    } from 'vuelidate/lib/validators'
    // import {
    //     mapGetters
    // } from 'vuex'
    // import {
    //     showGlobalError
    // } from '../../../helpers/ui'
    // import CscObjectSpinner from "../../CscObjectSpinner";
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
            // CscObjectSpinner,
            // CscPbxSoundGroup,
            // QItem,
            // QItemSide,
            // QItemMain,
            // QItemTile,
            // QBtn,
            // QIcon,
            // QField,
            // QInput,
            // QInnerLoading,
            // QSpinnerDots,
            // QToggle,
            // QTooltip
        },
        data () {
            return {
                // expanded: false,
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
            // ...mapGetters('pbxConfig', [
            //     'groupLabel'
            // ]),
            // itemClasses() {
            //     let classes = ['csc-list-item'];
            //     if (this.expanded) {
            //         classes.push('csc-item-expanded');
            //     }
            //     else {
            //         classes.push('csc-item-collapsed');
            //     }
            //     return classes;
            // },
            // titleIcon() {
            //     if(!this.expanded) {
            //         return 'keyboard arrow down';
            //     }
            //     else {
            //         return 'keyboard arrow up';
            //     }
            // },
            // name() {
            //     return this.set.name;
            // },
            // nameHasChanged() {
            //     return this.name + "" !== this.changes.name + "";
            // },
            // description() {
            //     return this.set.description;
            // },
            // descriptionHasChanged() {
            //     return this.description + "" !== this.changes.description + "";
            // },
            // nameButtons() {
            //     let buttons = [];
            //     let self = this;
            //     if (this.nameHasChanged && this.$v.changes.name.$error) {
            //         buttons.push({
            //                 icon: 'clear',
            //                 error: true,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.resetName();
            //                 }
            //             }
            //         );
            //     }
            //     else if (this.nameHasChanged) {
            //         buttons.push({
            //                 icon: 'check',
            //                 error: false,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.saveName();
            //                 }
            //             }, {
            //                 icon: 'clear',
            //                 error: false,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.resetName();
            //                 }
            //             }
            //         );
            //     }
            //     return buttons;
            // },
            // descriptionButtons() {
            //     let buttons = [];
            //     let self = this;
            //     if (this.descriptionHasChanged && this.$v.changes.description.$error) {
            //         buttons.push({
            //                 icon: 'clear',
            //                 error: true,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.resetDescription();
            //                 }
            //             }
            //         );
            //     }
            //     else if (this.descriptionHasChanged) {
            //         buttons.push({
            //                 icon: 'check',
            //                 error: false,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.saveDescription();
            //                 }
            //             }, {
            //                 icon: 'clear',
            //                 error: false,
            //                 handler (event) {
            //                     event.stopPropagation();
            //                     self.resetDescription();
            //                 }
            //             }
            //         );
            //     }
            //     return buttons;
            // },
            // setModel() {
            //     return {
            //         id: this.set.id,
            //         name: this.changes.name,
            //         description: this.changes.description,
            //         contract_default: this.changes.contract_default
            //     }
            // },
            // contractDefaultClasses() {
            //     let classes = [];
            //     if(this.attach) {
            //         classes.push('csc-toggle-enabled');
            //     }
            //     else {
            //         classes.push('csc-toggle-disabled');
            //     }
            //     return classes;
            // },
            // nameErrorMessage() {
            //     if (!this.$v.changes.name.maxLength) {
            //         return this.$t('validationErrors.maxLength', {
            //             field: this.$t('pbxConfig.name'),
            //             maxLength: this.$v.changes.name.$params.maxLength.max
            //         });
            //     }
            // },
            // descriptionErrorMessage() {
            //     if (!this.$v.changes.description.maxLength) {
            //         return this.$t('validationErrors.maxLength', {
            //             field: this.$t('pbxConfig.description'),
            //             maxLength: this.$v.changes.description.$params.maxLength.max
            //         });
            //     }
            // },
            // isLoading() {
            //     return this.loading;
            // },
            // setDescription() {
            //     let descriptionLength = this.set.description.length;
            //     if (this.mobile && descriptionLength > 17) {
            //         return this.set.description.substring(0, 14) + '...';
            //     }
            //     else if (!this.mobile && descriptionLength > 67) {
            //         return this.set.description.substring(0, 64) + '...';
            //     }
            //     else {
            //         return this.set.description;
            //     }
            // },
            // tooltipLabel() {
            //     if (this.invalidCount === 1) {
            //         return this.$t('pbxConfig.invalidFileText', { amount: this.invalidCount });
            //     }
            //     else if (this.invalidCount > 1) {
            //         return this.$t('pbxConfig.invalidFilesText', { amount: this.invalidCount });
            //     }
            // },
            // validityLabel() {
            //     let invalidFileMultiple = this.invalidCount > 1;
            //     if (this.mobile) {
            //         return this.$t('pbxConfig.invalidTextMobile', { amount: this.invalidCount });
            //     }
            //     else if (invalidFileMultiple) {
            //         return this.$t('pbxConfig.invalidFilesText', { amount: this.invalidCount });
            //     }
            //     else {
            //         return this.$t('pbxConfig.invalidFileText', { amount: this.invalidCount });
            //     }
            // }
            hasNameChanged() {
                return this.changes.name !== this.getDefaultData().name;
            },
            hasDescriptionChanged() {
                return this.changes.description !== this.getDefaultData().description;
            }
        },
        methods: {
            saveAsDefault() {
                if(!this.soundSet.contract_default) {
                    this.$emit('save-as-default');
                }
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
            // toggleMain() {
            //     this.expanded = !this.expanded;
            // },
            // remove() {
            //     this.$emit('remove', this.set);
            // },
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
            // resetName() {
            //     this.changes.name = this.set.name;
            // },
            // saveName() {
            //     if (this.$v.changes.$invalid) {
            //         showGlobalError(this.$t('validationErrors.generic'));
            //     }
            //     else if (this.nameHasChanged) {
            //         this.$emit('save-name', this.setModel);
            //     }
            // },
            // resetDescription() {
            //     this.changes.description = this.set.description;
            // },
            // saveDescription() {
            //     if (this.$v.changes.$invalid) {
            //         showGlobalError(this.$t('validationErrors.generic'));
            //     }
            //     else if (this.descriptionHasChanged) {
            //         this.$emit('save-description', this.setModel);
            //     }
            // },
            // toggleContractDefault() {
            //     if (this.$v.changes.$invalid) {
            //         showGlobalError(this.$t('validationErrors.generic'));
            //     }
            //     else {
            //         this.$emit('save-contract-default', this.setModel);
            //     }
            // },
            // invalidGroup(group) {
            //     let count = 0;
            //     group.handles.forEach((handle) => {
            //         if (handle.filename.length === 0) {
            //             count++;
            //         }
            //     });
            //     return count > 0;
            // },
            // removeFile(item) {
            //     let options = {
            //         id: item.id,
            //         handle: item.handle,
            //         soundSet: this.setModel
            //     };
            //     this.$emit('remove-file', options);
            // },
            // toggleLoop(item) {
            //     let options = {
            //         id: item.id,
            //         loopplay: item.loopplay,
            //         soundSet: this.setModel
            //     };
            //     this.$emit('toggle-loop', options);
            // }
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
</style>
