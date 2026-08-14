<template>
    <csc-inline-alert
        icon="info"
        color="info"
        v-bind="$attrs"
    >
        <slot />
        <template
            #action
        >
            <slot
                name="action"
            />
        </template>
    </csc-inline-alert>
</template>

<script setup>
import CscInlineAlert from 'components/CscInlineAlert'

defineOptions({ name: 'CscInlineAlertInfo' })
</script>
