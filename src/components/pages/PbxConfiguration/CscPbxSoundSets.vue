<template>
    <csc-page
        :is-list="true"
    >
        <div
            v-if="isListLoadingVisible"
            class="row justify-center"
        >
            <q-spinner-dots
                color="primary"
                :size="40"
            />
        </div>
        <div
            v-show="addFormEnabled"
            class="row justify-center"
        >
            <csc-pbx-sound-set-add-form
                ref="addForm"
                class="col-xs-12 col-md-6 csc-list-form"
                :loading="isAdding"
                @save="addSoundSet"
                @cancel="disableAddForm"
            />
        </div>
        <div
            v-show="!addFormEnabled"
            class="row justify-center"
        >
            <q-btn
                flat
                color="primary"
                icon="add"
                @click="enableAddForm"
            >
                {{ $t('pbxConfig.addSoundSet') }}
            </q-btn>
        </div>
        <q-list
            striped-odd
            no-border
            multiline
            :highlight="!isMobile"
        >
            <csc-pbx-sound-set
                v-for="set in soundSets"
                :loading="isItemLoading(set.id)"
                :key="set.id"
                :set="set"
                :mobile="isMobile"
                :invalid="isSoundSetInvalid(set.id)"
                :invalid-count="soundSetInvalidCount(set.id)"
                @remove="removeSoundSetDialog"
                @save-name="saveSoundSetName"
                @save-description="saveSoundSetDescription"
                @save-contract-default="saveContractDefault"
                @remove-file="removeSoundFileDialog"
                @toggle-loop="toggleLoop"
            />
        </q-list>
        <div
            v-if="soundSets.length === 0 && !isSoundSetsRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noSoundSets') }}
        </div>
        <csc-remove-dialog
            ref="removeSoundSetDialog"
            :title="$t('pbxConfig.removeSoundSetTitle')"
            :message="removeSoundSetDialogMessage"
            @remove="removeSoundSet"
        />
        <csc-remove-dialog
            ref="removeSoundFileDialog"
            :title="$t('pbxConfig.removeSoundFileTitle')"
            :message="removeSoundFileDialogMessage"
            @remove="removeFile"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxSoundSet from './CscPbxSoundSet'
    import CscRemoveDialog from '../../CscRemoveDialog'
    import CscPbxSoundSetAddForm from './CscPbxSoundSetAddForm'
    import {
        mapGetters
    } from 'vuex'
    import {
        showToast
    } from '../../../helpers/ui'
    import {
        Platform,
        QList,
        QBtn,
        QInnerLoading,
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        components: {
            CscPage,
            CscPbxSoundSet,
            CscRemoveDialog,
            CscPbxSoundSetAddForm,
            QList,
            QBtn,
            QInnerLoading,
            QSpinnerDots
        },
        data () {
            return {
                currentRemovingSoundSet: null,
                currentRemovingSoundFile: null,
                addFormEnabled: false
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listSoundSetsWithFiles');
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'soundSets',
                'soundSetFilesLoading',
                'isSoundSetsRequesting',
                'isUpdating',
                'updateItemId',
                'updateState',
                'lastUpdatedField',
                'isListLoadingVisible',
                'isAdding',
                'addState',
                'lastAddedSoundSet',
                'soundSetInvalidCount'
            ]),
            isMobile() {
                return !!Platform.is.mobile;
            },
            removeSoundSetDialogMessage() {
                if (this.currentRemovingSoundSet !== null) {
                    return this.$t('pbxConfig.removeSoundSetText', {
                        set: this.currentRemovingSoundSet.name
                    });
                }
            },
            removeSoundFileDialogMessage() {
                if (this.currentRemovingSoundFile !== null) {
                    return this.$t('pbxConfig.removeSoundFileText', {
                        handle: this.currentRemovingSoundFile.handle
                    });
                }
            }
        },
        methods: {
            removeSoundSetDialog(soundSet) {
                this.currentRemovingSoundSet = soundSet;
                this.$refs.removeSoundSetDialog.open();
            },
            removeSoundFileDialog(item) {
                this.currentRemovingSoundFile = item;
                this.$refs.removeSoundFileDialog.open();
            },
            removeSoundSet() {
                this.$store.dispatch('pbxConfig/removeSoundSet', this.currentRemovingSoundSet);
            },
            saveSoundSetName(set) {
                this.$store.dispatch('pbxConfig/saveSoundSetName', set);
            },
            saveSoundSetDescription(set) {
                this.$store.dispatch('pbxConfig/saveSoundSetDescription', set);
            },
            saveContractDefault(set) {
                this.$store.dispatch('pbxConfig/saveContractDefault', set);
            },
            isItemLoading(setId) {
                return (this.isUpdating && this.updateItemId + "" === setId + "") ||
                    this.soundSetFilesLoading(setId) || this.isSoundSetsRequesting;
            },
            resetAddForm() {
                this.$refs.addForm.reset();
            },
            enableAddForm() {
                this.resetAddForm();
                this.addFormEnabled = true;
            },
            disableAddForm() {
                this.resetAddForm();
                this.addFormEnabled = false;
            },
            addSoundSet(soundSet) {
                this.$store.dispatch('pbxConfig/createSoundSet', soundSet);
            },
            isSoundSetInvalid(setId) {
                return this.soundSetInvalidCount(setId) > 0;
            },
            removeFile() {
                this.$store.dispatch('pbxConfig/removeSoundFile', this.currentRemovingSoundFile);
            },
            toggleLoop(item) {
                this.$store.dispatch('pbxConfig/setLoopplay', item);
            }
        },
        watch: {
            addState(state) {
                if (state === 'succeeded') {
                    this.disableAddForm();
                    showToast(this.$t('pbxConfig.toasts.addedSoundSetToast', { name: this.lastAddedSoundSet }));
                }
            },
            updateState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.changedFieldToast', this.lastUpdatedField));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
