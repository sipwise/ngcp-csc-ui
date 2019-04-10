<template>
    <q-item :class="itemClasses">
        <q-item-side
            v-if="!expanded"
        >
            <q-item-tile
                v-if="hasFrontImage"
                avatar
            >
                <img :src="frontImageUrl" />
            </q-item-tile>
            <q-icon
                v-else
                size="24px"
                name="fa-fax"
                color="white"
            />
        </q-item-side>
        <q-item-main :style="{zIndex: 10}">
            <q-item-tile
                v-if="!expanded"
                class="csc-item-title"
                label
            >
                {{ device.station_name }}
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <span class="csc-item-label">Model:</span>
                <span class="csc-item-value">{{ name }}</span>
            </q-item-tile>
            <q-item-tile
                v-if="!expanded"
                class="csc-item-subtitle"
                sublabel
            >
                <span class="csc-item-label">MAC address:</span>
                <span class="csc-item-value">{{ device.identifier }}</span>
            </q-item-tile>
            <q-item-tile
                v-if="expanded"
                class="csc-pbx-device-content"
                >
                <q-field :label="$t('pbxConfig.deviceStationName')">
                    <q-input
                        dark
                        v-model="changes.stationName"
                        :after="stationNameButtons"
                        @keyup.enter="saveStationName"
                    />
                </q-field>
                <q-field
                    :label="$t('pbxConfig.deviceIdentifier')"
                    :error-label="identifierErrorMessage"
                >
                    <q-input
                        dark
                        v-model="changes.identifier"
                        :after="identifierButtons"
                        @keyup.enter="saveIdentifier"
                        @input="$v.changes.identifier.$touch"
                        @blur="$v.changes.identifier.$touch"
                        :error="$v.changes.identifier.$error"
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
            :style="{zIndex: 11}"
            class="csc-list-actions-pinned"
        >
            <q-item-tile>
                <q-btn
                    v-if="expanded"
                    icon="delete"
                    :big="isMobile"
                    color="negative"
                    flat
                    @click="remove()"
                />
                <q-btn
                    :icon="titleIcon"
                    :big="isMobile"
                    color="primary"
                    flat
                    @click="toggleMain()"
                />
            </q-item-tile>
        </q-item-side>
        <csc-object-spinner
            v-if="loading"
            :loading="loading"
        />
    </q-item>
</template>


<script>
    import {
        showGlobalError
    } from '../../../helpers/ui'
    import {
        required
    } from 'vuelidate/lib/validators'
    import {
        customMacAddress
    } from '../../../helpers/validation'
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
    import CscObjectSpinner from "../../CscObjectSpinner";
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
            CscObjectSpinner,
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
        validations: {
            changes: {
                identifier: {
                    required,
                    customMacAddress
                }
            }
        },
        computed: {
            itemClasses() {
                let classes = ['csc-pbx-device', 'csc-list-item'];
                if (this.expanded) {
                    classes.push('csc-item-expanded');
                }
                else {
                    classes.push('csc-item-collapsed');
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
            identifier() {
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
                if (this.identifierHasChanges && this.$v.changes.identifier.$error) {
                    buttons.push({
                            icon: 'clear',
                            error: true,
                            handler (event) {
                                event.stopPropagation();
                                self.resetIdentifier();
                            }
                        }
                    );
                }
                else if (this.identifierHasChanges) {
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
            },
            identifierErrorMessage() {
                if (!this.$v.changes.identifier.required) {
                    return this.$t('validationErrors.fieldRequired', {
                        field: this.$t('pbxConfig.deviceIdentifier')
                    });
                }
                else if (!this.$v.changes.identifier.customMacAddress) {
                    return this.$t('validationErrors.macAddress');
                }
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
                if (!this.$v.changes.identifier.$error) {
                    this.$emit('save-identifier', this.deviceModel);
                }
                else {
                   showGlobalError(this.$t('validationErrors.macAddress'));
                }
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
    .csc-device-title
        text-overflow ellipsis
        white-space nowrap
</style>
