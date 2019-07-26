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
                    :sound-set="soundSet"
                    :sound-handles="soundHandleList"
                    :sound-handles-loading="isSoundHandleListRequesting"
                    :sound-files-loading="isSoundFileListRequesting(soundSet.id)"
                    :sound-file-map="soundFileMap"
                    :sound-file-url-map="soundFileUrlMap"
                    :sound-file-upload-state="soundFileUploadState"
                    :sound-file-upload-progress="soundFileUploadProgress"
                    :sound-file-update-state="soundFileUpdateState"
                    @require-sound-handles="loadSoundSetResources(soundSet.id)"
                    @remove="openSoundSetRemovalDialog(soundSet.id)"
                    @save-as-default="setAsDefaultSoundSet"
                    @save-name="setSoundSetName"
                    @save-description="setSoundSetDescription"
                    @expand="expandSoundSet(soundSet.id)"
                    @collapse="collapseSoundSet"
                    @play-sound-file="playSoundFile"
                    @upload-sound-file="uploadSoundFile"
                    @toggle-loop-play="setLoopPlay"
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
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscList from "../../CscList"
    import CscFade from "../../transitions/CscFade"
    import CscListActions from "../../CscListActions"
    import CscListActionButton from "../../CscListActionButton"
    import CscPbxSoundSet from "./CscPbxSoundSet"
    import {
        mapMutations,
        mapActions,
        mapState,
        mapGetters
    } from 'vuex'
    import CscListSpinner from "../../CscListSpinner";
    import CscPbxSoundSetAddForm from "./CscPbxSoundSetAddForm";
    import {
        QSlideTransition,
        QPagination
    } from 'quasar-framework'
    import CscRemoveDialog from "../../CscRemoveDialog";
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
        },
        data () {
            return {
            }
        },
        mounted() {
            this.loadSoundSetList();
        },
        computed: {
            ...mapState('pbxSoundSets', [
                'soundSetListVisible',
                'soundSetList',
                'soundSetListCurrentPage',
                'soundSetListLastPage',
                'soundHandleList',
                'soundFileMap',
                'soundFileUrlMap',
                'soundFileUploadState',
                'soundFileUploadProgress',
                'soundFileUpdateState'
            ]),
            ...mapGetters('pbxSoundSets', [
                'isSoundSetListRequesting',
                'isSoundSetAddFormEnabled',
                'isSoundSetListPaginationActive',
                'isSoundSetCreating',
                'isSoundSetUpdating',
                'isSoundSetLoading',
                'isSoundSetExpanded',
                'getSoundSetRemoveDialogMessage',
                'isSoundHandleListRequesting',
                'isSoundFileListRequesting'
            ])
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
                'setSoundSetDescription',
                'loadSoundSetResources',
                'playSoundFile',
                'uploadSoundFile',
                'setLoopPlay'
            ]),
            loadSoundSetListPaginated(page) {
                this.loadSoundSetList({
                    page: page
                });
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
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
