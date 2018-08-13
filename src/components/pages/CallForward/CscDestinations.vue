<template>
    <div class="dest-section">
        <div class="dest-title">
            <q-icon :name="icon" class="dest-icon" size="24px" />
            {{ title }}
        </div>
        <q-list no-border>
            <q-field
                v-if="showOwnPhone"
                class="csc-destination"
                :disabled="loading"
            >
                <q-toggle
                    :label="ownPhoneLabel"
                    :value="ownPhone"
                    @input="toggle()"
                    checked-icon="phone_in_talk"
                    unchecked-icon="phone_in_talk"
                />
            </q-field>
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
        QIcon,
        QField,
        QToggle
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
            'loading'
        ],
        components: {
            CscDestination,
            CscAddDestinationForm,
            QList,
            QItem,
            QIcon,
            QField,
            QToggle
        },
        computed: {
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
</style>
