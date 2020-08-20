<template>
	<transition
		appear
		enter-active-class="animated fadeIn faster"
		leave-active-class="animated fadeOut faster"
	>
		<slot />
	</transition>
</template>

<script>
export default {
	name: 'CscFade',
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
