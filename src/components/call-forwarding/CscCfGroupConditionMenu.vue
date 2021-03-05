<template>
    <csc-cf-group-condition
        title=" "
        v-on="$listeners"
    >
        <q-list
            dense
        >
            <csc-popup-menu-item
                icon="person_add"
                :label="$t('call from ...')"
                :close-popup="false"
                :disable="!!sourceSet"
                @click="$emit('step', 'call-from')"
            />
            <csc-popup-menu-item
                icon="person_add_disabled"
                :label="$t('call not from ...')"
                :close-popup="false"
                :disable="!!sourceSet"
                @click="$emit('step', 'call-not-from')"
            />
            <csc-popup-menu-item
                icon="today"
                :label="$t('date is ...')"
                :close-popup="false"
                :disable="!!timeSet"
                @click="$emit('step', 'date-is')"
            />
            <csc-popup-menu-item
                icon="book_online"
                :label="$t('date range is ...')"
                :close-popup="false"
                :disable="!!timeSet"
                @click="$emit('step', 'date-range-is')"
            />
            <csc-popup-menu-item
                icon="calendar_today"
                :label="$t('weekdays are ...')"
                :close-popup="false"
                :disable="!!timeSet"
                @click="$emit('step', 'date-weekdays')"
            />
            <csc-popup-menu-item
                icon="access_time"
                :label="$t('office hours are ...')"
                :close-popup="false"
                :disable="!!timeSet"
                @click="$emit('step', 'office-hours-times')"
            />
        </q-list>
    </csc-cf-group-condition>
</template>

<script>
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'
export default {
    name: 'CscCfGroupConditionMenu',
    components: { CscCfGroupCondition, CscPopupMenuItem },
    props: {
        mapping: {
            type: Object,
            required: true
        },
        destinationSet: {
            type: Object,
            required: true
        },
        sourceSet: {
            type: Object,
            default: undefined
        },
        timeSet: {
            type: Object,
            default: undefined
        }
    }
}
</script>
