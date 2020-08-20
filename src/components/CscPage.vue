<template>
	<q-page
		v-bind="$attrs"
		v-on="$listeners"
	>
		<slot />
	</q-page>
</template>

<script>

import platformMixin from '../mixins/platform'

export default {
	name: 'CscPage',
	mixins: [
		platformMixin
	],
	props: {
		title: {
			type: String,
			default: ''
		},
		isList: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {}
	},
	computed: {
		componentClasses () {
			const classes = ['csc-page']
			if (this.isMobile) {
				classes.push('csc-page-mobile')
			}
			if (this.isList) {
				classes.push('csc-page-list')
			}
			return classes
		}
	},
	methods: {
		resizeContent () {
			this.$root.$emit('content-resized')
		}
	}
}
</script>

<!--<style lang="stylus" rel="stylesheet/stylus">-->
<!--    .csc-page-->
<!--        min-height 100vh-->
<!--        position relative-->
<!--        margin 0-->
<!--        padding 0-->
<!--        .csc-page-content-->
<!--            min-height 100vh-->
<!--            padding $flex-gutter-lg-->
<!--            padding-top 24px-->
<!--            padding-bottom $call-footer-height-->
<!--    .csc-page.csc-page-mobile-->
<!--        .csc-page-content-->
<!--            padding-left $flex-gutter-sm * 1.4-->
<!--            padding-right $flex-gutter-sm * 1.4-->
<!--    .csc-page.csc-page-mobile.csc-page-list-->
<!--        .csc-page-content-->
<!--            padding-left 0-->
<!--            padding-right 0-->
<!--</style>-->
