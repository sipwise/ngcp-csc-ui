<template>
    <csc-page-sticky
        id="csc-page-call-forwarding"
        class="q-pa-lg"
    >
        <template
            v-slot:header
        >
            <q-btn
                flat
                icon="add"
                color="primary"
                :label="$t('Add forwarding')"
                :disable="$wait.is('csc-cf-mappings-full')"
                :loading="$wait.is('csc-cf-mappings-full')"
            >
                <csc-popup-menu>
                    <csc-popup-menu-item
                        color="primary"
                        :label="$t('If available')"
                        @click="createMapping({ type: 'cfu'})"
                    />
                    <csc-popup-menu-item
                        color="primary"
                        :label="$t('If not available')"
                        @click="createMapping({ type: 'cfna'})"
                    />
                    <csc-popup-menu-item
                        color="primary"
                        :label="$t('If busy')"
                        @click="createMapping({ type: 'cfb'})"
                    />
                </csc-popup-menu>
                <template
                    v-slot:loading
                >
                    <csc-spinner />
                </template>
            </q-btn>
        </template>
        <div
            class="row justify-center q-pt-lg"
        >
            <div
                id="csc-wrapper-call-forwarding"
                class="col-xs-12 col-lg-8"
            >
                <q-list
                    v-if="groups.length === 0 && !$wait.is('csc-cf-mappings-full')"
                    dense
                    separator
                >
                    <q-item
                        :disable="$wait.is('csc-cf-mappings-full')"
                    >
                        <q-item-section>
                            <q-item-label
                                class="text-weight-bold"
                            >
                                {{ $t('Always') }}
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                    <csc-cf-group-item-primary-number />
                </q-list>
                <template
                    v-for="group in groups"
                >
                    <csc-cf-group
                        :key="group.cfm_id"
                        class="q-mb-lg"
                        :loading="$wait.is('csc-cf-mappings-full')"
                        :mapping="group"
                        :destination-set="destinationSetMap[group.destinationset_id]"
                        :source-set="sourceSetMap[group.sourceset_id]"
                        :time-set="timeSetMap[group.timeset_id]"
                    />
                </template>
            </div>
        </div>
    </csc-page-sticky>
</template>
<script>
import CscCfGroup from 'components/call-forwarding/CscCfGroup'
import {
    mapActions,
    mapState,
    mapGetters
} from 'vuex'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenu from 'components/CscPopupMenu'
import CscSpinner from 'components/CscSpinner'
import CscCfGroupItemPrimaryNumber from 'components/call-forwarding/CscCfGroupItemPrimaryNumber'
import CscPageSticky from 'components/CscPageSticky'
export default {
    name: 'CscPageCf',
    components: {
        CscPageSticky,
        CscCfGroupItemPrimaryNumber,
        CscSpinner,
        CscPopupMenu,
        CscPopupMenuItem,
        CscCfGroup
    },
    computed: {
        ...mapState('callForwarding', [
            'mappings',
            'destinationSetMap',
            'sourceSetMap',
            'timeSetMap'
        ]),
        ...mapGetters('callForwarding', [
            'groups'
        ])
    },
    async mounted () {
        await this.loadAnnouncements()
        this.loadMappingsFull()
    },
    methods: {
        ...mapActions('callForwarding', [
            'loadMappingsFull',
            'createMapping',
            'loadAnnouncements'
        ])
    }
}
</script>
