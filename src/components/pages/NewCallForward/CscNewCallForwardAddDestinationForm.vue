<template>
	<div
		v-if="enabled"
		class="csc-form"
	>
		<csc-new-call-forward-input
			v-model="number"
			:label="$t('callBlocking.number')"
			:prefilled="destination"
			@submit="save"
			@error="error"
		/>
		<div
			class="csc-form-actions row justify-center csc-actions-cont"
		>
			<q-btn
				flat
				color="default"
				icon="clear"
				@mousedown.native="cancel()"
			>
				{{ $t('buttons.cancel') }}
			</q-btn>
			<q-btn
				v-if="!loading"
				flat
				color="primary"
				icon="done"
				:disable="saveDisabled"
				@click="save(); close()"
			>
				{{ $t('buttons.save') }}
			</q-btn>
			<div
				v-if="loading"
				class="csc-form-actions-spinner"
			>
				<csc-spinner />
			</div>
		</div>
	</div>
</template>

<script>
import CscNewCallForwardInput from './CscNewCallForwardInput'
import CscSpinner from '../../CscSpinner'
import {
	showGlobalError
} from 'src/helpers/ui'
import {
	maxLength
} from 'vuelidate/lib/validators'

export default {
	name: 'CscNewCallForwardAddDestinationForm',
	components: {
		CscNewCallForwardInput,
		CscSpinner
	},
	props: {
		destination: {
			type: Object,
			default: null
		},
		index: {
			type: Number,
			default: null
		},
		disable: {
			type: Boolean,
			default: false
		},
		loading: {
			type: Boolean,
			default: false
		},
		groupName: {
			type: String,
			default: ''
		},
		groupId: {
			type: String,
			default: null
		},
		firstDestinationInCreation: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			enabled: false,
			number: '',
			numberError: false,
			destinationIndex: null
		}
	},
	validations: {
		number: {
			maxLength: maxLength(64)
		}
	},
	computed: {
		saveDisabled () {
			return this.numberError || this.disable || this.loading
		}
	},
	updated () {
		if (Number.isInteger(this.index)) {
			this.destinationIndex = this.index
		}
	},
	methods: {
		async save () {
			const forwardGroupId = this.groupId
			const forwardGroupName = this.groupName
			const forwardGroup = await this.$store.dispatch('newCallForward/getForwardGroupById', forwardGroupId)
			this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
			if (this.numberError || this.saveDisabled) {
				showGlobalError(this.$t('validationErrors.generic'))
			} else if (Number.isInteger(this.destinationIndex) && Number.isInteger(forwardGroup.id)) { // edit mode
				await this.$store.dispatch('newCallForward/editDestination', {
					index: this.destinationIndex,
					forwardGroupId: forwardGroup.id,
					destination: this.number
				})
			} else {
				if (forwardGroup.id.toString().includes('temp-')) { // unexisting group
					forwardGroup.destinations[0].simple_destination = this.number // optimistic UI update :)
					const newGroupId = await this.$store.dispatch('newCallForward/addForwardGroup', {
						name: forwardGroupName,
						destination: this.number
					})

					await this.$store.dispatch('newCallForward/loadForwardGroups')

					if (this.destinationIndex === 0 && this.firstDestinationInCreation) {
						await this.$store.dispatch('newCallForward/setFirstDestinationInCreation', newGroupId)
					}
				} else { // existing group
					await this.$store.dispatch('newCallForward/addDestination', {
						forwardGroupId: forwardGroup.id,
						destination: this.number
					})
					await this.$store.dispatch('newCallForward/loadForwardGroups')
				}
			}
			this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
		},
		cancel () {
			this.number = ''
			this.enabled = false
			this.$parent.close()
		},
		add () {
			this.number = ''
			this.enabled = true
		},
		close () {
			this.enabled = false
			this.$parent.close()
		},
		reset () {
			this.cancel()
		},
		error (state) {
			this.numberError = state
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-actions-cont
        margin-bottom 15px
</style>
