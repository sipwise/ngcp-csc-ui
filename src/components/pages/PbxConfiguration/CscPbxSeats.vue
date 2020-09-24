<template>
	<csc-page
		class="q-pa-lg"
	>
		<csc-list-actions
			class="row justify-center q-mb-lg"
		>
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
				icon="filter_alt"
				color="primary"
				:label="$t('pbxConfig.seatsFilters')"
				:disable="isSeatListRequesting"
				@click="toggleFilters()"
			>
				{{ $t('pbxConfig.seatsFilters') }}
			</csc-list-action-button>
		</csc-list-actions>
		<csc-pbx-seat-add-form
			v-if="!isSeatAddFormDisabled"
			ref="addForm"
			class="q-mb-lg"
			:loading="isSeatCreating"
			:group-options="getGroupOptions"
			:alias-number-options="getNumberOptions"
			:sound-set-options="getSoundSetOptions"
			@save="createSeat"
			@cancel="disableSeatAddForm"
		/>
		<div
			v-if="showFilters"
			class="row justify-center q-mb-lg"
		>
			<div
				class="col col-6"
			>
				<q-select
					v-model="filterType"
					emit-value
					map-options
					:options="filterTypes"
					:label="$t('pbxConfig.seatsFiltersFilterByLabel')"
				/>
				<q-input
					v-if="filterType"
					ref="inputFilter"
					type="text"
					:value="typedFilter"
					:label="$t('pbxConfig.seatsFilterInputLabel')"
					@input="inputFilter"
				>
					<template
						v-slot:append
					>
						<q-btn
							icon="search"
							color="primary"
							dense
							flat
						/>
					</template>
				</q-input>
				<div
					class="q-mb-md"
				>
					<template
						v-for="(filter, index) in filters"
					>
						<q-chip
							v-if="filterType"
							:key="index"
							:label="filterType === 'name' ? 'Name: ' + filter : filter"
							closables
							@close="removeFilter(filter)"
						/>
					</template>
				</div>
				<div
					class="row justify-center"
				>
					<q-btn
						class="q-mr-sm"
						flat
						icon="clear"
						color="white"
						:label="$t('pbxConfig.seatsFiltersClose')"
						@click="closeFilters"
					/>
					<q-btn
						flat
						icon="undo"
						color="white"
						:label="$t('pbxConfig.seatsFiltersReset')"
						@click="emptyFilters"
					/>
				</div>
			</div>
		</div>
		<div
			v-if="isSeatListPaginationActive"
			class="row justify-center"
		>
			<q-pagination
				:value="seatListCurrentPage"
				:max="seatListLastPage"
				@input="loadSeatListItemsPaginated"
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
			class="row justify-center"
		>
			<csc-pbx-seat
				v-for="(seat, index) in seatListItems"
				:key="seat.id"
				:class="'col-xs-12 col-md-10 col-lg-8 csc-item-' + ((index % 2 === 0)?'odd':'even')"
				:seat="seat"
				:intra-pbx="getIntraPbx(seat.id)"
				:groups="groupMapById"
				:expanded="isSeatExpanded(seat.id)"
				:loading="isSeatLoading(seat.id)"
				:alias-number-options="getNumberOptions"
				:group-options="getGroupOptions"
				:sound-set-options="getSoundSetOptions"
				:sound-set="getSoundSetBySeatId(seat.id)"
				:label-width="4"
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
import CscListActions from '../../CscListActions'
import CscListActionButton from '../../CscListActionButton'
import {
	mapState,
	mapGetters,
	mapActions,
	mapMutations
} from 'vuex'
import {
	showGlobalError,
	showToast
} from 'src/helpers/ui'
import CscSpinner from '../../CscSpinner'
import {
	CreationState,
	RequestState
} from 'src/store/common'
import platform from '../../../mixins/platform'
import CscList from '../../CscList'

export default {
	components: {
		CscSpinner,
		CscPage,
		CscPbxSeat,
		CscPbxSeatAddForm,
		CscRemoveDialog,
		CscList,
		CscListActions,
		CscListActionButton
	},
	mixins: [
		platform
	],
	data () {
		return {
			showFilters: false,
			filterType: null,
			filterTypes: [
				{ label: this.$t('pbxConfig.seatsFiltersTypes.name'), value: 'name' }
			],
			typedFilter: null,
			filters: []
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
		resetSeatAddForm () {
			if (this.$refs.addForm) {
				this.$refs.addForm.reset()
			}
		},
		openSeatRemovalDialog (seatId) {
			if (this.$refs.removeDialog) {
				this.$refs.removeDialog.open()
				this.seatRemovalRequesting(seatId)
			}
		},
		closeSeatRemovalDialog () {
			this.seatRemovalCanceled()
		},
		loadSeatListItemsPaginated (page) {
			this.$scrollTo(this.$parent.$el)
			this.loadSeatListItems({
				page: page
			})
		},
		toggleFilters () {
			this.showFilters = !this.showFilters
		},
		inputFilter (input) {
			this.typedFilter = input
		},
		closeFilters () {
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
		triggerFilter () {
			this.$scrollTo(this.$parent.$el)
			this.loadSeatListItems({
				page: 1,
				display_name: this.typedFilter
			})
			this.filters = []
			this.filters.push(this.typedFilter)
			this.typedFilter = null
		},
		removeFilter (filter) {
			this.filters = this.filters.filter($filter => $filter !== filter)
			if (this.filters.length < 1) {
				this.emptyFilters()
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
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
