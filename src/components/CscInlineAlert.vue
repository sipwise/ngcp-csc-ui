<template>
	<q-banner
		:class="bannerClasses"
		inline-actions
	>
		<template
			v-if="icon !== null && icon !== undefined"
			v-slot:avatar
		>
			<q-icon
				:name="icon"
				color="dark"
				size="24px"
			/>
		</template>
		<slot />
		<template
			v-slot:action
		>
			<slot
				name="action"
			/>
		</template>
	</q-banner>
</template>

<script>
export default {
	name: 'CscInlineAlert',
	props: {
		icon: {
			type: String,
			default: null
		},
		color: {
			type: String,
			default: 'primary'
		}
	},
	computed: {
		bannerClasses () {
			return ['text-dark', 'bg-' + this.color]
		}
	}
}
</script>
