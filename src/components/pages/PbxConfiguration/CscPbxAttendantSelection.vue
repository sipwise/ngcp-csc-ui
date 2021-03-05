<template>
    <q-select
        :label="selectedKeyLabel"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <template
            v-if="showSelectedItemIcon"
            v-slot:prepend
        >
            <q-icon
                :name="selectedKeyIcon"
            />
        </template>
        <template v-slot:option="scope">
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
    name: 'CscPbxAttendantSelection',
    props: {
        showSelectedItemIcon: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        selectedKeyLabel () {
            const selectedValue = this.$attrs.value || { type: null }
            let label = this.$t('Group/Seat/Pilot')
            if (selectedValue.type !== null) {
                label = ({
                    pilot: this.$t('Pilot'),
                    seat: this.$t('Seat'),
                    group: this.$t('Group')
                })[selectedValue.type]
            }
            return label
        },
        selectedKeyIcon () {
            return this.$attrs.value?.icon
        }
    }
}
</script>
