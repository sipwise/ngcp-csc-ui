<template>
	<div>
		<div
			v-if="formEnabled"
		>
			<q-select
				v-model="slot"
				emit-value
				map-options
				:disable="loading"
				:readonly="loading"
				:label="$t('speedDial.slot')"
				:options="slotOptions"
			/>
			<csc-call-input
				v-model="destination"
				:label="$t('speedDial.destination')"
				@submit="save"
				@error="error"
			/>
			<div
				class="row justify-center form-actions"
			>
				<q-btn
					v-if="!loading"
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
					:disable="destinationError"
					@click="save()"
				>
					{{ $t('buttons.save') }}
				</q-btn>
			</div>
		</div>
		<div
			v-else
			class="row justify-center"
		>
			<q-btn
				color="primary"
				icon="add"
				flat
				@click="enableForm()"
			>
				{{ $t('speedDial.addSpeedDial') }}
			</q-btn>
		</div>
		<q-inner-loading
			v-show="loading"
			:visible="loading"
		>
			<q-spinner-dots
				size="60px"
				color="primary"
			/>
		</q-inner-loading>
	</div>
</template>

<script>
import CscCallInput from '../../form/CscCallInput'
import {
	showGlobalError
} from 'src/helpers/ui'
import {
	Alert
} from 'src/quasar-legacy'

export default {
	name: 'CscSpeedDialAddForm',
	components: {
		CscCallInput
	},
	props: {
		slotOptions: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			formEnabled: false,
			destination: '',
			slot: '',
			destinationError: false
		}
	},
	methods: {
		enableForm () {
			if (this.slotOptions.length > 0) {
				this.reset()
				this.formEnabled = true
			} else {
				Alert.create({
					enter: 'bounceInRight',
					leave: 'bounceOutRight',
					position: 'top-center',
					html: this.$t('speedDial.addNoSlotsDialogText'),
					icon: 'warning',
					dismissible: true
				})
			}
		},
		cancel () {
			this.formEnabled = false
		},
		save () {
			if (this.destinationError) {
				showGlobalError(this.$t('validationErrors.generic'))
			} else {
				this.$emit('save', {
					destination: this.destination,
					slot: this.slot
				})
			}
		},
		reset () {
			this.destination = ''
			this.slot = this.slotOptions[0].value ? this.slotOptions[0].value : ''
		},
		error (state) {
			this.destinationError = state
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .form-actions
        margin-top 16px
        margin-bottom 8px
</style>
