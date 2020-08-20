<template>
	<div
		v-if="enabled"
	>
		<div
			class="csc-cf-dest-type"
			@click="addDestinationsetUnconditional()"
		>
			{{ $t('pages.newCallForward.unconditionalLabel') }}
		</div>
		<div
			class="csc-cf-dest-type"
			@click="addDestinationsetOffline()"
		>
			{{ $t('pages.newCallForward.offlineLabel') }}
		</div>
		<div
			class="csc-cf-dest-type"
			@click="addDestinationsetBusy()"
		>
			{{ $t('pages.newCallForward.busyLabel') }}
		</div>
	</div>
</template>

<script>
import {
	mapGetters
} from 'vuex'
export default {
	name: 'CscNewCallForwardDestinationsetTypeSelect',
	data () {
		return {
			enabled: true
		}
	},
	computed: {
		...mapGetters('newCallForward', [
			'timeoutGroupExists',
			'timeoutFromGroupExists',
			'unconditionalGroupExists',
			'unconditionalFromGroupExists',
			'offlineGroupExists',
			'busyGroupExists'
		])
	},
	methods: {
		async addDestinationsetUnconditional () {
			await this.$store.dispatch('newCallForward/setSelectedDestType', 'unconditional')
			this.$parent.close()
		},
		async addDestinationsetUnconditionalFrom () {
			await this.$store.dispatch('newCallForward/setSelectedDestType', 'unconditional-from')
			this.$parent.close()
		},
		async addDestinationsetOffline () {
			await this.$store.dispatch('newCallForward/setSelectedDestType', 'offline')
			this.$parent.close()
		},
		async addDestinationsetBusy () {
			await this.$store.dispatch('newCallForward/setSelectedDestType', 'busy')
			this.$parent.close()
		},

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
