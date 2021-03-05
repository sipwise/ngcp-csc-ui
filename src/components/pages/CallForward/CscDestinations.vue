<template>
    <div>
        <q-list
            class="q-mb-sm"
            separator
        >
            <q-item
                class="q-pt-sm q-pb-sm q-pl-sm q-pr-none"
            >
                <q-item-section
                    side
                >
                    <q-icon
                        :name="icon"
                        size="24px"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label
                        class="text-uppercase"
                        overline
                    >
                        {{ title }}
                    </q-item-label>
                </q-item-section>
            </q-item>
            <q-item
                v-if="showOwnPhone && group.length > 0"
                class="q-pt-sm q-pb-sm q-pl-md q-pr-md csc-item-odd"
            >
                <q-item-section>
                    <q-item-label
                        v-if="ownPhone"
                        overline
                        class="text-uppercase"
                    >
                        {{ $t('first ring') }} {{ $t('own phone') }}
                    </q-item-label>
                    <q-item-label
                        v-if="ownPhone"
                        class="text-subtitle2"
                    >
                        {{ $t('for') }} {{ ownPhoneTimeout || 0 }} {{ $t('secs') }}
                    </q-item-label>
                    <q-item-label
                        v-if="!ownPhone"
                        overline
                        class="text-uppercase"
                    >
                        {{ $t('do not ring own phone') }}
                    </q-item-label>
                    <!--                    <div-->
                    <!--                        v-if="!isMobile"-->
                    <!--                    >-->
                    <!--                        <span v-if="ownPhone">-->
                    <!--                            <span>-->
                    <!--                                {{ $t('first ring') }}-->
                    <!--                            </span>-->
                    <!--                            <span>-->
                    <!--                                {{ $t('own phone') }}-->
                    <!--                            </span>-->
                    <!--                            <span>-->
                    <!--                                {{ $t('for') }}-->
                    <!--                            </span>-->
                    <!--                            <span>-->
                    <!--                                {{ ownPhoneTimeout || 0 }}-->
                    <!--                            </span>-->
                    <!--                            <span>-->
                    <!--                                {{ $t('secs') }}-->
                    <!--                            </span>-->
                    <!--                        </span>-->
                    <!--                        <span v-else>-->
                    <!--                            {{ $t('do not ring own phone') }}-->
                    <!--                        </span>-->
                    <!--                    </div>-->

                    <!--                    <div-->
                    <!--                        v-if="isMobile"-->
                    <!--                    >-->
                    <!--                        <div-->
                    <!--                            v-if="ownPhone"-->
                    <!--                        >-->
                    <!--                            {{ $t('own phone') }}-->
                    <!--                        </div>-->
                    <!--                        <div-->
                    <!--                            v-else-->
                    <!--                        >-->
                    <!--                            {{ $t('do not ring own phone') }}-->
                    <!--                        </div>-->
                    <!--                        <div-->
                    <!--                            v-if="ownPhone"-->
                    <!--                        >-->
                    <!--                            <span v-if="ownPhone">-->
                    <!--                                <span>-->
                    <!--                                    {{ $t('first ring') }}-->
                    <!--                                </span>-->
                    <!--                                <span>-->
                    <!--                                    {{ $t('for') }}-->
                    <!--                                </span>-->
                    <!--                                <span class="dest-values">-->
                    <!--                                    {{ ownPhoneTimeout || 0 }}-->
                    <!--                                </span>-->
                    <!--                                <span>-->
                    <!--                                    {{ $t('secs') }}-->
                    <!--                                </span>-->
                    <!--                            </span>-->
                    <!--                            <span v-else>-->
                    <!--                                {{ $t('do not ring own phone') }}-->
                    <!--                            </span>-->
                    <!--                        </div>-->
                    <!--                    </div>-->
                </q-item-section>

                <q-item-section
                    side
                >
                    <q-toggle
                        :value="ownPhone"
                        checked-icon="phone_in_talk"
                        unchecked-icon="phone_in_talk"
                        :disable="loading"
                        @input="toggle()"
                    />
                </q-item-section>
                <q-item-section
                    v-if="ownPhone || isMobile"
                    side
                >
                    <csc-more-menu>
                        <csc-popup-menu-item
                            v-if="isMobile"
                            :icon="toggleIcon"
                            :label="toggleTimeoutLabel"
                            @click="toggle()"
                        />
                        <csc-popup-menu-item
                            icon="edit"
                            :label="$t('Edit timeout')"
                            @click="showModal()"
                        />
                    </csc-more-menu>
                    <!--                    <q-menu-->
                    <!--                        ref="popover"-->
                    <!--                    >-->
                    <!--                        <q-list-->
                    <!--                            link-->
                    <!--                            no-border-->
                    <!--                            highlight-->
                    <!--                        >-->
                    <!--                            <q-item-->
                    <!--                                v-if="isMobile"-->
                    <!--                                @click="toggle();$refs.popover.close()"-->
                    <!--                            >-->
                    <!--                                <q-item-main-->
                    <!--                                    :label="toggleTimeoutLabel"-->
                    <!--                                />-->
                    <!--                                <q-item-side-->
                    <!--                                    :icon="toggleIcon"-->
                    <!--                                    color="secondary"-->
                    <!--                                />-->
                    <!--                            </q-item>-->
                    <!--                            <q-item @click="showModal();$refs.popover.close()">-->
                    <!--                                <q-item-main :label="$t('Edit timeout')" />-->
                    <!--                                <q-item-side-->
                    <!--                                    icon="fa-edit"-->
                    <!--                                    color="secondary"-->
                    <!--                                />-->
                    <!--                            </q-item>-->
                    <!--                        </q-list>-->
                    <!--                    </q-menu>-->
                </q-item-section>
            </q-item>
            <q-item
                v-if="group.length === 0"
                class="q-pt-sm q-pb-sm q-pl-sm q-pr-none csc-item-odd"
            >
                <q-item-section>
                    <q-item-label
                        class="text-uppercase"
                        overline
                    >
                        {{ $t('forward to nowhere') }}
                    </q-item-label>
                </q-item-section>
            </q-item>
            <template
                v-for="(destinationSet, destinationSetIndex) in group"
                v-else
            >
                <csc-destination
                    v-for="(destination, destinationIndex) in destinationSet.destinations"
                    :key="destinationSetIndex + '-' + destinationIndex"
                    :destination-set-id="destinationSet.id"
                    :destination-object="destination"
                    :destinations="destinationSet.destinations"
                    :index="destinationIndex"
                    :prev-dest-id="previousDestinationsetId(destinationSetIndex)"
                    :next-dest-id="nextDestinationsetId(destinationSetIndex)"
                    :own-phone="ownPhone"
                    :show-own-phone="showOwnPhone"
                    :timeset-name="timeset"
                />
            </template>
        </q-list>
        <q-dialog
            id="timeout-modal"
            v-model="isEditing"
            :minimized="!isMobile"
            :maximized="isMobile"
        >
            <q-card>
                <q-card-section>
                    <div class="title">
                        {{ $t('Edit timeout') }}
                    </div>
                </q-card-section>
                <q-card-section>
                    <q-input
                        v-if="ownPhone"
                        v-model="editTimeout"
                        :suffix="$t('seconds')"
                        :label="$t('Timeout')"
                        :error="$v.editTimeout.$error"
                        :error-message="errorMessage"
                        @input="$v.editTimeout.$touch"
                        @blur="$v.editTimeout.$touch"
                    />
                </q-card-section>
                <q-card-actions>
                    <q-btn
                        flat
                        icon="clear"
                        color="default"
                        @click="hideModal"
                    >
                        {{ $t('Cancel') }}
                    </q-btn>
                    <q-btn
                        flat
                        icon="undo"
                        color="negative"
                        @click="resetTimeout"
                    >
                        {{ $t('Reset') }}
                    </q-btn>
                    <q-btn
                        flat
                        icon="check"
                        color="primary"
                        :disable="$v.editTimeout.$error"
                        @click="updateTimeout"
                    >
                        {{ $t('Save') }}
                    </q-btn>
                </q-card-actions>
            </q-card>
        </q-dialog>
        <csc-add-destination-form
            v-bind="lastDestinationset"
            :sourceset-id="sourceset"
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
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
export default {
    name: 'CscDestinations',
    components: {
        CscPopupMenuItem,
        CscMoreMenu,
        CscDestination,
        CscAddDestinationForm
    },
    props: {
        title: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        },
        group: {
            type: Array,
            default: () => []
        },
        groupName: {
            type: String,
            default: ''
        },
        timeset: {
            type: String,
            default: null
        },
        sourceset: {
            type: Number,
            default: null
        },
        showOwnPhone: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        ownPhoneTimeout: {
            type: String,
            default: '0'
        }
    },
    data () {
        return {
            timeout: null,
            isEditing: false,
            isMobile: this.$q.platform.is.mobile
        }
    },
    validations: {
        editTimeout: {
            required,
            minValue: minValue(1),
            numeric
        }
    },
    computed: {
        toggleIcon () {
            return this.ownPhone ? 'fa-toggle-off' : 'fa-toggle-on'
        },
        errorMessage () {
            if (!this.$v.editTimeout.required) {
                return this.$t('{field} is required', {
                    field: this.$t('Timeout')
                })
            } else if (!this.$v.editTimeout.numeric) {
                return this.$t('{field} must consist of numeric characters only', {
                    field: this.$t('Timeout')
                })
            } else if (!this.$v.editTimeout.minValue) {
                return this.$t('{field} must be at least {minValue} second', {
                    field: this.$t('Timeout'),
                    minValue: this.$v.editTimeout.$params.minValue.min
                })
            } else {
                return ''
            }
        },
        editTimeout: {
            get () {
                if (this.ownPhoneTimeout && !this.timeout) {
                    return this.ownPhoneTimeout
                } else {
                    return this.timeout
                }
            },
            set (value) {
                this.timeout = value
            }
        },
        ownPhone () {
            if (this.group.length > 0) {
                return this.group[0].ownPhone
            } else {
                return false
            }
        },
        timesetId () {
            if (this.group.length > 0) {
                return this.group[0].timesetId
            } else {
                return null
            }
        },
        sourcesetId () {
            return this.sourceset
        },
        lastDestinationset () {
            const destinationset = _.cloneDeep(_.findLast(this.group)) || {}
            destinationset.groupName = this.groupName
            destinationset.priority = destinationset.lowestPriority || 1
            destinationset.timeset = this.timeset
            return destinationset
        },
        toggleTimeoutLabel () {
            const mode = this.ownPhone
                ? this.$t('Disable')
                : this.$t('Enable')
            return this.$t('{mode} own phone', {
                mode: mode
            })
        }
    },
    methods: {
        showModal () {
            this.timeout = null
            this.isEditing = true
        },
        hideModal () {
            this.isEditing = false
        },
        resetTimeout () {
            this.$store.dispatch('callForward/updateOwnPhoneTimeout', {
                timeout: 15
            })
        },
        updateTimeout () {
            this.$store.dispatch('callForward/updateOwnPhoneTimeout', {
                timeout: this.timeout
            })
        },
        toggle () {
            this.$store.dispatch('callForward/updateOwnPhone', {
                toggle: !this.ownPhone,
                sourcesetId: this.sourcesetId,
                timesetId: this.timesetId,
                timeset: this.timeset
            })
        },
        previousDestinationsetId (index) {
            const destinationset = this.group[index - 1] || {}
            return destinationset.id || null
        },
        nextDestinationsetId (index) {
            const destinationset = this.group[index + 1] || {}
            return destinationset.id || null
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
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
