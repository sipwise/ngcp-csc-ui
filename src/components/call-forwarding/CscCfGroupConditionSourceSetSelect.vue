<template>
    <csc-cf-group-condition
        :title="title"
        :loading="$wait.is('csc-cf-source-set-create')"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <div
            class="no-margin q-pa-md"
        >
            <csc-cf-source-set-selection
                v-model="selectedSourceSet"
                :mode="mode"
                dense
                :label="$t('Number list')"
            />
        </div>
        <template
            v-slot:actions
        >
            <q-btn
                :label="createLabel"
                flat
                color="primary"
                icon="source"
                @click="$emit('create')"
            />
            <q-btn
                :label="$t('Save')"
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
        }
    },
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
                id: this.selectedSourceSet
            })
            this.$emit('close')
        }
    }
}
</script>
