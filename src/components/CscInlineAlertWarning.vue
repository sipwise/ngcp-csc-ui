<template>
	<csc-inline-alert
		icon="warning"
		color="warning"
		v-bind="$attrs"
		v-on="$listeners"
	>
		<slot />
		<template
			v-slot:action
		>
			<slot
				name="action"
			/>
		</template>
	</csc-inline-alert>
</template>

<script>
import CscInlineAlert from 'components/CscInlineAlert'
export default {
	name: 'CscInlineAlertWarning',
	components: {
		CscInlineAlert
	}
}
</script>
