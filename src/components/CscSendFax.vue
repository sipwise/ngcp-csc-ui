<template>
    <q-modal v-model="showFaxModal" :minimized="!isMobile" :maximized="isMobile" id="fax-modal">
        <!--NOTE: There is an issue with q-modal, mentioned in Quasar Framework documentation,-->
        <!--where closing the modal by setting v-model to false, might not work properly in-->
        <!--development if source files are updated while Modal is open. Best procedure is to-->
        <!--always close modal before updating sourcefile (which triggers webpack re-build)-->
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
        <q-btn flat dark @click="hideModal">{{ $t('communication.cancel') }}</q-btn>
        <q-btn flat color="primary" @click="sendFax" icon-right="insert drive file" :disable="formDisabled">{{ $t('communication.send') }}</q-btn>
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
                ],
                isMobile: this.$q.platform.is.mobile
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
                return !(this.form.destination &&
                    this.form.data && this.form.quality) ? true : false;
            }
        },
        methods: {
            sendFax() {
                this.$store.dispatch('communication/createFax', this.form);
            },
            showModal() {
                this.form = {
                    destination: null,
                    pageheader: null,
                    data: null,
                    quality: 'normal'
                };
                this.showFaxModal = true;
            },
            hideModal() {
                this.showFaxModal = false;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'

    #fax-modal

        .modal-content
            min-width 40vw
            padding 20px 15px

        .title
            color $primary
            line-height $csc-subtitle-line-height
            font-size $csc-subtitle-font-size
            font-weight $csc-subtitle-font-weight
</style>
