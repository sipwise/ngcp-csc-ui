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
        <slot
        />
    </div>
</template>

<script>
    import {
        QIcon
    } from 'quasar-framework'
    export default {
        name: 'csc-list-item-title',
        props: [
            'icon',
            'iconColor'
        ],
        components: {
            QIcon
        },
        data () {
            return {}
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
