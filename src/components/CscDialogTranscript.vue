<template>
    <csc-dialog
        ref="dialog"
        :title="$t('Transcript')"
        title-icon="description"
        @hide="$emit('hide')"
        @before-hide="$emit('before-hide')"
    >
        <template #content>
            <div class="q-pa-md">
                <div
                    v-if="isLoading"
                    class="flex flex-center"
                >
                    <q-spinner
                        color="primary"
                        size="3em"
                    />
                </div>

                <p
                    v-else-if="status === 'done'"
                >
                    {{ text }}
                </p>
                <p
                    v-else
                    class="text-grey"
                >
                    {{ $t('No transcript available.') }}
                </p>
            </div>
        </template>
    </csc-dialog>
</template>

<script>
import CscDialog from 'components/CscDialog'

export default {
    name: 'CscDialogTranscript',
    components: {
        CscDialog
    },
    props: {
        text: {
            type: String,
            default: null
        },
        status: {
            type: String,
            default: null
        },
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['hide', 'before-hide'],
    methods: {
        show () {
            this.$refs.dialog.show()
        },
        hide () {
            this.$refs.dialog.hide()
        }
    }
}
</script>
