<template>
    <q-chip pointing="left" color="primary" class="csc-number-chip">
        <span class="number-pilot">{{ item.primary_number | number(item.pbx_extension) }}</span>
        <span class="number-ext">{{ item.pbx_extension }}</span>
    </q-chip>
</template>

<script>
    import { QChip } from 'quasar-framework'
    export default {
        name: 'csc-number-chip',
        props: ['item'],
        data () {
            return {}
        },
        components: {
            QChip
        }
    }
</script>

<style>
    .csc-number-chip .number-ext {
        font-weight: bold;
    }
</style>
