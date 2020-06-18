<template>
	<div
        class="csc-form"
    >
		<q-field
	        :error-label="errorMessagePass"
	    >
			<q-input
				dark
				ref="passwordInput"
				v-model.trim="password"
				clearable
				:before="[{
					icon: 'lock'
				}]"
				:float-label="$t('pbxConfig.typePassword')"
				type="password"
				:disable="loading"
				:error="$v.password.$error"
				@blur="$v.password.$touch()"
			>
				<div
					slot="prepend"
				>
					<q-icon
						name="lock"
					/>
				</div>
			</q-input>
		</q-field>

		<password-strength-meter
			v-model="passwordScored"
			class="q-psm"
			:strength-meter-only="true"
			@score="strengthMeterScoreUpdate"
		/>

		<q-field
			:error-label="errorMessagePassRetype"
		>
			<q-input
				ref="passwordRetypeInput"
				v-model.trim="passwordRetype"
				clearable
				icon="lock"
				dark
				:before="[{
					icon: 'lock'
				}]"
				:float-label="$t('pbxConfig.retypePassword')"
				type="password"
				:disable="loading"
				:error="$v.passwordRetype.$error"
				@blur="$v.passwordRetype.$touch()"

			>
				<div slot="prepend">
					<q-icon name="lock" />
				</div>
			</q-input>
		</q-field>
	</div>
</template>

<script>
import PasswordStrengthMeter from 'vue-password-strength-meter'
import {
	required
} from 'vuelidate/lib/validators'
import {
	QItem,
	QList,
	QInput,
	QField
} from 'quasar-framework'
export default {
	name: 'csc-change-password-form',
	components: {
		QItem,
		QList,
		QInput,
		QField,
		PasswordStrengthMeter
	},
	props: {
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
				return val == this.password
			}
		}
	},
	watch: {
		password (value) {
			if (value === null || value === undefined) {
				this.passwordScored = ''
			}
			else {
				this.passwordScored = value
			}
		}
	},
	computed: {
		errorMessagePass() {
			if (!this.$v.password.passwordStrength) {
				return this.$t('pbxConfig.errorPasswordStrength')
			}
		},
		errorMessagePassRetype() {
			if (!this.$v.passwordRetype.sameAsPassword) {
				return this.$t('pbxConfig.errorPasswordNotEqual')
			}
		}
	},
	methods: {
		strengthMeterScoreUpdate (score) {
			this.passwordStrengthScore = score
		},
		resetForm(){
			this.password = this.passwordRetype = this.passwordScored = "";
			this.passwordStrengthScore = null;
			this.$v.$reset();
		},
		submit () {
			this.$v.$touch()
			if (this.$v.$invalid) {
				this.$emit('validation-failed')
			}
			else {
				this.$emit('validation-succeeded', {
					password: this.password,
					strengthScore: this.passwordStrengthScore
				})
			}
		}
	}
}
</script>
