<template>
	<div
		class="row csc-cf-source-cont"
		:class="{ 'csc-cf-removed-source': removeInProgress }"
	>
		<div class="col text-left col-xs-10 col-md-10 ">
			<div
				class="csc-cf-source"
			>
				{{ source }}
			</div>
		</div>
		<div class="col col-xs-2 col-md-2 csc-cf-source-actions">
			<q-icon
				name="delete"
				color="negative"
				size="24px"
				@click="deleteSource"
			/>
		</div>
	</div>
</template>

<script>
import {
	mapGetters
} from 'vuex'
export default {
	name: 'CscNewCallForwardSource',
	props: {
		groupId: {
			type: [String, Number],
			default: null
		},
		groupName: {
			type: String,
			default: ''
		},
		source: {
			type: String,
			default: ''
		},
		sourceSetName: {
			type: String,
			default: ''
		},
		sourceSetId: {
			type: [String, Number],
			default: null
		}
	},
	data () {
		return {
			removeInProgress: false,
			toggleNumberForm: true,
			sources: []
		}
	},
	computed: {
		...mapGetters('newCallForward', [
			'getSourcesesBySourcesetId'
		])
	},
	methods: {
		async deleteSource () {
			this.removeInProgress = true
			let sources = this.getSourcesesBySourcesetId(this.sourceSetId)
			sources = sources.filter($source => $source.source !== this.source)
			try {
				this.$store.dispatch('newCallForward/addGroupLoader', this.groupId)
				await this.$store.dispatch('newCallForward/removeSourceFromSourceset', {
					id: this.sourceSetId,
					sources: sources
				})
				await this.$store.dispatch('newCallForward/loadSourcesets')
			} catch (err) {
				console.log(err)
			} finally {
				this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId)
			}
			this.removeInProgress = false
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
	.csc-cf-source-cont
		width 100%
		padding 5px
	.csc-cf-source
		white-space nowrap
		overflow hidden
		text-overflow ellipsis
	.csc-cf-source-actions
		text-align left
		cursor pointer
		.q-icon
			margin-left 4px
	.csc-cf-popover-hide
		display none
	.csc-cf-sourceset-name
		font-weight bold
		margin-bottom 15px
	.csc-cf-removed-source
		visibility hidden
		opacity 0
		transition visibility 0s 1s, opacity 1s linear
</style>
