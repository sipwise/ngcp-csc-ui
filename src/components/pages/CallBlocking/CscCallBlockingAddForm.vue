<template>
    <div
        v-if="enabled"
        class="csc-form"
    >
        <q-field
            :error="$v.number.$error"
            :error-label="errorMessage"
        >
            <q-input
                v-model="number"
                :float-label="$t('callBlocking.number')"
                :error="$v.number.$error"
                type="text"
                clearable
                dark
                @keyup.enter="save"
                @input="$v.number.$touch"
                @blur="blur()"
                @focus="focus()"
                :disable="disabled || loading"
                autofocus
            />
        </q-field>
        <div
            class="csc-form-actions row justify-center"
        >
            <q-btn
                flat
                color="default"
                icon="clear"
                @click="cancel()"
                :disabled="disabled || loading"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                v-if="!loading"
                flat
                color="primary"
                icon="done"
                @click="save()"
                :disabled="saveDisabled"
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
    <div
        v-else
        class="csc-form-add-button row justify-center"
    >
        <q-btn
            flat
            color="primary"
            icon="add"
            @click="add()"
        >
            {{ $t('pages.callBlockingIncoming.addNumberButton') }}
        </q-btn>
    </div>
</template>

<script>
    import CscSpinner from '../../CscSpinner'
    import {
        required
    } from 'vuelidate/lib/validators'
    import {
        userInfoAndEmpty
    } from '../../../helpers/validation'
    import {
        QField,
        QInput,
        QBtn,
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        name: 'csc-call-blocking-add-form',
        components: {
            QField,
            QInput,
            QBtn,
            QSpinnerDots,
            CscSpinner
        },
        data () {
            return {
                enabled: false,
                number: ''
            }
        },
        props: [
            'disabled',
            'loading'
        ],
        validations: {
            number: {
                required,
                userInfoAndEmpty
            }
        },
        computed: {
            errorMessage() {
                if (!this.$v.number.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('callBlocking.number')
                    });
                }
                else if (!this.$v.number.userInfoAndEmpty) {
                    return this.$t('validationErrors.userInfoAndEmpty');
                }
            },
            saveDisabled() {
                return this.$v.$invalid || this.disabled || this.loading;
            }
        },
        methods: {
            save() {
                if(!this.saveDisabled) {
                    this.$emit('save', this.number);
                }
            },
            cancel() {
                this.number = '';
                this.$v.$reset();
                this.enabled = false;
            },
            add() {
                this.number = '';
                this.$v.$reset();
                this.enabled = true;
            },
            blur() {
                if(this.number === '') {
                    this.$v.$reset();
                }
            },
            focus() {
                if(this.number !== '') {
                    this.$v.number.$touch();
                }
            },
            reset() {
                this.cancel();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
