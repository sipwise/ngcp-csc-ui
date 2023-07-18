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

<script>
import CscInlineAlert from 'components/CscInlineAlert'
export default {
    name: 'CscInlineAlertInfo',
    components: {
        CscInlineAlert
    }
}
</script>
