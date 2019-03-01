<template>
    <q-item
        :class="itemClasses"
    >
        <q-item-side
            v-if="!expanded"
        >
            <q-icon
                size="24px"
                name="music_note"
                color="white"
            />
        </q-item-side>
        <q-item-main>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-title"
                label
            >
                {{ set.name }}
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <div>
                    <span class="csc-item-label">
                        {{ $t('pbxConfig.description') }}:
                    </span>
                    <span class="csc-item-value">
                        {{ set.description }}
                    </span>
                </div>
            </q-item-tile>
            <q-item-tile
                v-if="expanded"
                class="csc-list-item-main"
            >
                <q-field
                    class="csc-form-field"
                    :label="$t('pbxConfig.name')"
                    :error-label="nameErrorMessage"
                >
                    <q-input
                        dark
                        v-model="changes.name"
                        :after="nameButtons"
                        @keyup.enter="saveName"
                        @input="$v.changes.name.$touch"
                        @blur="$v.changes.name.$touch"
                        :error="$v.changes.name.$error"
                    />
                </q-field>
                <q-field
                    class="csc-form-field"
                    :label="$t('pbxConfig.description')"
                    :error-label="descriptionErrorMessage"
                >
                    <q-input
                        dark
                        v-model="changes.description"
                        :after="descriptionButtons"
                        @keyup.enter="saveDescription"
                        @input="$v.changes.description.$touch"
                        @blur="$v.changes.description.$touch"
                        :error="$v.changes.description.$error"
                    />
                </q-field>
                <q-field
                    dark
                    class="csc-form-field"
                    :label="$t('pbxConfig.defaultForSubscribers')"
                >
                    <q-toggle
                        :class="contractDefaultClasses"
                        v-model="changes.contract_default"
                        @input="toggleContractDefault"
                        checked-icon="check_circle"
                        unchecked-icon="check_circle"
                    />
                </q-field>
            </q-item-tile>
            <q-item-tile
                class="csc-list-collapsible"
                v-if="expanded"
            >
                <div class="csc-sublabel">
                    {{ $t('pbxConfig.groups') }}
                </div>
                <csc-pbx-sound-group
                    v-for="(group, index) in set.groups"
                    :group="group"
                    :key="index"
                    :highlight="!mobile"
                    :mobile="mobile"
                />
            </q-item-tile>
        </q-item-main>
        <q-item-side
            right
            class="csc-list-actions-pinned"
        >
            <q-item-tile>
                <q-btn
                    v-if="expanded"
                    icon="delete"
                    :big="mobile"
                    color="negative"
                    flat
                    @click="remove()"
                />
                <q-btn
                    :icon="titleIcon"
                    :big="mobile"
                    color="primary"
                    flat
                    @click="toggleMain()"
                />
            </q-item-tile>
        </q-item-side>
        <q-inner-loading :visible="isLoading">
            <q-spinner-mat
                size="60px"
                color="primary"
            />
        </q-inner-loading>
    </q-item>
</template>

<script>
    import CscPbxSoundGroup from './CscPbxSoundGroup'
    import {
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QBtn,
        QIcon,
        QCollapsible,
        QCheckbox,
        QField,
        QInput,
        QInnerLoading,
        QSpinnerMat,
        QSpinnerDots,
        QToggle
    } from 'quasar-framework'
    import {
        maxLength
    } from 'vuelidate/lib/validators'
    import { showGlobalError } from '../../../helpers/ui'
    export default {
        name: 'csc-pbx-sound-set',
        props: {
            set: Object,
            mobile: Boolean,
            loading: Boolean
        },
        components: {
            CscPbxSoundGroup,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QBtn,
            QIcon,
            QCollapsible,
            QCheckbox,
            QField,
            QInput,
            QInnerLoading,
            QSpinnerMat,
            QSpinnerDots,
            QToggle
        },
        data () {
            return {
                expanded: false,
                changes: this.getSet()
            }
        },
        validations: {
            changes: {
                name: {
                    maxLength: maxLength(64)
                },
                description: {
                    maxLength: maxLength(500)
                }
            },
        },
        computed: {
            itemClasses() {
                let classes = ['csc-list-item'];
                if (this.expanded) {
                    classes.push('csc-item-expanded');
                }
                else {
                    classes.push('csc-item-collapsed');
                }
                return classes;
            },
            titleIcon() {
                if(!this.expanded) {
                    return 'keyboard arrow down';
                }
                else {
                    return 'keyboard arrow up';
                }
            },
            name() {
                return this.set.name;
            },
            nameHasChanged() {
                return this.name + "" !== this.changes.name + "";
            },
            description() {
                return this.set.description;
            },
            descriptionHasChanged() {
                return this.description + "" !== this.changes.description + "";
            },
            nameButtons() {
                let buttons = [];
                let self = this;
                if (this.nameHasChanged && this.$v.changes.name.$error) {
                    buttons.push({
                            icon: 'clear',
                            error: true,
                            handler (event) {
                                event.stopPropagation();
                                self.resetName();
                            }
                        }
                    );
                }
                else if (this.nameHasChanged) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveName();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetName();
                            }
                        }
                    );
                }
                return buttons;
            },
            descriptionButtons() {
                let buttons = [];
                let self = this;
                if (this.descriptionHasChanged && this.$v.changes.description.$error) {
                    buttons.push({
                            icon: 'clear',
                            error: true,
                            handler (event) {
                                event.stopPropagation();
                                self.resetDescription();
                            }
                        }
                    );
                }
                else if (this.descriptionHasChanged) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveDescription();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetDescription();
                            }
                        }
                    );
                }
                return buttons;
            },
            setModel() {
                return {
                    id: this.set.id,
                    name: this.changes.name,
                    description: this.changes.description,
                    contract_default: this.changes.contract_default
                }
            },
            contractDefaultClasses() {
                let classes = [];
                if(this.attach) {
                    classes.push('csc-toggle-enabled');
                }
                else {
                    classes.push('csc-toggle-disabled');
                }
                return classes;
            },
            nameErrorMessage() {
                if (!this.$v.changes.name.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('pbxConfig.name'),
                        maxLength: this.$v.changes.name.$params.maxLength.max
                    });
                }
            },
            descriptionErrorMessage() {
                if (!this.$v.changes.description.maxLength) {
                    return this.$t('validationErrors.maxLength', {
                        field: this.$t('pbxConfig.description'),
                        maxLength: this.$v.changes.description.$params.maxLength.max
                    });
                }
            },
            isLoading() {
                return this.loading;
            }
        },
        methods: {
            toggleMain() {
                this.expanded = !this.expanded;
            },
            remove() {
                this.$emit('remove', this.set);
            },
            getSet() {
                return {
                    name: this.set.name,
                    description: this.set.description,
                    contract_default: this.set.contract_default
                }
            },
            resetName() {
                this.changes.name = this.set.name;
            },
            saveName() {
                if (this.$v.changes.$invalid) {
                    showGlobalError(this.$t('validationErrors.generic'));
                }
                else {
                    this.$emit('save-name', this.setModel);
                }
            },
            resetDescription() {
                this.changes.description = this.set.description;
            },
            saveDescription() {
                if (this.$v.changes.$invalid) {
                    showGlobalError(this.$t('validationErrors.generic'));
                }
                else {
                    this.$emit('save-description', this.setModel);
                }
            },
            toggleContractDefault() {
                if (this.$v.changes.$invalid) {
                    showGlobalError(this.$t('validationErrors.generic'));
                }
                else {
                    this.$emit('save-contract-default', this.setModel);
                }
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';

    .csc-list-collapsible
        margin-top $flex-gutter-md

        .q-item
            padding-left 0

        .q-item-section
            padding-top 0

        .q-item-icon
            color $primary

        .q-collapsible-sub-item
            padding 0

        .csc-sublabel
            color $light
            margin-bottom $flex-gutter-sm

</style>
