<template>
    <q-inner-loading
        :visible="loading"
        :style="{zIndex: 12}"
    >
        <q-spinner-dots
            size="32px"
            color="primary"
        />
    </q-inner-loading>
</template>

<script setup>
defineOptions({ name: 'CscObjectSpinner' })

defineProps({
    loading: {
        type: Boolean,
        default: false
    }
})
</script>
