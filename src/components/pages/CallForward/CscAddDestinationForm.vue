<template>
    <div class="add-destination-form">
        <q-btn
            v-if="!isFormEnabled"
            flat
            color="primary"
            icon="fa-plus"
        >
            {{ $t('pages.callForward.addDestinationButton') }}
            <q-popover ref="popover">
                <q-list
                    separator
                    link
                >
                    <q-item @click="enableForm('number'), $refs.popover.close()">
                        {{ $t('pages.callForward.buttons.addNumber') }}
                    </q-item>
                    <q-item @click="enableForm('voicebox'), $refs.popover.close()">
                        {{ $t('pages.callForward.buttons.addVoicemail') }}
                    </q-item>
                    <q-item
                        v-if="hasFaxCapability && hasSendFaxFeature"
                        @click="enableForm('fax2mail'), $refs.popover.close()"
                    >
                        {{ $t('pages.callForward.buttons.addFax2Mail') }}
                    </q-item>
                </q-list>
            </q-popover>
        </q-btn>
        <div v-if="isFormEnabled">
            <q-field
                :error-label="destinationInputError"
            >
                <q-input
                    :before="beforeIconDestination"
                    :float-label="$t('pages.callForward.destination')"
                    type="text"
                    v-model="destinationForm.destination"
                    @keyup.enter="addDestination()"
                    :clearable="isFormTypeNumber"
                    :autofocus="isFormTypeNumber"
                    :disable="!isFormTypeNumber || addDestinationIsRequesting"
                    @input="$v.destinationForm.destination.$touch"
                    @blur="$v.destinationForm.destination.$touch"
                    :error="$v.destinationForm.destination.$error"
                />
            </q-field>
            <q-field
                :error-label="timeoutInputError"
            >
                <q-input
                    v-if="isFormTypeNumber"
                    :before="beforeIconTimeout"
                    :float-label="$t('pages.callForward.timeout')"
                    type="number"
                    v-model="destinationForm.timeout"
                    suffix="seconds"
                    @input="$v.destinationForm.timeout.$touch"
                    @blur="$v.destinationForm.timeout.$touch"
                    :error="$v.destinationForm.timeout.$error"
                />
            </q-field>
            <q-btn
                flat
                dark
                @click="disableForm()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                color="primary"
                icon-right="fa-save"
                @click="addDestination()"
                :disable="$v.destinationForm.destination.$error || $v.destinationForm.timeout.$error"
            >
                {{ $t('buttons.save') }}
            </q-btn>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash'
    import {
        startLoading,
        showGlobalError
    } from '../../../helpers/ui'
    import {
        mapGetters,
        mapState
    } from 'vuex'
    import {
        required,
        maxLength,
        minValue
    } from 'vuelidate/lib/validators'
    import {
        QItem,
        Toast,
        QBtn,
        QSelect,
        QPopover,
        QList,
        QField,
        QInput,
        QSlider
    } from 'quasar-framework'
    export default {
        name: 'csc-add-destination-form',
        props: [
            'destinations',
            'id',
            'groupName',
            'priority',
            'timeset',
            'timesetId',
            'sourcesetId'
        ],
        data () {
            return {
                formEnabled: false,
                destinationForm: {
                    destination: '',
                    timeout: 300
                }
            }
        },
        components: {
            QSelect,
            QPopover,
            QField,
            QInput,
            QSlider,
            QList,
            QItem,
            Toast,
            QBtn
        },
        validations: {
            destinationForm: {
                destination: {
                    required,
                    maxLength: maxLength(64)
                },
                timeout: {
                    required,
                    minValue: minValue(1)
                }
            }
        },
        computed: {
            ...mapState('callForward', [
                'activeForm',
                'formType',
                'addDestinationState',
            ]),
            ...mapGetters('user', [
                'hasSendFaxFeature',
                'hasFaxCapability'
            ]),
            destinationInputError() {
                if (!this.$v.destinationForm.destination.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('pages.callForward.destination'),
                        maxLength: this.$v.destinationForm.destination.$params.maxLength.max
                    });
                }
                else if (!this.$v.destinationForm.destination.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pages.callForward.destination')
                    });
                }
            },
            timeoutInputError() {
                if (!this.$v.destinationForm.timeout.minValue) {
                    return this.$t('validationErrors.minValueSecond', {
                        field: this.$t('pages.callForward.timeout'),
                        minValue: this.$v.destinationForm.timeout.$params.minValue.min
                    });
                }
                else if (!this.$v.destinationForm.timeout.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pages.callForward.timeout')
                    });
                }
            },
            isFormTypeNumber() {
                return this.formType === 'number';
            },
            isFormEnabled() {
                return this.activeForm === this.groupName && this.formEnabled;
            },
            addDestinationIsRequesting() {
                return this.addDestinationState === 'requesting';
            },
            beforeIconTimeout() {
                return [{
                    icon: 'schedule'
                }];
            },
            beforeIconDestination() {
                return [{
                    icon: 'fa-angle-double-right'
                }];
            }
        },
        watch: {
            addDestinationState(state) {
                if (state === 'succeeded') {
                    this.disableForm();
                }
            }
        },
        methods: {
            enableForm(type) {
                let lastDestination = _.findLast(this.destinations) || {};
                this.formEnabled = true;
                this.$store.commit('callForward/setFormType', type);
                this.$store.commit('callForward/setActiveForm', this.groupName);
                this.$store.commit('callForward/setDestinationsetId', this.id);
                this.$store.commit('callForward/setGroupName', this.groupName);
                this.$store.commit('callForward/setPriority', lastDestination.priority || 1);
                if (type === 'voicebox') {
                    this.destinationForm.destination = 'Voicemail';
                }
                else if (type === 'fax2mail') {
                    this.destinationForm.destination = 'Fax2Mail';
                }
                else {
                    this.destinationForm.destination = '';
                }
            },
            disableForm() {
                this.destinationForm.timeout = 300;
                this.destinationForm.destination = '';
                this.formEnabled = false;
                this.$store.commit('callForward/resetFormState');
                this.$store.commit('callForward/resetDestinationState');
            },
            addDestination() {
                if (this.$v.destinationForm.destination.$error ||
                    this.$v.destinationForm.timeout.$error) {
                        showGlobalError(this.$t('validationErrors.generic'));
                }
                else {
                    startLoading();
                    this.$store.dispatch('callForward/addDestination', {
                        form: this.destinationForm,
                        destinations: this.destinations,
                        timeset: this.timeset,
                        timesetId: this.timesetId,
                        sourcesetId: this.sourcesetId
                    });
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

    .add-destination-form
        margin 0
        .q-slider.label-always
            padding 15px 0 5px
            height 50px
</style>
