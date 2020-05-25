<template>
		<div
			class="row csc-cf-source-cont"
			v-bind:class="{ 'csc-cf-removed-source': removeInProgress }"
		>
			<div class="col text-left col-xs-12 col-md-6 ">

				<div
					class='csc-cf-source'
				>
					{{ source }}

				</div>

			</div>
			<div class="col col-xs-12 col-md-6 csc-cf-source-actions">
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
		mapGetters,
	} from 'vuex'
	import {
		QIcon,
		QBtn,
		QPopover,
		QSlider,
		QList,
		QItem,
		QItemMain,
		QSpinnerDots
	} from 'quasar-framework'
	import CscConfirmDialog from "../../CscConfirmationDialog";
    export default {
        name: 'csc-new-call-forward-source',
        components: {
			QIcon,
			QBtn,
			QPopover,
			QSlider,
			QList,
			QItem,
			QItemMain,
			QSpinnerDots,
			CscConfirmDialog
		},
        props: [
			'groupId',
			'groupName',
            'source',
			'sourceSetName',
			'sourceSetId'
        ],
		data(){
			return {
				removeInProgress: false,
				toggleNumberForm: true,
                sources: []
			}
		},
		computed: {
			...mapGetters('newCallForward', [
				'getSourcesesBySourcesetId'
			]),
		},
        methods: {
			async deleteSource(){
				this.removeInProgress = true;
				let sources = this.getSourcesesBySourcesetId(this.sourceSetId);
				sources = sources.filter($source=> $source.source !== this.source);
				try{
					await this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
					await this.$store.dispatch('newCallForward/removeSourceFromSourceset', {
						id: this.sourceSetId,
						sources: sources
					});
					await this.$store.dispatch('newCallForward/loadSourcesets');
				}
				catch(err){
					console.log(err)
				}
				finally{
					await this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);
				}
				this.removeInProgress = false;
			}
		}
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
	.csc-cf-source-cont
		width 100%
		padding 5px
	.csc-cf-source
		width 100px
		white-space nowrap
		overflow hidden
		text-overflow ellipsis
	.csc-cf-number-form
		padding 0 20px 0 20px
		min-width 120px
	.csc-cf-source-actions
		text-align left
		cursor pointer
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
