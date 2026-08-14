<template>
    <csc-cf-destination
        :model-value="destination"
        :label="announcement ? announcement.label : ''"
        :clickable="true"
    >
        <q-popup-edit
            v-slot="scope"
            v-model="announcement"
            buttons
            anchor="top left"
            @before-show="setPopupShow(null)"
            @save="$emit('input', $event)"
        >
            <q-select
                v-model="scope.value"
                map-options
                :rules="[ checkAnnouncement ]"
                :options="announcements"
                :label="$t('Custom Announcements')"
                :disable="$attrs.loading"
            />
        </q-popup-edit>
    </csc-cf-destination>
</template>
<script>
import CscCfDestination from 'components/call-forwarding/CscCfDestination'
import { showGlobalError } from 'src/helpers/ui'
import { mapActions } from 'vuex'
export default {
    name: 'CscCfDestinationCustomAnnouncement',
    components: { CscCfDestination },
    props: {
        destination: {
            type: Object,
            default: undefined
        },
        announcements: {
            type: Array,
            default: undefined
        }
    },
    emits: ['input'],
    data () {
        return {
            announcement: this.$attrs.value
        }
    },
    watch: {
        '$attrs.value' (value) {
            this.announcement = value
        }
    },
    methods: {
        ...mapActions('callForwarding', ['setPopupShow']),
        checkAnnouncement () {
            const fieldFilled = this.announcement
            if (!fieldFilled) {
                showGlobalError(this.$t('Please select an option'))
            }
            return fieldFilled
        }
    }
}
</script>
