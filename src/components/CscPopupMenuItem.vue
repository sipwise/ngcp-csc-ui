<template>
    <q-item
        v-close-popup="closePopup"
        clickable
        :disable="disable"
        v-bind="$attrs"
    >
        <q-item-section
            v-if="icon !== null"
            side
        >
            <q-icon
                :name="icon"
                :color="color"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label>
                {{ label }}
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'CscPopupMenuItem',
    props: {
        icon: {
            type: String,
            default: null
        },
        color: {
            type: String,
            default: 'primary'
        },
        label: {
            type: [String, Number],
            default: ''
        },
        sublabel: {
            type: String,
            default: ''
        },
        closePopup: {
            type: Boolean,
            default: true
        },
        disable: {
            type: Boolean,
            default: false
        }
    }
}
</script>
