<template>
    <div class="row justify-center">
        <div v-if="formEnabled" class="col col-md-6 col-sm-12">
            <q-field>
                <q-select
                    :disabled="loading"
                    :readonly="loading"
                    v-model="slot"
                    :float-label="$t('speedDial.slot')"
                    :options="slotOptions"
                    radio
                />
            </q-field>
            <q-field>
                <csc-destination-input
                    :loading="loading"
                    :label="$t('speedDial.destination')"
                    @destination-input="destinationInput"
                />
                <!--<q-input-->
                    <!--:disabled="loading"-->
                    <!--:readonly="loading"-->
                    <!--type="text"-->
                    <!--v-model="destination"-->
                    <!--clearable-->
                    <!--:float-label="$t('speedDial.destination')"-->
                    <!--@keyup.enter="save()"-->
                <!--/>-->
            </q-field>
            <div
                class="row justify-center form-actions"
            >
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
                    flat
                    color="primary"
                    icon="done"
                    @click="save()"
                >
                    {{ $t('buttons.save') }}
                </q-btn>
            </div>
        </div>
        <div
            v-else
            class="row justify-center"
        >
            <q-btn
                color="primary"
                icon="add"
                flat
                @click="enableForm()"
            >
                {{ $t('speedDial.addSpeedDial') }}
            </q-btn>
        </div>
        <q-inner-loading
            v-show="loading"
            :visible="loading"
        >
            <q-spinner-mat
                size="60px"
                color="primary"
            />
        </q-inner-loading>
    </div>
</template>

<script>
    import 'quasar-extras/animate/bounceInRight.css'
    import 'quasar-extras/animate/bounceOutRight.css'
    import CscDestinationInput from '../../form/CscDestinationInput'
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
        Alert
    } from 'quasar-framework'

    export default {
        name: 'csc-speed-dial-add-form',
        props: [
            'slotOptions',
            'loading'
        ],
        data () {
            return {
                formEnabled: false,
                destination: '',
                slot: ''
            }
        },
        components: {
            CscDestinationInput,
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
        methods: {
            destinationInput(input) {
                this.destination = input;
            },
            enableForm(){
                if (this.slotOptions.length > 0) {
                    this.reset();
                    this.formEnabled = true;
                }
                else {
                    Alert.create({
                        enter: 'bounceInRight',
                        leave: 'bounceOutRight',
                        position: 'top-center',
                        html: this.$t('speedDial.addNoSlotsDialogText'),
                        icon: 'warning',
                        dismissible: true
                    });
                }
            },
            cancel() {
                this.formEnabled = false;
            },
            save() {
                this.$emit('save', {
                    destination: this.destination,
                    slot: this.slot
                });
                this.cancel();
            },
            reset() {
                this.destination = '';
                this.slot = this.slotOptions[0].value ? this.slotOptions[0].value : '';
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
