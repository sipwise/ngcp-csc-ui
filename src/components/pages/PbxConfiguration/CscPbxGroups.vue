<template>
    <csc-page
        :is-list="true"
    >
        <csc-list-actions>
            <csc-list-action-button
                v-if="isGroupAddFormDisabled"
                slot="slot1"
                icon="add"
                color="primary"
                :label="$t('pbxConfig.addGroup')"
                :disable="isGroupListRequesting"
                @click="enableGroupAddForm"
            />
        </csc-list-actions>
        <q-slide-transition>
            <div
                v-if="!isGroupAddFormDisabled"
                class="row justify-center"
            >
                <csc-pbx-group-add-form
                    ref="addForm"
                    class="col-xs-12 col-md-6 csc-list-form"
                    :loading="isGroupCreating"
                    :seat-options="getSeatOptions"
                    :alias-number-options="getNumberOptions"
                    :sound-set-options="getSoundSetOptions"
                    :hunt-policy-options="getHuntPolicyOptions"
                    @save="createGroup"
                    @cancel="disableGroupAddForm"
                />
            </div>
        </q-slide-transition>
        <div
            v-if="isGroupListPaginationActive"
            class="row justify-center"
        >
            <q-pagination
                :value="groupListCurrentPage"
                :max="groupListLastPage"
                @change="loadGroupListItemsPaginated"
            />
        </div>
        <csc-list-spinner
            v-if="isGroupListRequesting && !(isGroupCreating || isGroupRemoving || isGroupUpdating)"
        />
        <csc-list
            v-if="!isGroupListEmpty && groupListVisibility === 'visible'"
        >
            <csc-fade
                v-for="(group, index) in groupListItems"
                :key="'csc-fade-' + group.id"
            >
                <csc-pbx-group
                    :key="group.id"
                    :odd="(index % 2) === 0"
                    :group="group"
                    :seats="seatMapById"
                    :expanded="isGroupExpanded(group.id)"
                    :loading="isGroupLoading(group.id)"
                    :alias-number-options="getNumberOptions"
                    :seat-options="getSeatOptions"
                    :sound-set-options="getSoundSetOptions"
                    :hunt-policy-options="getHuntPolicyOptions"
                    :sound-set="getSoundSetByGroupId(group.id)"
                    :labelWidth="4"
                    :has-call-queue="hasCallQueue(group.id)"
                    @expand="expandGroup(group.id)"
                    @collapse="collapseGroup(group.id)"
                    @remove="openGroupRemovalDialog(group.id)"
                    @save-name="setGroupName"
                    @save-extension="setGroupExtension"
                    @save-hunt-policy="setGroupHuntPolicy"
                    @save-hunt-timeout="setGroupHuntTimeout"
                    @save-alias-numbers="setGroupNumbers"
                    @save-seats="setGroupSeats"
                    @save-sound-set="setGroupSoundSet"
                    @jump-to-call-queue="jumpToCallQueue"
                />
            </csc-fade>
        </csc-list>
        <div
            v-if="isGroupListEmpty && !isGroupListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noGroups') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.removeGroupTitle')"
            :message="getGroupRemoveDialogMessage"
            @remove="removeGroup({groupId:groupRemoving.id})"
            @cancel="closeGroupRemovalDialog"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxGroupAddForm from './CscPbxGroupAddForm'
    import CscPbxGroup from './CscPbxGroup'
    import CscRemoveDialog from '../../CscRemoveDialog'
    import CscListActions from "../../CscListActions";
    import CscListActionButton from "../../CscListActionButton";
    import {
        mapState,
        mapGetters,
        mapActions,
        mapMutations
    } from 'vuex'
    import {
        showGlobalError,
        showToast
    } from '../../../helpers/ui'
    import {
        QList,
        QBtn,
        QPagination,
        QTransition,
        QSlideTransition
    } from 'quasar-framework'
    import CscSpinner from "../../CscSpinner";
    import {
        CreationState,
        RequestState
    } from "../../../store/common";
    import platform from "../../../mixins/platform";
    import CscFadeDown from "../../transitions/CscFadeDown";
    import CscFadeUp from "../../transitions/CscFadeUp";
    import CscZoom from "../../transitions/CscZoom";
    import CscFade from "../../transitions/CscFade";
    import CscList from "../../CscList";
    import CscListSpinner from "../../CscListSpinner";

    export default {
        mixins: [
            platform
        ],
        mounted() {
            this.$scrollTo(this.$parent.$el);
            this.disableGroupAddForm();
            this.loadGroupListItems();
        },
        data () {
            return {}
        },
        components: {
            CscListSpinner,
            CscFadeDown,
            CscFadeUp,
            CscZoom,
            CscFade,
            QList,
            QBtn,
            QPagination,
            QTransition,
            QSlideTransition,
            CscSpinner,
            CscPage,
            CscPbxGroup,
            CscPbxGroupAddForm,
            CscRemoveDialog,
            CscList,
            CscListActions,
            CscListActionButton
        },
        computed: {
            ...mapState('pbx', [
                'seatMapById',
            ]),
            ...mapState('pbxGroups', [
                'groupListItems',
                'groupListCurrentPage',
                'groupListLastPage',
                'groupSelected',
                'groupCreating',
                'groupCreationState',
                'groupCreationError',
                'groupUpdating',
                'groupUpdateState',
                'groupUpdateError',
                'groupRemoving',
                'groupRemovalState',
                'groupRemovalError',
                'groupListVisibility'
            ]),
            ...mapGetters('pbx', [
                'getNumberOptions',
                'getSoundSetOptions',
                'getSeatOptions'
            ]),
            ...mapGetters('pbxGroups', [
                'isGroupListEmpty',
                'isGroupListRequesting',
                'isGroupListPaginationActive',
                'isGroupAddFormDisabled',
                'isGroupCreating',
                'isGroupUpdating',
                'isGroupRemoving',
                'isGroupExpanded',
                'isGroupLoading',
                'getSoundSetByGroupId',
                'getGroupCreatingName',
                'getGroupUpdatingField',
                'getGroupRemovingName',
                'getGroupRemoveDialogMessage',
                'getGroupCreationToastMessage',
                'getGroupUpdateToastMessage',
                'getGroupRemovalToastMessage',
                'getHuntPolicyOptions',
                'hasCallQueue'
            ])
        },
        methods: {
            ...mapActions('pbxGroups', [
                'loadGroupListItems',
                'createGroup',
                'removeGroup',
                'setGroupName',
                'setGroupExtension',
                'setGroupHuntPolicy',
                'setGroupHuntTimeout',
                'setGroupSeats',
                'setGroupNumbers',
                'setGroupSoundSet'
            ]),
            ...mapMutations('pbxGroups', [
                'enableGroupAddForm',
                'disableGroupAddForm',
                'expandGroup',
                'collapseGroup',
                'groupRemovalRequesting',
                'groupRemovalCanceled'
            ]),
            ...mapActions('pbxCallQueues', [
                'jumpToCallQueue'
            ]),
            resetGroupAddForm() {
                if(this.$refs.addForm) {
                    this.$refs.addForm.reset();
                }
            },
            openGroupRemovalDialog(groupId) {
                if(this.$refs.removeDialog) {
                    this.groupRemovalRequesting(groupId);
                    this.$refs.removeDialog.open();
                }
            },
            closeGroupRemovalDialog() {
                this.groupRemovalCanceled();
            },
            loadGroupListItemsPaginated(page) {
                this.$scrollTo(this.$parent.$el);
                this.loadGroupListItems({
                    page: page
                });
            }
        },
        watch: {
            groupCreationState(state) {
                if(state === CreationState.created) {
                    this.resetGroupAddForm();
                    this.$scrollTo(this.$parent.$el);
                    showToast(this.getGroupCreationToastMessage);
                }
                else if(state === CreationState.error) {
                    showGlobalError(this.groupCreationError);
                }
            },
            groupUpdateState(state) {
                if(state === RequestState.succeeded) {
                    showToast(this.getGroupUpdateToastMessage);
                }
                else if(state === RequestState.failed) {
                    showGlobalError(this.groupUpdateError);
                }
            },
            groupRemovalState(state) {
                if(state === RequestState.succeeded) {
                    this.$scrollTo(this.$parent.$el);
                    showToast(this.getGroupRemovalToastMessage);
                }
                else if(state === RequestState.failed) {
                    showGlobalError(this.groupRemovalError);
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl';
</style>
