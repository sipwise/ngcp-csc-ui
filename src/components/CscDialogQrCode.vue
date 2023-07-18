<template>
    <csc-dialog
        ref="dialog"
        :title="$t('Scan to login sip:phone')"
        :opened="true"
        @cancel="hide"
    >
        <img
            v-if="qrCode"
            class="full-width justify-center"
            width="300"
            data-cy="qr-code-img"
            :src="qrCode"
        >
        <div
            v-else
            class="full-width text-center text-negative "
        >
            {{ $t('QR code unavailable. Please retry later') }}
        </div>
    </csc-dialog>
</template>

<script>
import CscDialog from './CscDialog'
import { mapState } from 'vuex'
export default {
    name: 'CscDialogQrCode',
    components: {
        CscDialog
    },
    emits: ['hide'],
    data () {
        return {
            dataImg: null
        }
    },
    computed: {
        ...mapState('user', [
            'qrCode',
            'qrExpiringTime'
        ])
    },
    methods: {
        show () {
            this.$refs.dialog.show()
            setTimeout(() => {
                this.$emit('hide')
            }, Number(this.qrExpiringTime) * 1000)
        },
        hide () {
            this.$refs.dialog.hide()
        }
    }
}
</script>
