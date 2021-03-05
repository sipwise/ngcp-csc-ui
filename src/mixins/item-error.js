'use strict'

import { showGlobalError } from '../helpers/ui'
import { mapGetters } from 'vuex'

export default {
    computed: {
        ...mapGetters('pbxConfig', [
            'addState',
            'updateState',
            'removeState',
            'addError',
            'updateError',
            'removeError'
        ])
    },
    watch: {
        addState (state) {
            if (state === 'failed') {
                showGlobalError(this.addError)
            }
        },
        updateState (state) {
            if (state === 'failed') {
                showGlobalError(this.updateError)
            }
        },
        removeState (state) {
            if (state === 'failed') {
                showGlobalError(this.removeError)
            }
        }
    }
}
