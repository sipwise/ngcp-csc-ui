<template>
    <div
        class="weekdays-selection-component"
    >
        <div
            v-if="!tabs"
            class="row justify-around"
        >
            <q-btn
                v-for="(day, index) in days"
                :key="day.value"
                :label="day.label"
                :class="(index > 0)?'q-ml-sm':''"
                round
                no-caps
                unelevated
                :color="(isSelected(day))?'primary':'dark'"
                :text-color="(isSelected(day))?'dark':'primary'"
                :disable="disable"
                @click="toggle(day)"
            />
        </div>
        <div
            v-else
        >
            <q-tabs
                v-model="selectedTab"
                dense
                active-color="primary"
                indicator-color="primary"
                align="center"
            >
                <q-tab
                    v-for="(day) in days"
                    :key="day.value"
                    :name="'tab-' + day.value"
                    :label="day.label"
                    class="text-primary no-padding"
                    inline-label
                    outside-arrows
                    mobile-arrows
                    no-caps
                    :disable="disable"
                />
            </q-tabs>
            <q-separator
                v-if="tabs"
            />
        </div>
    </div>
</template>

<script>
import {
    DAY_MAP,
    getDayNameByNumber
} from 'src/filters/time-set'

export default {
    name: 'CscCfSelectionWeekdays',
    props: {
        value: {
            type: Array,
            default: () => [DAY_MAP[0]]
        },
        tabs: {
            type: Boolean,
            default: false
        },
        disable: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            selectedWeekdays: this.value
        }
    },
    computed: {
        selectedTab: {
            get () {
                return 'tab-' + this.selectedWeekdays[0]
            },
            set (tab) {
                this.selectedWeekdays = [Number(tab.replace('tab-', ''))]
            }
        },
        days () {
            const options = []
            DAY_MAP.forEach((day, index) => {
                options.push({
                    label: getDayNameByNumber(index, true),
                    value: day
                })
            })
            return options
        }
    },
    watch: {
        selectedWeekdays (weekdays) {
            this.$emit('input', weekdays)
        },
        value (weekdays) {
            this.selectedWeekdays = weekdays
        }
    },
    methods: {
        toggle (day) {
            if (this.isSelected(day)) {
                this.selectedWeekdays = this.selectedWeekdays.filter(dayValue => day.value !== dayValue)
            } else {
                this.selectedWeekdays.push(day.value)
            }
        },
        isSelected (day) {
            return this.selectedWeekdays.find(dayValue => day.value === dayValue)
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
    .weekdays-selection-component
        // Note: the magic number for height is the max component height in buttons mode.
        // It makes the height of our component stable in any mode (tab \ buttons)
        min-height 42px
</style>
