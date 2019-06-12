<template>
    <q-item
        @click="click"
    >
        <q-item-side
            :icon="icon"
            :color="iconColor"
        />
        <q-item-main>
            <slot />
        </q-item-main>
    </q-item>
</template>

<script>
    import {
        QItem,
        QItemSide,
        QItemMain
    } from 'quasar-framework'
    export default {
        name: 'csc-list-menu-item',
        data () {
            return {}
        },
        props: [
            'icon',
            'iconColor',
            'popover'
        ],
        components: {
            QItem,
            QItemSide,
            QItemMain
        },
        methods: {
            click() {
                this.$emit('click');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
