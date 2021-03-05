<template>
    <q-item-section
        v-bind="$attrs"
        v-on="$listeners"
    >
        <q-item-label>{{ $attrs.label }}</q-item-label>
    </q-item-section>
</template>

<script>
export default {
    name: 'QItemMain'
}
</script>
