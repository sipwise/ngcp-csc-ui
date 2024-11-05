<template>
    <div
        v-if="enabled"
        class="csc-form"
    >
        <csc-call-input
            v-model="number"
            :label="$t('Number')"
            data-cy="csc-block-number-input"
            @submit="save"
            @error="error"
        />
        <div
            class="csc-form-actions row justify-center"
        >
            <q-btn
                flat
                color="default"
                icon="clear"
                data-cy="csc-block-number-cancel"
                @mousedown="cancel()"
            >
                {{ $t('Cancel') }}
            </q-btn>
            <q-btn
                v-if="!loading"
                flat
                color="primary"
                icon="done"
                data-cy="csc-block-number-save"
                :disable="saveDisabled"
                @click="save()"
            >
                {{ $t('Save') }}
            </q-btn>
            <div
                v-if="loading"
                class="csc-form-actions-spinner"
            >
                <csc-spinner />
            </div>
        </div>
    </div>
    <div
        v-else
        class="csc-form-add-button row justify-center"
    >
        <q-btn
            flat
            color="primary"
            icon="add"
            data-cy="csc-add-number"
            @click="add()"
        >
            {{ $t('Add number') }}
        </q-btn>
    </div>
</template>

<script>

import CscSpinner from 'components/CscSpinner'
import CscCallInput from 'components/form/CscCallInput'
import { showGlobalError } from 'src/helpers/ui'
export default {
    name: 'CscCallBlockingAddForm',
    components: {
        CscCallInput,
        CscSpinner
    },
    props: {
        disable: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['save'],
    data () {
        return {
            enabled: false,
            number: '',
            numberError: false
        }
    },
    computed: {
        saveDisabled () {
            return this.numberError || this.disable || this.loading
        }
    },
    methods: {
        save () {
            if (this.numberError || this.saveDisabled) {
                showGlobalError(this.$t('You have invalid form input. Please check and try again.'))
            } else {
                this.$emit('save', this.number)
            }
        },
        cancel () {
            this.number = ''
            this.enabled = false
        },
        add () {
            this.number = ''
            this.enabled = true
        },
        reset () {
            this.cancel()
        },
        error (state) {
            this.numberError = state
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
</style>
