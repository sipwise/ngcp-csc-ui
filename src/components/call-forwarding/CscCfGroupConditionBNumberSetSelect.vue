<template>
    <csc-cf-group-condition
        :title="title"
        :loading="$wait.is('csc-cf-b-number-set-create')"
        v-bind="$attrs"
        @close="$emit('close')"
    >
        <div
            class="no-margin q-pa-md"
        >
            <csc-cf-b-number-set-selection
                v-model="selectedBNumberSet"
                :mode="mode"
                dense
                :label="$t('Number list')"
                data-cy="csc-call-select-number-list"
            />
        </div>
        <template
            #actions
        >
            <q-btn
                :label="createLabel"
                flat
                color="primary"
                icon="source"
                data-cy="csc-call-select-edit-list"
                @click="$emit('create')"
            />
            <q-btn
                :label="$t('Save')"
                data-cy="csc-call-selection-save"
                flat
                color="primary"
                icon="check"
                :disable="!selectedBNumberSet"
                @click="selectBNumberSetEvent"
            />
        </template>
    </csc-cf-group-condition>
</template>

<script>
import CscCfBNumberSetSelection from 'components/call-forwarding/CscCfBNumberSetSelection'
import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'
import { mapActions } from 'vuex'
export default {
    name: 'CscCfGroupConditionBNumberSetSelect',
    components: {
        CscCfBNumberSetSelection,
        CscCfGroupCondition
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
        createLabel: {
            type: String,
            required: true
        },
        subscriberId: {
            type: String,
            default: ''
        }
    },
    emits: ['close', 'create'],
    data () {
        return {
            selectedBNumberSet: null
        }
    },
    methods: {
        ...mapActions('callForwarding', [
            'assignBNumberSet'
        ]),
        async selectBNumberSetEvent () {
            await this.assignBNumberSet({
                mapping: this.mapping,
                id: this.selectedBNumberSet,
                subscriberId: this.subscriberId
            })
            this.$emit('close')
        }
    }
}
</script>
