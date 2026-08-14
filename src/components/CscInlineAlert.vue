<template>
    <q-banner
        :class="bannerClasses"
        inline-actions
        rounded
        v-bind="$attrs"
    >
        <slot />
        <template
            v-if="icon !== null && icon !== undefined"
            #avatar
        >
            <q-icon
                :name="icon"
                color="dark"
                size="24px"
            />
        </template>
        <template
            #action
        >
            <slot
                name="action"
            />
        </template>
    </q-banner>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'CscInlineAlert' })

const props = defineProps({
    icon: {
        type: String,
        default: null
    },
    color: {
        type: String,
        default: 'primary'
    }
})

const bannerClasses = computed(() => {
    return ['text-weight-bold', 'text-dark', `bg-${props.color}`, 'content-start']
})
</script>
