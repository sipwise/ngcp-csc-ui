<template>
    <csc-page
        :is-list="true"
    >
        <csc-list-actions>
            <csc-list-action-button
                v-if="!isSoundSetAddFormEnabled"
                slot="slot1"
                icon="add"
                color="primary"
                :label="$t('pbxConfig.addSoundSet')"
                @click="enableSoundSetAddForm"
            />
        </csc-list-actions>
        <q-slide-transition>
            <div
                v-if="isSoundSetAddFormEnabled"
                class="row justify-center"
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
                @change="loadSoundSetListPaginated"
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
                    :soundSet="soundSet"
                    @require-sound-handles=""
                    @play-sound="playSoundSetSound(soundSet.id)"
                    @remove="openSoundSetRemovalDialog(soundSet.id)"
                    @save-as-default="setAsDefaultSoundSet(soundSet.id)"
                    @save-name="setSoundSetName"
                    @save-description="setSoundSetDescription"
                    @expand="expandSoundSet(soundSet.id)"
                    @collapse="collapseSoundSet"
                />
            </csc-fade>
        </csc-list>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.soundSetRemovalDialogTitle')"
            :message="getSoundSetRemoveDialogMessage"
            @remove="removeSoundSet"
            @cancel="closeSoundSetRemovalDialog"
        />
        <!--<div-->
            <!--v-show="addFormEnabled"-->
            <!--class="row justify-center"-->
        <!--&gt;-->
            <!--<csc-pbx-sound-set-add-form-->
                <!--ref="addForm"-->
                <!--class="col-xs-12 col-md-6 csc-list-form"-->
                <!--:loading="isAdding"-->
                <!--@save="addSoundSet"-->
                <!--@cancel="disableAddForm"-->
            <!--/>-->
        <!--</div>-->
        <!--<div-->
            <!--v-show="!addFormEnabled"-->
            <!--class="row justify-center"-->
        <!--&gt;-->
            <!--<q-btn-->
                <!--flat-->
                <!--color="primary"-->
                <!--icon="add"-->
                <!--@click="enableAddForm"-->
            <!--&gt;-->
                <!--{{ $t('pbxConfig.addSoundSet') }}-->
            <!--</q-btn>-->
        <!--</div>-->
        <!--<div-->
            <!--v-if="isListLoadingVisible"-->
            <!--class="row justify-center"-->
        <!--&gt;-->
            <!--<csc-spinner />-->
        <!--</div>-->
        <!--<q-list-->
            <!--striped-odd-->
            <!--no-border-->
            <!--multiline-->
            <!--:highlight="!isMobile"-->
        <!--&gt;-->
            <!--<csc-pbx-sound-set-->
                <!--v-for="set in soundSets"-->
                <!--:loading="isItemLoading(set.id)"-->
                <!--:key="set.id"-->
                <!--:set="set"-->
                <!--:mobile="isMobile"-->
                <!--:invalid="isSoundSetInvalid(set.id)"-->
                <!--:invalid-count="soundSetInvalidCount(set.id)"-->
                <!--@remove="removeSoundSetDialog"-->
                <!--@save-name="saveSoundSetName"-->
                <!--@save-description="saveSoundSetDescription"-->
                <!--@save-contract-default="saveContractDefault"-->
                <!--@remove-file="removeSoundFileDialog"-->
                <!--@toggle-loop="toggleLoop"-->
            <!--/>-->
        <!--</q-list>-->
        <!--<div-->
            <!--v-if="soundSets.length === 0 && !isSoundSetsRequesting"-->
            <!--class="row justify-center csc-no-entities"-->
        <!--&gt;-->
            <!--{{ $t('pbxConfig.noSoundSets') }}-->
        <!--</div>-->
        <!--<csc-remove-dialog-->
            <!--ref="removeSoundSetDialog"-->
            <!--:title="$t('pbxConfig.removeSoundSetTitle')"-->
            <!--:message="removeSoundSetDialogMessage"-->
            <!--@remove="removeSoundSet"-->
        <!--/>-->
        <!--<csc-remove-dialog-->
            <!--ref="removeSoundFileDialog"-->
            <!--:title="$t('pbxConfig.removeSoundFileTitle')"-->
            <!--:message="removeSoundFileDialogMessage"-->
            <!--@remove="removeFile"-->
        <!--/>-->
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscList from "../../CscList"
    import CscFade from "../../transitions/CscFade"
    import CscListActions from "../../CscListActions";
    import CscListActionButton from "../../CscListActionButton";
    import CscPbxSoundSet from "./CscPbxSoundSet";
    // import CscPbxSoundSet from './CscPbxSoundSet'
    // import CscRemoveDialog from '../../CscRemoveDialog'
    // import CscPbxSoundSetAddForm from './CscPbxSoundSetAddForm'
    import {
        mapMutations,
        mapActions,
        mapState,
        mapGetters
    } from 'vuex'
    import CscListSpinner from "../../CscListSpinner";
    import CscPbxSoundSetAddForm from "./CscPbxSoundSetAddForm";
    // import {
    //     showToast
    // } from '../../../helpers/ui'
    import {
        QSlideTransition,
        QPagination
        // Platform,
        // QList,
        // QBtn,
        // QInnerLoading,
        // QSpinnerDots
    } from 'quasar-framework'
    import CscRemoveDialog from "../../CscRemoveDialog";
    // import CscSpinner from "../../CscSpinner";
    // import CscList from "../../CscList";
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
            CscPage,
            QSlideTransition,
            QPagination
            // CscSpinner,
            // CscPbxSoundSet,
            // CscRemoveDialog,
            // CscPbxSoundSetAddForm,
            // QList,
            // QBtn,
            // QInnerLoading,
            // QSpinnerDots
        },
        data () {
            return {
                // currentRemovingSoundSet: null,
                // currentRemovingSoundFile: null,
                // addFormEnabled: false
            }
        },
        mounted() {
            this.loadSoundSetList();
            // this.$store.dispatch('pbxConfig/listSoundSetsWithFiles');s
        },
        computed: {
            ...mapState('pbxSoundSets', [
                'soundSetListVisible',
                'soundSetList',
                'soundSetListCurrentPage',
                'soundSetListLastPage'
            ]),
            ...mapGetters('pbxSoundSets', [
                'isSoundSetListRequesting',
                'isSoundSetAddFormEnabled',
                'isSoundSetListPaginationActive',
                'isSoundSetCreating',
                'isSoundSetUpdating',
                'isSoundSetLoading',
                'isSoundSetExpanded',
                'getSoundSetRemoveDialogMessage'
            ])
            // ...mapGetters('pbxConfig', [
            //     'soundSets',
            //     'soundSetFilesLoading',
            //     'isSoundSetsRequesting',
            //     'isUpdating',
            //     'updateItemId',
            //     'updateState',
            //     'lastUpdatedField',
            //     'isListLoadingVisible',
            //     'isAdding',
            //     'addState',
            //     'lastAddedSoundSet',
            //     'soundSetInvalidCount'
            // ]),
            // isMobile() {
            //     return !!Platform.is.mobile;
            // },
            // removeSoundSetDialogMessage() {
            //     if (this.currentRemovingSoundSet !== null) {
            //         return this.$t('pbxConfig.removeSoundSetText', {
            //             set: this.currentRemovingSoundSet.name
            //         });
            //     }
            // },
            // removeSoundFileDialogMessage() {
            //     if (this.currentRemovingSoundFile !== null) {
            //         return this.$t('pbxConfig.removeSoundFileText', {
            //             handle: this.currentRemovingSoundFile.handle
            //         });
            //     }
            // }
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
                'setSoundSetDescription'
            ]),
            loadSoundSetListPaginated(page) {
                this.loadSoundSetList({
                    page: page
                });
            },
            playSoundSetSound() {

            },
            openSoundSetRemovalDialog(soundSetId) {
                if (this.$refs.removeDialog) {
                    this.$refs.removeDialog.open();
                }
                this.soundSetRemovalRequesting(soundSetId);
            },
            closeSoundSetRemovalDialog() {
                this.soundSetRemovalCanceled();
            }
            // removeSoundSetDialog(soundSet) {
            //     this.currentRemovingSoundSet = soundSet;
            //     this.$refs.removeSoundSetDialog.open();
            // },
            // removeSoundFileDialog(item) {
            //     this.currentRemovingSoundFile = item;
            //     this.$refs.removeSoundFileDialog.open();
            // },
            // removeSoundSet() {
            //     this.$store.dispatch('pbxConfig/removeSoundSet', this.currentRemovingSoundSet);
            // },
            // saveSoundSetName(set) {
            //     this.$store.dispatch('pbxConfig/saveSoundSetName', set);
            // },
            // saveSoundSetDescription(set) {
            //     this.$store.dispatch('pbxConfig/saveSoundSetDescription', set);
            // },
            // saveContractDefault(set) {
            //     this.$store.dispatch('pbxConfig/saveContractDefault', set);
            // },
            // isItemLoading(setId) {
            //     return (this.isUpdating && this.updateItemId + "" === setId + "") ||
            //         this.soundSetFilesLoading(setId) || this.isSoundSetsRequesting;
            // },
            // resetAddForm() {
            //     this.$refs.addForm.reset();
            // },
            // enableAddForm() {
            //     this.resetAddForm();
            //     this.addFormEnabled = true;
            // },
            // disableAddForm() {
            //     this.resetAddForm();
            //     this.addFormEnabled = false;
            // },
            // addSoundSet(soundSet) {
            //     this.$store.dispatch('pbxConfig/createSoundSet', soundSet);
            // },
            // isSoundSetInvalid(setId) {
            //     return this.soundSetInvalidCount(setId) > 0;
            // },
            // removeFile() {
            //     this.$store.dispatch('pbxConfig/removeSoundFile', this.currentRemovingSoundFile);
            // },
            // toggleLoop(item) {
            //     this.$store.dispatch('pbxConfig/setLoopplay', item);
            // }
        },
        watch: {
            // addState(state) {
            //     if (state === 'succeeded') {
            //         this.disableAddForm();
            //         showToast(this.$t('pbxConfig.toasts.addedSoundSetToast', { name: this.lastAddedSoundSet }));
            //     }
            // },
            // updateState(state) {
            //     if (state === 'succeeded') {
            //         showToast(this.$t('pbxConfig.toasts.changedFieldToast', this.lastUpdatedField));
            //     }
            // }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
