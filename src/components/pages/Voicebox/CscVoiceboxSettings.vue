
<template>
    <div>
        <q-field
            class="csc-form-field"
            icon="lock"
            :error-label="pinErrorMessage"
        >
            <q-inner-loading :visible="pinRequesting">
                <q-spinner-dots
                    color="primary"
                    :size="24"
                />
            </q-inner-loading>
            <q-input
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
            <q-inner-loading :visible="emailRequesting">
                <q-spinner-dots
                    color="primary"
                    :size="24"
                />
            </q-inner-loading>
            <q-input
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
        <q-field class="csc-form-field">
            <q-inner-loading :visible="attachRequesting">
                <q-spinner-dots
                    color="primary"
                    :size="24"
                />
            </q-inner-loading>
            <q-toggle
                :class="attachClasses"
                :disable="attachRequesting"
                :label="attachLabel"
                v-model="changes.attach"
                @input="toggleAttach"
                checked-icon="attach_file"
                unchecked-icon="attach_file"
            />
        </q-field>
        <q-field class="csc-form-field">
            <q-inner-loading :visible="deleteRequesting">
                <q-spinner-dots
                    color="primary"
                    :size="24"
                />
            </q-inner-loading>
            <q-toggle
                :class="deleteClasses"
                :disable="deleteRequesting || !canToggleDelete"
                :label="deleteLabel"
                v-model="changes.delete"
                @input="toggleDelete"
                checked-icon="delete"
                unchecked-icon="delete"
            />
        </q-field>
    </div>
</template>

<script>
    import {
        maxLength,
        numeric,
        email
    } from 'vuelidate/lib/validators'
    import {
        QField,
        QInput,
        QToggle,
        QSpinnerDots,
        QInnerLoading
    } from 'quasar-framework'
    export default {
        name: 'csc-voicebox-settings',
        props: [
            'deleteRequesting',
            'attachRequesting',
            'pinRequesting',
            'emailRequesting',
            'attachLabel',
            'deleteLabel',
            'attach',
            'delete',
            'pin',
            'email'
        ],
        data () {
            return {
                changes: this.getSettings()
            }
        },
        components: {
            QField,
            QInput,
            QToggle,
            QSpinnerDots,
            QInnerLoading
        },
        validations: {
            changes: {
                pin: {
                    maxLength: maxLength(64),
                    numeric
                },
                email: {
                    email
                }
            }
        },
        computed: {
            pinErrorMessage() {
                if (!this.$v.changes.pin.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('voicebox.pin'),
                        maxLength: this.$v.changes.pin.$params.maxLength.max
                    });
                }
                else if (!this.$v.changes.pin.numeric) {
                    return this.$t('validationErrors.numeric', {
                        field: this.$t('voicebox.pin')
                    });
                }
            },
            emailErrorMessage() {
                return this.$t('validationErrors.email');
            },
            canToggleDelete() {
                return this.attach;
            },
            pinHasChanged() {
                return this.changes.pin !== this.pin;
            },
            emailHasChanged() {
                return this.changes.email !== this.email;
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
            },
            attachClasses() {
                let classes = [];
                if(this.attach) {
                    classes.push('csc-toggle-enabled');
                }
                else {
                    classes.push('csc-toggle-disabled');
                }
                return classes;
            },
            deleteClasses() {
                let classes = [];
                if(this.delete) {
                    classes.push('csc-toggle-enabled');
                }
                else {
                    classes.push('csc-toggle-disabled');
                }
                return classes;
            }
        },
        methods: {
            getSettings() {
                return {
                    delete: this.delete,
                    attach: this.attach,
                    pin: this.pin,
                    email: this.email
                }
            },
            resetFields() {
                this.changes = this.getSettings();
            },
            toggleDelete() {
                this.$store.dispatch('voicebox/toggleDelete');
            },
            toggleAttach() {
                this.$store.dispatch('voicebox/toggleAttach');
            },
            updatePin() {
                if(this.pinHasChanged) {
                    this.$store.dispatch('voicebox/updatePin', this.changes.pin);
                }
            },
            updateEmail() {
                if(this.emailHasChanged) {
                    this.$store.dispatch('voicebox/updateEmail', this.changes.email);
                }
            }
        },
        watch: {
            pin() {
                this.changes.pin = this.pin;
            },
            delete() {
                this.changes.delete = this.delete;
            },
            attach() {
                this.changes.attach = this.attach;
            },
            email() {
                this.changes.email = this.email;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
