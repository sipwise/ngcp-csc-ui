<template>
    <q-page
        v-bind="$attrs"
    >
        <slot />
    </q-page>
</template>

<script>

import platformMixin from '../mixins/platform'
export default {
    name: 'CscPage',
    mixins: [
        platformMixin
    ],
    props: {
        title: {
            type: String,
            default: ''
        },
        isList: {
            type: Boolean,
            default: false
        }
    },
    emits: ['content-resized'],
    data () {
        return {}
    },
    computed: {
        componentClasses () {
            const classes = ['csc-page']
            if (this.isMobile) {
                classes.push('csc-page-mobile')
            }
            if (this.isList) {
                classes.push('csc-page-list')
            }
            return classes
        }
    },
    methods: {
        resizeContent () {
            this.emitter.$emit('content-resized')
        }
    }
}
</script>
