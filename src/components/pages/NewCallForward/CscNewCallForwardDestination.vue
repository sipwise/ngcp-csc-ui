<template>
		<div
			class="row csc-cf-destination-cont"
			:class="removed"
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
					: isVoiceMail()
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
						anchor="top right"
						v-if="!isVoiceMail() && !groupId.toString().includes('temp-')"
						@open="showDestTypeForm()"
						@close="showNext()"
					>
						<csc-new-call-forward-destination-type-form
							ref="selectDestinationType"
						/>
					</q-popover>
					<q-popover
						ref="numberForm"
						anchor="top right"
						class="csc-cf-number-form"
						v-if="!isVoiceMail()"
						v-bind:class="{ 'csc-cf-popover-hide': toggleNumberForm }"
						v-if=""
						@open="showNumberForm()"
					>
						<csc-new-call-forward-add-destination-form
							ref="addDestinationForm"
							:index="this.destinationIndex"
							:destination="this.destinationNumber"
							:groupName="this.groupName"
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
				<q-spinner-dots
					v-if="showDots"
					color="primary"
					:size="24"
				/>
				<csc-confirm-dialog
					ref="confirmDialog"
					title-icon="delete"
					:title="$t('pages.newCallForward.cancelDialogTitle', {groupName: this.groupName})"
					:message="$t('pages.newCallForward.cancelDialogText', {groupName: this.groupName, destination: this.destination.simple_destination})"
					@confirm="deleteDestination"
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
				showDots: false,
				removeInProgress: false,
				toggleNumberForm: true
			}
		},
		computed: {
			...mapGetters('newCallForward', [
				'getOwnPhoneTimeout'
			]),
			removed(){
				return this.removeInProgress ? "csc-cf-removed-destination" : "";
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
						if(this.groupId.toString().includes('temp-')){ // unexisting group
							this.showDots = true;
							await this.$store.dispatch('newCallForward/addForwardGroup', {
								name: this.groupName,
								destination: 'voicebox'
							});
							await this.$store.dispatch('newCallForward/loadForwardGroups');
							this.showDots = false;
						}
						else{
							await this.$store.dispatch('newCallForward/addVoiceMail', this.groupId);
						}
					break;
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
				this.$store.dispatch('newCallForward/editTimeout', {
					index: this.destinationIndex,
					timeout: this.destinationTimeout,
					forwardGroupId: this.groupId
				});
			},
			showConfirmDialog(){
				this.$refs.confirmDialog.open();
			},
			async deleteDestination(){
				this.showDots = true;
				this.removeInProgress = true;
				await this.$store.dispatch('newCallForward/removeDestination', {
					destination: this.destination,
					forwardGroupId: this.groupId
				});
				await this.$store.dispatch('newCallForward/loadForwardGroups');
				await this.$store.dispatch('newCallForward/loadMappings');
			},
			isVoiceMail(){
				return this.destination.destination.includes('voicebox.local')
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
	.csc-cf-removed-destination
		visibility hidden
		opacity 0
		transition visibility 0s 1s, opacity 1s linear
	.csc-cf-popover-hide
		display none
</style>
