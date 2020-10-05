<template>
	<div
		class="col-xs-10 col-sm-8 col-md-4 csc-opt-center"
	>
		<csc-inline-alert-info
			v-if="!hasRtcEngineCapabilityEnabled"
			class="q-mb-lg"
		>
			{{ $t('call.rtcEngineNotEnabledConferencing') }}
		</csc-inline-alert-info>
		<div
			class="text-h6 text-center q-mb-lg"
		>
			{{ $t('conferencing.joinText') }}
		</div>
		<q-input
			ref="conferenceName"
			class="q-mb-lg"
			:value="conferenceIdInput"
			:placeholder="$t('conferencing.idPlaceholder')"
			:disable="isJoining || !hasRtcEngineCapabilityEnabled"
			@input="conferenceIdChanged"
		>
			<template
				v-slot:prepend
			>
				<q-icon
					name="meeting_room"
					size="24px"
				/>
			</template>
			<template
				v-slot:append
			>
				<q-btn
					:disable="!hasConferenceId || isJoining || !hasRtcEngineCapabilityEnabled"
					:color="shareButtonColor"
					:label="$t('conferencing.shareButtonLabel')"
					flat
					dense
					icon="link"
					@click="showShareDialog"
				/>
			</template>
		</q-input>
		<div
			class="row justify-center"
		>
			<q-btn
				:color="joinButtonColor"
				:disable="!hasConferenceId || isJoining || !hasRtcEngineCapabilityEnabled"
				icon="login"
				text-color="dark"
				unelevated
				round
				size="large"
				@click="join"
			/>
		</div>
		<csc-object-spinner
			:loading="isJoining"
		/>
		<csc-share-conference-dialog
			ref="shareDialog"
			:conference-url="conferenceUrl"
		/>
	</div>
</template>

<script>
import {
	randInRange
} from 'src/helpers/math-helper'
import CscShareConferenceDialog from './CscShareConferenceDialog'
import CscObjectSpinner from '../../CscObjectSpinner'
import CscInlineAlertInfo from 'components/CscInlineAlertInfo'
import { showGlobalError } from 'src/helpers/ui'
import { mapState } from 'vuex'
export default {
	name: 'CscConferenceJoin',
	components: {
		CscInlineAlertInfo,
		CscObjectSpinner,
		CscShareConferenceDialog
	},
	props: {
		conferenceId: {
			type: String,
			default: null
		},
		hasConferenceId: {
			type: Boolean,
			default: false
		},
		conferenceUrl: {
			type: String,
			default: null
		},
		localMediaStream: {
			type: MediaStream,
			default: null
		},
		isMicrophoneEnabled: {
			type: Boolean,
			default: false
		},
		isCameraEnabled: {
			type: Boolean,
			default: false
		},
		isScreenEnabled: {
			type: Boolean,
			default: false
		},
		isJoining: {
			type: Boolean,
			default: false
		},
		isJoined: {
			type: Boolean,
			default: false
		},
		hasRtcEngineCapabilityEnabled: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			conferenceIdInput: this.conferenceId
		}
	},
	computed: {
		...mapState('conference', [
			'localMediaError'
		]),
		contentClasses () {
			const classes = ['col', 'col-md-4', 'text-center']
			if (this.isCameraEnabled) {
				classes.push('csc-camera-background')
			} else if (this.isScreenEnabled) {
				classes.push('csc-screen-background')
			}
			return classes
		},
		joinButtonColor () {
			return 'primary'
		},
		shareButtonColor () {
			if (this.hasConferenceId) {
				return 'primary'
			} else {
				return 'grey'
			}
		},
		isMediaEnabled () {
			return this.isCameraEnabled || this.isScreenEnabled || this.isMicrophoneEnabled
		}
	},
	watch: {
		conferenceId (value) {
			this.conferenceIdInput = value
		},
		localMediaError (error) {
			if (error !== null && error !== undefined) {
				showGlobalError(error)
			}
		}
	},
	mounted () {
		if (!this.conferenceId) {
			this.conferenceIdChanged(this.createConferenceId())
		}
	},
	methods: {
		join () {
			this.$emit('join', this.conferenceId)
		},
		conferenceIdChanged (value) {
			try {
				this.$router.push({
					path: '/conference/' + value
				})
				this.conferenceIdInput = value
			} catch (err) {
				this.conferenceIdInput = this.conferenceId
			}
		},
		showShareDialog () {
			this.$refs.shareDialog.open()
		},
		createConferenceId () {
			const prefixes = ['conf', 'room', 'space']
			const randPrefixIndex = randInRange(0, prefixes.length - 1)
			const randSuffix = randInRange(100000, 999999)
			return prefixes[randPrefixIndex] + randSuffix
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-conf-alert
        margin-bottom $flex-gutter-md
    #csc-conf-link-input
        margin-bottom $flex-gutter-md
    #csc-conf-join-text
        margin-bottom $flex-gutter-md
        font-weight bold
        font-size 1rem
    #csc-conf-join-content
        padding $flex-gutter-md
        position relative
        z-index 2
    #csc-conf-join-content.csc-camera-background
        background-color alpha($main-menu-background, 0.5)
    #csc-conf-join-content.csc-screen-background
        background-color alpha($main-menu-background, 0.5)
</style>
