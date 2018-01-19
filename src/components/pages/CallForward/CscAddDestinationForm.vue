<template>
    <div class="add-destination-form">
        <q-btn flat color="primary" icon="fa-plus">
            {{ $t('pages.callForward.addDestinationButton') }}
            <q-popover ref="popover">
                <q-list separator link>
                    <q-item @click="enableForm('number'),
                        $refs.popover.close()">
                            {{ $t('pages.callForward.buttons.addNumber') }}
                    </q-item>
                    <q-item @click="enableForm('voicebox'),
                        $refs.popover.close()">
                            {{ $t('pages.callForward.buttons.addVoicemail') }}
                    </q-item>
                    <q-item @click="enableForm('fax2mail'),
                        $refs.popover.close()"
                        v-if="hasFaxCapability">
                            {{ $t('pages.callForward.buttons.addFax2Mail') }}
                    </q-item>
                </q-list>
            </q-popover>
        </q-btn>
        <div v-if="isFormEnabled">
            <q-field :error="addFormError"
                :error-label="$t('pages.callForward.addInputError')">
                    <p class="caption">
                        {{ $t('pages.callForward.destination') }}
                    </p>
                    <q-input type="text"
                        v-model="destinationForm.destination"
                        @keyup.enter="addDestination()"
                        :clearable="formType === 'number'"
                        :autofocus="formType === 'number'"
                        :disable="formType !== 'number' || addDestinationIsRequesting" />
                    <div v-if="formType === 'number'">
                        <p class="caption">
                            {{ $t('pages.callForward.timeout') }}
                        </p>
                        <q-slider class="timeout-slider"
                            v-model="destinationForm.timeout"
                            :min="0" :max="300" label-always />
                    </div>
            </q-field>
            <q-btn flat @click="disableForm()">
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn flat color="primary" icon-right="fa-save"
                @click="addDestination()">
                    {{ $t('buttons.save') }}
            </q-btn>
        </div>
    </div>
</template>

<script>

    import _ from 'lodash'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import { normalizeTerminationInput } from '../../../filters/number-format'
    import { mapGetters, mapState } from 'vuex'
    import { QItem, Toast, QBtn, QSelect, QPopover, QList,
        QField, QInput, QSlider } from 'quasar-framework'
    export default {
        name: 'csc-add-destination-form',
        props: [
            'destinations',
            'id',
            'groupName',
            'priority'
        ],
        data () {
            return {
                addFormError: false,
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
        computed: {
            ...mapState('callForward', [
                'activeForm',
                'formType',
                'addDestinationState',
                'addDestinationError',
                'lastAddedDestination'
            ]),
            ...mapGetters('callForward', [
                'hasFaxCapability'
            ]),
            isFormEnabled() {
                return this.activeForm === this.groupName && this.formEnabled;
            },
            addDestinationIsRequesting() {
                return this.addDestinationState === 'requesting';
            },
            addDestinationError() {
                return this.$store.state.callForward.addDestinationError || this.$t('pages.callForward.addErrorMessage');
            }
        },
        watch: {
            addDestinationState(state) {
                if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.addDestinationError);
                } else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.addDestinationSuccessMessage', {
                        destination: this.lastAddedDestination
                    }));
                    this.disableForm();
                } else if (state === 'button') {
                    stopLoading();
                }
            }
        },
        methods: {
            enableForm(type) {
                let lastDestination = _.findLast(this.destinations) || {};
                this.formEnabled = true;
                this.$store.dispatch('callForward/setFormType', type);
                this.$store.dispatch('callForward/setActiveForm', this.groupName);
                this.$store.dispatch('callForward/setDestinationsetId', this.id);
                this.$store.dispatch('callForward/setGroupName', this.groupName);
                this.$store.dispatch('callForward/setPriority', lastDestination.priority || 1);
                if (type === 'voicebox') {
                    this.destinationForm.destination = 'Voicemail';
                } else if (type === 'fax2mail') {
                    this.destinationForm.destination = 'Fax2Mail';
                } else {
                    this.destinationForm.destination = '';
                }
            },
            disableForm() {
                this.destinationForm.timeout = 300;
                this.destinationForm.destination = '';
                this.formEnabled = false;
                this.$store.dispatch('callForward/resetFormState');
                this.$store.dispatch('callForward/resetDestinationState');
            },
            addDestination() {
                startLoading();
                this.$store.dispatch('callForward/addDestination', {
                    form: this.destinationForm,
                    destinations: this.destinations
                });
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
.add-destination-form
    margin 0 15px
    .q-slider.label-always
        padding 15px 0 5px
        height 50px
</style>
