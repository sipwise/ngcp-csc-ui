<template>
	<div
		v-if="enabled"
		class="csc-form"
	>
		<csc-input
			v-model="number"
			:label="$t('callBlocking.number')"
			@submit="save"
			@error="error"
		/>
		<div
			class="row justify-center csc-actions-cont"
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
import CscInput from '../../form/CscInput'
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
		CscInput,
		CscSpinner
	},
	props: {
		destination: {
			type: String,
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
			type: [String, Number],
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
	mounted () {
		this.number = this.destination
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
			this.enabled = false
		},
		add () {
			this.enabled = true
		},
		close () {
			this.enabled = false
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
</style>
