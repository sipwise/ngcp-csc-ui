<template>
    <q-item-section
        v-bind="$attrs"
        v-on="$listeners"
    >
        <slot />
    </q-item-section>
</template>

<script>
export default {
    name: 'QItemSide'
}
</script>
