<template>
	<csc-list-item
		icon="fa-fax"
		:image="imageUrl"
		:odd="odd"
		:expanded="expanded"
		:loading="loading"
		@toggle="toggle"
	>
		<template
			slot="title"
		>
			<csc-list-item-title>
				{{ device.station_name }}
			</csc-list-item-title>
			<q-slide-transition>
				<csc-list-item-subtitle
					v-if="!expanded"
				>
					{{ $t('pbxConfig.deviceIdentifier') }}: {{ device.identifier }}
				</csc-list-item-subtitle>
			</q-slide-transition>
			<q-slide-transition>
				<csc-list-item-subtitle
					v-if="!expanded"
				>
					{{ $t('pbxConfig.deviceModel') }}: {{ profile.name }}
				</csc-list-item-subtitle>
			</q-slide-transition>
		</template>
		<template
			slot="menu"
		>
			<csc-list-menu-item
				icon="delete"
				icon-color="negative"
				@click="deleteDevice"
			>
				{{ $t('buttons.remove') }}
			</csc-list-menu-item>
		</template>
		<template
			slot="body"
		>
			<q-input
				v-model="changes.stationName"
				:label="$t('pbxConfig.deviceStationName')"
				@keyup.enter="save"
			>
				<template
					v-if="hasStationNameChanged"
					v-slot:append
				>
					<csc-input-button-save
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetStationName"
					/>
				</template>
			</q-input>
			<q-field
				:label="$t('pbxConfig.deviceIdentifier')"
			>
				<q-input
					v-model="changes.identifier"
					dark
					@keyup.enter="save"
				/>
				<csc-fade>
					<csc-form-save-button
						v-if="hasIdentifierChanged"
						@click="save"
					/>
				</csc-fade>
				<csc-fade>
					<csc-form-reset-button
						v-if="hasIdentifierChanged"
						@click="resetIdentifier"
					/>
				</csc-fade>
			</q-field>
			<csc-pbx-model-select
				v-model="changes.profile"
				:label="$t('pbxConfig.deviceModel')"
				:profile="changes.profile"
				:profiles="profiles"
				:profile-map="profileMap"
				:model-image-map="modelImageMap"
				:has-reset-button="false"
				@opened="$emit('model-select-opened')"
			>
				<template
					v-if="hasProfileChanged"
					v-slot:append
				>
					<csc-input-button-save
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetProfile"
					/>
				</template>
			</csc-pbx-model-select>
			<!--			<q-field-->
			<!--				-->
			<!--			>-->

			<!--				<csc-fade>-->
			<!--					<csc-form-save-button-->
			<!--						v-if="hasProfileChanged"-->
			<!--						@click="save"-->
			<!--					/>-->
			<!--				</csc-fade>-->
			<!--				<csc-fade>-->
			<!--					<csc-form-reset-button-->
			<!--						v-if="hasProfileChanged"-->
			<!--						@click="resetProfile"-->
			<!--					/>-->
			<!--				</csc-fade>-->
			<!--			</q-field>-->
			<csc-pbx-device-config
				v-if="modelImage"
				:device="device"
				:profile="profile"
				:model="model"
				:model-image="modelImage"
				:loading="subscribersLoading"
				:subscribers="subscribers"
				:subscriber-map="subscriberMap"
				:subscriber-options="subscriberOptions"
				@keysChanged="saveKeys"
			/>
		</template>
	</csc-list-item>
</template>

<script>
import CscPbxModelSelect from '../PbxConfiguration/CscPbxModelSelect'
import CscPbxDeviceConfig from '../PbxConfiguration/CscPbxDeviceConfig'
import CscListItem from '../../CscListItem'
import CscListItemTitle from '../../CscListItemTitle'
import CscListItemSubtitle from '../../CscListItemSubtitle'
import CscFade from '../../transitions/CscFade'
import CscFormSaveButton from '../../form/CscFormSaveButton'
import CscFormResetButton from '../../form/CscFormResetButton'
import CscListMenuItem from '../../CscListMenuItem'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscInputButtonReset from 'components/form/CscInputButtonReset'

export default {
	name: 'CscPbxDevice',
	components: {
		CscInputButtonReset,
		CscInputButtonSave,
		CscListMenuItem,
		CscListItem,
		CscListItemTitle,
		CscListItemSubtitle,
		CscFade,
		CscFormSaveButton,
		CscFormResetButton,
		CscPbxModelSelect,
		CscPbxDeviceConfig
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
		loading: {
			type: Boolean,
			default: false
		},
		device: {
			type: Object,
			default: null
		},
		profile: {
			type: Object,
			default: null
		},
		profiles: {
			type: Array,
			default () {
				return []
			}
		},
		profileMap: {
			type: Object,
			default: null
		},
		model: {
			type: Object,
			default: null
		},
		modelImage: {
			type: Object,
			default: null
		},
		modelImageMap: {
			type: Object,
			default: null
		},
		subscribers: {
			type: Array,
			default () {
				return []
			}
		},
		subscribersLoading: {
			type: Boolean,
			default: false
		},
		subscriberOptions: {
			type: Array,
			default () {
				return []
			}
		},
		subscriberMap: {
			type: Object,
			default: null
		}
	},
	data () {
		return {
			changes: this.getData()
		}
	},
	computed: {
		imageUrl () {
			if (this.modelImage && this.modelImage.url) {
				return this.modelImage.url
			}
			return null
		},
		hasStationNameChanged () {
			return this.changes.stationName !== this.device.station_name
		},
		hasIdentifierChanged () {
			return this.changes.identifier !== this.device.identifier
		},
		hasProfileChanged () {
			return this.changes.profile !== this.device.profile_id
		}
	},
	watch: {
		expanded (expanded) {
			if (expanded) {
				this.$emit('expanded')
			}
		}
	},
	mounted () {
		this.$emit('load-model')
	},
	methods: {
		getData () {
			return {
				stationName: this.device.station_name,
				identifier: this.device.identifier,
				profile: this.device.profile_id
			}
		},
		toggle () {
			if (this.expanded) {
				this.$emit('collapse')
			} else {
				this.$emit('expand')
			}
		},
		resetStationName () {
			this.changes.stationName = this.device.station_name
		},
		resetIdentifier () {
			this.changes.identifier = this.device.identifier
		},
		resetProfile () {
			this.changes.profile = this.device.profile_id
		},
		deleteDevice () {
			if (this.$refs.listItem) {
				this.$refs.listItem.closePopoverMenu()
			}
			this.$emit('remove')
		},
		saveKeys (keys) {
			this.$emit('save-keys', {
				deviceId: this.device.id,
				keys: keys
			})
		},
		save () {
			if (this.hasStationNameChanged) {
				this.$emit('save-station-name', {
					deviceId: this.device.id,
					stationName: this.changes.stationName
				})
			}
			if (this.hasIdentifierChanged) {
				this.$emit('save-identifier', {
					deviceId: this.device.id,
					identifier: this.changes.identifier
				})
			}
			if (this.hasProfileChanged) {
				this.$emit('save-profile', {
					deviceId: this.device.id,
					profileId: this.changes.profile
				})
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
s
