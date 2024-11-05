<template>
    <q-popup-proxy
        ref="popup"
        persistent
        anchor="bottom middle"
        self="top middle"
        @before-show="beforeShow"
    >
        <slot />
    </q-popup-proxy>
</template>

<script>
import _ from 'lodash'
import { v4 } from 'uuid'
import {
    mapMutations,
    mapState
} from 'vuex'
export default {
    name: 'CscCfConditionPopup',
    emits: ['open', 'close'],
    data () {
        return {
            popupId: `${_.kebabCase(this.$options.name)}-${v4()}`
        }
    },
    computed: {
        ...mapState('callForwarding', [
            'popupCurrent'
        ])
    },
    watch: {
        popupCurrent (id) {
            if (id === null || this.popupId !== id) {
                this.close()
            }
        }
    },
    methods: {
        ...mapMutations('callForwarding', [
            'popupShow'
        ]),
        beforeShow () {
            this.closed = false
            this.popupShow(this.popupId)
        },
        close () {
            this.closed = true
            this.$refs.popup.hide()
            this.$emit('close')
        },
        reOpen () {
            if (!this.closed) {
                this.$refs.popup.hide()
                this.$nextTick(() => {
                    this.$refs.popup.show()
                    this.$emit('open')
                })
            }
        }
    }
}
</script>
