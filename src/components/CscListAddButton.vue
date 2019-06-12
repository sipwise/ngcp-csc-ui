<template>
    <q-slide-transition>
        <div
            class="csc-add-button row justify-center"
        >
            <q-btn
                color="primary"
                icon="add"
                flat
                @click="click"
            >
                {{ label }}
            </q-btn>
        </div>
    </q-slide-transition>
</template>

<script>
    import {
        QSlideTransition,
        QBtn
    } from 'quasar-framework'
    export default {
        name: 'csc-list-add-button',
        data () {
            return {}
        },
        props: [
            'label'
        ],
        components: {
            QSlideTransition,
            QBtn
        },
        methods: {
            click() {
                this.$emit('click');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'
</style>
