<template>
    <span
        class="cursor-pointer"
    >
        <template
            v-if="value === '' || value === undefined || value === null"
        >
            <q-btn
                icon="add"
                dense
                flat
                size="sm"
                :disable="$attrs.disable"
            />
        </template>
        {{ label }}
        <q-popup-edit
            v-model="internalValue"
            buttons
            :label-set="saveLabel"
            @before-show="popupBeforeShowEvent"
            @save="$emit('saved', {
                column: column,
                row: row,
                value: internalValue
            })"
        >
            <q-select
                v-model="internalValue"
                :options="filteredOptions || column.componentOptions"
                :label="column.label"
                emit-value
                map-options
                dense
                autofocus
                fill-input
                :disable="$attrs.disable"
            >
                <template
                    v-if="column.componentIcon"
                    #prepend
                >
                    <q-icon
                        :name="column.componentIcon"
                    />
                </template>
            </q-select>
        </q-popup-edit>
    </span>
</template>

<script>
import { i18n } from 'src/boot/i18n'
export default {
    name: 'CscDataTableEditSelect',
    props: {
        column: {
            type: Object,
            required: true
        },
        row: {
            type: Object,
            required: true
        },
        value: {
            type: [String, Number],
            default: undefined
        },
        filteredOptions: {
            type: Array,
            default: undefined
        },
        saveLabel: {
            type: String,
            default: i18n.global.tc('Save')
        }
    },
    emits: ['saved'],
    data () {
        return {
            internalValue: this.value
        }
    },
    computed: {
        label () {
            const refOption = this.column.componentOptions.find(option => option.value === this.value)
            if (refOption) {
                return refOption.label
            } else {
                return this.value
            }
        }
    },
    methods: {
        popupBeforeShowEvent () {
            this.internalValue = this.value
        }
    }
}
</script>
