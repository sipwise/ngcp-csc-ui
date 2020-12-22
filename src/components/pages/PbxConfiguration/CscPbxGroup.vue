<template>
	<csc-list-item
		ref="listItem"
		icon="group"
		:expanded="expanded"
		:odd="odd"
		:loading="loading"
		@toggle="toggle"
	>
		<template
			slot="title"
		>
			<csc-list-item-title>
				{{ group | groupName }}
			</csc-list-item-title>
			<q-slide-transition>
				<csc-list-item-subtitle
					v-if="!expanded"
				>
					{{ $t('Extension') }}: {{ group.pbx_extension }}
				</csc-list-item-subtitle>
			</q-slide-transition>
			<q-slide-transition>
				<csc-list-item-subtitle
					v-if="!expanded"
				>
					<span
						v-if="group.pbx_groupmember_ids.length > 0"
					>
						{{ $t('Seats') }}:
						<span
							v-for="seatId in group.pbx_groupmember_ids"
							:key="seatId"
							class="csc-list-item-title-keyword"
						>
							<q-icon
								name="person"
								size="16px"
							/>
							{{ seats[seatId] | seatName }}
						</span>
					</span>
					<span
						v-else
					>
						<q-icon
							name="info"
							color="info"
							size="24px"
						/>
						{{ $t('No seats') }}
					</span>
				</csc-list-item-subtitle>
			</q-slide-transition>
		</template>
		<template
			slot="menu"
		>
			<csc-list-menu-item
				icon="delete"
				icon-color="negative"
				@click="deleteSeat"
			>
				{{ $t('Remove') }}
			</csc-list-menu-item>
		</template>
		<template slot="body">
			<q-input
				v-model="changes.name"
				:label="$t('Name')"
				@keyup.enter="save"
			>
				<template
					v-if="hasNameChanged"
					v-slot:append
				>
					<csc-input-button-save
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetName"
					/>
				</template>
			</q-input>
			<q-input
				v-model="changes.extension"
				hide-hint
				:error="$v.changes.extension.$error"
				:error-message="extensionErrorMessage"
				:label="$t('Extension')"
				:hint="getExtensionHint"
				@keyup.enter="save"
				@input="$v.changes.extension.$touch"
			>
				<template
					v-if="hasExtensionChanged"
					v-slot:append
				>
					<csc-input-button-save
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetExtension"
					/>
				</template>
			</q-input>
			<q-input
				readonly
				disable
				:value="getPrimaryNumber"
				:label="$t('Primary Number')"
			/>
			<q-select
				v-model="changes.huntPolicy"
				emit-value
				map-options
				radio
				:label="$t('Hunt Policy')"
				:options="huntPolicyOptions"
			>
				<template
					v-if="hasHuntPolicyChanged"
					v-slot:append
				>
					<csc-input-button-save
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetHuntPolicy"
					/>
				</template>
			</q-select>
			<q-input
				v-model="changes.huntTimeout"
				:label="$t('Hunt Timeout')"
				@keyup.enter="save"
			>
				<template
					v-if="hasHuntTimeoutChanged"
					v-slot:append
				>
					<csc-input-button-save
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetHuntTimeout"
					/>
				</template>
			</q-input>
			<q-select
				v-model="changes.aliasNumbers"
				emit-value
				map-options
				use-chips
				multiple
				:label="$t('Alias Numbers')"
				:options="aliasNumberOptions"
			>
				<template
					v-if="hasAliasNumbersChanged"
					v-slot:append
				>
					<csc-input-button-save
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetAliasNumbers"
					/>
				</template>
			</q-select>
			<q-select
				v-model="changes.seats"
				emit-value
				map-options
				use-chips
				multiple
				:label="$t('Seats')"
				:options="seatOptions"
			>
				<template
					v-if="hasSeatsChanged"
					v-slot:append
				>
					<csc-input-button-save
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetSeats"
					/>
				</template>
			</q-select>
			<q-select
				v-model="changes.soundSet"
				emit-value
				map-options
				radio
				:label="$t('Sound Set')"
				:options="soundSetOptions"
			>
				<template
					v-if="hasSoundSetChanged"
					v-slot:append
				>
					<csc-input-button-save
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetSoundSet"
					/>
				</template>
			</q-select>
			<q-btn
				v-if="hasCallQueue"
				icon="filter_none"
				flat
				color="primary"
				:label="$t('Call Queue')"
				@click="jumpToCallQueue"
			/>
		</template>
	</csc-list-item>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { between } from 'vuelidate/lib/validators'
import { inRange } from 'src/helpers/validation'
import CscListItem from '../../CscListItem'
import CscListItemTitle from '../../CscListItemTitle'
import CscListItemSubtitle from '../../CscListItemSubtitle'
import CscListMenuItem from '../../CscListMenuItem'
import numberFilter from '../../../filters/number'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
export default {
	name: 'CscPbxGroup',
	components: {
		CscInputButtonReset,
		CscInputButtonSave,
		CscListMenuItem,
		CscListItem,
		CscListItemTitle,
		CscListItemSubtitle
	},
	props: {
		group: {
			type: Object,
			default: null
		},
		seats: {
			type: Object,
			default: null
		},
		soundSet: {
			type: Object,
			default: null
		},
		expanded: {
			type: Boolean,
			default: false
		},
		loading: {
			type: Boolean,
			default: false
		},
		aliasNumberOptions: {
			type: Array,
			default: () => []
		},
		seatOptions: {
			type: Array,
			default: () => []
		},
		soundSetOptions: {
			type: Array,
			default: () => []
		},
		huntPolicyOptions: {
			type: Array,
			default: () => []
		},
		odd: {
			type: Boolean,
			default: false
		},
		labelWidth: {
			type: Number,
			default: null
		},
		hasCallQueue: {
			type: Boolean,
			default: false
		}
	},
	validations: {
		changes: {
			extension: {
				isInRange: function (value) {
					return inRange(value, this.getMinAllowedExtension, this.getMaxAllowedExtension, between)
				}
			}
		}
	},
	data () {
		return {
			changes: this.getGroupData()
		}
	},
	computed: {
		...mapGetters('pbx', [
			'getExtensionHint',
			'getMinAllowedExtension',
			'getMaxAllowedExtension'
		]),
		getPrimaryNumber () {
			return numberFilter(this.group.primary_number)
		},
		hasNameChanged () {
			return this.changes.name !== this.group.display_name
		},
		hasExtensionChanged () {
			return this.changes.extension !== this.group.pbx_extension
		},
		hasHuntPolicyChanged () {
			return this.changes.huntPolicy !== this.group.pbx_hunt_policy
		},
		hasHuntTimeoutChanged () {
			return this.changes.huntTimeout !== this.group.pbx_hunt_timeout
		},
		hasAliasNumbersChanged () {
			const aliasNumbers = _.clone(this.changes.aliasNumbers)
			return !_.isEqual(aliasNumbers.sort(), this.getAliasNumberIds().sort())
		},
		hasSeatsChanged () {
			const seatIds1 = _.clone(this.changes.seats)
			const seatIds2 = _.clone(this.group.pbx_groupmember_ids)
			return !_.isEqual(seatIds1.sort(), seatIds2.sort())
		},
		hasSoundSetChanged () {
			return this.changes.soundSet !== this.getSoundSetId()
		},
		extensionErrorMessage () {
			if (!this.$v.changes.extension.isInRange) {
				return this.getExtensionHint
			} else {
				return ''
			}
		}
	},
	watch: {
		group () {
			this.changes = this.getGroupData()
		}
	},
	methods: {
		getAliasNumberIds () {
			const numberIds = []
			this.group.alias_numbers.forEach((number) => {
				numberIds.push(number.number_id)
			})
			return numberIds
		},
		getSeatIds () {
			return _.clone(this.group.pbx_groupmember_ids)
		},
		getSoundSetId () {
			if (this.soundSet !== null) {
				return this.soundSet.id
			}
			return null
		},
		getGroupData () {
			return {
				name: this.group.display_name,
				extension: this.group.pbx_extension,
				huntPolicy: this.group.pbx_hunt_policy,
				huntTimeout: this.group.pbx_hunt_timeout,
				aliasNumbers: this.getAliasNumberIds(),
				seats: this.getSeatIds(),
				soundSet: this.getSoundSetId()
			}
		},
		toggle () {
			if (this.expanded) {
				this.$emit('collapse')
			} else {
				this.$emit('expand')
			}
		},
		resetName () {
			this.changes.name = this.group.display_name
		},
		resetExtension () {
			this.changes.extension = this.group.pbx_extension
		},
		resetHuntPolicy () {
			this.changes.huntPolicy = this.group.pbx_hunt_policy
		},
		resetHuntTimeout () {
			this.changes.huntTimeout = this.group.pbx_hunt_timeout
		},
		resetAliasNumbers () {
			this.changes.aliasNumbers = this.getAliasNumberIds()
		},
		resetSeats () {
			this.changes.seats = this.getSeatIds()
		},
		resetSoundSet () {
			this.changes.soundSet = this.getSoundSetId()
		},
		deleteSeat () {
			if (this.$refs.listItem) {
				this.$refs.listItem.closePopoverMenu()
			}
			this.$emit('remove')
		},
		jumpToCallQueue () {
			this.$emit('jump-to-call-queue', this.group)
		},
		save () {
			if (this.hasNameChanged) {
				this.$emit('save-name', {
					groupId: this.group.id,
					groupName: this.changes.name
				})
			}
			if (this.hasExtensionChanged) {
				this.$emit('save-extension', {
					groupId: this.group.id,
					groupExtension: this.changes.extension
				})
			}
			if (this.hasHuntPolicyChanged) {
				this.$emit('save-hunt-policy', {
					groupId: this.group.id,
					groupHuntPolicy: this.changes.huntPolicy
				})
			}
			if (this.hasHuntTimeoutChanged) {
				this.$emit('save-hunt-timeout', {
					groupId: this.group.id,
					groupHuntTimeout: this.changes.huntTimeout
				})
			}
			if (this.hasAliasNumbersChanged) {
				this.$emit('save-alias-numbers', {
					groupId: this.group.id,
					assignedNumbers: _.difference(this.changes.aliasNumbers, this.getAliasNumberIds()),
					unassignedNumbers: _.difference(this.getAliasNumberIds(), this.changes.aliasNumbers)
				})
			}
			if (this.hasSeatsChanged) {
				this.$emit('save-seats', {
					groupId: this.group.id,
					seatIds: this.changes.seats
				})
			}
			if (this.hasSoundSetChanged) {
				this.$emit('save-sound-set', {
					groupId: this.group.id,
					soundSetId: this.changes.soundSet
				})
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
