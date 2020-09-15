<template>
    <csc-page
        :is-list="true"
    >
        <csc-list-actions>
            <csc-list-action-button
                v-if="isSeatAddFormDisabled"
                slot="slot1"
                icon="add"
                color="primary"
                :label="$t('pbxConfig.addSeat')"
                :disable="isSeatListRequesting"
                @click="enableSeatAddForm"
            />
            <csc-list-action-button
                v-if="!showFilters"
                slot="slot2"
                icon="fa-filter"
                color="primary"
                :label="$t('pbxConfig.seatsFilters')"
                :disable="isSeatListRequesting"
                @click="toggleFilters()"
            >
                {{$t('pbxConfig.seatsFilters')}}
            </csc-list-action-button>
        </csc-list-actions>
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

            <!-- filters -->
            <div class="csc-pbx-filters-container row justify-center">
                <div
                    class="csc-pbx-filter-fields-container"
                    v-if="showFilters"
                >
                    <div>
                        <q-field
                          dark
                          class="csc-pbx-filters-field"
                        >
                            <q-select
                                dark
                                v-model="filterType"
                                :options="filterTypes"
                                :float-label="$t('pbxConfig.seatsFiltersFilterByLabel')"
                            />

                        </q-field>
                        <q-field
                          v-if="filterType"
                          dark
                          class="csc-pbx-filters-field"
                        >
                            <q-input
                                dark
                                ref="inputFilter"
                                :clearable="false"
                                type="text"
                                :value="typedFilter"
                                :float-label="$t('pbxConfig.seatsFilterInputLabel')"
                                @input="inputFilter"
                                :after="[
                                    {
                                        icon: 'search',
                                        color: 'primary',
                                        handler () {
                                          triggerFilter()
                                        }
                                    }
                                ]"
                            />
                        </q-field>
                    </div>
                    <div
                      v-if="filterType"
                      class="csc-pbx-chips-container"
                      v-for="(filter, item) in filters"
                      dark
                    >
                        <q-chip
                            closable
                            @close="removeFilter(filter)"
                        >
                            {{ filterType === 'name' ? 'Name: ' + filter : filter }}
                        </q-chip>
                    </div>
                    <div class="csc-pbx-filter-buttons">
                        <q-btn
                            flat
                            icon="clear"
                            color="white"
                            @click="closeFilters"
                        >
                            {{ $t('pbxConfig.seatsFiltersClose') }}
                        </q-btn>
                        <q-btn
                            flat
                            icon="fa-filter"
                            color="red"
                            @click="emptyFilters"
                        >
                            {{$t('pbxConfig.seatsFiltersReset')}}
                        </q-btn>
                    </div>
                </div>
            </div>
            <!--  -->

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
                    :intra-pbx="getIntraPbx(seat.id)"
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
                    @save-intra-pbx="setIntraPbx"
                    @jump-to-call-queue="jumpToCallQueue"
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
        QField,
        QPagination,
        QTransition,
        QSlideTransition,
        QSelect,
        QInput,
        QChip
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
            return {
                showFilters: false,
                filterType: null,
                filterTypes: [
                    { label: this.$t('pbxConfig.seatsFiltersTypes.name'), value: 'name' },
                ],
                typedFilter: null,
                filters: []
            }
        },
        components: {
            CscFadeDown,
            CscFadeUp,
            CscZoom,
            CscFade,
            QList,
            QBtn,
            QField,
            QPagination,
            QTransition,
            QSlideTransition,
            QSelect,
            QInput,
            QChip,
            CscSpinner,
            CscPage,
            CscPbxSeat,
            CscPbxSeatAddForm,
            CscRemoveDialog,
            CscList,
            CscListActions,
            CscListActionButton
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
                'getIntraPbx',
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
                'setSeatSoundSet',
                'setIntraPbx'
            ]),
            ...mapMutations('pbxSeats', [
                'enableSeatAddForm',
                'disableSeatAddForm',
                'expandSeat',
                'collapseSeat',
                'seatRemovalRequesting',
                'seatRemovalCanceled'
            ]),
            ...mapActions('pbxCallQueues', [
                'jumpToCallQueue'
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
            },
            toggleFilters() {
                this.showFilters = !this.showFilters
            },
            inputFilter(input) {
                this.typedFilter = input
            },
            closeFilters() {
                this.showFilters = false
            },
            emptyFilters () {
                this.filterType = null
                this.typedFilter = null
                this.filters = []
                this.$scrollTo(this.$parent.$el)
                this.loadSeatListItems({
                    page: 1
                })
            },
            triggerFilter() {
                this.$scrollTo(this.$parent.$el)
                this.loadSeatListItems({
                    page: 1,
                    display_name: this.typedFilter
                });
                this.filters = []
                this.filters.push(this.typedFilter)
                this.typedFilter = null
            },
            removeFilter(filter){
                this.filters = this.filters.filter( $filter => $filter !== filter )
                if(this.filters.length < 1){
                    this.emptyFilters()
                }

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
                    showGlobalError(this.seatUpdateError, 5000);
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
    .csc-pbx-filters-container
        color $secondary
        margin-bottom 20px
    .csc-pbx-chips-container
        margin 20px auto 20px auto
        text-align center
    .csc-pbx-filters-field
        width 250px
        display inline-block
        margin-left 10px

    .csc-pbx-filter-fields-container
        margin-top -15px
    .csc-pbx-filter-buttons
        margin-top 15px
        text-align center
</style>
