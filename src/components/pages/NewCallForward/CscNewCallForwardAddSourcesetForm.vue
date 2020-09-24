<template>
	<div
		v-if="enabled"
		class="csc-form"
	>
		<csc-input
			v-model="name"
			:label="$t('pages.newCallForward.sourcesetName')"
			@submit="save"
			@error="errorName"
		/>

		<csc-call-input
			v-model="number"
			:label="$t('callBlocking.number')"
			@submit="save"
			@error="errorNumber"
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
import CscCallInput from '../../form/CscCallInput'
import CscInput from '../../form/CscInput'
import CscSpinner from '../../CscSpinner'
import {
	showGlobalError
} from 'src/helpers/ui'
import {
	maxLength
} from 'vuelidate/lib/validators'

export default {
	name: 'CscNewCallForwardAddSourcesetForm',
	components: {
		CscCallInput,
		CscInput,
		CscSpinner
	},
	props: {
		groupName: {
			type: String,
			default: ''
		},
		groupId: {
			type: [String, Number],
			default: null
		}
	},
	data () {
		return {
			loading: false,
			enabled: false,
			number: '',
			name: '',
			nameError: false,
			numberError: false,
			destinationIndex: null
		}
	},
	validations: {
		number: {
			minLength: 1,
			maxLength: maxLength(64)
		},
		name: {
			minLength: 1
		}
	},
	computed: {
		saveDisabled () {
			return this.number.length < 1 || this.name.length < 1 || this.numberError || this.nameError || this.disable || this.loading
		}
	},
	methods: {
		async save () {
			let sourceSetId
			const forwardGroupId = this.groupId
			const forwardGroupName = this.groupName

			if (this.numberError || this.nameError || this.saveDisabled) {
				showGlobalError(this.$t('validationErrors.generic'))
				return
			}
			try {
				this.$emit('close')
				this.$store.dispatch('newCallForward/addGroupLoader', forwardGroupId)
				sourceSetId = await this.$store.dispatch('newCallForward/createSourceSet', {
					name: this.name,
					source: this.number
				})
				await this.$store.dispatch('newCallForward/addSourcesetToGroup', {
					name: forwardGroupName,
					id: forwardGroupId,
					sourceSetId: sourceSetId
				})
				this.$store.dispatch('newCallForward/loadSourcesets')
				this.$store.dispatch('newCallForward/removeGroupLoader', forwardGroupId)
			} catch (err) {
				console.log(err)
			}
		},
		cancel () {
			this.number = ''
			this.name = ''
			this.enabled = false
			this.$emit('close')
		},
		add () {
			this.number = ''
			this.name = ''
			this.enabled = true
		},
		close () {
			this.enabled = false
			this.$emit('close')
		},
		reset () {
			this.cancel()
		},
		errorName (state) {
			this.nameError = state
		},
		errorNumber (state) {
			this.numberError = state
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
