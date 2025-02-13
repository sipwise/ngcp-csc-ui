<template>
    <csc-page-sticky
        id="csc-page-pbx-seats"
    >
        <template
            #header
        >
            <q-btn
                icon="add"
                color="primary"
                flat
                :label="$t('Add Seat')"
                :disable="!isSeatAddFormDisabled"
                @click="openAddForm"
            />
            <q-btn
                v-if="!showFilters"
                icon="filter_alt"
                color="primary"
                flat
                :label="$t('Filter')"
                @click="openFilters"
            />
            <q-btn
                v-if="showFilters"
                icon="clear"
                color="negative"
                flat
                :label="$t('Close filters')"
                @click="closeFilters"
            />
        </template>
        <template
            #toolbar
        >
            <csc-pbx-seat-filters
                v-if="showFilters"
                ref="filters"
                class="q-mb-md q-pa-md"
                @filter="filterEvent"
            />
            <csc-pbx-seat-add-form
                v-if="!isSeatAddFormDisabled"
                ref="addForm"
                class="q-mb-md q-pa-md"
                :loading="isSeatCreating"
                :group-options="getGroupOptions"
                :alias-number-options="getNumberOptions"
                :sound-set-options="getSoundSetOptions"
                @save="createSeat"
                @cancel="disableSeatAddForm"
            />
        </template>
        <div
            v-if="isSeatListPaginationActive"
            class="row justify-center"
        >
            <q-pagination
                :model-value="seatListCurrentPage"
                :max="seatListLastPage"
                @update:model-value="loadSeatListItemsPaginated"
            />
        </div>
        <div
            v-if="isSeatListRequesting && !(isSeatCreating || isSeatRemoving || isSeatUpdating)"
            class="row justify-center"
        >
            <csc-spinner />
        </div>
        <q-list
            v-if="!isSeatListEmpty && seatListVisibility === 'visible'"
            class="row justify-start items-start"
        >
            <csc-pbx-seat
                v-for="(seat, index) in seatListItems"
                :key="seat.id"
                :class="'col-xs-12 col-md-6 col-lg-4 csc-item-' + ((index % 2 === 0)?'odd':'even')"
                :seat="seat"
                :intra-pbx="getIntraPbx(seat.id)"
                :music-on-hold="getMusicOnHold(seat.id)"
                :groups="groupMapById"
                :loading="isSeatLoading(seat.id)"
                @remove="openSeatRemovalDialog(seat.id)"
                @save-intra-pbx="setIntraPbx"
                @save-music-on-hold="setMusicOnHold"
            />
        </q-list>
        <div
            v-if="!isSeatListRequesting && isSeatListEmpty"
            class="row justify-center csc-no-entities"
        >
            {{ $t('No seats created yet') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('Remove seat')"
            :message="getSeatRemoveDialogMessage"
            @remove="removeSeat({seatId:seatRemoving.id})"
            @cancel="closeSeatRemovalDialog"
        />
    </csc-page-sticky>
</template>

<script>
import CscPageSticky from 'components/CscPageSticky'
import CscRemoveDialog from 'components/CscRemoveDialog'
import CscSpinner from 'components/CscSpinner'
import CscPbxSeat from 'components/pages/PbxConfiguration/CscPbxSeat'
import CscPbxSeatAddForm from 'components/pages/PbxConfiguration/CscPbxSeatAddForm'
import CscPbxSeatFilters from 'components/pages/PbxConfiguration/CscPbxSeatFilters'
import _ from 'lodash'
import {
    showGlobalError,
    showToast
} from 'src/helpers/ui'
import platform from 'src/mixins/platform'
import {
    CreationState,
    RequestState
} from 'src/store/common'
import {
    mapActions,
    mapGetters,
    mapMutations,
    mapState
} from 'vuex'

export default {
    name: 'CscPagePbxSeats',
    components: {
        CscPbxSeatFilters,
        CscPageSticky,
        CscSpinner,
        CscPbxSeat,
        CscPbxSeatAddForm,
        CscRemoveDialog
    },
    mixins: [
        platform
    ],
    data () {
        return {
            showFilters: false,
            filters: null
        }
    },
    computed: {
        ...mapState('pbx', [
            'groupMapById'
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
            'seatListVisibility',
            'seatListState',
            'seatListError'
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
            'isSeatLoading',
            'getIntraPbx',
            'getMusicOnHold',
            'getSeatRemoveDialogMessage',
            'getSeatCreationToastMessage',
            'getSeatRemovalToastMessage',
            'getSeatUpdateToastMessage'
        ])
    },
    watch: {
        seatCreationState (state) {
            if (state === CreationState.created) {
                this.resetSeatAddForm()
                this.$scrollTo(this.$parent.$el)
                showToast(this.getSeatCreationToastMessage)
            } else if (state === CreationState.error) {
                showGlobalError(this.seatCreationError)
            }
        },
        seatUpdateState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.getSeatUpdateToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.seatUpdateError, 5000)
            }
        },
        seatRemovalState (state) {
            if (state === RequestState.succeeded) {
                this.$scrollTo(this.$parent.$el)
                showToast(this.getSeatRemovalToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.seatRemovalError)
            }
        },
        seatListState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.seatListError)
            }
        }
    },
    mounted () {
        this.$scrollTo(this.$parent.$el)
        this.disableSeatAddForm()
        this.loadSeatListItems()
    },
    methods: {
        ...mapActions('pbxSeats', [
            'loadSeatListItems',
            'createSeat',
            'removeSeat',
            'setIntraPbx',
            'setMusicOnHold'
        ]),
        ...mapMutations('pbxSeats', [
            'enableSeatAddForm',
            'disableSeatAddForm',
            'seatRemovalRequesting',
            'seatRemovalCanceled'
        ]),
        resetSeatAddForm () {
            if (this.$refs.addForm) {
                this.$refs.addForm.reset()
            }
        },
        openSeatRemovalDialog (seatId) {
            if (this.$refs.removeDialog) {
                this.$refs.removeDialog.show()
                this.seatRemovalRequesting(seatId)
            }
        },
        closeSeatRemovalDialog () {
            this.seatRemovalCanceled()
        },
        loadSeatListItemsPaginated (page) {
            this.$scrollTo(this.$parent.$el)
            this.loadSeatListItems({
                page
            })
        },
        openAddForm () {
            this.enableSeatAddForm()
            this.closeFilters()
        },
        openFilters () {
            this.showFilters = true
            this.disableSeatAddForm()
        },
        inputFilter (input) {
            this.typedFilter = input
        },
        closeFilters () {
            if (this.$refs.filters) {
                this.$refs.filters.removeFilters()
            }
            this.showFilters = false
        },
        filterEvent (filters) {
            this.$scrollTo(this.$parent.$el)
            this.filters = filters
            const payload = _.cloneDeep(filters)
            payload.page = 1
            this.loadSeatListItems(payload)
        }
    }
}
</script>
