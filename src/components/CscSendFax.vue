<template>
	<q-dialog
		:value="value"
		v-bind="$attrs"
		v-on="$listeners"
	>
		<q-card
			style="min-width: 50%"
		>
			<q-card-section
				class="text-h6"
			>
				{{ $t('communication.sendFax') }}
			</q-card-section>
			<q-card-section>
				<csc-call-input
					v-if="value"
					v-model="form.destination"
					:label="$t('communication.label.destination')"
					@submit="sendFax"
					@error="error"
				/>
				<q-select
					v-model="form.quality"
					emit-value
					map-options
					:options="$faxQualityOptions"
					:label="$t('communication.label.quality')"
				/>
				<q-input
					v-model="form.pageHeader"
					clearable
					type="text"
					:label="$t('communication.label.pageHeader')"
					:error="$v.form.pageHeader.$error"
					:error-message="pageHeaderErrorMessage"
					@input="$v.form.pageHeader.$touch"
					@blur="$v.form.pageHeader.$touch"
				/>
				<q-input
					v-model="form.data"
					clearable
					type="textarea"
					:max-height="100"
					:min-rows="10"
					:label="$t('communication.label.content')"
					:error="$v.form.data.$error"
					:error-message="dataErrorMessage"
					@input="$v.form.data.$touch"
					@blur="$v.form.data.$touch"
				/>
				<csc-input-file
					accept=".pdf,.tiff,.txt,.ps"
				/>
			</q-card-section>
			<q-card-actions>
				<q-btn
					v-close-popup
					flat
					icon="clear"
					color="default"
					:label="$t('communication.cancel')"
				/>
				<q-btn
					flat
					color="primary"
					icon="send"
					:disable="formDisabled"
					:label="$t('communication.send')"
					@click="sendFax"
				/>
			</q-card-actions>
		</q-card>

		<!--		<q-field class="upload-field">-->
		<!--			<label-->
		<!--				for="fax-file-upload"-->
		<!--				class="upload-label"-->
		<!--			>-->
		<!--				<div class="upload-label">-->
		<!--					{{ $t('communication.label.faxFile') }}-->
		<!--				</div>-->
		<!--				<q-btn-->
		<!--					flat-->
		<!--					color="white"-->
		<!--					icon="cloud_upload"-->
		<!--					class="upload-button"-->
		<!--					@click="$refs.faxUpload.click()"-->
		<!--				>-->
		<!--					{{ $t('buttons.select') }}-->
		<!--				</q-btn>-->
		<!--				<span class="upload-filename">-->
		<!--					{{ selectedFile }}-->
		<!--				</span>-->
		<!--				<q-btn-->
		<!--					v-if="selectedFile.length > 0"-->
		<!--					flat-->
		<!--					icon="cancel"-->
		<!--					class="reset-button"-->
		<!--					@click="resetFile"-->
		<!--				/>-->
		<!--			</label>-->
		<!--			<input-->
		<!--				id="fax-file-upload"-->
		<!--				ref="faxUpload"-->
		<!--				dark-->
		<!--				type="file"-->
		<!--				accept=".pdf,.tiff,.txt,.ps"-->
		<!--				:error="$v.form.file.$error"-->
		<!--				@change="processFile($event)"-->
		<!--				@input="$v.form.file.$touch"-->
		<!--				@blur="$v.form.file.$touch"-->
		<!--			>-->
		<!--		</q-field>-->
		<!--		<div-->
		<!--			v-if="$v.form.file.$error"-->
		<!--			id="csc-error-label"-->
		<!--		>-->
		<!--			{{ fileErrorMessage }}-->
		<!--		</div>-->
		<!--		<q-btn-->
		<!--			flat-->
		<!--			icon="clear"-->
		<!--			color="default"-->
		<!--			@mousedown.native="hideModal"-->
		<!--		>-->
		<!--			{{ $t('communication.cancel') }}-->
		<!--		</q-btn>-->
		<!--		<q-btn-->
		<!--			flat-->
		<!--			color="primary"-->
		<!--			icon="insert drive file"-->
		<!--			:disable="formDisabled"-->
		<!--			@click="sendFax"-->
		<!--		>-->
		<!--			{{ $t('communication.send') }}-->
		<!--		</q-btn>-->
	</q-dialog>
</template>

<script>
import CscCallInput from './form/CscCallInput'
import {
	showGlobalError
} from 'src/helpers/ui'
import {
	requiredUnless,
	maxLength
} from 'vuelidate/lib/validators'
import CscInputFile from 'components/form/CscInputFile'

export default {
	name: 'CscSendFax',
	components: {
		CscInputFile,
		CscCallInput
	},
	props: {
		value: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			selectedFile: '',
			form: {
				destination: '',
				pageHeader: '',
				data: null,
				quality: this.$faxQualityOptionsDefault,
				file: {}
			},
			isMobile: this.$q.platform.is.mobile,
			destinationError: false
		}
	},
	validations: {
		form: {
			data: {
				required: requiredUnless(function () {
					return this.hasContentToSend
				}),
				maxLength: maxLength(3600)
			},
			file: {
				required: requiredUnless(function () {
					return this.hasContentToSend
				})
			},
			pageHeader: {
				maxLength: maxLength(64)
			}
		}
	},
	computed: {
		hasContentToSend () {
			return (!!this.form.data || !!this.form.file) || !this.$v.form.$anyDirty
		},
		formDisabled () {
			return !this.$v.form.$anyDirty ||
				this.destinationError ||
				this.$v.form.pageHeader.$error ||
				!this.hasContentToSend
		},
		pageHeaderErrorMessage () {
			return this.$t('validationErrors.maxLength', {
				field: this.$t('communication.label.pageHeader'),
				maxLength: this.$v.form.pageHeader.$params.maxLength.max
			})
		},
		dataErrorMessage () {
			if (!this.$v.form.data.required) {
				return this.$t('validationErrors.fieldRequiredXor', {
					fieldOne: this.$t('communication.label.content'),
					fieldTwo: this.$t('communication.label.file')
				})
			} else if (!this.$v.form.data.maxLength) {
				return this.$t('validationErrors.maxLength', {
					field: this.$t('communication.label.content'),
					maxLength: this.$v.form.data.$params.maxLength.max
				})
			} else {
				return ''
			}
		},
		fileErrorMessage () {
			return this.$t('validationErrors.fieldRequiredXor', {
				fieldOne: this.$t('communication.label.file'),
				fieldTwo: this.$t('communication.label.content')
			})
		}
	},
	methods: {
		resetFile () {
			this.form.file = {}
			this.selectedFile = ''
			this.$refs.faxUpload.value = ''
		},
		processFile (event) {
			const file = event.target.files[0]
			let fileName = file ? file.name : ''
			const fileNameSplit = fileName.split('.')
			const extension = fileNameSplit[1] ? fileNameSplit[1] : null
			if (fileName.length > 22 && extension) {
				fileName = `${fileName.substring(0, 14)}...${extension}`
			} else if (fileName.length > 22 && !extension) {
				fileName = `${fileName.substring(0, 17)}...`
			}
			this.form.file = file
			this.selectedFile = fileName
		},
		sendFax () {
			if (this.$v.form.$error ||
				this.destinationError) {
				showGlobalError(this.$t('validationErrors.generic'))
			} else {
				this.$store.dispatch('communication/createFax', this.form)
			}
		},
		error (state) {
			this.destinationError = state
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    #fax-modal
        .modal-content
            min-width 40vw
            padding 20px 15px

        .title
            line-height $csc-subtitle-line-height
            font-size $csc-subtitle-font-size
            font-weight $csc-subtitle-font-weight
    .upload-field
        margin-bottom 10px

        .upload-label
            display block
            font-size 16px
            margin-bottom 5px

        .upload-button
            color black

        .reset-button
            padding 0

            .q-icon
                margin 0

        .upload-filename
            color black

    #fax-file-upload
        display none

    #csc-error-label
        font-size 12px
        color $negative
        margin -15px 0 10px 0

</style>
