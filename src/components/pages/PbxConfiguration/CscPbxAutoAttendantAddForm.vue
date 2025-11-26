<template>
    <div class="q-pa-xs">
        <div
            class="csc-pbx-aa-form-cont"
        >
            <q-form
                :loading="$wait.is('csc-pbx-auto-attendant-form')"
                class="csc-pbx-aa-form justify-center"
                @submit="save"
            >
                <div class="row">
                    <csc-select-lazy
                        class="col-12"
                        icon="person"
                        :value="data.subscriberId"
                        :label="$t('Subscriber')"
                        clearable
                        store-getter="pbxAutoAttendants/subscribers"
                        store-action="pbxAutoAttendants/fetchSubscribers"
                        :load-initially="false"
                        v-bind="$attrs"
                        @input="setSubscriberId($event)"
                    />
                </div>
                <div
                    v-for="(slotNumber, index) in slotsNumbers"
                    :key="index"
                    class="col-12"
                >
                    <div
                        v-if="index % 2 === 0"
                        class="row"
                    >
                        <q-input
                            v-model="data.slots[index]"
                            :label="$t('Slot {number}', {
                                number: slotNumber
                            })"
                            dense
                            class="col-6 q-pa-xs"
                        />

                        <q-input
                            v-model="data.slots[index +1]"
                            :label="$t('Slot {number}', {
                                number: slotsNumbers[index +1]
                            })"
                            dense
                            class="col-6 q-pa-xs"
                        />
                    </div>
                </div>
                <div
                    class="row justify-center"
                >
                    <q-btn
                        flat
                        color="default"
                        icon="clear"
                        :disable="$wait.is('csc-pbx-auto-attendant-form')"
                        :label="$t('Cancel')"
                        @click="$emit('closeForm')"
                    />
                    <q-btn
                        flat
                        color="primary"
                        icon="check"
                        :loading="$wait.is('csc-pbx-auto-attendant-form')"
                        :disabled="disableSave"
                        :label="$t('Save')"
                        @click="save"
                    />
                </div>
            </q-form>
        </div>
    </div>
</template>

<script>
import { required } from '@vuelidate/validators'
import CscSelectLazy from 'components/form/CscSelectLazy'
import { showToast } from 'src/helpers/ui'
import { mapWaitingActions } from 'vue-wait-vue3'
import { mapGetters } from 'vuex'
export default {
    name: 'CscPbxAutoAttendantAddForm',
    components: {
        CscSelectLazy
    },
    emits: ['closeForm', 'newSubscriberSaved'],
    data () {
        return {
            data: {
                subscriberId: null,
                slots: []
            },
            loading: false
        }
    },
    validations: {
        data: {
            subscriberId: {
                required
            }
        }
    },
    computed: {
        ...mapGetters('pbxAutoAttendants', [
            'slotsNumbers'
        ]),
        disableSave () {
            return this.data.subscriberId === null || this.data.slots.length < 1
        }
    },
    methods: {
        ...mapWaitingActions('pbxAutoAttendants', {
            updateSubscriberSlots: 'csc-pbx-auto-attendant-form'
        }),
        setSubscriberId (subscriberId) {
            this.data.subscriberId = subscriberId
            this.data.slots = []
        },
        async save () {
            await this.updateSubscriberSlots({
                subscriberId: this.data.subscriberId,
                slots: this.data.slots.filter((slot, index) => {
                    if (slot) {
                        return true
                    }
                    return false
                }).map((slot, index) => ({
                    slot: index,
                    destination: slot
                }))
            })
            showToast(this.$t('Slots successfully added'))
            this.$emit('newSubscriberSaved')
            this.$emit('closeForm')
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass" scoped>
.csc-pbx-aa-form-cont
    width: 100%
.csc-pbx-aa-form
    width: 50%
    margin: auto
</style>
