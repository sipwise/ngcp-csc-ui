<template>
	<div
		class="csc-form"
	>
		<q-input
			ref="passwordInput"
			v-model.trim="password"
			clearable
			type="password"
			hide-bottom-space
			:label="$t('pbxConfig.typePassword')"
			:disable="loading"
			:error="$v.password.$error"
			:error-message="errorMessagePass"
			@blur="$v.password.$touch()"
		>
			<template
				v-slot:prepend
			>
				<q-icon
					name="lock"
				/>
			</template>
		</q-input>
		<password-strength-meter
			v-model="passwordScored"
			class="full-width"
			style="max-width: none;"
			:strength-meter-only="true"
			@score="strengthMeterScoreUpdate"
		/>
		<q-input
			ref="passwordRetypeInput"
			v-model.trim="passwordRetype"
			clearable
			type="password"
			hide-bottom-space
			:label="$t('pbxConfig.retypePassword')"
			:disable="loading"
			:error="$v.passwordRetype.$error"
			:error-message="errorMessagePassRetype"
			@blur="$v.passwordRetype.$touch();onRetypeBlur()"
		>
			<template
				v-slot:prepend
			>
				<q-icon
					name="lock"
				/>
			</template>
		</q-input>
	</div>
</template>

<script>
import PasswordStrengthMeter from 'vue-password-strength-meter'
import {
	required
} from 'vuelidate/lib/validators'
export default {
	name: 'CscChangePasswordForm',
	components: {
		PasswordStrengthMeter
	},
	props: {
		noSubmit: {
			type: Boolean,
			default: false
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			password: '',
			passwordRetype: '',
			passwordScored: '',
			passwordStrengthScore: null
		}
	},
	validations: {
		password: {
			required,
			passwordStrength () {
				return this.passwordStrengthScore >= 2
			}
		},
		passwordRetype: {
			required,
			sameAsPassword (val) {
				return val === this.password
			}
		}
	},
	computed: {
		errorMessagePass () {
			if (!this.$v.password.passwordStrength) {
				return this.$t('pbxConfig.errorPasswordStrength')
			} else {
				return ''
			}
		},
		errorMessagePassRetype () {
			if (!this.$v.passwordRetype.sameAsPassword) {
				return this.$t('pbxConfig.errorPasswordNotEqual')
			} else {
				return ''
			}
		}
	},
	watch: {
		password (value) {
			if (value === null || value === undefined) {
				this.passwordScored = ''
			} else {
				this.passwordScored = value
			}
		}
	},
	methods: {
		strengthMeterScoreUpdate (score) {
			this.passwordStrengthScore = score
		},
		resetForm () {
			this.password = this.passwordRetype = this.passwordScored = ''
			this.passwordStrengthScore = null
			this.$v.$reset()
		},
		submit () {
			this.$v.$touch()
			if (this.$v.$invalid) {
				this.$emit('validation-failed')
			} else {
				this.$emit('validation-succeeded', {
					password: this.password,
					strengthScore: this.passwordStrengthScore
				})
			}
		},
		onRetypeBlur () {
			if (this.noSubmit && !this.$v.$invalid) {
				this.$emit('validation-succeeded', {
					password: this.password,
					strengthScore: this.passwordStrengthScore
				})
			}
		}
	}
}
</script>
