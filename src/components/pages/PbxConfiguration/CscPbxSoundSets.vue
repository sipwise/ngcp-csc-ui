<template>
    <csc-page
        :is-list="true"
    >
        <div
            v-show="addFormEnabled"
            class="row justify-center"
        >
            <csc-pbx-sound-set-add-form
                class="col-xs-12 col-md-6 csc-list-form"
                ref="addForm"
                @save="addSoundSet"
                @cancel="disableAddForm"
                :loading="isAdding"
            />
        </div>
        <div
            v-show="!addFormEnabled"
            class="row justify-center"
        >
            <q-btn
                color="primary"
                icon="add"
                flat
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
                :loading="soundSetFilesLoading(set.id)"
                :key="set.id"
                :set="set"
                :mobile="isMobile"
                @remove="removeSoundSetDialog"
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
    import CscPbxSoundSetAddForm from './CscPbxSoundSetAddForm'
    import {
        mapGetters
    } from 'vuex'
    import {
        Platform,
        QList,
        QBtn
    } from 'quasar-framework'
    export default {
        components: {
            CscPage,
            CscPbxSoundSet,
            CscRemoveDialog,
            CscPbxSoundSetAddForm,
            QList,
            QBtn
        },
        data () {
            return {
                currentRemovingSoundSet: null,
                addFormEnabled: false,
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
                'isAdding'
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
                this.$store.dispatch('pbxConfig/removeSoundSet', this.currentRemovingSoundSet)
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
            addSoundSet(set) {
                this.$store.dispatch('pbxConfig/addSoundSet', set);
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
