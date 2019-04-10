<template>
    <csc-page
        :is-list="true"
    >
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
                {{ $t('pbxConfig.addSeat') }}
            </q-btn>
        </div>
        <div
            class="row justify-center"
            v-show="addFormEnabled"
        >
            <csc-pbx-seat-add-form
                ref="addForm"
                class="col-xs-12 col-md-6 csc-list-form"
                :alias-number-options="aliasNumberOptions"
                :group-options="groupOptions"
                :sound-set-options="soundSetOptions"
                :loading="isAdding"
                :default-sound-set="!!defaultSoundSet"
                @save="addSeat"
                @cancel="disableAddForm"
            />
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
            v-if="seats.length > 0 && !isListRequesting && listLastPage > 1"
            class="row justify-center"
        >
            <q-pagination
                :value="listCurrentPage"
                :max="listLastPage"
                @change="changePage"
            />
        </div>
        <div>
            <q-list
                striped-odd
                no-border
                multiline
                :highlight="!isMobile"
            >
                <csc-pbx-seat
                    v-for="seat in seats"
                    :key="seat.id"
                    :seat="seat"
                    :alias-number-options="aliasNumberOptions"
                    :group-options="groupOptions"
                    :loading="isItemLoading(seat.id)"
                    :sound-set-options="soundSetOptions"
                    :default-sound-set="!!defaultSoundSet"
                    @remove="removeSeatDialog"
                    @save-name="setSeatName"
                    @save-extension="setSeatExtension"
                    @save-alias-numbers="updateAliasNumbers"
                    @save-groups="updateGroups"
                    @save-sound-set="updateSoundSet"
                />
            </q-list>
        </div>
        <div
            v-if="seats.length === 0 && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noSeats') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.removeSeatTitle')"
            :message="removeDialogMessage"
            @remove="removeSeat"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxSeatAddForm from './CscPbxSeatAddForm'
    import CscPbxSeat from './CscPbxSeat'
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
        mounted() {
            this.$store.dispatch('pbxConfig/listSeats', {
                page: 1
            });
            this.$store.dispatch('pbxConfig/listSoundSets');
            this.$store.dispatch('pbxConfig/getDefaultSoundSet');
        },
        data () {
            return {
                addFormEnabled: false,
                currentRemovingSeat: null
            }
        },
        components: {
            CscPage,
            CscPbxSeat,
            CscPbxSeatAddForm,
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
                'updateGroupsAndSeatsState',
                'updateState',
                'soundSetOptions',
                'soundSetValue',
                'defaultSoundSet',
                'groupOptions'
            ]),
            isMobile() {
                return Platform.is.mobile;
            },
            removeDialogMessage() {
                if (this.currentRemovingSeat !== null) {
                    return this.$t('pbxConfig.removeSeatText', {
                        seat: this.currentRemovingSeat.name
                    });
                }
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
            removeSeat() {
                this.$store.dispatch('pbxConfig/removeSeat', this.currentRemovingSeat);
            },
            setSeatName(seat) {
                this.$store.dispatch('pbxConfig/setSeatName', seat);
            },
            setSeatExtension(seat) {
                this.$store.dispatch('pbxConfig/setSeatExtension', seat);
            },
            updateAliasNumbers(data) {
                this.$store.dispatch('pbxConfig/updateSeatAliasNumbers', data);
            },
            updateGroups(data) {
                this.$store.dispatch('pbxConfig/updateGroups', data);
            },
            updateSoundSet(data) {
                this.$store.dispatch('pbxConfig/setSubscriberSoundSet', data);
            },
            changePage(page) {
                this.$store.dispatch('pbxConfig/listSeats', {
                    page: page
                });
            },
            removeSeatDialog(subscriber) {
                this.currentRemovingSeat = subscriber;
                this.$refs.removeDialog.open();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl';
</style>
