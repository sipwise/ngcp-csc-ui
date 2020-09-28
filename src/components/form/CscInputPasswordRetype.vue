<template>
	<div
		class="csc-input-password-retype"
	>
		<csc-input-password
			v-model="password"
			v-bind="$attrs"
			generate
			clearable
			:label="$t('pbxConfig.typePassword')"
			@input="inputPassword"
			@generated="passwordGenerated"
			@clear="$refs.passwordRetype.clear()"
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
			@blur="blur"
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
		}
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
			this.$v.passwordRetype.$reset()
			this.inputPassword()
		},
		passwordGenerated (password) {
			this.$emit('input', {
				password: password,
				passwordRetype: password
			})
		},
		blur () {
			this.$v.passwordRetype.$touch()
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
