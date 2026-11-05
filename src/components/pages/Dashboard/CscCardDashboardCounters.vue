<template>
    <q-card
        dark
        bordered
        class="csc-card-dashboard-counters csc-item-odd q-my-sm"
    >
        <q-card-section
            class="row wrap items-center justify-around"
        >
            <div class="text-h6 q-px-md">
                {{ title }}
            </div>
            <template
                v-for="counter in counters"
                :key="counter.label"
            >
                <q-separator
                    dark
                    vertical
                    inset
                />
                <div
                    class="row no-wrap items-center q-px-md"
                    :data-cy="counter.dataCy"
                >
                    <csc-spinner
                        v-if="counter.loading"
                    />
                    <div
                        v-else-if="counter.error"
                        class="text-h4 text-negative"
                    >
                        N/A
                    </div>
                    <div
                        v-else
                        class="text-h4"
                    >
                        {{ counter.count }}
                    </div>
                    <div class="q-ml-sm">
                        {{ counter.label }}
                    </div>
                    <q-btn
                        color="primary"
                        unelevated
                        flat
                        :label="counter.buttonTitle"
                        :to="counter.routeTo"
                        class="q-ml-md"
                    />
                </div>
            </template>
        </q-card-section>
    </q-card>
</template>

<script setup>
import CscSpinner from 'components/CscSpinner'

defineOptions({ name: 'CscCardDashboardCounters' })

defineProps({
    title: {
        type: String,
        default: ''
    },
    counters: {
        type: Array,
        required: true
    }
})
</script>

<style lang="sass" rel="stylesheet/sass">
.csc-card-dashboard-counters
    width: calc(90% + 40px)
    max-width: calc(100% - 20px)
</style>
