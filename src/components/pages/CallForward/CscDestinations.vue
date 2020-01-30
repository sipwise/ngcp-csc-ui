<template>
    <div class="dest-section">
        <div class="dest-title">
            <q-icon
                :name="icon"
                class="dest-icon"
                size="24px"
            />
            {{ title }}
        </div>
        <q-list no-border>
            <q-item
                highlight
                inset-separator
                v-if="showOwnPhone && group.length > 0"
                :class="itemClasses"
            >
                <q-item-side v-if="!isMobile">
                    <q-field
                        :disable="loading"
                    >
                        <q-toggle
                            :value="ownPhone"
                            @input="toggle()"
                            checked-icon="phone_in_talk"
                            unchecked-icon="phone_in_talk"
                        />
                    </q-field>
                </q-item-side>
                <q-item-main>
                    <div
                        v-if="!isMobile"
                        class="dest-row own-phone-desktop"
                    >
                        <span v-if="ownPhone">
                            <span>
                                {{ $t('pages.callForward.firstRing') }}
                            </span>
                            <span class="dest-values">
                                {{ $t('pages.callForward.ownPhone') }}
                            </span>
                            <span>
                                {{ $t('pages.callForward.for') }}
                            </span>
                            <span class="dest-values">
                                {{ ownPhoneTimeout || 0 }}
                            </span>
                            <span>
                                {{ $t('pages.callForward.secs') }}
                            </span>
                        </span>
                        <span v-else>
                            {{ $t('pages.callForward.ownPhoneDisabled') }}
                        </span>
                    </div>
                    <div
                        v-if="isMobile"
                        class="dest-row mobile"
                    >
                        <q-item-tile
                            v-if="ownPhone"
                            class="dest-values"
                            label
                        >
                            {{ $t('pages.callForward.ownPhone') }}
                        </q-item-tile>
                        <q-item-tile
                            v-else
                            label
                        >
                            {{ $t('pages.callForward.ownPhoneDisabled') }}
                        </q-item-tile>
                        <q-item-tile
                            v-if="ownPhone"
                            class="dest-sublabel"
                            sublabel
                        >
                            <span v-if="ownPhone">
                                <span>
                                    {{ $t('pages.callForward.firstRing') }}
                                </span>
                                <span>
                                    {{ $t('pages.callForward.for') }}
                                </span>
                                <span class="dest-values">
                                    {{ ownPhoneTimeout || 0 }}
                                </span>
                                <span>
                                    {{ $t('pages.callForward.secs') }}
                                </span>
                            </span>
                            <span v-else>
                                {{ $t('pages.callForward.ownPhoneDisabled') }}
                            </span>
                        </q-item-tile>
                    </div>
                </q-item-main>
                <q-item-side
                    v-if="ownPhone || isMobile"
                    class="dest-btns"
                    icon="more_vert"
                    right
                >
                    <q-popover ref="popover">
                        <q-list
                            link
                            no-border
                            highlight
                        >
                            <q-item
                               v-if="isMobile"
                                @click="toggle();$refs.popover.close()"
                            >
                                <q-item-main
                                    :label="toggleTimeoutLabel"
                                />
                                <q-item-side
                                    :icon="toggleIcon"
                                    color="secondary"
                                />
                            </q-item>
                            <q-item @click="showModal();$refs.popover.close()">
                                <q-item-main :label="$t('pages.callForward.editTimeout')" />
                                <q-item-side
                                    icon="fa-edit"
                                    color="secondary"
                                />
                            </q-item>
                        </q-list>
                    </q-popover>
                </q-item-side>
            </q-item>
            <q-item-separator
                v-if="showOwnPhone && group.length > 0"
                class="csc-dest-separator"
            />
            <q-item
                dense
                v-if="group.length === 0"
                class="dest-row csc-no-destination"
            >
                <span>
                    {{ $t('pages.callForward.forwardToNowhere') }}
                </span>
            </q-item>
            <csc-destination
                v-else
                v-for="(destinationset, index) in group"
                :key="index"
                v-bind="destinationset"
                :prev-dest-id="previousDestinationsetId(index)"
                :next-dest-id="nextDestinationsetId(index)"
                :ownPhone="ownPhone"
                :showOwnPhone="showOwnPhone"
            />
        </q-list>
        <q-modal
            v-model="isEditing"
            :minimized="!isMobile"
            :maximized="isMobile"
            id="timeout-modal"
        >
            <div class="title">
                {{ $t('pages.callForward.editTimeout') }}
            </div>
            <q-field :error-label="errorMessage">
                <q-input
                    dark
                    v-if="ownPhone"
                    v-model="editTimeout"
                    :suffix="$t('pages.callForward.seconds')"
                    :before="[{ icon: 'schedule' }]"
                    :float-label="$t('pages.callForward.timeout')"
                    @input="$v.editTimeout.$touch"
                    @blur="$v.editTimeout.$touch"
                    :error="$v.editTimeout.$error"
                />
            </q-field>
            <q-btn
                flat
                icon="clear"
                @click="hideModal"
                color="default"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                flat
                icon="undo"
                color="negative"
                @click="resetTimeout"
            >
                {{ $t('buttons.reset') }}
            </q-btn>
            <q-btn
                flat
                icon="check"
                color="primary"
                @click="updateTimeout"
                :disable="$v.editTimeout.$error"
            >
                {{ $t('buttons.save') }}
            </q-btn>
        </q-modal>
        <csc-add-destination-form
            v-bind="lastDestinationset"
            :sourcesetId="sourceset"
        />
    </div>
</template>

<script>
    import _ from 'lodash'
    import CscDestination from './CscDestination'
    import CscAddDestinationForm from './CscAddDestinationForm'
    import {
        required,
        minValue,
        numeric
    } from 'vuelidate/lib/validators'
    import {
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QItemSeparator,
        QPopover,
        QIcon,
        QField,
        QToggle,
        QInput,
        QModal,
        QBtn
    } from 'quasar-framework'
    export default {
        name: 'csc-destinations',
        props: [
            'title',
            'icon',
            'group',
            'groupName',
            'timeset',
            'sourceset',
            'showOwnPhone',
            'loading',
            'ownPhoneTimeout'
        ],
        data() {
            return {
                timeout: null,
                isEditing: false,
                isMobile: this.$q.platform.is.mobile
            }
        },
        components: {
            CscDestination,
            CscAddDestinationForm,
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QItemSeparator,
            QPopover,
            QIcon,
            QField,
            QToggle,
            QInput,
            QModal,
            QBtn
        },
        validations: {
            editTimeout: {
                required,
                minValue: minValue(1),
                numeric
            }
        },
        computed: {
            toggleIcon() {
                return this.ownPhone ? 'fa-toggle-off' : 'fa-toggle-on';
            },
            errorMessage() {
                if (!this.$v.editTimeout.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pages.callForward.timeout')
                    });
                }
                else if (!this.$v.editTimeout.numeric) {
                    return this.$t('validationErrors.numeric', {
                        field: this.$t('pages.callForward.timeout'),
                    });
                }
                else if (!this.$v.editTimeout.minValue) {
                    return this.$t('validationErrors.minValueSecond', {
                        field: this.$t('pages.callForward.timeout'),
                        minValue: this.$v.editTimeout.$params.minValue.min
                    });
                }
            },
            editTimeout: {
                get() {
                    if (this.ownPhoneTimeout && !this.timeout) {
                        return this.ownPhoneTimeout;
                    }
                    else {
                        return this.timeout;
                    }
                },
                set(value) {
                    this.timeout = value;
                }
            },
            ownPhone() {
                if (this.group.length > 0) {
                    return this.group[0].ownPhone;
                }
                else {
                    return false;
                }
            },
            timesetId() {
                if (this.group.length > 0) {
                    return this.group[0].timesetId;
                }
                else {
                    return null;
                }
            },
            sourcesetId() {
                return this.sourceset;
            },
            lastDestinationset() {
                let destinationset = _.findLast(this.group) || {};
                destinationset.groupName = this.groupName;
                destinationset.priority = destinationset.lowestPriority || 1;
                destinationset.timeset = this.timeset;
                return destinationset;
            },
            itemClasses() {
                let classes = ['csc-destination'];
                if (!this.isMobile) {
                    classes.push('csc-own-phone');
                }
                return classes;
            },
            toggleTimeoutLabel() {
                let mode = this.ownPhone
                    ? this.$t('pages.callForward.disable')
                    : this.$t('pages.callForward.enable');
                return this.$t('pages.callForward.toggleTimeout', {
                    mode: mode
                });
            }
        },
        methods: {
            showModal() {
                this.timeout = null,
                this.isEditing = true;
            },
            hideModal() {
                this.isEditing = false;
            },
            resetTimeout() {
                this.$store.dispatch('callForward/updateOwnPhoneTimeout', {
                    timeout: 15
                });
            },
            updateTimeout() {
                this.$store.dispatch('callForward/updateOwnPhoneTimeout', {
                    timeout: this.timeout
                });
            },
            toggle() {
                this.$store.dispatch('callForward/updateOwnPhone', {
                    toggle: !this.ownPhone,
                    sourcesetId: this.sourcesetId,
                    timesetId: this.timesetId
                });
            },
            previousDestinationsetId(index) {
                let destinationset = this.group[index-1] || {};
                return destinationset.id || null;
            },
            nextDestinationsetId(index) {
                let destinationset = this.group[index+1] || {};
                return destinationset.id || null;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'
    .csc-destination
        position relative

    .dest-section
        padding-top 30px
        padding-bottom 30px

    .dest-title
        font-size 16px
        color $white

    .dest-icon
        margin-right 5px
        color $white

    .q-item.csc-no-destination
        margin-left 0px
        padding 0

    #timeout-modal
        .modal-content
            min-width 40vw
            padding 20px 15px

        .title
            color $white
            line-height $csc-subtitle-line-height
            font-size $csc-subtitle-font-size
            font-weight $csc-subtitle-font-weight

    .q-item-highlight.csc-own-phone:hover
        background-color $item-highlight-color

    .q-tab-pane
        .csc-dest-separator
            margin 0

        .csc-own-phone.q-item
            max-height 37px

        .q-item-side
            padding-bottom 9px

        .dest-btns
            padding-top 8px

    .dest-row
        color $white
        white-space nowrap
        overflow hidden
        font-size 16px

        .dest-values
            font-weight bold
            color $white

    .dest-row.mobile
        padding 16px
        padding-left 0
        .dest-values > span
            font-weight bold

    .dest-row.mobile .dest-sublabel span
        font-weight 300

</style>
