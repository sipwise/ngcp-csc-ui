<template>
	<q-dialog
		ref="modal"
		minimized
	>
		<div
			class="csc-dialog csc-share-dialog"
		>
			<div
				class="csc-dialog-title"
			>
				<q-icon
					v-if="titleIcon"
					:name="titleIcon"
					size="24px"
				/>
				<span
					class="csc-dialog-title-text"
				>{{ title }}</span>
			</div>
			<div
				class="csc-dialog-content"
			>
				<slot
					name="content"
				/>
			</div>
			<div
				class="csc-dialog-actions row justify-end no-wrap"
			>
				<q-btn
					icon="clear"
					color="default"
					flat
					@click="cancel"
				>
					{{ $t('buttons.cancel') }}
				</q-btn>
				<slot
					name="actions"
				/>
			</div>
		</div>
	</q-dialog>
</template>

<script>
export default {
	name: 'CscDialog',
	props: {
		title: {
			type: String,
			default: ''
		},
		titleIcon: {
			type: String,
			default: ''
		},
		opened: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {

		}
	},
	watch: {
		opened (opened) {
			if (opened) {
				this.open()
			} else {
				this.close()
			}
		}
	},
	mounted () {
		if (this.opened) {
			this.open()
		}
	},
	methods: {
		open () {
			this.$refs.modal.show()
		},
		close () {
			this.$refs.modal.hide()
			this.$emit('close')
		},
		cancel () {
			this.close()
			this.$emit('cancel')
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-dialog
        max-width 480px
        background-color $body-background
        .csc-dialog-title
            text-transform uppercase
            font-size 14px
            line-height 14px
            padding $flex-gutter-sm
            background-color $item-highlight-color
            .csc-dialog-title-text
                vertical-align middle
            i
                margin-right $flex-gutter-xs
                vertical-align middle
        .csc-dialog-content
            padding $flex-gutter-md
        .csc-dialog-actions
            padding $flex-gutter-sm
</style>
