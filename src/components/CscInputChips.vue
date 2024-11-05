<template>
    <div>
        <q-input
            ref="input"
            v-model.trim="input"
            v-bind="$attrs"
            clearable
            hide-bottom-space
            @keyup.enter="add(input)"
            @clear="clearInput"
            @blur="blurInput"
        >
            <template
                #append
            >
                <q-btn
                    v-if="showAddButton()"
                    icon="add"
                    color="primary"
                    :label="$t('Add')"
                    data-cy="chip-add"
                    size="sm"
                    flat
                    dense
                    @click="add(input)"
                />
                <q-btn
                    v-if="showRemoveAllButton()"
                    icon="delete"
                    color="negative"
                    size="sm"
                    flat
                    dense
                    :label="$t('Remove all')"
                    data-cy="chip-removeall"
                    @click="removeAll"
                />
            </template>
        </q-input>
        <div
            v-if="items && items.length > 0"
        >
            <q-chip
                v-for="(item, index) in items"
                :key="getItemKey(item, index)"
                :label="item.label"
                :removable="!$attrs.disable"
                :dense="$attrs.dense"
                @remove="remove(item)"
            />
        </div>
    </div>
</template>

<script>
import useValidate from '@vuelidate/core'
export default {
    name: 'CscInputChips',
    props: {
        value: {
            type: Array,
            default: () => []
        }
    },
    emits: ['input'],
    data () {
        return {
            v$: useValidate(),
            input: '',
            items: []
        }
    },
    computed: {
        itemsAsArray () {
            const items = []
            if (this.items) {
                this.items.forEach((item) => {
                    items.push(item.value)
                })
            }
            return items
        }
    },
    watch: {
        value (newItems) {
            this.assignItems(newItems)
        }
    },
    mounted () {
        this.assignItems(this.value)
        this.resetInput()
    },
    methods: {
        removeAll () {
            this.$emit('input', [])
        },
        remove (removable) {
            const newItems = this.items.filter((item) => item.value !== removable.value)
            this.$emit('input', newItems.map((item) => item.value))
        },
        add (value) {
            let isValid = true
            if (this.v$.input) {
                this.v$.input.$touch()
                isValid = !this.v$.input.$error
            }
            if (isValid) {
                const exists = this.items.find((item) => item.value === value)
                if (value !== undefined && value !== null && value !== '' && !exists) {
                    this.resetInput()
                    this.input = ''
                    this.items.push({
                        value,
                        label: value
                    })

                    this.$emit('input', this.items.map((item) => item.value))
                }
            }
        },
        assignItems (newItems) {
            if (newItems) {
                this.items = []
                return newItems.forEach((value) => {
                    this.items.push({
                        value,
                        label: value
                    })
                })
            }

            this.items = newItems
        },
        clearInput () {
            this.resetInput()
            this.$refs.input.blur()
        },
        resetInput () {
            if (this.v$.input) {
                this.v$.input.$reset()
            }
        },
        blurInput () {
            if (this.input === undefined || this.input === null || this.input === '') {
                this.resetInput()
            }
        },
        getItemKey (item, index) {
            return `${String(item.value)}-${String(index)}`
        },
        showAddButton () {
            return this.input !== undefined && this.input !== null && this.input !== ''
        },
        showRemoveAllButton () {
            return (this.input === undefined || this.input === null || this.input === '') &&
                this.items &&
                this.items.length > 0
        }
    }
}
</script>
