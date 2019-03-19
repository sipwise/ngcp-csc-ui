
<template>
    <div class="csc-form csc-pbx-call-queue-add-form">
        <q-field>
            <q-select
                dark
                chips
                clearable
                v-model="data.subscriber_id"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.queueExtensionName')"
                :options="options"
            />
        </q-field>
        <q-field :error-label="maxQueueLengthErrorMessage">
            <q-input
                dark
                clearable
                autofocus
                v-model="data.max_queue_length"
                :error="$v.data.max_queue_length.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.queueLength')"
                :suffix="$t('pbxConfig.callers')"
                @input="$v.data.max_queue_length.$touch"
                @blur="$v.data.max_queue_length.$touch"
            />
        </q-field>
        <q-field :error-label="wrapUpTimeErrorMessage">
            <q-input
                dark
                clearable
                v-model="data.queue_wrap_up_time"
                :error="$v.data.queue_wrap_up_time.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.wrapUpTime')"
                :suffix="$t('pbxConfig.seconds')"
                @input="$v.data.queue_wrap_up_time.$touch"
                @blur="$v.data.queue_wrap_up_time.$touch"
            />
        </q-field>
        <div class="csc-form-actions row justify-center">
            <q-btn
                flat
                v-if="!loading"
                color="default"
                icon="clear"
                @mousedown.native="cancel()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                v-if="!loading"
                :disable="$v.data.$invalid"
                color="primary"
                icon="person"
                @click="save()"
            >
                {{ $t('pbxConfig.createConfig') }}
            </q-btn>
        </div>
        <q-inner-loading :visible="loading">
            <q-spinner-mat size="60px" color="primary" />
        </q-inner-loading>
    </div>
</template>

<script>
    import {
        required,
        maxValue,
        minValue,
        numeric
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
        name: 'csc-pbx-call-queue-add-form',
        props: [
            'options',
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
                subscriber_id: {
                    required
                },
                max_queue_length: {
                    numeric,
                    minValue: minValue(1),
                    maxValue: maxValue(3600)
                },
                queue_wrap_up_time: {
                    numeric,
                    minValue: minValue(1),
                    maxValue: maxValue(3600)
                }
            }
        },
        data () {
            return {
                data: this.getDefaults()
            }
        },
        computed: {
            maxQueueLengthErrorMessage() {
                if (!this.$v.data.max_queue_length.numeric) {
                    return this.$t('validationErrors.numeric', {
                        field: this.$t('pbxConfig.queueLength'),
                    });
                }
                else if (!this.$v.data.max_queue_length.minValue) {
                    return this.$t('validationErrors.minValueSecond', {
                        field: this.$t('pbxConfig.queueLength'),
                        minValue: this.$v.data.max_queue_length.$params.minValue.min
                    });
                }
                else if (!this.$v.data.max_queue_length.maxValue) {
                    return this.$t('validationErrors.maxValueSecond', {
                        field: this.$t('pbxConfig.queueLength'),
                        maxValue: this.$v.data.max_queue_length.$params.maxValue.max
                    });
                }
            },
            wrapUpTimeErrorMessage() {
                if (!this.$v.data.queue_wrap_up_time.numeric) {
                    return this.$t('validationErrors.numeric', {
                        field: this.$t('pbxConfig.wrapUpTime'),
                    });
                }
                else if (!this.$v.data.queue_wrap_up_time.minValue) {
                    return this.$t('validationErrors.minValueSecond', {
                        field: this.$t('pbxConfig.wrapUpTime'),
                        minValue: this.$v.data.queue_wrap_up_time.$params.minValue.min
                    });
                }
                else if (!this.$v.data.queue_wrap_up_time.maxValue) {
                    return this.$t('validationErrors.maxValueSecond', {
                        field: this.$t('pbxConfig.wrapUpTime'),
                        maxValue: this.$v.data.queue_wrap_up_time.$params.maxValue.max
                    });
                }
            }
        },
        methods: {
            getDefaults() {
                return {
                    subscriber_id: null,
                    max_queue_length: null,
                    queue_wrap_up_time: null
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
                this.$v.$reset();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl';
</style>
