<template>
    <div>
        <q-select
            v-model="data.subscriberId"
            emit-value
            map-options
            :disable="loading || subscriberOptionsLoading"
            :readonly="loading"
            :label="$t('Select a manager')"
            :options="subscriberOptions"
        />
        <q-select
            v-model="data.secretaryNumbers"
            multiple
            chips
            clearable
            emit-value
            map-options
            :disable="loading || numberOptionsLoading"
            :readonly="loading"
            :label="$t('Select secretary numbers')"
            :options="numberOptions"
        />
        <div
            class="csc-form-actions row justify-center"
        >
            <q-btn
                v-if="!loading"
                flat
                color="default"
                icon="clear"
                @click="cancel()"
            >
                {{ $t('Cancel') }}
            </q-btn>
            <q-btn
                v-if="!loading"
                flat
                :disable="v$.data.$invalid || !secretaryNumbersIsValid"
                color="primary"
                icon="arrow_forward"
                @click="save()"
            >
                {{ $t('Create Config') }}
            </q-btn>
        </div>
        <csc-object-spinner
            v-if="loading"
            :loading="loading"
        />
    </div>
</template>

<script>
import _ from 'lodash'
import {
    required
} from '@vuelidate/validators'
import CscObjectSpinner from '../../CscObjectSpinner'
import useValidate from '@vuelidate/core'
export default {
    name: 'CscPbxMsConfigAddForm',
    components: {
        CscObjectSpinner
    },
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        subscriberOptions: {
            type: Array,
            default: () => []
        },
        subscriberOptionsLoading: {
            type: Boolean,
            default: false
        },
        numberOptions: {
            type: Array,
            default: () => []
        },
        numberOptionsLoading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['submit', 'cancel', 'ready'],
    validations: {
        data: {
            subscriberId: {
                required
            }
        }
    },
    data () {
        return {
            data: this.getDefaults(),
            v$: useValidate()
        }
    },
    computed: {
        secretaryNumbersIsValid () {
            return _.get(this.data, 'secretaryNumbers.length', 0) > 0
        }
    },
    mounted () {
        this.$emit('ready')
    },
    methods: {
        getDefaults () {
            return {
                subscriberId: null,
                secretaryNumbers: []
            }
        },
        cancel () {
            this.$emit('cancel')
        },
        save () {
            this.$emit('submit', this.data)
        },
        reset () {
            this.data = this.getDefaults()
            this.v$.$reset()
        }
    }
}
</script>
