<template>
    <div
        class="csc-form csc-pbx-ms-config-add-form"
    >
        <q-field>
            <q-select
                dark
                v-model="data.subscriberId"
                :disable="loading || subscriberOptionsLoading"
                :readonly="loading"
                :stack-label="$t('pbxConfig.msConfigSubscriberSelectionLabel')"
                :options="subscriberOptions"
            />
        </q-field>
        <q-field>
            <q-select
                dark
                multiple
                chips
                clearable
                v-model="data.secretaryNumbers"
                :disable="loading || numberOptionsLoading"
                :readonly="loading"
                :float-label="$t('pbxConfig.msConfigNumberSelectionLabel')"
                :options="numberOptions"
            />
        </q-field>
        <!--<q-field-->
            <!--:error-label="maxQueueLengthErrorMessage"-->
        <!--&gt;-->
            <!--<q-input-->
                <!--dark-->
                <!--v-model="data.max_queue_length"-->
                <!--:error="$v.data.max_queue_length.$error"-->
                <!--:disable="loading"-->
                <!--:readonly="loading"-->
                <!--:float-label="$t('pbxConfig.queueLength')"-->
                <!--default="3"-->
                <!--@input="$v.data.max_queue_length.$touch"-->
            <!--/>-->
        <!--</q-field>-->
        <!--<q-field-->
            <!--:error-label="wrapUpTimeErrorMessage"-->
        <!--&gt;-->
            <!--<q-input-->
                <!--dark-->
                <!--v-model="data.queue_wrap_up_time"-->
                <!--:error="$v.data.queue_wrap_up_time.$error"-->
                <!--:disable="loading"-->
                <!--:readonly="loading"-->
                <!--:float-label="$t('pbxConfig.wrapUpTime')"-->
                <!--:suffix="$t('pbxConfig.seconds')"-->
                <!--@input="$v.data.queue_wrap_up_time.$touch"-->
            <!--/>-->
        <!--</q-field>-->
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
                :disable="$v.data.$invalid || !this.secretaryNumbersIsValid"
                color="primary"
                icon="arrow_forward"
                @click="save()"
            >
                {{ $t('pbxConfig.msConfigCreationLabel') }}
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
        required,
        // maxValue,
        // minValue,
        // numeric
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
        name: 'csc-pbx-ms-config-add-form',
        props: [
            'loading',
            'subscriberOptions',
            'subscriberOptionsLoading',
            'numberOptions',
            'numberOptionsLoading'
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
                subscriberId: {
                    required
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
            // maxQueueLengthErrorMessage() {
            //     if (!this.$v.data.max_queue_length.numeric) {
            //         return this.$t('validationErrors.numeric', {
            //             field: this.$t('pbxConfig.queueLength'),
            //         });
            //     }
            //     else if (!this.$v.data.max_queue_length.minValue) {
            //         return this.$t('validationErrors.minValueSecond', {
            //             field: this.$t('pbxConfig.queueLength'),
            //             minValue: this.$v.data.max_queue_length.$params.minValue.min
            //         });
            //     }
            //     else if (!this.$v.data.max_queue_length.maxValue) {
            //         return this.$t('validationErrors.maxValueSecond', {
            //             field: this.$t('pbxConfig.queueLength'),
            //             maxValue: this.$v.data.max_queue_length.$params.maxValue.max
            //         });
            //     }
            // },
            // wrapUpTimeErrorMessage() {
            //     if (!this.$v.data.queue_wrap_up_time.numeric) {
            //         return this.$t('validationErrors.numeric', {
            //             field: this.$t('pbxConfig.wrapUpTime'),
            //         });
            //     }
            //     else if (!this.$v.data.queue_wrap_up_time.minValue) {
            //         return this.$t('validationErrors.minValueSecond', {
            //             field: this.$t('pbxConfig.wrapUpTime'),
            //             minValue: this.$v.data.queue_wrap_up_time.$params.minValue.min
            //         });
            //     }
            //     else if (!this.$v.data.queue_wrap_up_time.maxValue) {
            //         return this.$t('validationErrors.maxValueSecond', {
            //             field: this.$t('pbxConfig.wrapUpTime'),
            //             maxValue: this.$v.data.queue_wrap_up_time.$params.maxValue.max
            //         });
            //     }
            // }
            secretaryNumbersIsValid() {
                return _.get(this.data, 'secretaryNumbers.length', 0) > 0;
            }
        },
        methods: {
            getDefaults() {
                return {
                    subscriberId: null,
                    secretaryNumbers: []
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
