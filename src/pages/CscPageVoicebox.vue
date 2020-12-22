<template>
	<csc-page
		id="csc-page-voicebox"
		class="row q-pa-lg"
	>
		<q-list
			class="col col-xs-12 col-md-6"
		>
			<q-item>
				<q-item-section>
					<csc-input-saveable
						v-model="formData.pin"
						icon="lock"
						:label="$t('Change PIN')"
						:loading="pinLoading"
						:value-changed="pinHasChanged"
						:error="pinHasError"
						:error-message="pinErrorMessage"
						@undo="pinUndo(pinValue)"
						@save="pinUpdate(formData.pin)"
						@input="pinInput"
						@keypress.space.prevent
						@keydown.space.prevent
						@keyup.space.prevent
					/>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<csc-input-saveable
						v-model="formData.email"
						icon="email"
						:label="$t('Change Email')"
						:loading="emailLoading"
						:value-changed="emailHasChanged"
						:error="emailHasError"
						:error-message="emailErrorMessage"
						@undo="emailUndo(emailValue)"
						@save="emailUpdate(formData.email)"
						@input="emailInput"
						@keypress.space.prevent
						@keydown.space.prevent
						@keyup.space.prevent
					/>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<q-toggle
						v-model="formData.attach"
						:loading="attachLoading"
						:disable="attachLoading"
						:label="attachLabel"
						checked-icon="attach_file"
						unchecked-icon="attach_file"
						@input="attachToggleAction(!attachValue)"
					/>
				</q-item-section>
				<q-item-section
					side
				>
					<csc-spinner
						v-if="attachLoading"
						class="self-center"
					/>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<q-toggle
						v-model="formData.delete"
						:loading="deleteLoading"
						:disable="deleteLoading || !attachValue"
						:label="deleteLabel"
						checked-icon="delete"
						unchecked-icon="delete"
						@input="deleteToggleAction(!deleteValue)"
					/>
				</q-item-section>
				<q-item-section
					side
				>
					<csc-spinner
						v-if="deleteLoading"
						class="self-center"
					/>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<csc-sound-file-upload
						ref="uploadBusy"
						:icon="soundFileIcon"
						:file-types="soundFileTypes"
						:float-label="$t('Busy Greeting')"
						:value="busyGreetingLabel"
						:progress="busyGreetingUploadProgress"
						:uploading="busyGreetingUploading"
						:updating="busyGreetingUploading || busyGreetingDeleting || settingsLoading"
						:uploaded="busyGreetingId !== null"
						:file-url="busyGreetingUrl"
						:loaded="busyGreetingFileLoaded"
						delete-term="revert"
						@init="busyGreetingInitAudio"
						@remove="busyGreetingDeletionConfirmation"
						@upload="busyGreetingUpload"
						@abort="busyGreetingUploadAbort"
					/>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<csc-sound-file-upload
						ref="uploadUnavail"
						:icon="soundFileIcon"
						:file-types="soundFileTypes"
						:float-label="$t('Unavailable Greeting')"
						:value="unavailableGreetingLabel"
						:progress="unavailableGreetingUploadProgress"
						:uploading="unavailableGreetingUploading"
						:uploaded="unavailableGreetingId !== null"
						:updating="unavailableGreetingUploading || unavailableGreetingDeleting || settingsLoading"
						:file-url="unavailableGreetingUrl"
						:loaded="unavailableGreetingFileLoaded"
						delete-term="revert"
						@init="unavailableGreetingInitAudio"
						@remove="unavailableGreetingDeletionConfirmation"
						@upload="unavailableGreetingUpload"
						@abort="unavailableGreetingUploadAbort"
					/>
				</q-item-section>
			</q-item>
		</q-list>
	</csc-page>
</template>

<script>
import {
	mapMutations,
	mapActions,
	mapGetters,
	mapState
} from 'vuex'
import {
	showToast
} from 'src/helpers/ui'
import CscPage from 'components/CscPage'
import CscInputSaveable from 'components/form/CscInputSaveable'
import CscSoundFileUpload from 'components/form/CscSoundFileUpload'
import {
	email,
	maxLength,
	numeric
} from 'vuelidate/lib/validators'
import CscSpinner from 'components/CscSpinner'
export default {
	components: {
		CscSpinner,
		CscPage,
		CscInputSaveable,
		CscSoundFileUpload
	},
	data () {
		return {
			formData: {
				pin: this.pinValue,
				email: this.emailValue,
				attach: this.attachValue,
				delete: this.deleteValue
			},
			platform: this.$q.platform.is
		}
	},
	validations: {
		formData: {
			pin: {
				maxLength: maxLength(64),
				numeric
			},
			email: {
				email
			}
		}
	},
	computed: {
		...mapState('voicebox', [
			'pinValue',
			'pinUpdateError',
			'emailValue',
			'emailUpdateError',
			'attachValue',
			'deleteValue',
			'busyGreetingId',
			'busyGreetingUrl',
			'busyGreetingUploadProgress',
			'unavailableGreetingId',
			'unavailableGreetingUrl',
			'unavailableGreetingUploadProgress'
		]),
		...mapGetters('voicebox', [
			'settingsLoading',
			'pinLoading',
			'pinUpdateSucceeded',
			'pinUpdateFailed',
			'emailLoading',
			'emailUpdateSucceeded',
			'emailUpdateFailed',
			'attachLoading',
			'attachLabel',
			'deleteLoading',
			'deleteLabel',
			'busyGreetingUploading',
			'busyGreetingFileLoaded',
			'busyGreetingLabel',
			'busyGreetingDeleting',
			'unavailableGreetingUploading',
			'unavailableGreetingFileLoaded',
			'unavailableGreetingLabel',
			'unavailableGreetingDeleting'
		]),
		soundFileIcon () {
			return 'music_note'
		},
		soundFileTypes () {
			return '.wav,.mp3,.ogg'
		},
		soundFileFormat () {
			return this.platform.mozilla ? 'ogg' : 'mp3'
		},
		pinHasChanged () {
			return this.pinValue !== this.formData.pin
		},
		pinHasError () {
			return this.$v.formData.pin.$error || this.pinUpdateFailed
		},
		pinErrorMessage () {
			if (!this.$v.formData.pin.maxLength) {
				return this.$t('{field} must have at most {maxLength} letters', {
					field: this.$t('PIN'),
					maxLength: this.$v.formData.pin.$params.maxLength.max
				})
			} else if (!this.$v.formData.pin.numeric) {
				return this.$t('{field} must consist of numeric characters only', {
					field: this.$t('PIN')
				})
			} else if (this.pinUpdateFailed) {
				return this.pinUpdateError
			} else {
				return ''
			}
		},
		emailHasChanged () {
			return this.emailValue !== this.formData.email
		},
		emailHasError () {
			return this.$v.formData.email.$error || this.emailUpdateFailed
		},
		emailErrorMessage () {
			if (!this.$v.formData.email.email) {
				return this.$t('Input a valid email address')
			} else if (this.emailUpdateFailed) {
				return this.emailUpdateError
			} else {
				return ''
			}
		}
	},
	watch: {
		pinValue (value) {
			this.formData.pin = value
		},
		pinUpdateSucceeded (succeeded) {
			if (succeeded) {
				showToast(this.$t('Changed PIN successfully.'))
			}
		},
		emailValue (value) {
			this.formData.email = value
		},
		emailUpdateSucceeded (succeeded) {
			if (succeeded) {
				showToast(this.$t('Changed email successfully'))
			}
		},
		attachValue (value) {
			this.formData.attach = value
		},
		deleteValue (value) {
			this.formData.delete = value
		}
	},
	mounted () {
		this.settingsLoadAction()
		this.formData.pin = this.pinValue
		this.formData.email = this.emailValue
		this.formData.attach = this.attachValue
		this.formData.delete = this.deleteValue
	},
	methods: {
		...mapMutations('voicebox', [
			'pinInitialize',
			'emailInitialize'
		]),
		...mapActions('voicebox', [
			'settingsLoadAction',
			'pinUpdateAction',
			'emailUpdateAction',
			'attachToggleAction',
			'deleteToggleAction',
			'busyGreetingUpload',
			'busyGreetingUploadAbort',
			'busyGreetingPlay',
			'busyGreetingDelete',
			'unavailableGreetingUpload',
			'unavailableGreetingUploadAbort',
			'unavailableGreetingPlay',
			'unavailableGreetingDelete'
		]),
		pinInput () {
			this.pinInitialize()
			this.$v.formData.pin.$touch()
		},
		pinUndo (oldPin) {
			this.formData.pin = oldPin
			this.pinInitialize()
		},
		pinUpdate (newPin) {
			this.$v.formData.pin.$touch()
			if (this.pinHasChanged && !this.pinHasError) {
				this.pinUpdateAction(newPin)
			}
		},
		emailInput () {
			this.emailInitialize()
			this.$v.formData.email.$touch()
		},
		emailUndo (oldEmail) {
			this.emailInitialize()
			this.formData.email = oldEmail
		},
		emailUpdate (newEmail) {
			this.$v.formData.email.$touch()
			if (this.emailHasChanged && !this.emailHasError) {
				this.emailUpdateAction(newEmail)
			}
		},
		busyGreetingInitAudio () {
			this.busyGreetingPlay(this.soundFileFormat)
			this.$refs.uploadBusy.setPlayingTrue()
			this.$refs.uploadBusy.setPausedFalse()
		},
		busyGreetingDeletionConfirmation () {
			this.$q.dialog({
				title: this.$t('Reset greeting sound'),
				message: this.$t('You are about to reset the custom {type} greeting sound to defaults', {
					type: this.$t('busy')
				}),
				color: 'primary',
				cancel: true,
				persistent: true
			}).onOk(data => {
				this.busyGreetingDelete()
			})
		},
		unavailableGreetingInitAudio () {
			this.unavailableGreetingPlay(this.soundFileFormat)
			this.$refs.uploadUnavail.setPlayingTrue()
			this.$refs.uploadUnavail.setPausedFalse()
		},
		unavailableGreetingDeletionConfirmation () {
			this.$q.dialog({
				title: this.$t('Reset greeting sound'),
				message: this.$t('You are about to reset the custom {type} greeting sound to defaults', {
					type: this.$t('unavailable')
				}),
				color: 'primary',
				cancel: true,
				persistent: true
			}).onOk(data => {
				this.unavailableGreetingDelete()
			})
		}
	}
}
</script>
