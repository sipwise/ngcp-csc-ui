<template>
	<div
		v-if="enabled"
	>
		<div
			class="csc-cf-dest-type"
			@click="setSelectedDestinationType('destination')"
		>
			{{ $t('pages.newCallForward.numberLabel') }}
		</div>
		<div
			class="csc-cf-dest-type"
			@click="setSelectedDestinationType('voicemail')"
		>
			{{ $t('pages.newCallForward.voiceMailLabel') }}
		</div>
	</div>
</template>

<script>
import {
	mapActions
} from 'vuex'
export default {
	name: 'CscNewCallForwardDestinationTypeForm',
	data () {
		return {
			enabled: false
		}
	},
	mounted () {
		this.setSelectedDestinationType(null)
	},
	methods: {
		...mapActions('newCallForward', [
			'setSelectedDestinationType'
		]),
		cancel () {
			this.enabled = false
		},
		add () {
			this.enabled = true
		},
		close () {
			this.enabled = false
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-cf-dest-type
        min-width 100px
        padding 10px
        cursor pointer
    .csc-cf-dest-type:hover
        background $main-menu-item-hover-background
</style>
