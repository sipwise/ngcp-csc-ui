<template>
    <q-item
        v-close-popup
        clickable
        v-bind="$attrs"
        @click="click"
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

<script>
export default {
    name: 'CscListMenuItem',
    props: {
        icon: {
            type: String,
            default: ''
        },
        iconColor: {
            type: String,
            default: ''
        }
    },
    emits: ['click'],
    data () {
        return {}
    },
    methods: {
        click () {
            this.$emit('click')
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
</style>
