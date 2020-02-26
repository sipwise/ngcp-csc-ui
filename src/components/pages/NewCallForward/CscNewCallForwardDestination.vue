<template>
		<div class="row csc-cf-destination-cont">
			<div class="col col-xs-12 col-md-4 text-right">
				{{ $t('pages.newCallForward.destinationTimeoutLabel') }}
				<span class='csc-cf-timeout'>
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
							:min="0"
							:max="300"
							snap
						/>
					</q-popover>
				</span>
				{{ $t('pages.newCallForward.destinationNumberLabel') }}
			</div>
			<div class="col text-left csc-cf-dest-number-cont">

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
						/>
					</q-popover>
				</div>
			</div>
			<div class="col col-xs-12 col-md-5 ">
				<!-- TODO add remove btn -->
			</div>
	</div>

</template>

<script>
	import {
		// QField,
		// QToggle,
		QIcon,
		QBtn,
		QPopover,
		QSlider,
		QList,
		QItem,
		QItemMain
	} from 'quasar-framework'
	// import { mapGetters } from 'vuex'
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
			CscNewCallForwardAddDestinationForm
		},
        props: [
			'groupId',
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
				destinationIndex: null
			}
		},
        methods: {
			updateValues(destination){
				this.destinationTimeout = destination.timeout;
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



</style>
