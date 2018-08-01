<template>
    <q-card class="csc-pbx-seat-add-form shadow-1">
        <q-card-title>
            <q-icon
                name="add"
                color="primary"
                size="22px"
            />
            <span>{{ $t('pbxConfig.addSeat') }}</span>
        </q-card-title>
        <q-card-main>
            <q-field :error-label="seatNameErrorMessage">
                <q-input
                    @input="$v.data.name.$touch"
                    :error="$v.data.name.$error"
                    :disabled="loading"
                    :readonly="loading"
                    v-model="data.name"
                    autofocus
                    :float-label="$t('pbxConfig.seatName')"
                    clearable
                />
            </q-field>
            <q-field :error-label="extensionErrorMessage">
                <q-input
                    @input="$v.data.extension.$touch"
                    :error="$v.data.extension.$error"
                    :disabled="loading"
                    :readonly="loading"
                    type="number"
                    v-model="data.extension"
                    clearable
                    :min="1"
                    :max="1000000"
                    :float-label="$t('pbxConfig.extension')"
                />
            </q-field>
            <q-field>
                <q-select
                    :disabled="loading"
                    :readonly="loading"
                    v-model="data.aliasNumbers"
                    multiple
                    chips
                    clearable
                    :float-label="$t('pbxConfig.aliasNumbers')"
                    :options="aliasNumberOptions"
                />
            </q-field>
            <q-field>
                <q-select
                    :disabled="loading"
                    :readonly="loading"
                    v-model="data.groups"
                    multiple
                    chips
                    clearable
                    :float-label="$t('pbxConfig.groups')"
                    :options="groupOptions"
                />
            </q-field>
        </q-card-main>
        <q-card-separator/>
        <q-card-actions align="center">
            <q-btn
                v-if="!loading"
                flat
                color="secondary"
                icon="clear"
                @click="cancel()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                v-if="!loading"
                :disabled="$v.data.$invalid"
                flat
                color="primary"
                icon="done"
                @click="save()"
            >
                {{ $t('buttons.save') }}
            </q-btn>
        </q-card-actions>
        <q-inner-loading :visible="loading">
            <q-spinner-mat
                size="60px"
                color="primary"
            ></q-spinner-mat>
        </q-inner-loading>
    </q-card>
</template>

<script>

    import {
        required,
        maxLength,
        minValue,
        maxValue
    } from 'vuelidate/lib/validators'
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
        QIcon
    } from 'quasar-framework'

    export default {
        name: 'csc-pbx-seat-add-form',
        props: [
            'aliasNumberOptions',
            'groupOptions',
            'loading'
        ],
        components: {
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
            QIcon
        },
        validations: {
            data: {
                name: {
                    required,
                    maxLength: maxLength(30)
                },
                extension: {
                    required,
                    minValue: minValue(1),
                    maxValue: maxValue(1000000)
                }
            }
        },
        data () {
            return {
                data: this.getDefaults()
            }
        },
        computed: {
            seatNameErrorMessage() {
                if (!this.$v.data.name.required) {
                    return this.$t('pbxConfig.requiredSeatName');
                }
                else if (!this.$v.data.name.maxLength) {
                    return this.$t('pbxConfig.seatNameMaxLength', { maxLength: this.$v.data.name.$params.maxLength.max });
                }
            },
            extensionErrorMessage() {
                if (!this.$v.data.extension.required) {
                    return this.$t('pbxConfig.requiredExtension');
                }
                else if (!this.$v.data.extension.minValue) {
                    return this.$t('pbxConfig.extensionMinValue', { minValue: this.$v.data.extension.$params.minValue.min });
                }
                else if (!this.$v.data.extension.maxValue) {
                    return this.$t('pbxConfig.extensionMaxValue', { maxValue: this.$v.data.extension.$params.maxValue.max });
                }
            }
        },
        methods: {
            getDefaults() {
                return {
                    name: '',
                    extension: '',
                    aliasNumbers: [],
                    groups: []
                }
            },
            cancel() {
                this.$emit('cancel');
            },
            save() {
                this.$emit('save', this.data);
            },
            reset() {
                this.data = this.getDefaults();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
    .csc-pbx-seat-add-form
        position: relative
    .csc-pbx-seat-add-form
        .q-field:last-child
            margin-bottom: 36px
</style>
