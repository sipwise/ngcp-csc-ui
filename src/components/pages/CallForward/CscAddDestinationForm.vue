<template>
    <div class="add-destination-form">
        <q-btn
            v-if="!isFormEnabled"
            flat
            color="primary"
            icon="add"
        >
            {{ $t('pages.callForward.addDestinationButton') }}
            <q-popover ref="popover">
                <q-list
                    link
                    no-border
                >
                    <q-item @click="addDestinationByType('number'), $refs.popover.close()">
                        {{ $t('pages.callForward.buttons.addNumber') }}
                    </q-item>
                    <q-item @click="addDestinationByType('voicebox'), $refs.popover.close()">
                        {{ $t('pages.callForward.buttons.addVoicemail') }}
                    </q-item>
                    <q-item
                        v-if="hasFaxCapability && hasSendFaxFeature"
                        @click="addDestinationByType('fax2mail'), $refs.popover.close()"
                    >
                        {{ $t('pages.callForward.buttons.addFax2Mail') }}
                    </q-item>
                </q-list>
            </q-popover>
        </q-btn>
        <div v-if="isFormEnabled">
            <csc-call-input
                :label="$t('pages.callForward.destination')"
                v-model="destinationForm.destination"
                @submit="addDestination"
                @error="error"
                :before="beforeIconDestination"
            />
            <q-field
                :error-label="timeoutInputError"
            >
                <q-input
                    dark
                    :before="beforeIconTimeout"
                    :float-label="$t('pages.callForward.timeout')"
                    v-model="destinationForm.timeout"
                    :suffix="$t('pages.callForward.seconds')"
                    clearable
                    @input="$v.destinationForm.timeout.$touch"
                    @blur="$v.destinationForm.timeout.$touch"
                    :error="$v.destinationForm.timeout.$error"
                />
            </q-field>
            <q-btn
                flat
                icon="clear"
                @mousedown.native="disableForm()"
                color="default"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                icon="check"
                color="primary"
                @click="addDestination()"
                :disable="$v.destinationForm.timeout.$error || destinationError"
            >
                {{ $t('buttons.save') }}
            </q-btn>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash'
    import CscCallInput from '../../form/CscCallInput'
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
        minValue,
        numeric
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
                },
                destinationError: false
            }
        },
        components: {
            CscCallInput,
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
                timeout: {
                    required,
                    minValue: minValue(1),
                    numeric
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
            timeoutInputError() {
                if (!this.$v.destinationForm.timeout.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pages.callForward.timeout')
                    });
                }
                else if (!this.$v.destinationForm.timeout.numeric) {
                    return this.$t('validationErrors.numeric', {
                        field: this.$t('pages.callForward.timeout'),
                    });
                }
                else if (!this.$v.destinationForm.timeout.minValue) {
                    return this.$t('validationErrors.minValueSecond', {
                        field: this.$t('pages.callForward.timeout'),
                        minValue: this.$v.destinationForm.timeout.$params.minValue.min
                    });
                }
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
            addDestinationByType(type) {
                this.$store.commit('callForward/setFormType', type);
                let lastDestination = _.findLast(this.destinations) || {};
                this.$store.commit('callForward/setDestinationsetId', this.id);
                this.$store.commit('callForward/setGroupName', this.groupName);
                this.$store.commit('callForward/setPriority', lastDestination.priority || 1);
                if (type === 'voicebox') {
                    this.destinationForm.destination = 'Voicemail';
                    this.addDestination();
                }
                else if (type === 'fax2mail') {
                    this.destinationForm.destination = 'Fax2Mail';
                    this.addDestination();
                }
                else {
                    this.$v.$reset();
                    this.formEnabled = true;
                    this.$store.commit('callForward/setActiveForm', this.groupName);
                    this.destinationForm.destination = '';
                }
            },
            disableForm() {
                this.destinationForm.timeout = 300;
                this.destinationForm.destination = '';
                this.formEnabled = false;
                this.$v.$reset();
                this.$store.commit('callForward/resetFormState');
                this.$store.commit('callForward/resetDestinationState');
            },
            addDestination() {
                if (this.$v.destinationForm.timeout.$error ||
                    this.destinationError) {
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
            },
            error(state) {
                this.destinationError = state;
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