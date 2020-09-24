<template>
	<div
		class="row csc-cf-destination-cont"
		:class="{ 'csc-cf-removed-destination': removeInProgress }"
	>
		<div class="col-xs-4 col-md-4 text-right">
			{{ labelTimeout }}
			<span
				v-if="!allCallsFwd"
				class="csc-cf-timeout csc-cf-destination-link"
			>
				{{ destinationTimeout }}
				<q-menu
					ref="timeoutForm"
					class="csc-cf-timeout-menu"
					@hide="saveTimeout()"
				>
					<q-item
						class="csc-cf-timeout-item"
					>
						<q-slider
							ref="timeout"
							v-model="destinationTimeout"
							label
							label-always
							:step="5"
							:min="5"
							:max="60"
							label-text-color="secondary"
							markers
							snap
						/>
					</q-item>
				</q-menu>
			</span>
			{{ labelFront }}
		</div>
		<div class="text-left col-xs-2 col-md-2 csc-cf-dest-number-cont">
			<div
				:class="{ 'csc-cf-destination-link': !isVoiceMail() }"
				class="csc-cf-destination"
				@click="toggleDestMenu()"
			>
				{{ labelNumber }}
				<q-menu
					v-if="!isVoiceMail()"
					ref="destTypeForm"
					class="csc-cf-dest-popover-bottom"
					:class="{ 'csc-cf-popover-hide': disableDestType, 'csc-cf-popover-to-top': popoverToTop, 'csc-cf-popover-timeout-to-top': popoverTimeoutToTop }"
					:auto-close="true"
					:no-parent-event="true"
					@show="showDestTypeForm()"
					@hide="showNext()"
				>
					<div
						v-if="firstDestinationInCreation && (popoverToTop || popoverTimeoutToTop)"
						class="csc-cf-popver-alert"
					>
						{{ $t('pages.newCallForward.mandatoryDestinationLabel') }}
					</div>
					<csc-new-call-forward-destination-type-form
						ref="selectDestinationType"
					/>
				</q-menu>
				<q-menu
					v-if="!isVoiceMail()"
					ref="numberForm"
					:no-parent-event="true"
					class="csc-cf-dest-popover-bottom"
					:class="{ 'csc-cf-popover-hide': disableNumberPopover, 'csc-cf-popover-to-top': popoverToTop, 'csc-cf-popover-timeout-to-top': popoverTimeoutToTop }"
					@show="showNumberForm()"
					@hide="movePopoverToInitialPos(); movePopoverTimeoutToInitialPos()"
				>
					<csc-new-call-forward-add-destination-form
						ref="addDestinationForm"
						class="q-pa-md"
						:index="destinationIndex"
						:destination="destinationNumber"
						:group-name="groupName"
						:group-id="groupId"
						:first-destination-in-creation="firstDestinationInCreation"
					/>
				</q-menu>
			</div>
		</div>
		<div class="col col-xs-5 col-md-5 csc-cf-destination-actions">
			<q-icon
				name="delete"
				color="negative"
				size="24px"
				@click="showConfirmDialog"
			/>
			<csc-confirm-dialog
				ref="confirmDialog"
				title-icon="delete"
				:title="$t('pages.newCallForward.cancelDialogTitle', {groupName: groupName})"
				:message="$t('pages.newCallForward.cancelDialogText', {groupName: groupName, destination: getDestName()})"
				@confirm="confirmDeleteDest"
			/>
		</div>
	</div>
</template>

<script>
import {
	mapGetters
} from 'vuex'
import CscConfirmDialog from '../../CscConfirmationDialog'
import CscNewCallForwardAddDestinationForm from './CscNewCallForwardAddDestinationForm'
import CscNewCallForwardDestinationTypeForm from './CscNewCallForwardDestinationTypeForm'
export default {
	name: 'CscNewCallForwardDestination',
	components: {
		CscConfirmDialog,
		CscNewCallForwardDestinationTypeForm,
		CscNewCallForwardAddDestinationForm
	},
	props: {
		allCallsFwd: {
			type: Boolean,
			default: false
		},
		groupId: {
			type: [String, Number],
			default: null
		},
		groupName: {
			type: String,
			default: ''
		},
		destination: {
			type: Object,
			default: null
		},
		index: {
			type: Number,
			default: null
		}
	},
	data () {
		return {
			destinationTimeout: 0,
			destinationNumber: null,
			destinationIndex: null,
			removeInProgress: false,
			toggleNumberForm: true,
			firstDestinationInCreation: false,
			popoverToTop: false,
			popoverTimeoutToTop: false
		}
	},
	computed: {
		...mapGetters('newCallForward', [
			'getSelectedDestinationType',
			'getOwnPhoneTimeout'
		]),
		disableDestType () {
			return !this.groupId.toString().includes('temp-')
		},
		disableNumberPopover () {
			return !this.groupId.toString().includes('temp-') ? false : this.toggleNumberForm
		},
		labelTimeout () {
			if (this.allCallsFwd) {
				return ''
			} else {
				return this.$t('pages.newCallForward.destinationTimeoutLabel')
			}
		},
		labelFront () {
			if (this.allCallsFwd) {
				return this.$t('pages.newCallForward.allCallsForwardedTo')
			} else if (this.isVoiceMail() || this.isOfflineGroup() || this.isBusyGroup()) {
				return this.$t('pages.newCallForward.destinationVoicemailLabel')
			} else {
				return this.$t('pages.newCallForward.destinationNumberLabel')
			}
		},
		labelNumber () {
			if (!this.destinationNumber || this.destinationNumber.length < 2) {
				return this.$t('pages.newCallForward.destinationLabel')
			} else {
				return this.destinationNumber
			}
		}
	},
	mounted () {
		this.updateValues(this.destination)
	},
	methods: {
		updateValues (destination) {
			this.destinationTimeout = 	this.index === 0 &&
				this.groupName === 'csc-timeout' &&
				isNaN(this.getOwnPhoneTimeout) === false
				? this.getOwnPhoneTimeout
				: destination.timeout
			this.destinationNumber = this.isVoiceMail() ? `${this.$t('pages.newCallForward.voiceMailLabel')}` : destination.simple_destination
			this.destinationIndex = this.index
		},
		async showNext () {
			switch (this.getSelectedDestinationType) {
			case 'destination':
				this.toggleNumberForm = false
				this.$refs.numberForm.show()
				break
			case 'voicemail':
				this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
				if (this.groupId.toString().includes('temp-')) { // unexisting group
					const newGroupId = await this.$store.dispatch('newCallForward/addForwardGroup', {
						name: this.groupName,
						destination: 'voicebox'
					})

					await this.$store.dispatch('newCallForward/loadForwardGroups')

					if (this.firstDestinationInCreation) {
						await this.$store.dispatch('newCallForward/setFirstDestinationInCreation', newGroupId)
						this.firstDestinationInCreation = false
					}
				} else {
					await this.$store.dispatch('newCallForward/addVoiceMail', this.groupId)
				}
				this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
				this.popoverToTop = false
				this.popoverTimeoutToTop = false
				break
			default:
				this.popoverToTop = false
				this.popoverTimeoutToTop = false
			}
		},
		toggleDestMenu () {
			if (this.destinationNumber === 'Voicemail') {
				return
			}
			if (this.destinationNumber && this.destinationNumber !== ' ') {
				this.$refs.numberForm.show()
			} else {
				this.$refs.destTypeForm.show()
			}
		},
		showNumberForm () {
			this.$refs.addDestinationForm.add()
		},
		showDestTypeForm () {
			this.toggleNumberForm = true
			this.$refs.selectDestinationType.add()
		},
		async saveTimeout () {
			this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
			await this.$store.dispatch('newCallForward/editTimeout', {
				index: this.destinationIndex,
				timeout: this.destinationTimeout,
				forwardGroupId: this.groupId
			})
			this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
		},
		showConfirmDialog () {
			this.$refs.confirmDialog.open()
		},
		async confirmDeleteDest () {
			this.removeInProgress = true
			this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
			await this.$store.dispatch('newCallForward/removeDestination', {
				destination: this.destination,
				forwardGroupId: this.groupId
			})
			this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
		},
		isVoiceMail () {
			return this.destination.destination.includes('voicebox.local')
		},
		isBusyGroup () {
			return this.groupName.includes('busy')
		},
		isOfflineGroup () {
			return this.groupName.includes('offline')
		},
		isNotTimeoutOrUnconditional () {
			return this.destination.destination.includes('voicebox.local')
		},
		getDestName () {
			return this.destination.simple_destination
				? this.destination.simple_destination
				: this.isVoiceMail()
					? `${this.$t('pages.newCallForward.voiceMailLabel')}`
					: ''
		},
		movePopoverToTop () {
			this.popoverToTop = true
		},
		movePopoverToInitialPos () {
			this.popoverToTop = false
		},
		movePopoverTimeoutToTop () {
			this.popoverTimeoutToTop = true
		},
		movePopoverTimeoutToInitialPos () {
			this.popoverTimeoutToTop = false
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
	.csc-cf-timeout,
	.csc-cf-destination
		width 100px
		white-space nowrap
		overflow hidden
		text-overflow ellipsis
		font-weight bold
	.csc-cf-destination-link
		color $primary
		cursor pointer
	.csc-cf-timeout-menu
		height 40px
	.csc-cf-timeout-item
		min-width 200px
		padding 30px 20px 20px 20px
	.csc-cf-dest-number-cont
		padding-left 30px
		.q-toggle__inner
			top -8px
	.csc-cf-destination-actions
		text-align left
		cursor pointer
	.csc-cf-popover-hide
		display none
	.csc-cf-dest-popover-bottom
		margin-left 0px
	.csc-cf-removed-destination
		visibility hidden
		opacity 0
		transition visibility 0s 2s, opacity 2s linear
	.csc-cf-popover-to-top
		position: fixed;
		margin: -4vh 0px 0px -120px;
	.csc-cf-popover-timeout-to-top
		position: fixed;
		margin: -8.5vh 0px 0px -120px;
	.csc-cf-popver-alert
		padding 10px
		max-width 160px
		font-size 12px
		color $red
</style>
