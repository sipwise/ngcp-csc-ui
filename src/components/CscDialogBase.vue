<template>
	<q-dialog
		ref="dialog"
		v-bind="$attrs"
		v-on="$listeners"
		@hide="$emit('hide', $event)"
	>
		<q-card
			class="bg-main-menu q-dialog-plugin"
		>
			<q-card-section
				class="text-h6"
			>
				<q-icon
					v-if="icon !== undefined"
					:name="icon"
					size="24px"
					class="self-center"
				/>
				{{ title }}
			</q-card-section>
			<q-card-section>
				<slot />
			</q-card-section>
			<q-card-actions
				align="right"
			>
				<q-btn
					icon="clear"
					:label="$t('buttons.cancel')"
					flat
					@click="hide"
				/>
				<q-btn
					icon="check"
					:label="$t('buttons.confirm')"
					unelevated
					text-color="dark"
					color="primary"
					:disable="!ready"
					@click="okEvent"
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script>
export default {
	name: 'CscDialogBase',
	components: {
	},
	props: {
		icon: {
			type: String,
			default: undefined
		},
		title: {
			type: String,
			default: undefined
		},
		ready: {
			type: Boolean,
			default: true
		}
	},
	data () {
		return {
			passwordRetype: {
				password: '',
				passwordRetype: ''
			}
		}
	},
	methods: {
		show () {
			this.$refs.dialog.show()
		},
		hide () {
			this.$refs.dialog.hide()
		},
		okEvent ($event) {
			this.$emit('ok', $event)
			this.hide()
		},
		cancelEvent ($event) {
			this.hide()
		}
	}
}
</script>
