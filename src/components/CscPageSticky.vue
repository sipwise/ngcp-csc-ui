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
                <div class="row justify-center">
                    <slot
                        name="header"
                    />
                </div>
                <div class="row q-ml-sm q-mb-sm">
                    <slot
                        name="header-align-left"
                    />
                </div>
                <q-separator />
                <div
                    class="col-12"
                >
                    <slot
                        name="toolbar"
                    />
                </div>
            </div>

            <q-resize-observer
                @resize="computeTopMargin"
            />
        </q-page-sticky>
        <slot />
    </csc-page>
</template>
<script>
import CscPage from 'components/CscPage'
export default {
    name: 'CscPageSticky',
    components: {
        CscPage
    },
    emits: ['input'],
    data () {
        return {
            topMargin: 0
        }
    },
    computed: {
        pageStyle () {
            return {
                paddingTop: `${this.topMargin}px`
            }
        }
    },
    mounted () {
        this.computeTopMargin()
    },
    methods: {
        input ($event) {
            this.$emit('input', $event)
            this.computeTopMargin()
            this.$nextTick(() => {
                this.computeTopMargin()
            })
        },
        computeTopMargin () {
            this.topMargin = this.$refs.pageSticky.$el.offsetHeight
        }
    }
}
</script>
