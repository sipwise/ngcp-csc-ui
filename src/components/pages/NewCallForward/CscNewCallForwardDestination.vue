<template>
	<div class="row csc-cf-destination-cont">
		<div class="col col-xs-12 col-md-4 ">
			{{ $t('pages.newCallForward.destinationTimeoutLabel') }}
			<span class='csc-cf-timeout'>
				{{this.destinationTimeout}}
				<q-popover
					ref="timeoutForm"
					self="top left"
					class="csc-cf-timeout-form"
				>
					<q-slider
						v-model="destinationTimeout"
						label
						label-always
						:step="5"
						:min="0"
						:max="120"
						@change="saveTimeout()"
					/>
				</q-popover>
			</span>
			{{ $t('pages.newCallForward.destinationNumberLabel') }}
		</div>
		<div class="col col-xs-12 col-md-2 ">

			<span class='csc-cf-destination'>
				{{this.destinationNumber}}
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
			</span>
		</div>
		<div class="col col-xs-12 col-md-2 ">
			<!-- TODO add remove btn -->
		</div>
	</div>
</template>

<script>
	import {
		// QField,
		// QToggle,
		QBtn,
		QPopover,
		QSlider,
		QList,
		QItem,
		QItemMain
	} from 'quasar-framework'
	import { mapGetters } from 'vuex'
	import CscNewCallForwardAddDestinationForm from './CscNewCallForwardAddDestinationForm'
    export default {
        name: 'csc-new-call-forward-destination',
        components: {
			QBtn,
			QPopover,
			QSlider,
			QList,
			QItem,
			QItemMain,
			CscNewCallForwardAddDestinationForm
		},
        props: [
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
		computed: {
			...mapGetters('newCallForward', [
				'destinations'
			])
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
				const destinationSetName = 'csc-unconditional'; // gonna be dynamic
                const getDestinationSetByName = await this.$store.dispatch('newCallForward/getDestinationSetByName', destinationSetName);
				this.$store.dispatch('newCallForward/editTimeout', {
					index: this.destinationIndex,
					timeout: this.destinationTimeout,
					destinationSetId: getDestinationSetByName.id
				});
			}
		},
        watch: {
			destinations(){
				if(Number.isInteger(this.destinationIndex)){
					this.updateValues(this.destinations[this.destinationIndex])
				}

			}
		}
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
	.csc-cf-destination-cont
		padding 5px
	.csc-cf-timeout,
	.csc-cf-destination
		color $primary
		cursor pointer
	.csc-cf-timeout-form,
	.csc-cf-number-form
		min-width 120px
		padding 0 15px 0 15px


</style>
