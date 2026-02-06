<template>
    <q-item
        v-close-popup
        clickable
        v-bind="$attrs"
        @click="$emit('click')"
    >
        <q-item-section
            side
        >
            <q-icon
                :name="icon"
                :color="iconColor"
            />
        </q-item-section>
        <q-item-section>
            <slot />
        </q-item-section>
    </q-item>
</template>

<script setup>
defineOptions({ name: 'CscListMenuItem' })

defineProps({
    icon: {
        type: String,
        default: ''
    },
    iconColor: {
        type: String,
        default: ''
    }
})

defineEmits(['click'])
</script>

<style lang="sass" rel="stylesheet/sass">
</style>
