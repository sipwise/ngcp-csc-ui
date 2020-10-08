<template>
	<q-toolbar>
		<q-space />
		<csc-input-date
			v-model="value.from"
			class="q-mr-sm"
			dense
			clearable
			label="From"
			:disable="loading"
			@input="inputFrom"
		/>
		<csc-input-date
			v-model="value.to"
			dense
			clearable
			label="To"
			:disable="loading"
			@input="inputTo"
		/>
		<q-space />
	</q-toolbar>
</template>

<script>
import CscInputDate from 'components/form/CscInputDate'
export default {
	name: 'CscConversationsFilter',
	components: {
		CscInputDate
	},
	props: {
		value: {
			type: Object,
			default () {
				return {
					from: '',
					to: ''
				}
			}
		},
		loading: {
			type: Boolean,
			default: false
		},
		disable: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		inputFrom (from) {
			this.$emit('input', {
				from: from,
				to: this.value.to
			})
		},
		inputTo (to) {
			this.$emit('input', {
				from: this.value.from,
				to: to
			})
		}
	}
}
</script>
