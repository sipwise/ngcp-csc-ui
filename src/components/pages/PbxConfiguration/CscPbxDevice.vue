<template>
    <q-item class="csc-entity csc-pbx-device">
        <q-item-side v-if="!expanded">
            <q-item-tile avatar>
                <img :src="frontImageUrl" />
            </q-item-tile>
        </q-item-side>
        <q-item-main>
            <q-item-tile v-if="!expanded" label>{{ device.station_name }}</q-item-tile>
            <q-item-tile v-if="!expanded" sublabel><span class="gt-sm">Model: </span>{{ name }}</q-item-tile>
            <q-item-tile v-if="!expanded" sublabel><span class="gt-sm">MAC address: </span>{{ device.identifier }}</q-item-tile>
            <q-item-tile v-if="expanded" class="csc-pbx-device-content">
                <q-field :label="$t('pbxConfig.deviceStationName')">
                    <q-input v-model="device.station_name" readonly />
                </q-field>
                <q-field :label="$t('pbxConfig.deviceIdentifier')">
                    <q-input v-model="device.identifier" readonly />
                </q-field>
                <q-field :label="$t('pbxConfig.deviceModel')">
                    <p>{{ name }}</p>
                </q-field>
                <csc-pbx-device-config :device="device" />
            </q-item-tile>
        </q-item-main>
        <q-item-side right>
            <q-item-tile>
                <q-btn :icon="titleIcon" :big="isMobile" color="primary" slot="right" flat @click="toggleMain()" />
                <q-btn icon="delete" :big="isMobile" color="negative" slot="right" flat @click="remove()" />
            </q-item-tile>
        </q-item-side>
        <q-inner-loading :visible="loading">
            <q-spinner-mat size="60px" color="primary"></q-spinner-mat>
        </q-inner-loading>
    </q-item>
</template>


<script>

    import _ from 'lodash'
    import { QCard, QCardTitle, QCardMain, QCollapsible,
        QIcon, QField, QInput, QSelect, QBtn, QInnerLoading, QSpinnerMat, QCardMedia,
        QItem, QItemMain, QItemSide, QItemTile, Platform } from 'quasar-framework'
    import CscPbxDeviceConfig from './CscPbxDeviceConfig'
    export default {
        name: 'csc-pbx-device',
        props: [
            'device',
            'loading',
            'modelOptions'
        ],
        components: {
            CscPbxDeviceConfig, QCard, QCardTitle, QCardMain, QCollapsible,
            QIcon, QField, QInput, QSelect, QBtn, QInnerLoading, QSpinnerMat, QCardMedia,
            QItem, QItemMain, QItemSide, QItemTile, Platform
        },
        data () {
            return {
                expanded: false,
                modalOpened: false
            }
        },
        computed: {
            isMobile() {
                return Platform.is.mobile;
            },
            titleIcon() {
                if(!this.expanded) {
                    return 'keyboard arrow down';
                }
                else {
                    return 'keyboard arrow up';
                }
            },
            frontImageUrl() {
                return _.get(this.device, 'profile.modelFrontImageUrl');
            },
            hasFrontImage() {
                return _.isString(this.frontImageUrl);
            },
            name() {
                return _.get(this.device, 'profile.name', '...');
            }
        },
        mounted() {
            this.$emit('loaded');
        },
        methods: {
            toggleMain() {
                this.expanded = !this.expanded;
            },
            remove() {
                this.$emit('remove', this.device);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common'

    .csc-pbx-device

        .csc-pbx-device-content
            padding-top: 32px;

        .q-item-side.q-item-side-right
            position absolute
            right 10px

        .q-item-avatar
            img
                border-radius 0

        .q-item-label
            font-size 18px
            font-weight 400
            letter-spacing normal
            line-height 1.8rem
</style>
