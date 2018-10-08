<template>
    <q-item :class="itemClasses">
        <q-item-side v-if="!expanded">
            <q-item-tile avatar>
                <img :src="frontImageUrl" />
            </q-item-tile>
        </q-item-side>
        <q-item-main :style="{zIndex: 10}">
            <q-item-tile
                class="csc-device-title"
                v-if="!expanded"
                label
            >
                {{ device.station_name }}
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                sublabel
            >
                <span class="gt-sm">
                    Model:
                </span>
                {{ name }}
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                sublabel
            >
                <span class="gt-sm">
                    MAC address:
                </span>
                {{ device.identifier }}
            </q-item-tile>
            <q-item-tile
                v-if="expanded"
                class="csc-pbx-device-content"
                >
                <q-field :label="$t('pbxConfig.deviceStationName')">
                    <q-input
                        v-model="changes.stationName"
                        :after="stationNameButtons"
                        @keyup.enter="saveStationName"
                    />
                </q-field>
                <q-field
                    :label="$t('pbxConfig.deviceIdentifier')"
                >
                    <q-input
                        v-model="device.identifier"
                        :after="identifierButtons"
                        @keyup.enter="saveIdentifier"
                    />
                </q-field>
                <q-field
                    :label="$t('pbxConfig.deviceModel')"
                >
                    <csc-pbx-model-select
                        :selected-id="profileId"
                        :preview="false"
                        :erasable="false"
                        :readonly="true"
                        :profiles="profiles"
                        :modelImages="modelImages"
                        @opened="modelSelectOpened()"
                        @select="selectProfile"
                    />
                </q-field>

                <csc-pbx-device-config
                    :device="device"
                    :groupsAndSeatsOptions="groupsAndSeatsOptions"
                    :loading="loading"
                    @loadGroupsAndSeats="loadGroupsAndSeats()"
                    @keysChanged="keysChanged"
                    :subscribers="subscribers"
                />

            </q-item-tile>
        </q-item-main>
        <q-item-side
            right
            class="csc-item-buttons"
            :style="{zIndex: 11}"
        >
            <q-item-tile>
                <q-btn
                    :icon="titleIcon"
                    :big="isMobile"
                    color="primary"
                    slot="right"
                    flat
                    @click="toggleMain()"
                />
                <q-btn
                    icon="delete"
                    :big="isMobile"
                    color="negative"
                    slot="right"
                    flat
                    @click="remove()"
                />
            </q-item-tile>
        </q-item-side>
        <q-inner-loading
            v-if="loading"
            :visible="loading"
            :style="{zIndex: 12}"
        >
            <q-spinner-mat
                size="60px"
                color="primary"
            />
        </q-inner-loading>
    </q-item>
</template>


<script>

    import _ from 'lodash'
    import {
        QCard,
        QCardTitle,
        QCardMain,
        QCollapsible,
        QIcon,
        QField,
        QInput,
        QSelect,
        QBtn,
        QInnerLoading,
        QSpinnerMat,
        QCardMedia,
        QItem,
        QItemMain,
        QItemSide,
        QItemTile,
        Platform
    } from 'quasar-framework'
    import CscPbxDeviceConfig from './CscPbxDeviceConfig'
    import CscPbxModelSelect from './CscPbxModelSelect'

    export default {
        name: 'csc-pbx-device',
        props: [
            'device',
            'loading',
            'modelOptions',
            'groupsAndSeatsOptions',
            'subscribers',
            'profiles',
            'modelImages'
        ],
        components: {
            CscPbxDeviceConfig,
            CscPbxModelSelect,
            QCard,
            QCardTitle,
            QCardMain,
            QCollapsible,
            QIcon,
            QField,
            QInput,
            QSelect,
            QBtn,
            QInnerLoading,
            QSpinnerMat,
            QCardMedia,
            QItem,
            QItemMain,
            QItemSide,
            QItemTile,
            Platform
        },
        data () {
            return {
                expanded: false,
                modalOpened: false,
                changes: this.getDevice()
            }
        },
        computed: {
            itemClasses() {
                let classes = ['csc-entity', 'csc-pbx-device'];
                if (this.expanded) {
                    classes.push('csc-item-expanded');
                }
                return classes;
            },
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
            },
            stationNameButtons() {
                let buttons = [];
                let self = this;
                if(this.stationNameHasChanges) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveStationName();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetStationName();
                            }
                        }
                    );
                }
                return buttons;
            },
            stationName() {
                return this.device.station_name;
            },
            deviceModel() {
                return {
                    id: this.changes.id,
                    station_name: this.changes.stationName,
                    identifier: this.device.identifier
                }
            },
            stationNameHasChanges() {
                return this.stationName !== this.changes.stationName;
            },
            identifierHasChanges() {
                return this.device.identifier !== this.changes.identifier;
            },
            identifierButtons() {
                let buttons = [];
                let self = this;
                if(this.identifierHasChanges) {
                    buttons.push({
                            icon: 'check',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.saveIdentifier();
                            }
                        }, {
                            icon: 'clear',
                            error: false,
                            handler (event) {
                                event.stopPropagation();
                                self.resetIdentifier();
                            }
                        }
                    );
                }
                return buttons;
            },
            profileId() {
                return _.get(this.device, 'profile.id', null);
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
            },
            loadGroupsAndSeats(){
                this.$emit('loadGroupsAndSeats');
            },
            keysChanged(keys) {
                this.$emit('deviceKeysChanged', {
                    device: this.device,
                    keys: keys
                });
            },
            getDevice() {
                return {
                    id: this.device.id,
                    stationName: this.device.station_name,
                    identifier: this.device.identifier
                }
            },
            resetStationName() {
                this.changes.stationName = this.device.station_name;
            },
            saveStationName() {
                this.$emit('save-station-name', this.deviceModel);
            },
            resetIdentifier() {
                this.changes.identifier = this.device.identifier;
            },
            saveIdentifier() {
                this.$emit('save-identifier', this.deviceModel);
            },
            selectProfile(profile) {
                this.$emit('update-profile', {
                    profile: profile,
                    device: this.device
                });
            },
            modelSelectOpened() {}
        },
        watch: {
            device() {
                this.changes = this.getDevice();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';

    .csc-pbx-device

        .csc-pbx-device-content
            padding-top 32px

        .q-item-side.q-item-side-right
            position absolute
            right 10px

        .q-item-avatar
            overflow hidden
            border-radius 0
            img
                border-radius 0
                height auto

        .q-item-label
            font-size 18px
            font-weight 400
            letter-spacing normal
            line-height 1.8rem

    .csc-item-buttons
        .q-btn
            padding-left 8px
            padding-right 8px

    .csc-pbx-device-buttons
        margin-top 32px

    .csc-device-title
        text-overflow ellipsis
        white-space nowrap
        width 100%
        overflow hidden
        padding-right 80px

</style>
