
<template>
	<q-field
		:error-label="errorMessage"
	>
		<q-input
			ref="inputField"
			v-model="inputValue"
			dark
			clearable
			type="text"
			:float-label="label"
			:error="$v.inputValue.$error"
			:before="beforeButtons"
			@keyup.enter="submit"
			@keypress.space.prevent
			@keydown.space.prevent
			@keyup.space.prevent
			@input="input"
			@blur="blur"
		/>
	</q-field>
</template>

<script>
import {
	userInfoAndEmpty
} from 'src/helpers/validation'
import {
	maxLength,
	required
} from 'vuelidate/lib/validators'

export default {
	name: 'CscNewCallForwardInput',
	props: {
		label: {
			type: String,
			default: ''
		},
		prefilled: {
			type: String,
			default: ''
		},
		before: {
			type: Array,
			default () {
				return []
			}
		}
	},
	data () {
		return {
			inputValue: '',
			error: ''
		}
	},
	validations: {
		inputValue: {
			userInfoAndEmpty,
			maxLength: maxLength(64),
			required
		}
	},
	computed: {
		errorMessage () {
			if (!this.$v.inputValue.required) {
				return this.$t('validationErrors.fieldRequired', {
					field: this.label
				})
			} else if (!this.$v.inputValue.maxLength) {
				return this.$t('validationErrors.maxLength', {
					field: this.label,
					maxLength: this.$v.inputValue.$params.maxLength.max
				})
			} else if (!this.$v.inputValue.userInfoAndEmpty) {
				return this.$t('validationErrors.inputValidNumber')
			} else {
				return ''
			}
		},
		beforeButtons () {
			return this.before ? this.before : []
		}
	},
	watch: {
		error (state) {
			this.$emit('error', state)
		}
	},
	mounted () {
		if (this.prefilled) {
			this.inputValue = this.prefilled === ' ' ? '' : this.prefilled
			this.$v.$reset()
		}
	},
	methods: {
		submit () {
			this.$emit('submit')
		},
		input () {
			this.$v.inputValue.$touch()
			this.error = this.$v.inputValue.$error
			this.$emit('input', this.inputValue)
		},
		blur () {
			this.$v.inputValue.$touch()
			this.error = this.$v.inputValue.$error
		},
		reset () {
			this.$refs.inputField.clear()
			this.$v.$reset()
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
