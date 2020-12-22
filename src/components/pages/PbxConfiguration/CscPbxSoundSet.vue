<template>
	<csc-list-item
		ref="listItem"
		icon="queue_music"
		:odd="odd"
		:loading="loading"
		:expanded="expanded"
		@toggle="toggle"
	>
		<template
			slot="title"
		>
			<csc-list-item-title>
				{{ soundSet.name }}
			</csc-list-item-title>
			<q-slide-transition>
				<csc-list-item-subtitle
					v-if="!expanded && soundSet.description"
				>
					{{ soundSet.description }}
				</csc-list-item-subtitle>
			</q-slide-transition>
			<q-slide-transition>
				<csc-list-item-subtitle
					v-if="!expanded"
				>
					<q-checkbox
						:value="soundSet.contract_default"
						:label="$t('Default')"
						:left-label="true"
						@input="saveAsDefault"
					/>
				</csc-list-item-subtitle>
			</q-slide-transition>
		</template>
		<template
			slot="body"
		>
			<q-input
				v-model="changes.name"
				:error="$v.changes.name.$error"
				:label="$t('Name')"
				@input="$v.changes.name.$touch"
				@keyup.enter="save"
			>
				<template
					v-if="hasNameChanged"
					v-slot:append
				>
					<csc-input-button-save
						v-if="!$v.changes.name.$error"
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetName"
					/>
				</template>
			</q-input>
			<q-input
				v-model="changes.description"
				:error="$v.changes.description.$error"
				:label="$t('Description')"
				@input="$v.changes.description.$touch"
				@keyup.enter="save"
			>
				<template
					v-if="hasDescriptionChanged"
					v-slot:append
				>
					<csc-input-button-save
						v-if="!$v.changes.description.$error"
						@click.stop="save"
					/>
					<csc-input-button-reset
						@click.stop="resetDescription"
					/>
				</template>
			</q-input>
			<q-checkbox
				:label="$t('Default sound set for all seats and groups')"
				:value="soundSet.contract_default"
				@input="saveAsDefault"
			/>
			<csc-list-spinner
				v-if="soundHandlesLoading || soundFilesLoading"
			/>
			<div
				v-if="!soundHandlesLoading && soundHandles.length > 0 && !soundFilesLoading"
				class="csc-pbx-sound-set-sound-list"
			>
				<csc-pbx-sound-set-sound
					v-for="(soundHandle, index) in soundHandles"
					:key="soundHandle.id"
					:odd="(index % 2) === 0"
					:sound-handle="soundHandle"
					:sound-file="soundFileMap[soundSet.id + '-' + soundHandle.handle]"
					:sound-file-url="soundFileUrlMap[soundSet.id + '-' + soundHandle.handle]"
					:sound-file-upload-state="soundFileUploadState[soundSet.id + '-' + soundHandle.handle]"
					:sound-file-upload-progress="soundFileUploadProgress[soundSet.id + '-' + soundHandle.handle]"
					:sound-file-update-state="soundFileUpdateState[soundSet.id + '-' + soundHandle.handle]"
					@play="playSoundFile"
					@upload="uploadSoundFile"
					@toggle-loop-play="toggleLoopPlay"
				/>
			</div>
		</template>
		<template slot="menu">
			<csc-list-menu-item
				icon="delete"
				icon-color="negative"
				@click="remove"
			>
				{{ $t('Remove') }}
			</csc-list-menu-item>
		</template>
	</csc-list-item>
</template>

<script>
import {
	maxLength
} from 'vuelidate/lib/validators'
import CscListItem from '../../CscListItem'
import CscListItemTitle from '../../CscListItemTitle'
import CscListItemSubtitle from '../../CscListItemSubtitle'
import CscListMenuItem from '../../CscListMenuItem'
import CscPbxSoundSetSound from './CscPbxSoundSetSound'
import CscListSpinner from '../../CscListSpinner'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscInputButtonReset from 'components/form/CscInputButtonReset'

export default {
	name: 'CscPbxSoundSet',
	components: {
		CscInputButtonReset,
		CscInputButtonSave,
		CscListSpinner,
		CscPbxSoundSetSound,
		CscListMenuItem,
		CscListItemSubtitle,
		CscListItemTitle,
		CscListItem
	},
	props: {
		odd: {
			type: Boolean,
			default: false
		},
		loading: {
			type: Boolean,
			default: false
		},
		expanded: {
			type: Boolean,
			default: false
		},
		soundSet: {
			type: Object,
			default: null
		},
		soundHandles: {
			type: Array,
			default: () => []
		},
		soundHandlesLoading: {
			type: Boolean,
			default: false
		},
		soundFileMap: {
			type: Object,
			default: null
		},
		soundFilesLoading: {
			type: Boolean,
			default: false
		},
		soundFileUrlMap: {
			type: Object,
			default: null
		},
		soundFileUploadState: {
			type: Object,
			default: null
		},
		soundFileUploadProgress: {
			type: Object,
			default: null
		},
		soundFileUpdateState: {
			type: Object,
			default: null
		}
	},
	data () {
		return {
			changes: this.getDefaultData()
		}
	},
	validations: {
		changes: {
			name: {
				maxLength: maxLength(64)
			},
			description: {
				maxLength: maxLength(255)
			}
		}
	},
	computed: {
		hasNameChanged () {
			return this.changes.name !== this.getDefaultData().name
		},
		hasDescriptionChanged () {
			return this.changes.description !== this.getDefaultData().description
		}
	},
	watch: {
		expanded (expanded) {
			if (expanded) {
				this.$emit('require-sound-handles')
			}
		}
	},
	methods: {
		saveAsDefault () {
			this.$emit('save-as-default', {
				soundSetId: this.soundSet.id,
				contractDefault: !this.soundSet.contract_default
			})
		},
		remove () {
			if (this.$refs.listItem) {
				this.$refs.listItem.closePopoverMenu()
			}
			this.$emit('remove', this.soundSet.id)
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
				name: this.soundSet.name,
				description: this.soundSet.description,
				contract_default: this.soundSet.contract_default
			}
		},
		resetName () {
			this.changes.name = this.getDefaultData().name
		},
		resetDescription () {
			this.changes.description = this.getDefaultData().description
		},
		playSoundFile (data) {
			this.$emit('play-sound-file', data)
		},
		uploadSoundFile (options) {
			this.$emit('upload-sound-file', {
				soundSetId: this.soundSet.id,
				soundHandle: options.soundHandle,
				soundFileData: options.soundFileData
			})
		},
		toggleLoopPlay (options) {
			this.$emit('toggle-loop-play', options)
		},
		save () {
			if (this.hasNameChanged) {
				this.$emit('save-name', {
					soundSetId: this.soundSet.id,
					name: this.changes.name
				})
			}
			if (this.hasDescriptionChanged) {
				this.$emit('save-description', {
					soundSetId: this.soundSet.id,
					description: this.changes.description
				})
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-pbx-sound-set-sound-list
        margin-top $flex-gutter-sm
</style>
