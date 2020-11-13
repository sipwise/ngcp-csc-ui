<template>
	<q-input
		:value="value"
		:clearable="false"
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
			<slot
				name="append"
			/>
			<q-btn
				v-if="$attrs.clearable !== undefined && value !== ''"
				icon="backspace"
				color="white"
				flat
				dense
				tabindex="-1"
				:disable="$attrs.disable"
				@click="clear"
			/>
		</template>
	</q-input>
</template>

<script>
import CscSpinner from 'components/CscSpinner'
export default {
	name: 'CscInput',
	components: {
		CscSpinner
	},
	props: {
		value: {
			type: [String, Number],
			default: undefined
		}
	},
	date () {
		return {

		}
	},
	mounted () {
	},
	methods: {
		clear () {
			this.$emit('input', '')
			this.$emit('clear')
		}
	}
}
</script>
