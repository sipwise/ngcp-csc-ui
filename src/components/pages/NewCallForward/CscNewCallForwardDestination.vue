<template>
		<div
			class="row csc-cf-destination-cont"
			v-bind:class="{ 'csc-cf-removed-destination': removeInProgress }"
		>
			<div class="col col-xs-12 col-md-4 text-right">
				{{ this.allCallsFwd  ? '' : $t('pages.newCallForward.destinationTimeoutLabel') }}
				<span
					v-if="!this.allCallsFwd"
					class='csc-cf-timeout csc-cf-destination-link'
				>
					{{this.destinationTimeout}}
					<q-popover
						ref="timeoutForm"
						self="top left"
						class="csc-cf-timeout-form"
						@close="saveTimeout()"
					>
						<q-slider
							v-model="destinationTimeout"
							label
							label-always
							:step="5"
							:min="5"
							:max="300"
							snap
						/>
					</q-popover>
				</span>
				{{ this.allCallsFwd
					? $t('pages.newCallForward.allCallsForwardedTo')
					: isVoiceMail() || isOfflineGroup() || isBusyGroup()
						? $t('pages.newCallForward.destinationVoicemailLabel')
						: $t('pages.newCallForward.destinationNumberLabel')
				}}
			</div>
			<div class="col text-left col-xs-12 col-md-2 csc-cf-dest-number-cont">

				<div
					v-bind:class="{ 'csc-cf-destination-link': !isVoiceMail() }"
					class='csc-cf-destination'
				>
					{{ !this.destinationNumber || this.destinationNumber.length < 2
							? $t('pages.newCallForward.destinationLabel')
							: this.destinationNumber}}
					<q-popover
						ref="destTypeForm"
						class="csc-cf-dest-popover-bottom"
						v-if="!isVoiceMail()"
						v-bind:class="{ 'csc-cf-popover-hide': disableDestType, 'csc-cf-popover-to-top': popoverToTop, 'csc-cf-popover-timeout-to-top': popoverTimeoutToTop }"
						@open="showDestTypeForm()"
						@close="showNext()"
					>
						<csc-new-call-forward-destination-type-form
							ref="selectDestinationType"
						/>
					</q-popover>

					<q-popover
						ref="numberForm"
						class="csc-cf-number-form csc-cf-dest-popover-bottom"
						v-if="!isVoiceMail()"
						v-bind:class="{ 'csc-cf-popover-hide': disableNumberPopover, 'csc-cf-popover-to-top': popoverToTop, 'csc-cf-popover-timeout-to-top': popoverTimeoutToTop  }"
						@open="showNumberForm()"
						@close="movePopoverToInitialPos(); movePopoverTimeoutToInitialPos()"
					>
						<csc-new-call-forward-add-destination-form
							ref="addDestinationForm"
							:index="this.destinationIndex"
							:destination="this.destinationNumber"
							:groupName="this.groupName"
							:groupId="this.groupId"
							:firstDestinationInCreation="this.firstDestinationInCreation"
						/>
					</q-popover>
				</div>

			</div>
			<div class="col col-xs-12 col-md-5 csc-cf-destination-actions">
				<q-icon
					name="delete"
					color="negative"
					size="24px"
					@click="showConfirmDialog"
				/>
				<csc-confirm-dialog
					ref="confirmDialog"
					title-icon="delete"
					:title="$t('pages.newCallForward.cancelDialogTitle', {groupName: this.groupName})"
					:message="$t('pages.newCallForward.cancelDialogText', {groupName: this.groupName, destination: getDestName()})"
					@confirm="confirmDeleteDest"
				/>
			</div>
	</div>

</template>

<script>
	import {
		mapGetters,
	} from 'vuex'
	import {
		QIcon,
		QBtn,
		QPopover,
		QSlider,
		QList,
		QItem,
		QItemMain,
		QSpinnerDots
	} from 'quasar-framework'
	import CscConfirmDialog from "../../CscConfirmationDialog";
	import CscNewCallForwardAddDestinationForm from './CscNewCallForwardAddDestinationForm'
	import CscNewCallForwardDestinationTypeForm from './CscNewCallForwardDestinationTypeForm'
    export default {
        name: 'csc-new-call-forward-destination',
        components: {
			QIcon,
			QBtn,
			QPopover,
			QSlider,
			QList,
			QItem,
			QItemMain,
			QSpinnerDots,
			CscConfirmDialog,
			CscNewCallForwardDestinationTypeForm,
			CscNewCallForwardAddDestinationForm
		},
        props: [
			'allCallsFwd',
			'groupId',
			'groupName',
            'destination',
			'index'
        ],
        mounted(){
			this.updateValues(this.destination)
		},
		data(){
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
				'getOwnPhoneTimeout'
			]),
			disableDestType(){
				return !this.groupId.toString().includes('temp-')
			},
			disableNumberPopover(){
				return !this.groupId.toString().includes('temp-') ? false : this.toggleNumberForm;
			}
		},
        methods: {
			updateValues(destination){
				this.destinationTimeout = 	this.index === 0
											&& this.groupName === 'csc-timeout'
											&& isNaN(this.getOwnPhoneTimeout) === false
												? this.getOwnPhoneTimeout
												: destination.timeout;
				this.destinationNumber = this.isVoiceMail() ? `${this.$t('pages.newCallForward.voiceMailLabel')}` : destination.simple_destination;
				this.destinationIndex = this.index;
			},
			async showNext(){
				switch(this.$refs.selectDestinationType.action){
					case 'destination':
						this.toggleNumberForm = false;
						this.$refs.numberForm.open();
					break;
					case 'voicemail':
						await this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
						if(this.groupId.toString().includes('temp-')){ // unexisting group
							const newGroupId = await this.$store.dispatch('newCallForward/addForwardGroup', {
								name: this.groupName,
								destination: 'voicebox'
							});

							await this.$store.dispatch('newCallForward/loadForwardGroups');

							if(this.firstDestinationInCreation){
								await this.$store.dispatch('newCallForward/setFirstDestinationInCreation', newGroupId);
								this.firstDestinationInCreation = false;
							}

						}
						else{
							await this.$store.dispatch('newCallForward/addVoiceMail', this.groupId);
						}
						await this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);
						this.popoverToTop = false;
						this.popoverTimeoutToTop = false;
					break;
					default:
						this.popoverToTop = false;
						this.popoverTimeoutToTop = false;
				}
			},
			showNumberForm(){
				this.$refs.addDestinationForm.add();
			},
			showDestTypeForm(){
				this.toggleNumberForm = true;
				this.$refs.selectDestinationType.add();
			},
			async saveTimeout(){
				await this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
				await this.$store.dispatch('newCallForward/editTimeout', {
					index: this.destinationIndex,
					timeout: this.destinationTimeout,
					forwardGroupId: this.groupId
				});
				await this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);

			},
			showConfirmDialog(){
				this.$refs.confirmDialog.open();
			},
			async confirmDeleteDest(){
				this.removeInProgress = true;
				await this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
				await this.$store.dispatch('newCallForward/removeDestination', {
					destination: this.destination,
					forwardGroupId: this.groupId
				});
				await this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);
			},
			isVoiceMail(){
				return this.destination.destination.includes('voicebox.local')
			},
			isBusyGroup(){
				return this.groupName.includes('busy');
			},
			isOfflineGroup(){
				return this.groupName.includes('offline');
			},
			isNotTimeoutOrUnconditional(){
				return this.destination.destination.includes('voicebox.local')
			},
			getDestName(){
				return this.destination.simple_destination
								? this.destination.simple_destination
								: this.isVoiceMail()
									? `${this.$t('pages.newCallForward.voiceMailLabel')}`
									: "";
			},
			movePopoverToTop(){
				this.popoverToTop = true;
			},
			movePopoverToInitialPos(){
				this.popoverToTop = false;
			},
			movePopoverTimeoutToTop(){
				this.popoverTimeoutToTop = true;
			},
			movePopoverTimeoutToInitialPos(){
				this.popoverTimeoutToTop = false;
			}
		}
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
	.csc-cf-destination-cont
		width 100%
		padding 5px
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
	.csc-cf-timeout-form,
	.csc-cf-number-form
		padding 0 20px 0 20px
		min-width 120px
	.csc-cf-dest-number-cont
		padding-left 30px
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
</style>
