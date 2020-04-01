<template>
		<div
			class="row csc-cf-destination-cont"
			:class="removed"
		>
			<div class="col col-xs-12 col-md-4 text-right">
				{{ this.allCallsFwd  ? '' : $t('pages.newCallForward.destinationTimeoutLabel') }}
				<span
					v-if="!this.allCallsFwd"
					class='csc-cf-timeout'
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
				{{ this.allCallsFwd ?  $t('pages.newCallForward.allCallsForwardedTo') : $t('pages.newCallForward.destinationNumberLabel') }}
			</div>
			<div class="col text-left col-xs-12 col-md-2 csc-cf-dest-number-cont">

				<div class='csc-cf-destination'>
					{{ !this.destinationNumber || this.destinationNumber.length < 2
							? $t('pages.newCallForward.destinationLabel')
							: this.destinationNumber}}
					<q-popover
						ref="numberForm"
						anchor="top right"
						class="csc-cf-number-form"
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
				showDots: false
			}
		},
		computed: {
			...mapGetters('newCallForward', [
				'getOwnPhoneTimeout'
			]),
			removed(){
				return this.showDots ? "csc-cf-removed-destination" : "";
			}
		},
        methods: {
			updateValues(destination){
				this.destinationTimeout = this.index === 0 && this.groupName === 'csc-timeout' ? this.getOwnPhoneTimeout : destination.timeout;
				this.destinationNumber = destination.simple_destination;
				this.destinationIndex = this.index;
			},
			showNumberForm(){
				this.$refs.addDestinationForm.add();
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
				await this.$store.dispatch('newCallForward/removeDestination', {
					destination: this.destination,
					forwardGroupId: this.groupId
				});
				await this.$store.dispatch('newCallForward/loadForwardGroups');
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
		color $primary
		cursor pointer
	.csc-cf-timeout-form,
	.csc-cf-number-form
		min-width 120px
		padding 0 20px 0 20px
	.csc-cf-dest-number-cont
		padding-left 30px
	.csc-cf-destination-actions
		text-align left
		cursor pointer
	.csc-cf-removed-destination
		visibility hidden
		opacity 0
		transition visibility 0s 1s, opacity 1s linear
</style>
