
<template>
    <q-field
        :error-label="errorMessage"
    >
        <q-input
            dark
            clearable
            type="text"
            :float-label="label"
            v-model="inputValue"
            @keyup.enter="submit"
            @keypress.space.prevent
            @keydown.space.prevent
            @keyup.space.prevent
            @input="input"
            @blur="blur"
            :error="$v.inputValue.$error"
            :before="beforeButtons"
        />
    </q-field>
</template>

<script>
    import {
        QField,
        QInput
    } from 'quasar-framework'
    import {
        userInfoAndEmpty
    } from '../../../helpers/validation'
    import {
        maxLength,
        required
    } from 'vuelidate/lib/validators'

    export default {
        name: 'csc-new-call-forward-input',
        props: {
            label: String,
            prefilled: String,
            before: Array
        },
        mounted(){
            if(this.prefilled){
                this.inputValue = this.prefilled === " " ? "" : this.prefilled;
            }

        },
        data () {
            return {
                inputValue: '',
                error: ''
            }
        },
        validations: {
            inputValue: {
                userInfoAndEmpty,
                maxLength: maxLength(64),
                required
            }
        },
        components: {
            QField,
            QInput
        },
        computed: {
            errorMessage() {
                if (!this.$v.inputValue.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.label
                    });
                }
                else if (!this.$v.inputValue.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.label,
                        maxLength: this.$v.inputValue.$params.maxLength.max
                    });
                }
                else if (!this.$v.inputValue.userInfoAndEmpty) {
                    return this.$t('validationErrors.inputValidNumber');
                }
            },
            beforeButtons() {
                return this.before ? this.before : [];
            }
        },
        methods: {
            submit() {
                this.$emit('submit');
            },
            input() {
                this.$v.inputValue.$touch();
                this.error = this.$v.inputValue.$error;
                this.$emit('input', this.inputValue);
            },
            blur() {
                this.$v.inputValue.$touch();
                this.error = this.$v.inputValue.$error;
            }
        },
        watch: {
            error(state) {
                this.$emit('error', state);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
