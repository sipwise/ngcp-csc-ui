<template>
	<q-item>
		<q-item-section
			side
		>
			<q-icon
				:name="icon"
			/>
		</q-item-section>
		<q-item-section>
			<q-item-label
				v-if="!removing && !editing"
			>
				{{ number }}
				<csc-spinner
					v-if="loading"
				/>
			</q-item-label>
			<csc-input-saveable
				v-else-if="!removing && !loading"
				v-model="currentNumber"
				:value-changed="currentNumber !== number"
				dense
				@save="save"
				@undo="currentNumber = number"
			/>
			<csc-spinner
				v-if="removing"
			/>
		</q-item-section>
		<q-item-section
			side
		>
			<csc-more-menu>
				<csc-popup-menu-item
					icon="edit"
					color="primary"
					:label="$t('buttons.edit')"
					@click="edit"
				/>
				<csc-popup-menu-item
					icon="delete"
					color="negative"
					:label="$t('buttons.remove')"
					@click="remove"
				/>
			</csc-more-menu>
		</q-item-section>
	</q-item>
</template>

<script>
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscInputSaveable from 'components/form/CscInputSaveable'
import CscSpinner from 'components/CscSpinner'
export default {
	name: 'CscBlockedNumber',
	components: {
		CscSpinner,
		CscInputSaveable,
		CscPopupMenuItem,
		CscMoreMenu
	},
	props: {
		number: {
			type: String,
			default: ''
		},
		index: {
			type: Number,
			default: null
		},
		loading: {
			type: Boolean,
			default: false
		},
		icon: {
			type: String,
			default: ''
		},
		removing: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			editing: false,
			currentNumber: this.number
		}
	},
	computed: {
		numberButtons () {
			const buttons = []
			const self = this
			if (this.currentNumber !== this.number) {
				buttons.push({
					icon: 'check',
					error: false,
					handler (event) {
						event.stopPropagation()
						self.save()
					}
				}
				)
			}
			buttons.push({
				icon: 'clear',
				error: false,
				handler (event) {
					event.stopPropagation()
					self.reset()
				}
			})
			return buttons
		}
	},
	watch: {
		number (number) {
			this.currentNumber = number
		}
	},
	methods: {
		edit () {
			this.editing = true
		},
		remove () {
			this.$emit('remove', this.index)
		},
		save () {
			if (this.currentNumber !== this.number) {
				this.$emit('save', {
					number: this.currentNumber,
					index: this.index
				})
				this.reset()
			}
		},
		reset () {
			this.editing = false
			this.currentNumber = this.number
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
