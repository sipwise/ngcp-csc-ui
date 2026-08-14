<template>
    <q-select
        :label="selectedKeyLabel"
        :model-value="modelValue"
        :options="options"
        v-bind="$attrs"
    >
        <template
            v-if="showSelectedItemIcon"
            #prepend
        >
            <q-icon
                :name="selectedKeyIcon"
            />
        </template>
        <template #option="scope">
            <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
            >
                <q-item-section
                    side
                >
                    <q-icon
                        :name="scope.opt.icon"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label>
                        {{ scope.opt.label }}
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>
    </q-select>
</template>

<script>
export default {
    name: 'CscPbxAutoAttendantSelection',
    props: {
        modelValue: {
            type: Object,
            default: undefined
        },
        options: {
            type: Array,
            default: () => []
        },
        showSelectedItemIcon: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        selectedKeyLabel () {
            const selectedValue = this.modelValue || { subscriberTypeTitle: null }
            let label = this.$t('Group/Seat/Pilot')
            if (selectedValue.subscriberTypeTitle !== null) {
                label = this.$t(selectedValue.subscriberTypeTitle)
            }
            return label
        },
        selectedKeyIcon () {
            return this.modelValue?.icon
        }
    }
}
</script>
