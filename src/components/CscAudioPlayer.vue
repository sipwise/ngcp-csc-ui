<template>
	<q-item
		class="no-padding"
	>
		<audio
			ref="audio"
			:src="fileUrl"
			preload="auto"
			@timeupdate="timeUpdate"
		/>
		<q-item-section
			class="no-padding"
			side
		>
			<q-btn
				v-if="!playing"
				flat
				dense
				color="primary"
				icon="play_arrow"
				:disable="disable"
				@click="playLoad()"
			/>
			<q-btn
				v-if="playing"
				flat
				dense
				color="primary"
				icon="pause"
				:disable="disable"
				@click="toggle()"
			/>
		</q-item-section>
		<q-item-section
			class="no-padding q-mr-sm"
			side
		>
			<q-btn
				:disable="disable"
				flat
				dense
				color="primary"
				icon="stop"
				@click="stop()"
			/>
		</q-item-section>
		<q-item-section
			class="no-padding"
		>
			<q-linear-progress
				:value="progressPercentage"
				instant-feedback
				color="primary"
			/>
		</q-item-section>
	</q-item>
</template>

<script>
export default {
	name: 'CscAudioPlayer',
	props: {
		fileUrl: {
			type: String,
			default: null
		},
		loaded: {
			type: Boolean,
			default: false
		},
		disable: {
			type: Boolean,
			default: false
		},
		pausable: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			playing: false,
			paused: false,
			progressPercentage: 0
		}
	},
	computed: {
		playPauseIcon () {
			return this.playing ? 'pause' : 'play_arrow'
		},
		isLoaded () {
			return this.loaded || this.fileUrl
		}
	},
	watch: {
		fileUrl () {
			if (this.fileUrl) {
				this.play()
			}
		}
	},
	mounted () {
		this.$refs.audio.addEventListener('play', () => {
			this.playing = true
		})
		this.$refs.audio.addEventListener('playing', () => {
			this.playing = true
		})
		this.$refs.audio.addEventListener('ended', () => {
			this.playing = false
			this.stop()
		})
		this.$refs.audio.addEventListener('canplay', () => {
			if (!this.paused && this.playing) {
				this.$refs.audio.play()
			}
		})
	},
	methods: {
		play () {
			const playPromise = this.$refs.audio.play()
			if (playPromise && playPromise.then) {
				playPromise.then(() => {
					this.playing = true
					this.paused = false
					this.$emit('playing')
				}).catch(() => {
					this.playing = true
					this.paused = false
					this.$emit('loading')
				})
			} else {
				this.playing = true
				this.paused = false
				this.$emit('playing')
			}
		},
		pause () {
			this.$refs.audio.pause()
			this.playing = false
			this.paused = true
		},
		stop () {
			this.$refs.audio.currentTime = 0
			this.pause()
			this.$emit('stopped')
		},
		setPlayingTrue () {
			this.playing = true
		},
		setPausedFalse () {
			this.paused = false
		},
		timeUpdate () {
			this.progressPercentage = this.$refs.audio.currentTime / this.$refs.audio.duration
		},
		load () {
			this.$emit('load')
		},
		toggle () {
			if (this.$refs.audio.paused) {
				this.playLoad()
			} else {
				this.pause()
			}
		},
		playLoad () {
			if (!this.isLoaded) {
				this.load()
			} else if (this.$refs.audio.paused) {
				this.play()
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .audio-player
        width 100%
        display flex
        justify-content space-around
        align-items center

        .control-btns
            display flex
            justify-content space-between

        .progress-bar
            margin-left 16px
            margin-right 16px

</style>
