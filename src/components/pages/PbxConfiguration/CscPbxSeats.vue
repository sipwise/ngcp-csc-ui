<template>
    <csc-page
        :is-list="true"
    >
        <q-slide-transition>
            <div
                v-if="isSeatAddFormDisabled"
                class="csc-add-button row justify-center"
            >
                <q-btn
                    color="primary"
                    icon="add"
                    flat
                    :disable="isSeatListRequesting"
                    @click="enableSeatAddForm"
                >
                    {{ $t('pbxConfig.addSeat') }}
                </q-btn>
            </div>
        </q-slide-transition>
        <q-slide-transition>
            <div
                v-if="!isSeatAddFormDisabled"
                class="row justify-center"
            >
                <csc-pbx-seat-add-form
                    ref="addForm"
                    class="csc-list-form col-xs-12 col-md-6"
                    :loading="isSeatCreating"
                    :group-options="getGroupOptions"
                    :alias-number-options="getNumberOptions"
                    :sound-set-options="getSoundSetOptions"
                    @save="createSeat"
                    @cancel="disableSeatAddForm"
                />
            </div>
        </q-slide-transition>
        <div
            v-if="isSeatListPaginationActive"
            class="row justify-center"
        >
            <q-pagination
                :value="seatListCurrentPage"
                :max="seatListLastPage"
                @change="loadSeatListItemsPaginated"
            />
        </div>
        <div
            v-if="isSeatListRequesting && !(isSeatCreating || isSeatRemoving || isSeatUpdating)"
            class="row justify-center"
        >
            <csc-spinner />
        </div>
        <csc-list
            v-if="!isSeatListEmpty && seatListVisibility === 'visible'"
        >
            <csc-fade
                v-for="(seat, index) in seatListItems"
                :key="'csc-fade-' + seat.id"
            >
                <csc-pbx-seat
                    :key="seat.id"
                    :odd="(index % 2) === 0"
                    :seat="seat"
                    :groups="groupMapById"
                    :expanded="isSeatExpanded(seat.id)"
                    :loading="isSeatLoading(seat.id)"
                    :alias-number-options="getNumberOptions"
                    :group-options="getGroupOptions"
                    :sound-set-options="getSoundSetOptions"
                    :sound-set="getSoundSetBySeatId(seat.id)"
                    :labelWidth="4"
                    :has-call-queue="hasCallQueue(seat.id)"
                    @expand="expandSeat(seat.id)"
                    @collapse="collapseSeat(seat.id)"
                    @remove="openSeatRemovalDialog(seat.id)"
                    @save-name="setSeatName"
                    @save-extension="setSeatExtension"
                    @save-alias-numbers="setSeatNumbers"
                    @save-groups="setSeatGroups"
                    @save-sound-set="setSeatSoundSet"
                />
            </csc-fade>
        </csc-list>
        <div
            v-if="!isSeatListRequesting && isSeatListEmpty"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noSeats') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('pbxConfig.removeSeatTitle')"
            :message="getSeatRemoveDialogMessage"
            @remove="removeSeat({seatId:seatRemoving.id})"
            @cancel="closeSeatRemovalDialog"
        />
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxSeatAddForm from './CscPbxSeatAddForm'
    import CscPbxSeat from './CscPbxSeat'
    import CscRemoveDialog from '../../CscRemoveDialog'
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

    export default {
        mixins: [
            platform
        ],
        mounted() {
            this.$scrollTo(this.$parent.$el);
            this.disableSeatAddForm();
            this.loadSeatListItems();
        },
        data () {
            return {}
        },
        components: {
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
            CscPbxSeat,
            CscPbxSeatAddForm,
            CscRemoveDialog,
            CscList
        },
        computed: {
            ...mapState('pbx', [
                'groupMapById',
            ]),
            ...mapState('pbxSeats', [
                'seatListItems',
                'seatListCurrentPage',
                'seatListLastPage',
                'seatCreationState',
                'seatCreationError',
                'seatUpdateState',
                'seatUpdateError',
                'seatRemoving',
                'seatRemovalState',
                'seatRemovalError',
                'seatListVisibility'
            ]),
            ...mapGetters('pbx', [
                'getNumberOptions',
                'getSoundSetOptions',
                'getGroupOptions'
            ]),
            ...mapGetters('pbxSeats', [
                'isSeatListEmpty',
                'isSeatListRequesting',
                'isSeatListPaginationActive',
                'isSeatAddFormDisabled',
                'isSeatCreating',
                'isSeatUpdating',
                'isSeatRemoving',
                'isSeatExpanded',
                'isSeatLoading',
                'getSoundSetBySeatId',
                'getSeatCreatingName',
                'getSeatUpdatingField',
                'getSeatRemovingName',
                'getSeatRemoveDialogMessage',
                'getSeatCreationToastMessage',
                'getSeatUpdateToastMessage',
                'getSeatRemovalToastMessage',
                'hasCallQueue'
            ])
        },
        methods: {
            ...mapActions('pbxSeats', [
                'loadSeatListItems',
                'createSeat',
                'removeSeat',
                'setSeatName',
                'setSeatExtension',
                'setSeatGroups',
                'setSeatNumbers',
                'setSeatSoundSet'
            ]),
            ...mapMutations('pbxSeats', [
                'enableSeatAddForm',
                'disableSeatAddForm',
                'expandSeat',
                'collapseSeat',
                'seatRemovalRequesting',
                'seatRemovalCanceled'
            ]),
            resetSeatAddForm() {
                if(this.$refs.addForm) {
                    this.$refs.addForm.reset();
                }
            },
            openSeatRemovalDialog(seatId) {
                if(this.$refs.removeDialog) {
                    this.$refs.removeDialog.open();
                    this.seatRemovalRequesting(seatId);
                }
            },
            closeSeatRemovalDialog() {
                this.seatRemovalCanceled();
            },
            loadSeatListItemsPaginated(page) {
                this.$scrollTo(this.$parent.$el);
                this.loadSeatListItems({
                    page: page
                });
            }
        },
        watch: {
            seatCreationState(state) {
                if(state === CreationState.created) {
                    this.resetSeatAddForm();
                    this.$scrollTo(this.$parent.$el);
                    showToast(this.getSeatCreationToastMessage);
                }
                else if(state === CreationState.error) {
                    showGlobalError(this.seatCreationError);
                }
            },
            seatUpdateState(state) {
                if(state === RequestState.succeeded) {
                    showToast(this.getSeatUpdateToastMessage);
                }
                else if(state === RequestState.failed) {
                    showGlobalError(this.seatUpdateError);
                }
            },
            seatRemovalState(state) {
                if(state === RequestState.succeeded) {
                    this.$scrollTo(this.$parent.$el);
                    showToast(this.getSeatRemovalToastMessage);
                }
                else if(state === RequestState.failed) {
                    showGlobalError(this.seatRemovalError);
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl';
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
</style>
