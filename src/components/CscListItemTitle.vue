<template>
    <div
        class="csc-list-item-title"
    >
        <q-icon
            v-if="icon"
            :name="icon"
            :color="iconColor"
            size="24px"
        />
        <slot />
    </div>
</template>

<script setup>
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
</script>

<style lang="sass" rel="stylesheet/sass">
</style>
