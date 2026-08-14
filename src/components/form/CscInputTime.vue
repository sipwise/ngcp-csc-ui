<template>
    <q-input
        :value="value"
        readonly
        mask="##:##"
        v-bind="$attrs"
        @click="$refs.popupTime.show()"
    >
        <template
            #prepend
        >
            <q-btn
                icon="schedule"
                color="primary"
                dense
                flat
            >
                <q-popup-proxy
                    ref="popupTime"
                >
                    <q-time
                        :value="value"
                        format24h
                        now-btn
                        flat
                        mask="HH:mm"
                        color="primary"
                        @input="$emit('input', $event); $refs.popupTime.hide()"
                    />
                </q-popup-proxy>
            </q-btn>
        </template>
    </q-input>
</template>

<script>
export default {
    name: 'CscInputTime',
    props: {
        value: {
            type: String,
            default: '00:00'
        }
    },
    emits: ['input'],
    data () {
        return {}
    }
}
</script>
