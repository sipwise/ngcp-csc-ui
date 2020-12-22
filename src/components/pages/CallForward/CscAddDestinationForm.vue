<template>
	<div class="add-destination-form">
		<q-btn
			v-if="!isFormEnabled"
			flat
			dense
			color="primary"
			icon="add"
			:label="$t('Add destination')"
		>
			<csc-popup-menu>
				<csc-popup-menu-item
					:label="$t('Add Number')"
					@click="addDestinationByType('number')"
				/>
				<csc-popup-menu-item
					:label="$t('Add Voicemail')"
					@click="addDestinationByType('voicebox')"
				/>
				<csc-popup-menu-item
					v-if="hasFaxCapabilityAndFaxActive && hasSendFaxFeature"
					:label="$t('Add Fax2Mail')"
					@click="addDestinationByType('fax2mail')"
				/>
			</csc-popup-menu>
		</q-btn>
		<div v-if="isFormEnabled">
			<csc-call-input
				v-model="destinationForm.destination"
				:label="$t('Destination')"
				:before="beforeIconDestination"
				dense
				@submit="addDestination"
				@error="error"
			/>
			<q-input
				v-model="destinationForm.timeout"
				clearable
				dense
				:label="$t('Timeout')"
				:suffix="$t('seconds')"
				:error="$v.destinationForm.timeout.$error"
				@input="$v.destinationForm.timeout.$touch"
				@blur="$v.destinationForm.timeout.$touch"
			/>
			<q-btn
				flat
				icon="clear"
				color="default"
				@click="disableForm()"
			>
				{{ $t('Cancel') }}
			</q-btn>
			<q-btn
				flat
				icon="check"
				color="primary"
				:disable="$v.destinationForm.timeout.$error || destinationError"
				@click="addDestination()"
			>
				{{ $t('Save') }}
			</q-btn>
		</div>
	</div>
</template>

<script>
import _ from 'lodash'
import CscCallInput from '../../form/CscCallInput'
import {
	// startLoading,
	showGlobalError
} from 'src/helpers/ui'
import {
	mapGetters,
	mapState
} from 'vuex'
import {
	required,
	minValue,
	numeric
} from 'vuelidate/lib/validators'
import CscPopupMenu from 'components/CscPopupMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
export default {
	name: 'CscAddDestinationForm',
	components: {
		CscPopupMenuItem,
		CscPopupMenu,
		CscCallInput
	},
	props: {
		destinations: {
			type: Array,
			default: undefined
		},
		id: {
			type: Number,
			default: null
		},
		groupName: {
			type: String,
			default: ''
		},
		priority: {
			type: Number,
			default: null
		},
		timeset: {
			type: String,
			default: undefined
		},
		timesetId: {
			type: Number,
			default: null
		},
		timesetName: {
			type: String,
			default: null
		},
		sourcesetId: {
			type: [Number, String],
			default: null
		}
	},
	data () {
		return {
			formEnabled: false,
			destinationForm: {
				destination: '',
				timeout: 300
			},
			destinationError: false
		}
	},
	validations: {
		destinationForm: {
			timeout: {
				required,
				minValue: minValue(1),
				numeric
			}
		}
	},
	computed: {
		...mapState('callForward', [
			'activeForm',
			'formType',
			'addDestinationState'
		]),
		...mapGetters('user', [
			'hasSendFaxFeature',
			'hasFaxCapabilityAndFaxActive'
		]),
		timeoutInputError () {
			if (!this.$v.destinationForm.timeout.required) {
				return this.$t('{field} is required', {
					field: this.$t('Timeout')
				})
			} else if (!this.$v.destinationForm.timeout.numeric) {
				return this.$t('{field} must consist of numeric characters only', {
					field: this.$t('Timeout')
				})
			} else if (!this.$v.destinationForm.timeout.minValue) {
				return this.$t('{field} must be at least {minValue} second', {
					field: this.$t('Timeout'),
					minValue: this.$v.destinationForm.timeout.$params.minValue.min
				})
			} else {
				return ''
			}
		},
		isFormEnabled () {
			return this.activeForm === this.groupName && this.formEnabled
		},
		addDestinationIsRequesting () {
			return this.addDestinationState === 'requesting'
		},
		beforeIconTimeout () {
			return [{
				icon: 'schedule'
			}]
		},
		beforeIconDestination () {
			return [{
				icon: 'fa-angle-double-right'
			}]
		}
	},
	watch: {
		addDestinationState (state) {
			if (state === 'succeeded') {
				this.disableForm()
			}
		}
	},
	methods: {
		addDestinationByType (type) {
			this.$store.commit('callForward/setFormType', type)
			const lastDestination = _.findLast(this.destinations) || {}
			this.$store.commit('callForward/setDestinationsetId', this.id)
			this.$store.commit('callForward/setGroupName', this.groupName)
			this.$store.commit('callForward/setPriority', lastDestination.priority || 1)
			if (type === 'voicebox') {
				this.destinationForm.destination = 'Voicemail'
				this.addDestination()
			} else if (type === 'fax2mail') {
				this.destinationForm.destination = 'Fax2Mail'
				this.addDestination()
			} else {
				this.$v.$reset()
				this.formEnabled = true
				this.$store.commit('callForward/setActiveForm', this.groupName)
				this.destinationForm.destination = ''
			}
		},
		disableForm () {
			this.destinationForm.timeout = 300
			this.destinationForm.destination = ''
			this.formEnabled = false
			this.$v.$reset()
			this.$store.commit('callForward/resetFormState')
			this.$store.commit('callForward/resetDestinationState')
		},
		addDestination () {
			if (this.$v.destinationForm.timeout.$error ||
				this.destinationError) {
				showGlobalError(this.$t('You have invalid form input. Please check and try again.'))
			} else {
				this.$store.dispatch('callForward/addDestination', {
					form: this.destinationForm,
					destinations: this.destinations,
					timeset: this.timeset,
					timesetId: this.timesetId,
					sourcesetId: this.sourcesetId
				})
			}
		},
		error (state) {
			this.destinationError = state
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .add-destination-form
        margin 0
        .q-slider.label-always
            padding 15px 0 5px
            height 50px
</style>
