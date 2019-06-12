<template>
    <csc-list-item
        icon="fa-fax"
        :image="imageUrl"
        :odd="odd"
        :expanded="expanded"
        :loading="loading"
        @toggle="toggle"
    >
        <template
            slot="title"
        >
            <csc-list-item-title
            >
                {{ device.station_name }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    {{ $t('pbxConfig.deviceIdentifier')}}: {{ device.identifier }}
                </csc-list-item-subtitle>
            </q-slide-transition>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    {{ $t('pbxConfig.deviceModel')}}: {{ profile.name }}
                </csc-list-item-subtitle>
            </q-slide-transition>
        </template>
        <template slot="menu">
            <csc-list-menu-item
                icon="delete"
                icon-color="negative"
                @click="deleteDevice"
            >
                {{ $t('buttons.remove') }}
            </csc-list-menu-item>
        </template>
        <template
            slot="body"
        >
            <q-field
                :label="$t('pbxConfig.deviceStationName')"
            >
                <q-input
                    dark
                    v-model="changes.stationName"
                    @keyup.enter=""
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasStationNameChanged"
                        @click="saveStationName"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasStationNameChanged"
                        @click="resetStationName"
                    />
                </csc-fade>
            </q-field>
            <q-field
                :label="$t('pbxConfig.deviceIdentifier')"
            >
                <q-input
                    dark
                    v-model="changes.identifier"
                    @keyup.enter=""
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasIdentifierChanged"
                        @click="saveIdentifier"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasIdentifierChanged"
                        @click="resetIdentifier"
                    />
                </csc-fade>
            </q-field>
            <q-field
                :label="$t('pbxConfig.deviceModel')"
            >
                <csc-pbx-model-select
                    class="col-12"
                    :profile="changes.profile"
                    :profiles="profiles"
                    :profile-map="profileMap"
                    :model-image-map="modelImageMap"
                    :has-reset-button="false"
                    @opened="$emit('model-select-opened')"
                    @selected="selectedDeviceProfile"
                />
                <csc-fade>
                    <csc-form-save-button
                        v-if="hasProfileChanged"
                        @click="saveProfile"
                    />
                </csc-fade>
                <csc-fade>
                    <csc-form-reset-button
                        v-if="hasProfileChanged"
                        @click="resetProfile"
                    />
                </csc-fade>
            </q-field>
            <csc-pbx-device-config
                v-if="modelImage"
                :device="device"
                :profile="profile"
                :model="model"
                :model-image="modelImage"
                :loading="subscribersLoading"
                :subscribers="subscribers"
                :subscriber-map="subscriberMap"
                :subscriber-options="subscriberOptions"
                @keysChanged="saveKeys"
            />
        </template>
    </csc-list-item>
</template>

<script>
    import CscPbxModelSelect from '../PbxConfiguration/CscPbxModelSelect'
    import CscPbxDeviceConfig from '../PbxConfiguration/CscPbxDeviceConfig'
    import CscListItem from "../../CscListItem"
    import CscListItemTitle from "../../CscListItemTitle"
    import CscListItemSubtitle from "../../CscListItemSubtitle"
    import CscFade from "../../transitions/CscFade"
    import CscFormSaveButton from "../../form/CscFormSaveButton"
    import CscFormResetButton from "../../form/CscFormResetButton"
    import {
        QSlideTransition,
        QField,
        QInput
    } from 'quasar-framework'
    import CscListMenuItem from "../../CscListMenuItem";
    export default {
        name: 'csc-pbx-device',
        components: {
            CscListMenuItem,
            CscListItem,
            CscListItemTitle,
            CscListItemSubtitle,
            QSlideTransition,
            QField,
            QInput,
            CscFade,
            CscFormSaveButton,
            CscFormResetButton,
            CscPbxModelSelect,
            CscPbxDeviceConfig
        },
        mounted(){
            this.$emit('load-model');
        },
        props:[
            'odd',
            'expanded',
            'loading',
            'device',
            'profile',
            'profiles',
            'profileMap',
            'model',
            'modelImage',
            'modelImageMap',
            'loading',
            'subscribers',
            'subscribersLoading',
            'subscriberOptions',
            'subscriberMap'
        ],
        data () {
            return {
                changes: this.getData()
            }
        },
        computed: {
            imageUrl() {
                if(this.modelImage && this.modelImage.url) {
                    return this.modelImage.url;
                }
                return null;
            },
            hasStationNameChanged() {
                return this.changes.stationName !== this.device.station_name;
            },
            hasIdentifierChanged() {
                return this.changes.identifier !== this.device.identifier;
            },
            hasProfileChanged() {
                return this.changes.profile !== this.device.profile_id;
            },
        },
        methods: {
            getData() {
                return {
                    stationName: this.device.station_name,
                    identifier: this.device.identifier,
                    profile: this.device.profile_id
                }
            },
            toggle() {
                if(this.expanded) {
                    this.$emit('collapse');
                }
                else {
                    this.$emit('expand');
                }
            },
            saveStationName() {
                this.$emit('save-station-name', {
                    deviceId: this.device.id,
                    stationName: this.changes.stationName
                });
            },
            resetStationName() {
                this.changes.stationName = this.device.station_name;
            },
            saveIdentifier(){
                this.$emit('save-identifier', {
                    deviceId: this.device.id,
                    identifier: this.changes.identifier
                });
            },
            resetIdentifier() {
                this.changes.identifier = this.device.identifier;
            },
            saveProfile() {
                this.$emit('save-profile', {
                    deviceId: this.device.id,
                    profileId: this.changes.profile
                });
            },
            resetProfile() {
                this.changes.profile = this.device.profile_id;
            },
            saveKeys(keys) {
                this.$emit('save-keys', {
                    deviceId: this.device.id,
                    keys: keys
                });
            },
            selectedDeviceProfile(profileId) {
                this.changes.profile = profileId;
            },
            deleteDevice() {
                if(this.$refs.listItem) {
                    this.$refs.listItem.closePopoverMenu();
                }
                this.$emit('remove');
            }
        },
        watch: {
            expanded(expanded) {
                if(expanded) {
                    this.$emit('expanded');
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
s
