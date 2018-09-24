
<template>
    <div>
        <q-field class="csc-form-field">
            <q-toggle
                :disable="deleteRequesting || !canToggleDelete"
                :label="deleteLabel"
                v-model="changes.delete"
                @input="toggle('delete')"
                checked-icon="delete"
                unchecked-icon="delete"
            />
        </q-field>
        <q-field class="csc-form-field">
            <q-toggle
                :disable="attachRequesting || !canToggleAttachment"
                :label="attachLabel"
                v-model="changes.attach"
                @input="toggle('attach')"
                checked-icon="attach_file"
                unchecked-icon="attach_file"
            />
        </q-field>
        <q-field
            class="csc-form-field"
            icon="phone_locked"
            :error-label="pinErrorMessage"
        >
            <q-input
                :loading="pinRequesting"
                :disable="pinRequesting"
                :float-label="$t('voicebox.label.changePin')"
                v-model="changes.pin"
                :after="pinButtons"
                @keyup.enter="updatePin"
                @input="$v.changes.pin.$touch"
                @blur="$v.changes.pin.$touch"
                :error="$v.changes.pin.$error"
            />
        </q-field>
        <q-field
            class="csc-form-field"
            icon="email"
            :error-label="emailErrorMessage"
        >
            <q-input
                :loading="emailRequesting"
                :disable="emailRequesting"
                :float-label="$t('voicebox.label.changeEmail')"
                v-model="changes.email"
                :after="emailButtons"
                @keyup.enter="updateEmail"
                @input="$v.changes.email.$touch"
                @blur="$v.changes.email.$touch"
                :error="$v.changes.email.$error"
            />
        </q-field>
    </div>
</template>

<script>
    import {
        maxLength,
        email
    } from 'vuelidate/lib/validators'
    import {
        QField,
        QInput,
        QToggle
    } from 'quasar-framework'
    export default {
        name: 'csc-voicebox-settings',
        props: [
            'settings',
            'deleteRequesting',
            'attachRequesting',
            'pinRequesting',
            'emailRequesting',
            'attachLabel',
            'deleteLabel'
        ],
        data () {
            return {
                changes: this.getSettings()
            }
        },
        components: {
            QField,
            QInput,
            QToggle
        },
        validations: {
            changes: {
                pin: {
                    maxLength: maxLength(64)
                },
                email: {
                    email
                }
            }
        },
        computed: {
            pinErrorMessage() {
                return this.$t('validationErrors.maxLength', {
                    field: this.$t('voicebox.pin'),
                    maxLength: this.$v.changes.pin.$params.maxLength.max
                });
            },
            emailErrorMessage() {
                return this.$t('validationErrors.email');
            },
            canToggleDelete() {
                return this.settings.attach;
            },
            canToggleAttachment() {
                return !this.settings.delete;
            },
            pinHasChanged() {
                return this.changes.pin !== this.settings.pin;
            },
            emailHasChanged() {
                return this.changes.email !== this.settings.email;
            },
            pinButtons() {
                let buttons = [];
                let self = this;
                if (this.pinHasChanged) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.updatePin();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetFields();
                            }
                        }
                    );
                }
                return buttons;
            },
            emailButtons() {
                let buttons = [];
                let self = this;
                if (this.emailHasChanged) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.updateEmail();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetFields();
                            }
                        }
                    );
                }
                return buttons;
            }
        },
        methods: {
            getSettings() {
                return {
                    delete: this.settings.delete,
                    attach: this.settings.attach,
                    pin: this.settings.pin,
                    email: this.settings.email
                }
            },
            resetFields() {
                this.changes = this.getSettings();
            },
            toggle(field) {
                if (field === 'delete') {
                    this.$store.dispatch('voicebox/toggleDelete');
                }
                else if (field === 'attach') {
                    this.$store.dispatch('voicebox/toggleAttach');
                }
            },
            updatePin() {
                this.$store.dispatch('voicebox/updatePin', this.changes.pin);
            },
            updateEmail() {
                this.$store.dispatch('voicebox/updateEmail', this.changes.email);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
