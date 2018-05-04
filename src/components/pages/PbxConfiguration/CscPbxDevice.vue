<template>
    <q-card class="csc-entity csc-pbx-device shadow-1">
        <q-card-title>
            <q-icon name="fa-fax" color="secondary" size="24px"/>
            <span class="csc-entity-title-text">{{ device.station_name }}</span>
            <q-btn :icon="titleIcon" :small="isMobile" color="primary" slot="right" flat @click="toggleMain()" />
        </q-card-title>
        <q-card-main v-if="expanded">
            <q-field :label="$t('pbxConfig.deviceStationName')">
                <q-input v-model="device.station_name" readonly />
            </q-field>
            <q-field :label="$t('pbxConfig.deviceIdentifier')">
                <q-input v-model="device.identifier" readonly />
            </q-field>
            <q-field :label="$t('pbxConfig.deviceModel')">
                <!--<q-select v-model="device.model.id" :options="modelOptions" clearable disable />-->
                <p>{{ name }}</p>
                <div class="csc-pbx-device-image">
                    <img v-show="hasFrontImage" ref="modelImage" :src="frontImageUrl" />
                </div>
            </q-field>
        </q-card-main>
        <q-inner-loading :visible="loading">
            <q-spinner-mat size="60px" color="primary"></q-spinner-mat>
        </q-inner-loading>
    </q-card>
</template>

<script>

    import _ from 'lodash'
    import { QCard, QCardTitle, QCardMain, QCollapsible,
        QIcon, QField, QInput, QSelect, QBtn, QInnerLoading, QSpinnerMat } from 'quasar-framework'
    export default {
        name: 'csc-pbx-device',
        props: [
            'device',
            'loading',
            'modelOptions'
        ],
        components: {
            QCard, QCardTitle, QCardMain, QCollapsible,
            QIcon, QField, QInput, QSelect, QBtn, QInnerLoading, QSpinnerMat
        },
        data () {
            return {
                expanded: false
            }
        },
        computed: {
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
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common'

    .csc-pbx-device-image
        width 100%
        img
            width 100%
</style>
