<template>
    <div
        v-if="enabled"
        class="csc-form"
    >
        <csc-call-input
            :label="$t('callBlocking.number')"
            v-model="number"
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
                @mousedown.native="cancel()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                v-if="!loading"
                flat
                color="primary"
                icon="done"
                @click="save()"
                :disable="saveDisabled"
            >
                {{ $t('buttons.save') }}
            </q-btn>
            <div
                v-if="loading"
                class="csc-form-actions-spinner"
            >
                <csc-spinner />
            </div>
        </div>
    </div>
</template>

<script>
    import CscCallInput from '../../form/CscCallInput'
    import CscSpinner from '../../CscSpinner'
    import {
        showGlobalError
    } from '../../../helpers/ui'
    import {
        QField,
        QInput,
        QBtn
    } from 'quasar-framework'

    export default {
        name: 'csc-new-call-forward-add-destination-form',
        components: {
            CscCallInput,
            CscSpinner,
            QField,
            QInput,
            QBtn
        },
        data () {
            return {
                enabled: false,
                number: '',
                numberError: false
            }
        },
        props: [
            'disable',
            'loading'
        ],
        computed: {
            saveDisabled() {
                return this.numberError|| this.disable || this.loading;
            }
        },
        methods: {
            save() {
                if (this.numberError || this.saveDisabled) {
                    showGlobalError(this.$t('validationErrors.generic'));
                }
                else {
                    this.$emit('save', this.number);
                }
            },
            cancel() {
                this.number = '';
                this.enabled = false;
            },
            add() {
                this.number = '';
                this.enabled = true;
            },
            close() {
                this.enabled = false;
            },
            reset() {
                this.cancel();
            },
            error(state) {
                this.numberError = state;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
