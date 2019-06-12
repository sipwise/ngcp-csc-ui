<template>
    <div
        class="csc-form csc-add-form"
    >
        <q-field
            :error-label="stationNameErrorMessage"
        >
            <q-input
                dark
                autofocus
                v-model="formData.stationName"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.deviceStationName')"
                :error="$v.formData.stationName.$error"
                @input="$v.formData.stationName.$touch"
            />
        </q-field>
        <q-field
            :error-label="identifierErrorMessage"
        >
            <q-input
                dark
                v-model="formData.identifier"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.deviceIdentifier')"
                :error="$v.formData.identifier.$error"
                @input="$v.formData.identifier.$touch"
            />
        </q-field>
        <q-field>
            <csc-pbx-model-select
                :profile="formData.profile"
                :profiles="profiles"
                :profile-map="profileMap"
                :model-image-map="modelImageMap"
                :has-reset-button="true"
                @opened="$emit('model-select-opened')"
                @selected="selectedProfile"
                @reset="resetProfile"
            />
        </q-field>
        <div
            class="csc-form-actions row justify-center"
        >
            <q-btn
                flat
                color="default"
                icon="clear"
                :disable="loading"
                @click="cancel"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                color="primary"
                icon="done"
                :disable="$v.formData.$invalid || formData.profile === null || loading"
                @click="submit"
            >
                {{ $t('pbxConfig.createDevice') }}
            </q-btn>
        </div>
        <csc-object-spinner
            v-if="loading"
            :loading="loading"
        />
    </div>
</template>

<script>
    import {
        required,
        maxLength
    } from 'vuelidate/lib/validators'
    import { customMacAddress } from '../../../helpers/validation'
    import {
        QCard,
        QCardTitle,
        QCardMain,
        QCardActions,
        QCardSeparator,
        QBtn,
        QInnerLoading,
        QSpinnerMat,
        QField,
        QInput,
        QSelect,
        QIcon,
        QItem,
        QItemMain } from 'quasar-framework'
    import CscPbxModelSelect from './CscPbxModelSelect'
    import CscObjectSpinner from "../../CscObjectSpinner";
    export default {
        name: 'csc-pbx-device-add-form',
        props: [
            'loading',
            'profiles',
            'profileMap',
            'modelImageMap'
        ],
        components: {
            CscObjectSpinner,
            CscPbxModelSelect,
            QCard,
            QCardTitle,
            QCardMain,
            QCardActions,
            QCardSeparator,
            QBtn,
            QInnerLoading,
            QSpinnerMat,
            QField,
            QInput,
            QSelect,
            QIcon,
            QItem,
            QItemMain
        },
        validations: {
            formData: {
                stationName: {
                    required,
                    maxLength: maxLength(64)
                },
                identifier: {
                    required,
                    customMacAddress
                }
            }
        },
        data () {
            return {
                formData: this.getDefaultFormData()
            }
        },
        computed: {
            stationNameErrorMessage() {
                if (!this.$v.formData.stationName.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pbxConfig.deviceStationName')
                    });
                }
                else if (!this.$v.formData.stationName.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('pbxConfig.deviceStationName'),
                        maxLength: this.$v.formData.stationName.$params.maxLength.max
                    });
                }
            },
            identifierErrorMessage() {
                if (!this.$v.formData.identifier.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pbxConfig.deviceIdentifier')
                    });
                }
                else if (!this.$v.formData.identifier.customMacAddress) {
                    return this.$t('validationErrors.macAddress');
                }
            }
        },
        methods: {
            getDefaultFormData() {
                return {
                    stationName: '',
                    identifier: '',
                    profile: null
                }
            },
            cancel() {
                this.$emit('cancel');
            },
            submit() {
                this.$emit('submit', this.formData);
            },
            reset() {
                this.formData = this.getDefaultFormData();
            },
            selectedProfile(profileId) {
                this.formData.profile = profileId;
            },
            resetProfile() {
                this.formData.profile = null;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
    .form-actions
        margin-top 16px
        margin-bottom 8px
</style>
