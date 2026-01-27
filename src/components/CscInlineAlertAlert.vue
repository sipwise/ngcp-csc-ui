<template>
    <csc-inline-alert
        icon="error"
        color="negative"
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
</script>
