<template>
	<div
		class="csc-input-password-retype"
	>
		<csc-input-password
			ref="password"
			v-model="password"
			v-bind="$attrs"
			generate
			clearable
			:label="$t('pbxConfig.typePassword')"
			@input="inputPassword"
			@generated="passwordGenerated"
			@clear="passwordClear"
		/>
		<password-strength-meter
			v-show="false"
			v-model="password"
			:strength-meter-only="true"
			@score="strengthMeterScoreUpdate"
		/>
		<q-linear-progress
			v-model="passwordScoreMappedValue"
			:color="passwordScoreColor"
			size="8px"
		/>
		<csc-input-password
			ref="passwordRetype"
			v-model="passwordRetype"
			v-bind="$attrs"
			:label="$t('pbxConfig.retypePassword')"
			:error="$v.passwordRetype.$error"
			:error-message="errorMessagePasswordRetype"
			clearable
			:disable="passwordScore < 2 || $attrs.disable"
			@clear="$v.passwordRetype.$reset"
			@blur="passwordRetypeBlur"
			@input="inputRetypePassword"
		/>
	</div>
</template>
<script>
import {
	sameAs,
	required
} from 'vuelidate/lib/validators'
import CscInputPassword from 'components/form/CscInputPassword'
import PasswordStrengthMeter from 'vue-password-strength-meter'
export default {
	name: 'CscInputPasswordRetype',
	components: {
		CscInputPassword,
		PasswordStrengthMeter
	},
	validations: {
		password: {
			required
		},
		passwordRetype: {
			required,
			sameAsPassword: sameAs('password')
		}
	},
	props: {
		value: {
			type: Object,
			default () {
				return {
					password: '',
					passwordRetype: ''
				}
			}
		}
	},
	data () {
		return {
			password: this.value.password,
			passwordRetype: this.value.passwordRetype,
			passwordScore: null
		}
	},
	computed: {
		errorMessagePasswordRetype () {
			if (!this.$v.passwordRetype.sameAsPassword) {
				return this.$t('pbxConfig.errorPasswordNotEqual')
			} else {
				return ''
			}
		},
		passwordScoreMappedValue () {
			if (this.passwordScore === null || this.passwordScore === undefined) {
				return 0
			}
			return (this.passwordScore + 1) / 5
		},
		passwordScoreColor () {
			if (this.passwordScore < 2) {
				return 'negative'
			} else if (this.passwordScore === 2) {
				return 'warning'
			} else {
				return 'primary'
			}
		}
	},
	watch: {
		value (value) {
			this.password = value.password
			this.passwordRetype = value.passwordRetype
		},
		passwordScore (score) {
			if (score < 2) {
				this.$refs.passwordRetype.clear()
				this.$v.$reset()
			}
		}
	},
	mounted () {
		this.$v.$reset()
		this.$refs.passwordRetype.clear()
		this.$refs.password.clear()
	},
	methods: {
		strengthMeterScoreUpdate (score) {
			this.passwordScore = score
			this.$emit('score', score)
		},
		inputPassword () {
			this.$emit('input', {
				password: this.password,
				passwordRetype: this.passwordRetype
			})
		},
		inputRetypePassword () {
			this.validate()
			this.inputPassword()
		},
		passwordGenerated (password) {
			this.$emit('input', {
				password: password,
				passwordRetype: password
			})
			this.$nextTick(() => {
				this.validate()
			})
		},
		passwordClear () {
			this.$refs.passwordRetype.clear()
			this.validate()
			this.$v.$reset()
		},
		passwordRetypeBlur () {
			this.validate()
		},
		validate () {
			this.$v.$touch()
			if (!this.$v.$invalid) {
				this.$emit('validation-succeeded')
			} else {
				this.$emit('validation-failed')
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.csc-input-password-retype
	.Password__strength-meter
		margin 0
		margin-top 16px !important
		margin-bottom 16px !important
</style>
