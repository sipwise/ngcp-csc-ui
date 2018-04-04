<template>
    <q-modal v-model="showFaxModal">
        <div class="title">
            {{ $t('communication.sendFax') }}
        </div>
        <q-field>
            <q-input
                type="text"
                v-model="form.destination"
                :float-label="$t('communication.label.destination')" />
        </q-field>
        <q-field>
            <q-select
                v-model="form.quality"
                :options="qualityOptions"
                :float-label="$t('communication.label.quality')" />
        </q-field>
        <q-field>
            <q-input
                type="text"
                v-model="form.pageheader"
                :float-label="$t('communication.label.pageHeader')" />
        </q-field>
        <q-field>
            <q-input
                type="textarea"
                :max-height="100"
                :min-rows="10"
                v-model="form.data"
                :float-label="$t('communication.label.content')" />
        </q-field>
        <q-btn color="primary" @click="closeModal()" label="Close">{{ $t('communication.close') }}</q-btn>
        <q-btn color="primary" @click="sendFax()" label="Send" :disable="formDisabled">{{ $t('buttons.save') }}</q-btn>
    </q-modal>
</template>

<script>
    import {
    QModal,
    QBtn,
    QField,
    QSelect,
    QInput,
    } from 'quasar-framework'
    export default {
        name: 'csc-send-fax',
        data () {
            return {
                showFaxModal: false,
                form: {
                    destination: null,
                    pageheader: null,
                    data: null,
                    quality: 'normal'
                },
                qualityOptions: [
                    { label: this.$t('communication.quality.normal'), value: 'normal' },
                    { label: this.$t('communication.quality.fine'), value: 'fine' },
                    { label: this.$t('communication.quality.super'), value: 'super' }
                ]
            }
        },

        components: {
            QModal,
            QBtn,
            QField,
            QSelect,
            QInput
        },
        computed: {
            formDisabled() {
                return !(this.form.destination && this.form.pageheader
                    && this.form.data && this.form.quality) ? true : false;
            }
        },
        methods: {
            sendFax() {
                this.$store.dispatch('communication/createFax', this.form);
            },
            showModal() {
                console.log('showModal()');
                this.showFaxModal = true;
            },
            closeModal() {
                console.log('closeModal()');
                this.showFaxModal = false;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'
</style>
