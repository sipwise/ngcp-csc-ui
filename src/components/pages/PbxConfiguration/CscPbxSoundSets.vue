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
                @remove="removeSoundSetDialog"
                @save-name="saveSoundSetName"
                @save-description="saveSoundSetDescription"
                @save-contract-default="saveContractDefault"
            />
        </q-list>
        <div
            v-if="soundSets.length === 0 && !isSoundSetsRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noSoundSets') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.removeSoundSetTitle')"
            :message="removeDialogMessage"
            @remove="removeSoundSet"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxSoundSet from './CscPbxSoundSet'
    import CscRemoveDialog from '../../CscRemoveDialog'
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
            QList,
            QBtn,
            QInnerLoading,
            QSpinnerDots
        },
        data () {
            return {
                currentRemovingSoundSet: null
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listSoundSets');
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
                'isSoundSetInvalid'
            ]),
            isMobile() {
                return !!Platform.is.mobile;
            },
            removeDialogMessage() {
                if (this.currentRemovingSoundSet !== null) {
                    return this.$t('pbxConfig.removeSoundSetText', {
                        set: this.currentRemovingSoundSet.name
                    });
                }
            }
        },
        methods: {
            removeSoundSetDialog(soundSet) {
                this.currentRemovingSoundSet = soundSet;
                this.$refs.removeDialog.open();
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
            }
        },
        watch: {
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
