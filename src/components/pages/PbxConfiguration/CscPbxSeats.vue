<template>
    <csc-page :title="$t('pbxConfig.seatsTitle')">
        <csc-pbx-seat-add-form v-show="addFormEnabled" ref="addForm" :alias-number-options="aliasNumberOptions"
                               :group-options="groupOptions" :loading="isAdding" @save="addSeat"
                               @cancel="disableAddForm" />
        <div v-show="!addFormEnabled" class="row justify-center">
            <q-btn color="primary" icon="add" flat @click="enableAddForm">{{ $t('pbxConfig.addSeat') }}</q-btn>
        </div>
        <div v-if="isListLoadingVisible" class="row justify-center">
            <q-spinner-dots color="primary" :size="40" />
        </div>
        <div v-if="seats.length > 0 && !isListRequesting && listLastPage > 1" class="row justify-center">
            <q-pagination :value="listCurrentPage" :max="listLastPage" @change="changePage" />
        </div>
        <csc-pbx-seat v-for="seat in seats" :key="seat.id" :seat="seat" :alias-number-options="aliasNumberOptions"
                      :group-options="groupOptions" @remove="removeSeat" :loading="isItemLoading(seat.id)"
                      @save-name="setSeatName" @save-extension="setSeatExtension"
                      @save-alias-numbers="updateAliasNumbers" @save-groups="updateGroups" />
        <div v-if="seats.length === 0 && !isListRequesting" class="row justify-center csc-no-entities">
            {{ $t('pbxConfig.noSeats') }}
        </div>
    </csc-page>
</template>

<script>
    import CscPage  from '../../CscPage'
    import CscPbxSeatAddForm  from './CscPbxSeatAddForm'
    import CscPbxSeat  from './CscPbxSeat'
    import { QChip, QCard, QCardSeparator, QCardTitle, QCardMain,
        QCardActions, QIcon, QPopover, QList, QItem, QItemMain,
        QField, QInput, QBtn, QSelect, QInnerLoading, QSpinnerDots,
        QSpinnerMat, Dialog, QPagination } from 'quasar-framework'
    import aliasNumberOptions from '../../../mixins/alias-number-options'
    import itemError from '../../../mixins/item-error'
    import { mapGetters } from 'vuex'
    import { showToast } from '../../../helpers/ui'

    export default {
        mixins: [aliasNumberOptions, itemError],
        mounted() {
            this.$store.dispatch('pbxConfig/listSeats', {
                page: 1
            });
        },
        data () {
            return {
                addFormEnabled: false
            }
        },
        components: {
            CscPage, CscPbxSeat, CscPbxSeatAddForm,
            QChip, QCard, QCardSeparator, QCardTitle, QCardMain,
            QCardActions, QIcon, QPopover, QList, QItem, QItemMain,
            QField, QInput, QBtn, QSelect, QInnerLoading, QSpinnerDots,
            QSpinnerMat, Dialog, QPagination
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'seats',
                'groups',
                'addState',
                'removeState',
                'isAdding',
                'isUpdating',
                'updateItemId',
                'isUpdatingAliasNumbers',
                'updateAliasNumbersItemId',
                'isUpdatingGroupsAndSeats',
                'updateGroupsAndSeatsItemId',
                'isRemoving',
                'removeItemId',
                'listState',
                'listError',
                'isListRequesting',
                'isListLoadingVisible',
                'listCurrentPage',
                'listLastPage',
                'lastAddedSeat',
                'lastRemovedSeat',
                'lastUpdatedField',
                'updateAliasNumbersState',
                'updateGroupsAndSeatsState'
            ]),
            groupOptions() {
                let groups = [];
                this.groups.forEach((group)=>{
                    groups.push({
                        label: group.display_name,
                        sublabel: this.$t('pbxConfig.extension') + ': ' + group.pbx_extension,
                        value: group.id
                    });
                });
                return groups;
            }
        },
        watch: {
            addState(state) {
                if(state === 'succeeded') {
                    this.disableAddForm();
                    showToast(this.$t('pbxConfig.toasts.addedSeatToast', { seat: this.lastAddedSeat }));
                }
            },
            removeState(state) {
                if(state === 'succeeded') {
                    showToast(this.$t('pbxConfig.toasts.removedSeatToast', { seat: this.lastRemovedSeat }));
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
                    showToast(this.$t('pbxConfig.toasts.updatedGroupsInSeatToast', {seat: this.group}));
                }
            }
        },
        methods: {
            isItemLoading(seatId) {
                return (this.isUpdating && this.updateItemId + "" === seatId + "") ||
                    (this.isRemoving && this.removeItemId + "" === seatId + "") ||
                    (this.isUpdatingAliasNumbers && this.updateAliasNumbersItemId + "" === seatId + "") ||
                    (this.isUpdatingGroupsAndSeats && this.updateGroupsAndSeatsItemId + "" === seatId + "");
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
            addSeat(seat) {
                this.$store.dispatch('pbxConfig/addSeat', seat);
            },
            removeSeat(seat) {
                var store = this.$store;
                var i18n = this.$i18n;
                Dialog.create({
                    title: i18n.t('pbxConfig.removeSeatTitle'),
                    message: i18n.t('pbxConfig.removeSeatText', { seat: seat.name }),
                    buttons: [
                        'Cancel',
                        {
                            label: i18n.t('pbxConfig.removeSeat'),
                            color: 'negative',
                            handler () {
                                store.dispatch('pbxConfig/removeSeat', seat);
                            }
                        }
                    ]
                });
            },
            setSeatName(seat) {
                this.$store.dispatch('pbxConfig/setSeatName', seat);
            },
            setSeatExtension(seat) {
                this.$store.dispatch('pbxConfig/setSeatExtension', seat);
            },
            updateAliasNumbers(data) {
                this.$store.dispatch('pbxConfig/updateAliasNumbers', data);
            },
            updateGroups(data) {
                this.$store.dispatch('pbxConfig/updateGroups', data);
            },
            changePage(page) {
                this.$store.dispatch('pbxConfig/listSeats', {
                    page: page
                });
            }
        }
    }
</script>

<style>
    .pbx-seat .pbx-seat-title {
        padding-left: 8px;
    }
</style>
