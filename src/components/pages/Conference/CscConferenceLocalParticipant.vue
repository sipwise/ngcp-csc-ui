<template>
	<q-card
		class="bg-transparent"
		flat
	>
		<q-card-section
			v-if="!localMediaStream || localMediaStream && (!isCameraEnabled && !isScreenEnabled)"
			class="bg-black text-center"
			style="height: 100px"
		>
			<q-avatar
				class="absolute-center"
				style="top: 40px"
			>
				<q-icon
					name="person"
					size="32px"
				/>
			</q-avatar>
		</q-card-section>
		<q-card-section
			v-show="localMediaStream && (isCameraEnabled || isScreenEnabled)"
			class="relative-position bg-black text-center full-width no-padding"
			style="height: 100px"
		>
			<csc-media
				ref="cscMedia"
				:preview="false"
				:muted="true"
				:stream="localMediaStream"
			/>
		</q-card-section>
		<div
			class="absolute-bottom text-center bg-main-menu q-pa-xs"
		>
			{{ localParticipant.displayName }}
		</div>
		<!--		<q-card-section-->
		<!--			class="bg-black text-subtitle2 text-center q-pb-sm q-pr-sm q-pl-sm q-pt-none"-->
		<!--		>-->
		<!--			{{ localParticipant.displayName }}-->
		<!--		</q-card-section>-->
	</q-card>
</template>

<script>
import CscMedia from '../../CscMedia'
export default {
	name: 'CscConferenceLocalParticipant',
	components: {
		CscMedia
	},
	props: {
		localParticipant: {
			type: Object,
			default: () => {
				return {
					displayName: ''
				}
			}
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
		}
	},
	watch: {
		localMediaStream (stream) {
			this.assignStream(stream)
		}
	},
	mounted () {
		this.assignStream(this.localMediaStream)
	},
	methods: {
		assignStream (stream) {
			if (this.$refs.cscMedia) {
				this.$refs.cscMedia.assignStream(stream)
			}
		}
	}
}
</script>
