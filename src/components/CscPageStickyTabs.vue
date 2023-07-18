<template>
    <csc-page
        :style="pageStyle"
    >
        <q-page-sticky
            ref="pageSticky"
            class="bg-secondary q-pt-md"
            style="z-index: 10"
            expand
            position="top"
        >
            <div class="column full-width">
                <div
                    class="full-width"
                >
                    <q-tabs
                        :model-value="value"
                        style="z-index: 11"
                        align="center"
                        inline-label
                        active-color="primary"
                        dense
                        mobile-arrows
                        @update:model-value="input"
                    >
                        <slot
                            name="tabs"
                        />
                    </q-tabs>
                </div>
                <q-separator />
                <slot
                    name="toolbar"
                />
            </div>
        </q-page-sticky>
        <slot />
    </csc-page>
</template>
<script>
import CscPage from 'components/CscPage'
export default {
    name: 'CscPageStickyTabs',
    components: {
        CscPage
    },
    props: {
        value: {
            type: String,
            default: ''
        }
    },
    emits: ['input'],
    data () {
        return {
            topMargin: 0,
            currentTab: '',
            observer: null
        }
    },
    computed: {
        pageStyle () {
            return {
                paddingTop: this.topMargin + 'px'
            }
        }
    },
    mounted () {
        this.computeTopMargin()
        const observer = new MutationObserver(this.computeTopMargin)
        observer.observe(this.$refs.pageSticky.$el, {
            childList: true,
            subtree: true
        })
        this.observer = observer
    },
    beforeUnmount () {
        this.observer.disconnect()
    },
    methods: {
        async input ($event) {
            this.$emit('input', $event)
        },
        computeTopMargin () {
            this.topMargin = this.$refs.pageSticky.$el.offsetHeight
        }
    }
}
</script>
