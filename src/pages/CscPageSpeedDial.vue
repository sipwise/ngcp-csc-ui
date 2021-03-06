<template>
    <csc-page
        id="csc-page-speed-dial"
        class="q-pa-lg"
    >
        <div
            class="row justify-center"
        >
            <csc-speed-dial-add-form
                ref="addForm"
                class="col col-xs-12 col-md-4 q-mb-lg"
                :loading="isAdding"
                :slot-options="unassignedSlots"
                @save="assignSpeedDial"
            />
        </div>
        <div
            v-if="speedDialLoadingState === 'requesting' || unassignSlotState === 'requesting'"
            class="row justify-center"
        >
            <csc-list-spinner />
        </div>
        <div
            v-if="assignedSlots.length === 0"
            class="row justify-center"
        >
            <div
                class="col col-xs-12 col-md-8 text-center"
            >
                {{ $t('No speed dials found') }}
            </div>
        </div>
        <div
            class="row justify-center"
        >
            <q-list
                no-border
                class="col col-xs-12 col-md-8"
            >
                <q-item
                    v-for="(assigned, index) in assignedSlots"
                    :key="index"
                    :class="'q-pa-md csc-item-' + ((index % 2 === 0)?'odd':'even')"
                >
                    <q-item-section
                        side
                    >
                        <q-icon
                            name="touch_app"
                            color="primary"
                        />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label
                            class="text-subtitle1"
                        >
                            {{ $t('When I dial {slot} ...', { slot: assigned.slot }) }}
                        </q-item-label>
                        <q-item-label
                            class="text-subtitle2"
                        >
                            {{ $t('ring') }}
                            {{ assigned.destination | destinationFormat }}
                        </q-item-label>
                    </q-item-section>
                    <q-item-section
                        side
                    >
                        <q-btn
                            icon="more_vert"
                            flat
                            dense
                            color="primary"
                        >
                            <csc-popup-menu>
                                <csc-popup-menu-item
                                    icon="delete"
                                    color="negative"
                                    :label="$t('Remove')"
                                    @click="unassignSlot(assigned)"
                                />
                            </csc-popup-menu>
                        </q-btn>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </csc-page>
</template>

<script>
import {
    mapGetters
} from 'vuex'
import CscPage from 'components/CscPage'
import CscSpeedDialAddForm from 'components/pages/SpeedDial/CscSpeedDialAddForm'
import {
    showToast,
    showGlobalError
} from 'src/helpers/ui'
import CscListSpinner from 'components/CscListSpinner'
import CscPopupMenu from 'components/CscPopupMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'

export default {
    components: {
        CscPopupMenuItem,
        CscPopupMenu,
        CscListSpinner,
        CscPage,
        CscSpeedDialAddForm
    },
    data () {
        return {
            addFormEnabled: true
        }
    },
    computed: {
        ...mapGetters('speedDial', [
            'assignedSlots',
            'speedDialLoadingState',
            'speedDialLoadingError',
            'unassignSlotState',
            'unassignSlotError',
            'lastUnassignedSlot',
            'unassignedSlots',
            'assignSlotState',
            'assignSlotError',
            'lastAssignedSlot',
            'isAdding'
        ])
    },
    watch: {
        // speedDialLoadingState (state) {
        //     if (state === 'requesting') {
        //         startLoading()
        //     } else if (state === 'failed') {
        //         stopLoading()
        //         showGlobalError(this.speedDialLoadingError)
        //     } else if (state === 'succeeded') {
        //         stopLoading()
        //     }
        // },
        // unassignSlotState (state) {
        //     if (state === 'requesting') {
        //         startLoading()
        //     } else if (state === 'failed') {
        //         stopLoading()
        //         showGlobalError(this.unassignSlotError)
        //     } else if (state === 'succeeded') {
        //         stopLoading()
        //         showToast(this.$t('Unassigned slot {slot}', {
        //             slot: this.lastUnassignedSlot
        //         }))
        //     }
        // },
        assignSlotState (state) {
            if (state === 'failed') {
                showGlobalError(this.assignSlotError)
            } else if (state === 'succeeded') {
                this.$refs.addForm.cancel()
                showToast(this.$t('Assigned slot {slot}', {
                    slot: this.lastAssignedSlot
                }))
            }
        }
    },
    mounted () {
        this.$store.dispatch('speedDial/loadSpeedDials')
    },
    methods: {
        assignSpeedDial (assigned) {
            this.$store.dispatch('speedDial/assignSpeedDialSlot', assigned)
        },
        unassignSlot (unassigned) {
            this.$q.dialog({
                title: this.$t('Remove speed dial'),
                message: this.$t('You are about to remove the speed dial {slot}', {
                    slot: unassigned.slot
                }),
                color: 'primary',
                cancel: true,
                persistent: true
            }).onOk(data => {
                this.$store.dispatch('speedDial/unassignSpeedDialSlot', unassigned)
            })
        }
    }
}
</script>
