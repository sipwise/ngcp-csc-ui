<template>
	<div
		:class="itemClasses"
	>
		<div
			class="csc-pbx-sound-set-sound-label col-5"
		>
			<q-icon
				class="csc-pbx-sound-set-sound-icon"
				name="music_note"
				size="24px"
			/>{{ soundHandle.group }} {{ soundHandle.handle }}
		</div>
		<div
			class="col-grow"
		>
			<div
				class="row items-center"
			>
				<div
					class="col-6"
				>
					<input
						v-show="false"
						ref="fileUpload"
						accept=".wav,.mp3,.ogg"
						type="file"
						@input="selectFile"
					>
					<q-icon
						v-if="soundFile || selectedFile"
						name="insert_drive_file"
						class="csc-pbx-sound-set-sound-icon"
						size="24px"
					/>
					<span
						v-if="!selectedFile && soundFile"
					>
						{{ soundFileFilename }}
					</span>
					<span
						v-else-if="selectedFile"
					>
						{{ selectedFile.name }}
					</span>
					<span
						v-else
					>
						No file attached
					</span>
				</div>
				<div
					class="col-grow text-right"
				>
					<q-btn
						v-if="!selectedFile"
						dark
						flat
						color="primary"
						icon="folder"
						@click="openFileSelectionDialog"
					>
						Select file
					</q-btn>
					<q-btn
						v-if="selectedFile && !isUploading"
						dark
						flat
						color="primary"
						icon="cloud_upload"
						@click="uploadFile"
					>
						Upload
					</q-btn>
					<q-btn
						v-if="selectedFile && !isUploading"
						dark
						flat
						color="white"
						icon="undo"
						@click="resetFile"
					>
						Reset
					</q-btn>
				</div>
			</div>
			<div
				v-if="isUploading"
				class="row items-center"
			>
				<div
					class="csc-progress-col col-grow"
				>
					<q-progress
						:percentage="soundFileUploadProgress"
						color="primary"
						stripe
						animate
						height="24px"
					/>
				</div>
			</div>
			<div
				v-if="soundFile && !selectedFile"
				class="row items-center"
			>
				<div
					class="col-auto"
				>
					<q-checkbox
						:value="soundFileLoopplay"
						label="Loop"
						left-label
						@input="toggleLoopPlay"
					/>
				</div>
				<div
					class="csc-col-right col-grow"
				>
					<csc-audio-player
						v-if="soundFileFilename"
						:file-url="soundFileUrl"
						@load="loadPlay"
					/>
				</div>
			</div>
		</div>
		<csc-object-spinner
			v-if="isUpdating"
			:loading="isUpdating"
		/>
	</div>
</template>

<script>
import {
	RequestState
} from 'src/store/common'
import CscAudioPlayer from '../../CscAudioPlayer'
import CscObjectSpinner from '../../CscObjectSpinner'

export default {
	name: 'CscPbxSoundSetSound',
	components: {
		CscObjectSpinner,
		CscAudioPlayer
	},
	props: {
		odd: {
			type: Boolean,
			default: false
		},
		soundHandle: {
			type: Object,
			default: null
		},
		soundFile: {
			type: Object,
			default: null
		},
		soundFileUrl: {
			type: String,
			default: null
		},
		soundFileUploadState: {
			type: String,
			default: null
		},
		soundFileUploadProgress: {
			type: Number,
			default: 0
		},
		soundFileUpdateState: {
			type: String,
			default: null
		}
	},
	data () {
		return {
			selectedFile: null,
			selectedFileUploading: false
		}
	},
	computed: {
		soundFileLoopplay () {
			if (this.soundFile && this.soundFile.loopplay) {
				return this.soundFile.loopplay
			}
			return false
		},
		soundFileFilename () {
			if (this.soundFile && this.soundFile.filename) {
				return this.soundFile.filename
			}
			return ''
		},
		soundFileId () {
			if (this.soundFile && this.soundFile.id) {
				return this.soundFile.id
			}
			return null
		},
		itemClasses () {
			const classes = ['csc-pbx-sound-set-sound', 'row', 'items-center']
			if (this.odd) {
				classes.push('csc-pbx-sound-set-sound-odd')
			}
			return classes
		},
		isUploading () {
			return this.soundFileUploadState === RequestState.requesting
		},
		isUpdating () {
			return this.soundFileUpdateState === RequestState.requesting
		}
	},
	watch: {
		soundFileUploadState (state) {
			if (state === RequestState.succeeded || state === RequestState.failed) {
				this.selectedFile = this.resetFile()
			}
		}
	},
	mounted () {
	},
	methods: {
		openFileSelectionDialog () {
			if (this.$refs.fileUpload) {
				this.$refs.fileUpload.click()
			}
		},
		selectFile (event) {
			this.selectedFile = event.target.files[0]
		},
		resetFile () {
			this.selectedFile = null
			if (this.$refs.fileUpload) {
				this.$refs.fileUpload.value = ''
			}
		},
		loadPlay () {
			this.$emit('play', this.soundFile)
		},
		uploadFile () {
			this.$emit('upload', {
				soundHandle: this.soundHandle.handle,
				soundFileData: this.selectedFile
			})
		},
		toggleLoopPlay () {
			this.$emit('toggle-loop-play', {
				soundSetId: this.soundFile.set_id,
				soundHandle: this.soundFile.handle,
				soundFileId: this.soundFile.id,
				loopPlay: !this.soundFileLoopplay
			})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-progress-col
        margin-top $flex-gutter-xs
        .q-progress
            height 24px
    .csc-pbx-sound-set-sound.csc-pbx-sound-set-sound-odd
        background-color $item-stripe-color
    .csc-pbx-sound-set-sound
        position relative
        padding $flex-gutter-xs
        .csc-col-right
            padding-left $flex-gutter-sm
        .csc-pbx-sound-set-sound-icon
            margin-right $flex-gutter-xs
        .csc-pbx-sound-set-sound-player
            padding-left $flex-gutter-md
            .q-input
                margin 0
        .csc-pbx-sound-set-sound-label
            color alpha($white, 0.6)
        .audio-player
            .progress-bar
                margin-right 0
</style>
