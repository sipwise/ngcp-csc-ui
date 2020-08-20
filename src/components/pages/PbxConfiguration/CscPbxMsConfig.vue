<template>
	<csc-list-item
		ref="listItem"
		icon="arrow_forward"
		:odd="odd"
		:loading="loading"
		:expanded="expanded"
		@toggle="toggle"
	>
		<template
			slot="title"
		>
			<csc-list-item-title
				:icon="getTitleIcon"
			>
				{{ subscriber | displayName }}
			</csc-list-item-title>
			<q-slide-transition>
				<csc-list-item-subtitle
					v-if="!expanded"
				>
					<template
						v-if="currentSecretaryNumbers.length > 0"
					>
						{{ $t('pbxConfig.msConfigNumbersLabel') }}:
						<span
							v-for="number in currentSecretaryNumbers"
							:key="number"
							class="csc-list-item-title-keyword"
						>
							<q-icon
								name="call"
								size="16px"
							/>
							{{ number }}
						</span>
					</template>
					<template
						v-else
					>
						<span>
							<q-icon
								name="info"
								color="info"
								size="24px"
							/>
							{{ $t('pbxConfig.msConfigNoSecretaryNumbers') }}
						</span>
					</template>
				</csc-list-item-subtitle>
			</q-slide-transition>
		</template>
		<template slot="menu">
			<csc-list-menu-item
				icon="delete"
				icon-color="negative"
				@click="remove"
			>
				{{ $t('buttons.remove') }}
			</csc-list-menu-item>
		</template>
		<template
			slot="body"
		>
			<q-field
				:label="$t('pbxConfig.msConfigNumbersLabel')"
			>
				<q-select
					v-model="changes.secretaryNumbers"
					emit-value
					map-options
					multiple
					chips
					:disable="loading || numberOptionsLoading"
					:readonly="loading"
					:float-label="$t('pbxConfig.msConfigNumberSelectionLabel')"
					:options="numberOptions"
				/>
				<csc-fade>
					<csc-form-save-button
						v-if="hasSecretaryNumbersChanged"
						@click="saveSecretaryNumbers"
					/>
				</csc-fade>
				<csc-fade>
					<csc-form-reset-button
						v-if="hasSecretaryNumbersChanged"
						@click="resetSecretaryNumbers"
					/>
				</csc-fade>
			</q-field>
		</template>
	</csc-list-item>
</template>

<script>
import _ from 'lodash'
import CscFade from '../../transitions/CscFade'
import CscListItem from '../../CscListItem'
import CscListItemTitle from '../../CscListItemTitle'
import CscListItemSubtitle from '../../CscListItemSubtitle'
import CscListMenuItem from '../../CscListMenuItem'
import CscFormSaveButton from '../../form/CscFormSaveButton'
import CscFormResetButton from '../../form/CscFormResetButton'
export default {
	name: 'CscPbxCallQueue',
	components: {
		CscFormResetButton,
		CscFormSaveButton,
		CscListItem,
		CscListItemTitle,
		CscListItemSubtitle,
		CscListMenuItem,
		CscFade
	},
	props: {
		odd: {
			type: Boolean,
			default: false
		},
		expanded: {
			type: Boolean,
			default: false
		},
		msConfig: {
			type: Object,
			default: null
		},
		subscriber: {
			type: Object,
			default: null
		},
		loading: {
			type: Boolean,
			default: false
		},
		numberOptions: {
			type: Array,
			default: () => []
		},
		numberOptionsLoading: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			changes: this.getDefaultData()
		}
	},
	computed: {
		getTitleIcon () {
			let icon = 'person'
			if (this.subscriber.is_pbx_group) {
				icon = 'group'
			} else if (this.subscriber.is_pbx_pilot) {
				icon = 'person_outline'
			}
			return icon
		},
		hasSecretaryNumbersChanged () {
			const changedSecretaryNumbers = _.clone(_.get(this.changes, 'secretaryNumbers', []))
			const currentSecretaryNumbers = _.clone(this.currentSecretaryNumbers)
			return !_.isEqual(changedSecretaryNumbers.sort(), currentSecretaryNumbers.sort())
		},
		currentSecretaryNumbers () {
			return _.get(this.msConfig, 'secretary_numbers', [])
		}
	},
	watch: {
		msConfig () {
			this.changes = this.getDefaultData()
		}
	},
	mounted () {
		this.$emit('ready')
	},
	validations: {
		changes: {
		}
	},
	methods: {
		remove () {
			if (this.$refs.listItem) {
				this.$refs.listItem.closePopoverMenu()
			}
			this.$emit('remove', this.msConfig.id)
		},
		toggle () {
			if (this.expanded) {
				this.$emit('collapse')
			} else {
				this.$emit('expand')
			}
		},
		getDefaultData () {
			return {
				secretaryNumbers: _.clone(_.get(this.msConfig, 'secretary_numbers', []))
			}
		},
		resetSecretaryNumbers () {
			this.changes.secretaryNumbers = this.getDefaultData().secretaryNumbers
		},
		saveSecretaryNumbers () {
			if (this.hasSecretaryNumbersChanged) {
				this.$emit('save-secretary-numbers', {
					msConfigId: this.msConfig.id,
					secretaryNumbers: this.changes.secretaryNumbers
				})
			}
		}
	}
}
</script>
