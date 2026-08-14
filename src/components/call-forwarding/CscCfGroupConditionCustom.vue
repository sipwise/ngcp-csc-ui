<template>
    <csc-cf-group-condition
        :title="$t('Custom time set')"
        icon="today"
        :loading="$wait.is('csc-cf-time-set-create')"
        v-bind="$attrs"
        @close="$emit('close')"
    >
        <q-list
            separator
            class="q-pa-md"
        >
            <q-item
                v-for="(date, index) in times"
                :key="index"
            >
                <q-item-section>
                    <q-item-label overline>
                        {{ $t('Period') }}
                    </q-item-label>
                    <q-item-label>
                        {{ date.from }}
                    </q-item-label>
                    <q-item-label>
                        {{ date.to }}
                    </q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </csc-cf-group-condition>
</template>

<script>

import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'

export default {
    name: 'CscCfGroupConditionOfficeHours',
    components: {
        CscCfGroupCondition
    },
    props: {
        times: {
            type: Object,
            required: true
        }
    },
    emits: ['close', 'back']
}
</script>
