<template>
    <q-dialog
        ref="dialog"
        v-bind="$attrs"
    >
        <q-card
            class="bg-dark q-dialog-plugin"
        >
            <q-card-section
                class="no-padding"
            >
                <q-item>
                    <q-item-section
                        v-if="titleIcon !== undefined && titleIcon !== null && titleIcon !== ''"
                        side
                        no-wrap
                    >
                        <q-icon
                            :name="titleIcon"
                            :color="titleIconColor"
                        />
                    </q-item-section>
                    <q-item-section
                        class="text-subtitle1"
                        no-wrap
                    >
                        {{ title }}
                    </q-item-section>
                </q-item>
            </q-card-section>
            <q-separator />
            <q-card-section>
                <slot
                    name="content"
                />
                <slot
                    name="default"
                />
            </q-card-section>
            <q-card-actions
                align="right"
            >
                <q-btn
                    v-close-popup
                    icon="clear"
                    color="white"
                    flat
                    :label="$t('Cancel')"
                />
                <slot
                    name="actions"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'CscDialog',
    props: {
        title: {
            type: String,
            required: true
        },
        titleIcon: {
            type: String,
            default: undefined
        },
        titleIconColor: {
            type: String,
            default: 'primary'
        }
    },
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
