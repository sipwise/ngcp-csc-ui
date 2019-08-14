<template>
    <div>
        <q-slide-transition>
            <div
                v-if="!inputEnabled"
            >
                <q-btn
                    icon="lock"
                    flat
                    dark
                    color="primary"
                    @click="enableInput"
                >
                    {{ $t('userSettings.changePassword') }}
                </q-btn>
            </div>
        </q-slide-transition>
        <q-slide-transition>
            <div
                v-if="inputEnabled"
            >
                <q-field
                    icon="lock"
                >
                    <q-input
                        v-model.trim="newPassword"
                        dark
                        icon="lock"
                        type="password"
                        clearable
                        :float-label="$t('userSettings.newPasswordLabel')"
                    />
                </q-field>
                <q-field
                    icon="lock"
                >
                    <q-input
                        v-model.trim="newPasswordRetyped"
                        dark
                        icon="lock"
                        type="password"
                        clearable
                        :float-label="$t('userSettings.newPasswordRetypedLabel')"
                    />
                </q-field>
                <div
                    class="row justify-center"
                >
                    <q-btn
                        flat
                        color="default"
                        icon="clear"
                        @click="cancel"
                    >
                        {{ $t('buttons.cancel') }}
                    </q-btn>
                    <q-btn
                        flat
                        color="primary"
                        icon="done"
                        :disable="!isValid"
                        @click="openConfirmDialog"
                    >
                        {{ $t('userSettings.saveNewPassword') }}
                    </q-btn>
                </div>
            </div>
        </q-slide-transition>
        <csc-confirm-dialog
            ref="confirmDialog"
            :title-icon="'lock'"
            :title="$t('userSettings.changePasswordDialogTitle')"
            :message="$t('userSettings.changePasswordDialogText')"
            @cancel="closeConfirmDialog"
            @confirm="submit"
        />
        <csc-object-spinner
            v-if="loading"
            :loading="loading"
        />
    </div>
</template>

<script>
    import CscPage from '../../CscPage'
    import {
        QBtn,
        QField,
        QInput,
        QSlideTransition
    } from 'quasar-framework'
    import CscConfirmDialog from "../../CscConfirmationDialog";
    import CscObjectSpinner from "../../CscObjectSpinner";
    export default {
        name: 'csc-change-password',
        data () {
            return {
                inputEnabled: false,
                newPassword: '',
                newPasswordRetyped: ''
            }
        },
        props: [
            'subscriber',
            'loading',
            'error'
        ],
        components: {
            CscConfirmDialog,
            CscPage,
            QBtn,
            QField,
            QInput,
            QSlideTransition,
            CscObjectSpinner
        },
        mounted() {
        },
        computed: {
            isValid() {
                return this.newPassword !== '' && this.newPassword === this.newPasswordRetyped;
            }
        },
        methods: {
            enableInput() {
                this.inputEnabled = true;
                this.reset();
            },
            cancel() {
                this.inputEnabled = false;
                this.reset();
            },
            reset() {
                this.newPassword = '';
                this.newPasswordRetyped = '';
            },
            submit() {
                this.$emit('change', this.newPassword);
            },
            openConfirmDialog() {
                if(this.$refs.confirmDialog) {
                    this.$refs.confirmDialog.open();
                }
            },
            closeConfirmDialog() {
                if(this.$refs.confirmDialog) {
                    this.$refs.confirmDialog.close();
                }
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
</style>
