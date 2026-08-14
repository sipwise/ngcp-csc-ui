<template>
    <csc-inline-alert
        icon="warning"
        color="warning"
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

defineOptions({ name: 'CscInlineAlertWarning' })
</script>
