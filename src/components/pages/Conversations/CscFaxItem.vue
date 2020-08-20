<template>
	<q-item>
		<q-item-section
			side
			top
		>
			<q-icon
				name="description"
				:color="color"
			/>
		</q-item-section>
		<q-item-section>
			<q-item-label
				class="text-subtitle1"
			>
				{{ $t('pages.conversations.fax') }}
				{{ direction }}
				{{ fax.caller | numberFormat }}
			</q-item-label>
			<q-item-label
				caption
			>
				{{ fax.start_time | smartTime }}
			</q-item-label>
			<q-item-label
				v-if="fax.pages === 0"
				caption
			>
				No pages
			</q-item-label>
			<q-item-label
				v-else-if="fax.pages === 1"
				caption
			>
				{{ fax.pages }} {{ $t('pages.conversations.page') }}
			</q-item-label>
			<q-item-label
				v-else
				caption
			>
				{{ fax.pages }} {{ $t('pages.conversations.pages') }}
			</q-item-label>
		</q-item-section>
		<q-item-section
			side
		>
			<csc-more-menu>
				<csc-popup-menu-item
					icon="file_download"
					color="primary"
					:label="$t('pages.conversations.buttons.downloadFax')"
					@click="downloadFax"
				/>
				<csc-popup-menu-item-start-call
					v-if="callAvailable"
					@click="startCall"
				/>
			</csc-more-menu>
		</q-item-section>
	</q-item>
</template>

<script>
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenuItemStartCall from 'components/CscPopupMenuItemStartCall'
export default {
	name: 'CscFaxItem',
	components: { CscPopupMenuItemStartCall, CscPopupMenuItem, CscMoreMenu },
	props: {
		fax: {
			type: Object,
			default: null
		},
		callAvailable: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {}
	},
	computed: {
		color () {
			return this.fax.status === 'FAILED' ? 'negative' : 'primary'
		},
		direction () {
			if (this.fax.direction === 'out') {
				return 'to'
			} else {
				return 'from'
			}
		}
	},
	methods: {
		downloadFax () {
			this.$emit('download-fax', this.fax)
		},
		startCall () {
			this.$refs.callPopover.close()
			this.$emit('start-call', this.fax.caller)
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
