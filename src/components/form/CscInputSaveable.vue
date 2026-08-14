<template>
    <q-input
        v-bind="$attrs"
        :disable="disable === true || $attrs.loading"
        @update:model-value="$emit('input', $event)"
        @keyup.enter="$emit('save', $event)"
    >
        <slot />
        <template
            v-if="icon !== undefined && icon !== null"
            #prepend
        >
            <q-icon
                :name="icon"
            />
        </template>
        <template
            #loading
        >
            <q-spinner-dots
                color="primary"
            />
        </template>
        <template
            v-if="valueChanged"
            #append
        >
            <q-btn
                v-if="!$attrs.loading"
                icon="undo"
                color="primary"
                flat
                dense
                :label="$t('Undo')"
                :disable="$attrs.loading"
                @click="$emit('undo', $event)"
            />
            <q-btn
                v-if="!$attrs.error && !$attrs.loading"
                icon="check"
                color="primary"
                flat
                dense
                :label="$t('Save')"
                :disable="$attrs.loading"
                @click="$emit('save', $event)"
            />
        </template>
    </q-input>
</template>

<script>
export default {
    name: 'CscInputSaveable',
    props: {
        icon: {
            type: String,
            default: null
        },
        valueChanged: {
            type: Boolean,
            default: false
        },
        preventSpace: {
            type: Boolean,
            default: true
        },
        disable: {
            type: Boolean,
            default: null
        }
    },
    emits: ['save', 'undo', 'input']
}
</script>
