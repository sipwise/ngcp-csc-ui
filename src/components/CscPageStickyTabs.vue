<template>
	<csc-page
		:style="pageStyle"
	>
		<q-page-sticky
			ref="pageSticky"
			class="bg-secondary q-pt-md"
			style="z-index: 10"
			expand
			position="top"
		>
			<div
				class="full-width"
			>
				<q-tabs
					:value="value"
					style="z-index: 11"
					align="center"
					inline-label
					active-color="primary"
					dense
					mobile-arrows
					@input="input"
				>
					<slot
						name="tabs"
					/>
				</q-tabs>
			</div>
			<q-separator />
			<slot
				name="toolbar"
			/>
		</q-page-sticky>
		<slot />
	</csc-page>
</template>
<script>
import CscPage from 'components/CscPage'
export default {
	name: 'CscPageStickyTabs',
	components: {
		CscPage
	},
	props: {
		value: {
			type: String,
			default: ''
		}
	},
	data () {
		return {
			topMargin: 0,
			currentTab: ''
		}
	},
	computed: {
		pageStyle () {
			return {
				paddingTop: this.topMargin + 'px'
			}
		}
	},
	mounted () {
		this.computeTopMargin()
	},
	methods: {
		input ($event) {
			this.$emit('input', $event)
			this.computeTopMargin()
			this.$nextTick(() => {
				this.computeTopMargin()
			})
		},
		computeTopMargin () {
			this.topMargin = this.$refs.pageSticky.$el.offsetHeight
		}
	}
}
</script>
