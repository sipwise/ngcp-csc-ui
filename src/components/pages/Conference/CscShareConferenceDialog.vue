<template>
    <csc-dialog
        ref="dialogComp"
        :title="$t('Share conference')"
        :title-icon="'link'"
    >
        <div
            slot="content"
        >
            <q-input
                ref="conferenceUrlInput"
                :value="conferenceUrl"
                readonly
                @focus="selectConferenceUrl"
            />
        </div>
        <q-btn
            slot="actions"
            color="primary"
            flat
            icon="link"
            @click="copy"
        >
            {{ $t('Copy link') }}
        </q-btn>
    </csc-dialog>
</template>

<script>
import CscDialog from '../../CscDialog'
export default {
    name: 'CscShareConferenceDialog',
    components: {
        CscDialog
    },
    props: {
        conferenceUrl: {
            type: String,
            default: null
        }
    },
    data () {
        return {
        }
    },
    computed: {},
    mounted () {
        this.selectConferenceUrl()
    },
    methods: {
        open () {
            this.$refs.dialogComp.open()
            this.$nextTick(() => {
                this.$refs.conferenceUrlInput.focus()
            })
        },
        close () {
            this.$refs.dialogComp.close()
        },
        copy () {
            this.$refs.conferenceUrlInput.select()
            document.execCommand('copy')
            this.close()
        },
        selectConferenceUrl () {
            if (this.$refs.conferenceUrlInput) {
                this.$refs.conferenceUrlInput.select()
            }
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
