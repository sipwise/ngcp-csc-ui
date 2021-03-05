<template>
    <q-card
        class="bg-dark no-padding no-margin relative-position"
    >
        <q-item
            class="no-margin no-padding"
            dense
        >
            <q-item-section
                side
            >
                <q-btn
                    v-if="backButton"
                    icon="arrow_back"
                    flat
                    dense
                    @click="$emit('back')"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label
                    class="text-subtitle1"
                >
                    <q-icon
                        v-if="icon"
                        :name="icon"
                    />
                    {{ title }}
                </q-item-label>
            </q-item-section>
            <q-item-section
                side
            >
                <q-btn
                    icon="clear"
                    flat
                    dense
                    @click="$emit('close')"
                />
            </q-item-section>
        </q-item>
        <q-card-section
            class="no-padding no-margin"
        >
            <slot
                name="default"
            />
        </q-card-section>
        <q-card-actions
            align="right"
        >
            <slot
                name="actions"
            />
        </q-card-actions>
        <q-inner-loading
            :showing="loading"
        >
            <csc-spinner />
        </q-inner-loading>
    </q-card>
</template>

<script>
import CscSpinner from 'components/CscSpinner'
export default {
    name: 'CscCfGroupCondition',
    components: {
        CscSpinner
    },
    props: {
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            default: undefined
        },
        loading: {
            type: Boolean,
            default: false
        },
        backButton: {
            type: Boolean,
            default: false
        }
    }
}
</script>
