
<template>
    <q-field
        :error-label="errorMessage"
    >
        <q-input
            clearable
            type="text"
            :float-label="label"
            v-model="destination"
            @keyup.enter="submit"
            @keypress.space.prevent
            @keydown.space.prevent
            @keyup.space.prevent
            @input="$v.destination.$touch"
            @blur="$v.destination.$touch"
            :error="$v.destination.$error"
        />
    </q-field>
</template>

<script>
    import _ from 'lodash'
    import {
        QField,
        QInput
    } from 'quasar-framework'
    import { userInfo } from '../../helpers/validation'
    import {
        maxLength,
        required
    } from 'vuelidate/lib/validators'

    export default {
        name: 'csc-destination-input',
        props: {
            loading: Boolean,
            label: String
        },
        data () {
            return {
                destination: ''
            }
        },
        validations: {
            destination: {
                userInfo,
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
                if (!this.$v.destination.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('destination.label')
                    });
                }
                else if (!this.$v.destination.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('destination.label'),
                        maxLength: this.$v.destination.$params.maxLength.max
                    });
                }
                else if (!this.$v.destination.userInfo) {
                    return this.$t('validationErrors.inputValidNumber');
                }
            }
        },
        methods: {
            submit() {
                this.$emit('submit');
            },
            getDestination() {
                return this.destination;
            },
            hasDestination() {
                return !this.$v.destination.$error && !_.isEmpty(this.destination);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
