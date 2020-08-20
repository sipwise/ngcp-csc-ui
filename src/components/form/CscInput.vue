<template>
	<q-input
		ref="input"
		:value="value"
		v-bind="$attrs"
		@input="$emit('input', $event)"
		v-on="$listeners"
	>
		<template
			v-for="(_, slot) of $scopedSlots"
			v-slot:[slot]="scope"
		>
			<slot
				v-if="slot !== 'loading' && slot !== 'append'"
				:name="slot"
				v-bind="scope"
			/>
		</template>
		<template
			v-slot:loading
		>
			<csc-spinner />
		</template>
		<template
			v-slot:append
		>
			<q-btn
				v-if="value !== ''"
				icon="clear"
				color="white"
				flat
				dense
				@click="$emit('clear', $event)"
			/>
			<slot
				name="append"
			/>
		</template>
	</q-input>
</template>

<script>
import CscSpinner from 'components/CscSpinner'
export default {
	components: {
		CscSpinner
	},
	props: {
		value: {
			type: String,
			default: undefined
		}
	},
	date () {
		return {}
	},
	mounted () {
		console.log(this.$attrs)
	}
}
</script>
