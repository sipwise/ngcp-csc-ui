<template>
    <csc-cf-group-condition
        :title="title"
        :loading="$wait.is('csc-cf-source-set-create')"
        v-bind="$attrs"
        @close="$emit('close')"
    >
        <div
            class="no-margin q-pa-md"
        >
            <csc-cf-source-set-selection
                v-model="selectedSourceSet"
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
                :disable="!selectedSourceSet"
                @click="selectSourceSetEvent"
            />
        </template>
    </csc-cf-group-condition>
</template>

<script>
import {
    mapActions
} from 'vuex'
import CscCfGroupCondition from 'components/call-forwarding/CscCfGroupCondition'
import CscCfSourceSetSelection from 'components/call-forwarding/CscCfSourceSetSelection'
export default {
    name: 'CscCfGroupConditionSourceSetSelect',
    components: {
        CscCfSourceSetSelection,
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
            selectedSourceSet: null
        }
    },
    methods: {
        ...mapActions('callForwarding', [
            'assignSourceSet'
        ]),
        async selectSourceSetEvent () {
            await this.assignSourceSet({
                mapping: this.mapping,
                id: this.selectedSourceSet,
                subscriberId: this.subscriberId
            })
            this.$emit('close')
        }
    }
}
</script>
