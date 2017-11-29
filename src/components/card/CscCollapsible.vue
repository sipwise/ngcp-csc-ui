<template>
    <div class="csc-collapsible">
        <q-collapsible :icon="icon"
            :label="label"
            :sublabel="sublabel">
            <slot></slot>
        </q-collapsible>
    </div>
</template>

<script>
    import { QCollapsible } from 'quasar-framework'
    export default {
        name: 'csc-collapsible',
        props: [
            'icon',
            'label',
            'sublabel'
        ],
        components: {
            QCollapsible
        }
    }
</script>

<style lang="stylus">
@import '~variables'
.csc-collapsible
    .q-collapsible
        .q-item-icon
            font-size 22px
            padding-right 12px
            color $secondary
        .q-item-label
            color black
            font-size 18px
            font-weight 400
        ul
            list-style none
            font-size 1rem
            line-height 2rem
            strong
                font-weight 500
</style>
