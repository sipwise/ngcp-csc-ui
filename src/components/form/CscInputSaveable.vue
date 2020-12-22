<template>
	<q-input
		v-bind="$attrs"
		:value="value"
		:disable="disable === true || $attrs.loading"
		v-on="$listeners"
		@input="$emit('input', $event)"
		@keyup.enter="$emit('save', $event)"
	>
		<slot />
		<template
			v-if="icon !== undefined && icon !== null"
			v-slot:prepend
		>
			<q-icon
				:name="icon"
			/>
		</template>
		<template
			v-slot:loading
		>
			<q-spinner-dots
				color="primary"
			/>
		</template>
		<template
			v-if="valueChanged"
			v-slot:append
		>
			<q-btn
				v-if="!$attrs.loading"
				icon="undo"
				color="primary"
				flat
				dense
				:label="$t('Undo')"
				:disable="$attrs.loading"
				@click="$emit('undo', $event)"
			/>
			<q-btn
				v-if="!$attrs.error && !$attrs.loading"
				icon="check"
				color="primary"
				flat
				dense
				:label="$t('Save')"
				:disable="$attrs.loading"
				@click="$emit('save', $event)"
			/>
		</template>
	</q-input>
</template>

<script>
export default {
	name: 'CscInputSaveable',
	props: {
		icon: {
			type: String,
			default: null
		},
		valueChanged: {
			type: Boolean,
			default: false
		},
		preventSpace: {
			type: Boolean,
			default: true
		},
		value: {
			type: String,
			default: ''
		},
		disable: {
			type: Boolean,
			default: null
		}
	},
	data () {
		return {
			inputValue: this.value
		}
	}
}
</script>
