<template>
	<q-input
		ref="inputField"
		clearable
		type="text"
		:label="$t('call.number')"
		:value="value"
		:disable="!enabled"
		:error="$v.phoneNumber.$error"
		:readonly="readonly"
		@keypress.space.prevent
		@keydown.space.prevent
		@keyup.space.prevent
		@keyup.enter="keyReturn()"
		@input="inputNumber"
	/>
</template>
<script>
import Vue from 'vue'
import {
	userInfoAndEmpty
} from 'src/helpers/validation'
import {
	maxLength
} from 'vuelidate/lib/validators'
import platformMixin from '../../mixins/platform'
export default {
	name: 'CscPhoneNumberInput',
	validations: {
		phoneNumber: {
			userInfoAndEmpty,
			maxLength: maxLength(64)
		}
	},
	mixins: [
		platformMixin
	],
	props: {
		maxLength: {
			type: Number,
			default: 64
		},
		enabled: {
			type: Boolean,
			default: true
		},
		readonly: {
			type: Boolean,
			default: false
		},
		dark: {
			type: Boolean,
			default: true
		},
		value: {
			type: String,
			default: ''
		}
	},
	data () {
		return {
			phoneNumber: this.value
		}
	},
	computed: {
		errorMessage () {
			if (!this.$v.phoneNumber.required) {
				return this.$t('validationErrors.fieldRequired', {
					field: this.$t('call.number')
				})
			} else if (!this.$v.phoneNumber.maxLength) {
				return this.$t('validationErrors.maxLength', {
					field: this.$t('call.number'),
					maxLength: this.$v.phoneNumber.$params.maxLength.max
				})
			} else if (!this.$v.phoneNumber.userInfo) {
				return this.$t('validationErrors.inputValidNumber')
			} else {
				return ''
			}
		},
		helperMessage () {
			return this.$t('validationErrors.inputNumber')
		}
	},
	watch: {
		value () {
			this.phoneNumber = this.value
			this.$v.phoneNumber.$touch()
		}
	},
	methods: {
		inputNumber (input) {
			this.phoneNumber = input
			this.$v.phoneNumber.$touch()
			this.$emit('number-changed', this.phoneNumber)
		},
		keyReturn () {
			this.$emit('key-return')
		},
		focus () {
			Vue.nextTick(() => {
				if (this.$refs.inputField) {
					this.$refs.inputField.focus()
				}
			})
		},
		blur () {
			Vue.nextTick(() => {
				if (this.$refs.inputField) {
					this.$refs.inputField.blur()
				}
			})
		}
	}
}
</script>
<style lang="stylus" rel="stylesheet/stylus">
</style>
