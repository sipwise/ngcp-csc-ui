<template>
    <csc-cf-group-condition
        :title="title"
        :loading="$wait.is('csc-cf-source-set-create')"
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
                        v-model="sourceSetNameInternal"
                        dense
                        clearable
                        :label="$t('Number list name')"
                        data-cy="csc-call-select-number-list"
                    />
                </q-item-section>
            </q-item>
            <q-item
                v-for="(number, index) in sourceSetNumbersInternal"
                :key="index"
                class="no-margin no-padding"
            >
                <q-item-section>
                    <csc-input
                        v-model="sourceSetNumbersInternal[index]"
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
                        @click="sourceSetNumbersInternal.push('')"
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
                @click="deleteSourceSetEvent"
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
                @click="createSourceSetEvent"
            />
        </template>
    </csc-cf-group-condition>
</template>

<script>
import CscInput from 'components/form/CscInput'
import {
    mapActions
} from 'vuex'
import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'
export default {
    name: 'CscCfGroupConditionSourceSetCreate',
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
            sourceSetNameInternal: null,
            sourceSetNumbersInternal: null
        }
    },
    computed: {
        sourceSetNumbers () {
            const numbers = []
            if (this.sourceSet && this.sourceSet.sources) {
                this.sourceSet.sources.forEach((source) => {
                    numbers.push(source.source)
                })
            } else {
                numbers.push('')
            }
            return numbers
        },
        sourceSetName () {
            let name = this.$t('MyNumberList')
            if (this.sourceSet) {
                name = this.sourceSet.name
            }
            return name
        }
    },
    mounted () {
        this.sourceSetNameInternal = this.sourceSetName
        this.sourceSetNumbersInternal = this.sourceSetNumbers
    },
    methods: {
        ...mapActions('callForwarding', [
            'createSourceSet',
            'updateSourceSet',
            'deleteSourceSet',
            'unassignSourceSet'
        ]),
        deleteNumber (index) {
            this.sourceSetNumbersInternal = this.sourceSetNumbersInternal.filter((number, numberIndex) => {
                return numberIndex !== index
            })
        },
        async createSourceSetEvent () {
            if (this.sourceSet) {
                await this.updateSourceSet({
                    mapping: this.mapping,
                    id: this.sourceSet.id,
                    name: this.sourceSetNameInternal,
                    numbers: this.sourceSetNumbersInternal,
                    mode: this.mode,
                    subscriberId: this.subscriberId
                })
            } else {
                await this.createSourceSet({
                    mapping: this.mapping,
                    name: this.sourceSetNameInternal,
                    numbers: this.sourceSetNumbersInternal,
                    mode: this.mode,
                    subscriberId: this.subscriberId
                })
            }
            this.$emit('close')
        },
        async deleteSourceSetEvent () {
            if (this.sourceSet) {
                await this.deleteSourceSet({
                    mapping: this.mapping,
                    id: this.sourceSet.id
                })
            }
        },
        async unassignSourceSetEvent () {
            if (this.sourceSet) {
                await this.unassignSourceSet({
                    mapping: this.mapping,
                    id: this.sourceSet.id,
                    subscriberId: this.subscriberId
                })
            }
        }
    }
}
</script>
