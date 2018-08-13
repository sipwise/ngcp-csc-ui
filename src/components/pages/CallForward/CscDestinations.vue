<template>
    <div class="dest-section">
        <div class="dest-title">
            <q-icon :name="icon" class="dest-icon" size="24px" />
            {{ title }}
        </div>
        <q-list no-border>
            <q-item
                highlight
                separator
            >
                <q-item-side>
                    <q-field
                        v-if="showOwnPhone && group.length > 0"
                        class="csc-destination"
                        :disabled="loading"
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
                    <q-item-tile label>
                        {{ ownPhoneLabel }}
                    </q-item-tile>
                </q-item-main>
                <q-item-side
                    v-if="ownPhone"
                    class="dest-btns"
                    icon="more_vert"
                    right
                >
                    <q-popover ref="popover">
                        <q-list link>
                            <q-item @click="showModal();$refs.popover.close()">
                                <q-item-main :label="$t('pages.callForward.editTimeout')" />
                                <q-item-side icon="fa-edit" color="secondary"></q-item-side>
                            </q-item>
                        </q-list>
                    </q-popover>
                </q-item-side>
            </q-item>
            <q-item v-if="group.length === 0" class="dest-row csc-no-destination">
                <span> {{ $t('pages.callForward.forwardToNowhere') }} </span>
            </q-item>
            <div v-else :key="index" v-for="(destinationset, index) in group">
                <csc-destination v-bind="destinationset"
                    :prev-dest-id="previousDestinationsetId(index)"
                    :next-dest-id="nextDestinationsetId(index)"
                />
            </div>
        </q-list>
        <q-modal v-model="isEditing" :minimized="!isMobile" :maximized="isMobile" id="timeout-modal">
            <div class="title">
                {{ $t('pages.callForward.editTimeout') }}
            </div>
            <q-field>
                <!--TODO: Proper validation, and check limit-->
                <q-input
                    v-if="ownPhone"
                    v-model="editTimeout"
                    type="number"
                    :min="0"
                    :max="600"
                    suffix="seconds"
                    :before="[{ icon: 'schedule' }]"
                    :float-label="$t('pages.callForward.timeout')"
                />
            </q-field>
            <q-btn flat dark @click="hideModal">{{ $t('buttons.cancel') }}</q-btn>
            <q-btn flat color="negative" @click="resetTimeout">{{ $t('buttons.reset') }}</q-btn>
            <q-btn flat color="primary" @click="updateTimeout" icon-right="fa-save">{{ $t('buttons.save') }}</q-btn>
        </q-modal>
        <csc-add-destination-form v-bind="lastDestinationset" :sourcesetId="sourceset" />
    </div>
</template>

<script>
    import _ from 'lodash'
    import CscDestination from './CscDestination'
    import CscAddDestinationForm from './CscAddDestinationForm'
    import {
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
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
            QPopover,
            QIcon,
            QField,
            QToggle,
            QInput,
            QModal,
            QBtn
        },
        computed: {
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
            ownPhoneLabel() {
                if(this.ownPhone) {
                    return this.$t('pages.callForward.ownPhoneEnabled');
                }
                else {
                    return this.$t('pages.callForward.ownPhoneDisabled');
                }
            },
            lastDestinationset() {
                let destinationset = _.findLast(this.group) || {};
                destinationset.groupName = this.groupName;
                destinationset.priority = destinationset.lowestPriority || 1;
                destinationset.timeset = this.timeset;
                return destinationset;
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
                console.log('resetTimeout()');
            },
            updateTimeout() {
                console.log('updateTimeout()');
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
        color $secondary
        font-size 16px

    .dest-icon
        margin-right 5px

    .q-item.csc-no-destination
        margin-left 0px
        padding 0

    #timeout-modal

        .modal-content
            min-width 40vw
            padding 20px 15px

        .title
            color $primary
            line-height $csc-subtitle-line-height
            font-size $csc-subtitle-font-size
            font-weight $csc-subtitle-font-weight
</style>
