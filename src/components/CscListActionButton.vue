<template>
    <q-btn
        flat
        :icon="icon"
        :color="color"
        :disable="disable"
        :label="label"
        @click="$emit('click')"
    />
</template>

<script setup>
defineProps({
    disable: {
        type: Boolean,
        default: false
    },
    icon: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    }
})

defineEmits(['click'])
</script>
