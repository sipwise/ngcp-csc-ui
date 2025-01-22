<template>
    <csc-cf-group-condition
        :title="title"
        :loading="$wait.is('csc-cf-b-number-set-create')"
        v-bind="$attrs"
        @close="$emit('close')"
    >
        <q-list
            class="no-margin q-pa-md"
            dense
        >
            <q-item
                class="no-margin no-padding"
            >
                <q-item-section>
                    <csc-input
                        v-model="bNumberSetNameInternal"
                        dense
                        clearable
                        :label="$t('Number list name')"
                        data-cy="csc-call-select-number-list"
                    />
                </q-item-section>
            </q-item>
            <q-item
                v-for="(number, index) in bNumberSetNumbersInternal"
                :key="index"
                class="no-margin no-padding"
            >
                <q-item-section>
                    <csc-input
                        v-model="bNumberSetNumbersInternal[index]"
                        dense
                        clearable
                        :label="$t('Number')"
                        data-cy="csc-call-select-number"
                    >
                        <template
                            v-if="index > 0"
                        >
                            <q-btn
                                flat
                                dense
                                color="negative"
                                icon="delete"
                                data-cy="csc-call-select-number-delete"
                                @click="deleteNumber(index)"
                            />
                        </template>
                    </csc-input>
                </q-item-section>
            </q-item>
            <q-item
                class="no-margin no-padding"
            >
                <q-item-section>
                    <q-btn
                        :label="$t('Add number')"
                        data-cy="csc-call-select-number-add"
                        flat
                        color="primary"
                        icon="add"
                        @click="bNumberSetNumbersInternal.push('')"
                    />
                </q-item-section>
            </q-item>
        </q-list>
        <template
            #actions
        >
            <q-btn
                v-if="deleteButton"
                :label="$t('Delete')"
                data-cy="csc-call-select-delete"
                flat
                color="negative"
                icon="delete"
                @click="deleteBNumberSetEvent"
            />
            <q-btn
                v-if="unassignButton"
                :label="$t('Unassign')"
                data-cy="csc-call-select-unassign"
                flat
                color="primary"
                icon="undo"
                @click="unassignSourceSetEvent"
            />
            <q-btn
                :label="$t('Select')"
                data-cy="csc-call-select-select"
                flat
                color="primary"
                icon="source"
                @click="$emit('select')"
            />
            <q-btn
                :label="$t('Save')"
                data-cy="csc-call-select-save"
                flat
                color="primary"
                icon="check"
                @click="createBNumberSetEvent"
            />
        </template>
    </csc-cf-group-condition>
</template>

<script>
import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'
import CscInput from 'components/form/CscInput'
import { mapActions } from 'vuex'
export default {
    name: 'CscCfGroupConditionBNumberSetCreate',
    components: {
        CscCfGroupCondition,
        CscInput
    },
    props: {
        title: {
            type: String,
            required: true
        },
        mode: {
            type: String,
            required: true,
            validator (value) {
                return ['whitelist', 'blacklist'].includes(value.toLowerCase())
            }
        },
        mapping: {
            type: Object,
            required: true
        },
        bNumberSet: {
            type: Object,
            default: undefined
        },
        deleteButton: {
            type: Boolean,
            default: false
        },
        unassignButton: {
            type: Boolean,
            default: false
        },
        subscriberId: {
            type: String,
            default: null
        }
    },
    emits: ['close', 'select'],
    data () {
        return {
            bNumberSetNameInternal: null,
            bNumberSetNumbersInternal: null
        }
    },
    computed: {
        bNumberSetNumbers () {
            const bnumbers = []
            if (this.bNumberSet && this.bNumberSet.bnumbers) {
                this.bNumberSet.bnumbers.forEach((item) => {
                    bnumbers.push(item.bnumber)
                })
            } else {
                bnumbers.push('')
            }
            return bnumbers
        },
        bNumberSetName () {
            let name = this.$t('MyNumberList')
            if (this.bNumberSet) {
                name = this.bNumberSet.name
            }
            return name
        }
    },
    mounted () {
        this.bNumberSetNameInternal = this.bNumberSetName
        this.bNumberSetNumbersInternal = this.bNumberSetNumbers
    },
    methods: {
        ...mapActions('callForwarding', [
            'createBNumberSet',
            'updateBNumberSet',
            'deleteBNumberSet',
            'unassignBNumberSet'
        ]),
        deleteNumber (index) {
            this.bNumberSetNumbersInternal = this.bNumberSetNumbersInternal.filter((number, numberIndex) => {
                return numberIndex !== index
            })
        },
        async createBNumberSetEvent () {
            if (this.bNumberSet) {
                await this.updateBNumberSet({
                    mapping: this.mapping,
                    id: this.bNumberSet.id,
                    name: this.bNumberSetNameInternal,
                    numbers: this.bNumberSetNumbersInternal,
                    mode: this.mode,
                    subscriberId: this.subscriberId
                })
            } else {
                await this.createBNumberSet({
                    mapping: this.mapping,
                    name: this.bNumberSetNameInternal,
                    numbers: this.bNumberSetNumbersInternal,
                    mode: this.mode,
                    subscriberId: this.subscriberId
                })
            }
            this.$emit('close')
        },
        async deleteBNumberSetEvent () {
            if (this.bNumberSet) {
                await this.deleteBNumberSet({
                    mapping: this.mapping,
                    id: this.bNumberSet.id
                })
            }
        },
        async unassignSourceSetEvent () {
            if (this.bNumberSet) {
                await this.unassignBNumberSet({
                    mapping: this.mapping,
                    id: this.bNumberSet.id,
                    subscriberId: this.subscriberId
                })
            }
        }
    }
}
</script>
