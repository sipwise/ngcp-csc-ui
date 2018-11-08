<template>
    <csc-page
        :is-list="true"
    >
        <div
            v-show="addFormEnabled"
            class="row justify-center"
        >
            <csc-pbx-group-add-form
                class="col-xs-12 col-md-6 csc-list-form"
                ref="addForm"
                @save="addGroup"
                @cancel="disableAddForm"
                :loading="isAdding"
                :alias-number-options="aliasNumberOptions"
                :seat-options="seatOptions"
                :hunt-policy-options="huntPolicyOptions"
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
                @remove="removeGroup"
                :loading="isItemLoading(group.id)"
                @save-name="setGroupName"
                @save-extension="setGroupExtension"
                @save-hunt-policy="setGroupHuntPolicy"
                @save-hunt-timeout="setGroupHuntTimeout"
                @save-alias-numbers="updateAliasNumbers"
                @save-seats="updateSeats"
            />
        </q-list>
        <div
            v-if="groups.length === 0 && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noGroups') }}
        </div>
    </csc-page>
</template>

<script>
    import { mapGetters } from 'vuex'
    import CscPage from '../../CscPage'
    import CscPbxGroup from './CscPbxGroup'
    import CscPbxGroupAddForm from './CscPbxGroupAddForm'
    import aliasNumberOptions from '../../../mixins/alias-number-options'
    import itemError from '../../../mixins/item-error'
    import { showToast } from '../../../helpers/ui'
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
        Dialog,
        QPagination,
        Platform
    } from 'quasar-framework'

    export default {
        mixins: [aliasNumberOptions, itemError],
        components: {
            CscPage,
            CscPbxGroup,
            CscPbxGroupAddForm,
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
        mounted() {
            this.$store.dispatch('pbxConfig/listGroups', {
                page: 1
            });
        },
        data () {
            return {
                addFormEnabled: false,
                page: 1
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
            seatOptions() {
                let seats = [];
                this.seats.forEach((seat)=>{
                    seats.push({
                        label: seat.display_name ? seat.display_name : seat.username,
                        sublabel: this.$t('pbxConfig.extension') + ': ' + seat.pbx_extension,
                        value: seat.id
                    });
                });
                return seats;
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
                'updateGroupsAndSeatsState'
            ]),
            isMobile() {
                return Platform.is.mobile;
            },
        },
        watch: {
            addState(state) {
                if(state === 'succeeded') {
                    this.disableAddForm();
                    showToast(this.$t('pbxConfig.toasts.addedGroupToast', { group: this.lastAddedGroup }));
                }
            },
            removeState(state) {
                if(state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.removedGroupToast', { group: this.lastRemovedGroup }));
                }
            },
            updateState(state) {
                if(state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.changedFieldToast', this.lastUpdatedField));
                }
            },
            updateAliasNumbersState(state) {
                if(state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.updatedAliasNumbersToast'));
                }
            },
            updateGroupsAndSeatsState(state) {
                if(state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.updatedSeatsInGroupToast', {group: this.seat}));
                }
            }
        },
        methods: {
            isItemLoading(groupId) {
                return (this.isUpdating && this.updateItemId + "" === groupId + "") ||
                    (this.isRemoving && this.removeItemId + "" === groupId + "") ||
                    (this.isUpdatingAliasNumbers && this.updateAliasNumbersItemId + "" === groupId + "") ||
                    (this.isUpdatingGroupsAndSeats && this.updateGroupsAndSeatsItemId + "" === groupId + "");
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
            removeGroup(group) {
                var store = this.$store;
                var i18n = this.$i18n;
                Dialog.create({
                    title: i18n.t('pbxConfig.removeGroupTitle'),
                    message: i18n.t('pbxConfig.removeGroupText', { group: group.name }),
                    buttons: [
                        'Cancel',
                        {
                            label: i18n.t('pbxConfig.removeGroup'),
                            color: 'negative',
                            handler () {
                                store.dispatch('pbxConfig/removeGroup', group);
                            }
                        }
                    ]
                });
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
            changePage(page) {
                this.$store.dispatch('pbxConfig/listGroups', {
                    page: page
                });
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
