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
					@click="showConfirmDialog"
				/>
				<csc-confirm-dialog
					ref="confirmDialog"
					title-icon="delete"
					:title="$t('pages.newCallForward.cancelDialogTitle', {sourceSetName: this.sourceSetName})"
					:message="$t('pages.newCallForward.cancelDialogText', {sourceSetName: this.sourceSetName, source: this.source})"
					@confirm="confirmDeleteSource"
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
			'sourceSetName'
        ],
        // mounted(){
		// 	this.updateValues(this.destination)
		// },
		data(){
			return {
				removeInProgress: false,
				toggleNumberForm: true
			}
		},
		computed: {
			...mapGetters('newCallForward', []),
		},
        methods: {
			showConfirmDialog(){
				this.$refs.confirmDialog.open();
			},
			async confirmDeleteSource(){
				this.removeInProgress = true;
				await this.$store.dispatch('newCallForward/removeSourceFromSourceset', {
					source: this.source,
					forwardGroupId: this.groupId,
					sourceSetId: this.sourceSetId
				});
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
