<template>
	<transition
		appear
		enter-active-class="animated fadeInDown faster"
		leave-active-class="animated fadeOutUp faster"
	>
		<slot />
	</transition>
</template>

<script>
export default {
	name: 'CscFadeDown',
	components: {
	},
	data () {
		return {}
	},
	computed: {
	},
	watch: {
	},
	methods: {
	}
}
</script>
