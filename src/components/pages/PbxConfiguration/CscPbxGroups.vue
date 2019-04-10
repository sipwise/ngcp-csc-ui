<template>
    <csc-page
        :is-list="true"
    >
        <div
            v-show="addFormEnabled"
            class="row justify-center"
        >
            <csc-pbx-group-add-form
                ref="addForm"
                class="col-xs-12 col-md-6 csc-list-form"
                :alias-number-options="aliasNumberOptions"
                :seat-options="seatOptions"
                :hunt-policy-options="huntPolicyOptions"
                :sound-set-options="soundSetOptions"
                :sound-set-label="soundSetLabel"
                :loading="isAdding"
                :default-sound-set="!!defaultSoundSet"
                @save="addGroup"
                @cancel="disableAddForm"
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
                {{ $t('pbxConfig.addGroup') }}
            </q-btn>
        </div>
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
            v-if="groups.length > 0 && !isListRequesting && listLastPage > 1"
            class="row justify-center"
        >
            <q-pagination
                :value="listCurrentPage"
                :max="listLastPage"
                @change="changePage"
            />
        </div>
        <q-list
            no-border
            striped-odd
            multiline
            :highlight="!isMobile"
        >
            <csc-pbx-group
                v-for="group in groups"
                :key="group.id"
                :group="group"
                :alias-number-options="aliasNumberOptions"
                :seat-options="seatOptions"
                :hunt-policy-options="huntPolicyOptions"
                :loading="isItemLoading(group.id)"
                :sound-set-options="soundSetOptions"
                :sound-set-label="soundSetLabel"
                :default-sound-set="!!defaultSoundSet"
                @remove="removeGroupDialog"
                @save-name="setGroupName"
                @save-extension="setGroupExtension"
                @save-hunt-policy="setGroupHuntPolicy"
                @save-hunt-timeout="setGroupHuntTimeout"
                @save-alias-numbers="updateAliasNumbers"
                @save-seats="updateSeats"
                @save-sound-set="updateSoundSet"
            />
        </q-list>
        <div
            v-if="groups.length === 0 && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noGroups') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.removeGroupTitle')"
            :message="removeDialogMessage"
            @remove="removeGroup"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxGroup from './CscPbxGroup'
    import CscPbxGroupAddForm from './CscPbxGroupAddForm'
    import CscRemoveDialog from '../../CscRemoveDialog'
    import aliasNumberOptions from '../../../mixins/alias-number-options'
    import itemError from '../../../mixins/item-error'
    import {
        mapGetters
    } from 'vuex'
    import {
        showToast
    } from '../../../helpers/ui'
    import {
        QChip,
        QCard,
        QCardSeparator,
        QCardTitle,
        QCardMain,
        QCardActions,
        QIcon,
        QPopover,
        QList,
        QItem,
        QItemMain,
        QField,
        QInput,
        QBtn,
        QSelect,
        QInnerLoading,
        QSpinnerDots,
        QSpinnerMat,
        QPagination,
        Platform
    } from 'quasar-framework'

    export default {
        mixins: [aliasNumberOptions, itemError],
        components: {
            CscPage,
            CscPbxGroup,
            CscPbxGroupAddForm,
            CscRemoveDialog,
            QChip,
            QCard,
            QCardSeparator,
            QCardTitle,
            QCardMain,
            QCardActions,
            QIcon,
            QPopover,
            QList,
            QItem,
            QItemMain,
            QField,
            QInput,
            QBtn,
            QSelect,
            QInnerLoading,
            QSpinnerDots,
            QSpinnerMat,
            QPagination
        },
        created() {
            this.$store.dispatch('pbxConfig/listSoundSets');
            this.$store.dispatch('pbxConfig/getDefaultSoundSet');
            this.$store.dispatch('pbxConfig/listGroups', {
                page: 1
            });
        },
        data () {
            return {
                addFormEnabled: false,
                currentRemovingGroup: null
            }
        },
        computed: {
            huntPolicyOptions() {
                return [
                    {
                        label: this.$t('pbxConfig.serialRinging'),
                        value: 'serial'
                    },
                    {
                        label: this.$t('pbxConfig.parallelRinging'),
                        value: 'parallel'
                    },
                    {
                        label: this.$t('pbxConfig.randomRinging'),
                        value: 'random'
                    },
                    {
                        label: this.$t('pbxConfig.circularRinging'),
                        value: 'circular'
                    }
                ];
            },
            ...mapGetters('pbxConfig', [
                'groups',
                'seats',
                'aliasNumbers',
                'addState',
                'removeState',
                'isAdding',
                'isUpdating',
                'updateItemId',
                'isUpdatingAliasNumbers',
                'updateAliasNumbersItemId',
                'isUpdatingGroupsAndSeats',
                'updateGroupsAndSeatsItemId',
                'updateState',
                'isRemoving',
                'removeItemId',
                'listState',
                'listError',
                'isListRequesting',
                'isListLoadingVisible',
                'listCurrentPage',
                'listLastPage',
                'lastAddedGroup',
                'lastRemovedGroup',
                'lastUpdatedField',
                'updateAliasNumbersState',
                'updateGroupsAndSeatsState',
                'seatOptions',
                'soundSetOptions',
                'soundSetLabel',
                'defaultSoundSet'
            ]),
            isMobile() {
                return Platform.is.mobile;
            },
            removeDialogMessage() {
                if (this.currentRemovingGroup !== null) {
                    return this.$t('pbxConfig.removeGroupText', {
                        group: this.currentRemovingGroup.name
                    });
                }
            }
        },
        watch: {
            addState(state) {
                if (state === 'succeeded') {
                    this.disableAddForm();
                    showToast(this.$t('pbxConfig.toasts.addedGroupToast', { group: this.lastAddedGroup }));
                }
            },
            removeState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.removedGroupToast', { group: this.lastRemovedGroup }));
                }
            },
            updateState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.changedFieldToast', this.lastUpdatedField));
                }
            },
            updateAliasNumbersState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.updatedAliasNumbersToast'));
                }
            },
            updateGroupsAndSeatsState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.updatedSeatsInGroupToast', {group: this.seat}));
                }
            }
        },
        methods: {
            isItemLoading(groupId) {
                return (this.isUpdating && this.updateItemId + "" === groupId + "") ||
                    (this.isRemoving && this.removeItemId + "" === groupId + "") ||
                    (this.isUpdatingAliasNumbers && this.updateAliasNumbersItemId + "" === groupId + "") ||
                    (this.isUpdatingGroupsAndSeats && this.updateGroupsAndSeatsItemId + "" === groupId + "") ||
                    this.isListRequesting;
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
            addGroup(group) {
                this.$store.dispatch('pbxConfig/addGroup', group);
            },
            removeGroup() {
                this.$store.dispatch('pbxConfig/removeGroup', this.currentRemovingGroup);
            },
            setGroupName(group) {
                this.$store.dispatch('pbxConfig/setGroupName', group);
            },
            setGroupExtension(group) {
                this.$store.dispatch('pbxConfig/setGroupExtension', group);
            },
            setGroupHuntPolicy(group) {
                this.$store.dispatch('pbxConfig/setGroupHuntPolicy', group);
            },
            setGroupHuntTimeout(group) {
                this.$store.dispatch('pbxConfig/setGroupHuntTimeout', group);
            },
            updateAliasNumbers(data) {
                this.$store.dispatch('pbxConfig/updateGroupAliasNumbers', data);
            },
            updateSeats(data) {
                this.$store.dispatch('pbxConfig/updateSeats', data);
            },
            updateSoundSet(data) {
                this.$store.dispatch('pbxConfig/setGroupSoundSet', data);
            },
            changePage(page) {
                this.$store.dispatch('pbxConfig/listGroups', {
                    page: page
                });
            },
            removeGroupDialog(subscriber) {
                this.currentRemovingGroup = subscriber;
                this.$refs.removeDialog.open();
            }
        }
    }
</script>

<style lang="stylus">
    @import '../../../themes/quasar.variables.styl';
    .add-form {
        position: relative;
    }
    .add-form .q-field:last-child {
        margin-bottom: 36px;
    }
</style>
