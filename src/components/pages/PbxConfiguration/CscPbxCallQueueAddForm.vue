<template>
    <div
        class="csc-form csc-pbx-call-queue-add-form"
    >
        <q-field>
            <q-select
                dark
                v-model="data.subscriber_id"
                :disable="loading || subscriberOptionsLoading"
                :readonly="loading"
                :stack-label="$t('pbxConfig.queueExtensionName')"
                :options="options"
            />
        </q-field>
        <q-field
            :error-label="maxQueueLengthErrorMessage"
        >
            <q-input
                dark
                v-model="data.max_queue_length"
                :error="$v.data.max_queue_length.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.queueLength')"
                default="3"
                @input="$v.data.max_queue_length.$touch"
            />
        </q-field>
        <q-field
            :error-label="wrapUpTimeErrorMessage"
        >
            <q-input
                dark
                v-model="data.queue_wrap_up_time"
                :error="$v.data.queue_wrap_up_time.$error"
                :disable="loading"
                :readonly="loading"
                :float-label="$t('pbxConfig.wrapUpTime')"
                :suffix="$t('pbxConfig.seconds')"
                @input="$v.data.queue_wrap_up_time.$touch"
            />
        </q-field>
        <div
            class="csc-form-actions row justify-center"
        >
            <q-btn
                flat
                v-if="!loading"
                color="default"
                icon="clear"
                @click="cancel()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                v-if="!loading"
                :disable="$v.data.$invalid"
                color="primary"
                icon="filter_none"
                @click="save()"
            >
                {{ $t('pbxConfig.createConfig') }}
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
    import CscObjectSpinner from "../../CscObjectSpinner"
    export default {
        name: 'csc-pbx-call-queue-add-form',
        props: [
            'options',
            'loading',
            'subscriberOptionsLoading',
            'defaultMaxQueueLength',
            'defaultWrapUpTime'
        ],
        components: {
            CscObjectSpinner,
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
        mounted() {
            this.$emit('ready');
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
                    max_queue_length: this.defaultMaxQueueLength,
                    queue_wrap_up_time: this.defaultWrapUpTime
                }
            },
            cancel() {
                this.$emit('cancel');
            },
            save() {
                this.$emit('submit', this.data);
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
