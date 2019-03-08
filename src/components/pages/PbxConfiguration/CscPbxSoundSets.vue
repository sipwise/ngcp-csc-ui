<template>
    <csc-page
        :is-list="true"
    >
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
            QList,
            QBtn
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
                'soundFileLabel',
                'uploadSoundFileProgress',
                'uploadSoundFileRequesting',
                'uploadSoundFileDone',
                'playSoundFileUrl',
                'playSoundFileLoaded'
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
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
