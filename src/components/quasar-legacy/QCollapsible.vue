<template>
    <q-expansion-item
        :value="value"
        v-bind="$attrs"
        v-on="$listeners"
        @input="$emit('input', $event)"
    >
        <slot />
    </q-expansion-item>
</template>

<script>
export default {
    name: 'QCollapsible',
    props: {
        value: {
            type: Boolean,
            default: false
        }
    }
}
</script>
