<template>
    <div class="col">
        <div class="col">
            <q-field>
                <q-input
                    v-model="data.station_name"
                    :disabled="loading"
                    :readonly="loading"
                    autofocus
                    :float-label="$t('pbxConfig.deviceStationName')"
                    clearable
                />
            </q-field>
            <q-field>
                <q-input
                    v-model="data.identifier"
                    :disabled="loading"
                    :readonly="loading"
                    :float-label="$t('pbxConfig.deviceIdentifier')"
                    clearable
                />
            </q-field>
            <q-field>
                <csc-pbx-model-select
                    :profiles="profiles"
                    :modelImages="modelImages"
                    :label="$t('pbxConfig.deviceModel')"
                    @opened="modelSelectOpened()"
                    @select="selectProfile"
                />
            </q-field>
            <div
                class="row justify-center form-actions"
            >
                <q-btn
                    v-if="!loading"
                    flat color="secondary"
                    icon="clear"
                    @click="cancel()"
                >{{ $t('buttons.cancel') }}</q-btn>
                <q-btn
                    v-if="!loading"
                    flat
                    color="primary"
                    icon="done"
                    @click="save()"
                >{{ $t('buttons.save') }}</q-btn>
            </div>
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
        QItem,
        QItemMain } from 'quasar-framework'
    import CscPbxModelSelect from './CscPbxModelSelect'
    import CscPbxDeviceFilter from './CscPbxDeviceFilter'

    export default {
        name: 'csc-pbx-device-add-form',
        props: [
            'profiles',
            'modelImages',
            'loading'
        ],
        components: {
            CscPbxModelSelect,
            CscPbxDeviceFilter,
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
            QItem,
            QItemMain
        },
        data () {
            return {
                formEnabled: false,
                data: this.getDefaults()
            }
        },
        methods: {
            getDefaults() {
                return {
                    station_name: '',
                    identifier: '',
                    profile_id: null,
                    lines: null
                }
            },
            enableForm(){
                this.formEnabled = true;
            },
            disableForm(){
                this.reset();
                this.$emit('cancelForm');
            },
            cancel() {
                this.disableForm();
            },
            save() {
                this.$emit('save', this.data);
            },
            reset() {
                this.data = this.getDefaults();
            },
            modelSelectOpened() {
                this.$emit('modelSelectOpened');
            },
            selectProfile(profile) {
                this.data.profile_id = profile.id;
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
