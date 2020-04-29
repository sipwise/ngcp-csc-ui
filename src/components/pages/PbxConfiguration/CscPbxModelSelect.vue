<template>
    <div class="csc-pbx-model-select row items-end xs-gutter">
        <div
            v-if="selectedProfile !== null"
            class="col-auto"
        >
            <q-icon
                class="csc-pbx-device-model-icon"
                v-if="selectedProfileImageUrl === null"
                size="24px"
                name="fa-fax"
                color="white"
            />
            <div
                v-else
                class="csc-pbx-device-model-image"
            >
                <img
                    :src="selectedProfileImageUrl"
                />
            </div>
        </div>
        <div
            class="col-grow"
        >
            <q-input
                dark
                readonly
                class="cursor-pointer"
                float-label="Device Model"
                :value="selectedProfileName"
                :disable="disable"
            />
        </div>
        <q-popover
            ref="popover"
            fit
            @open="$emit('opened')"
        >
            <q-list
                no-border
                highlight
            >
                <q-item
                    v-for="profile in profiles"
                    class="cursor-pointer"
                    :key="profile.id"
                    @click="selectProfile(profile)"
                >
                    <q-item-side
                        class="text-center"
                    >
                        <q-icon
                            v-if="!modelImageMap[profile.device_id]"
                            size="24px"
                            name="fa-fax"
                            color="white"
                        />
                        <div
                            v-else
                            class="csc-pbx-device-model-image row items-center"
                        >
                            <img
                                :src="modelImageMap[profile.device_id].url"
                            />
                        </div>
                    </q-item-side>
                    <q-item-main>
                        <q-item-tile>
                            {{ profile.name }}
                        </q-item-tile>
                    </q-item-main>
                </q-item>
            </q-list>
        </q-popover>
        <div
            class="col-auto"
        >
            <q-btn
                v-if="selectedProfile !== null && hasResetButton"
                icon="clear"
                color="white"
                flat
                small
                @click="resetProfile"
            />
        </div>
    </div>
</template>

<script>
    import _ from 'lodash'
    import {
        QInput,
        QPopover,
        QList,
        QItem,
        QItemMain,
        QItemTile,
        QItemSide,
        QIcon,
        QBtn
    } from 'quasar-framework'
    export default {
        name: 'csc-pbx-model-select',
        props: [
            'profile',
            'profiles',
            'profileMap',
            'modelImageMap',
            'disable',
            'hasResetButton'
        ],
        components: {
            QInput,
            QPopover,
            QList,
            QItem,
            QItemMain,
            QItemTile,
            QItemSide,
            QIcon,
            QBtn
        },
        data () {
            return {
                selectedProfile: this.getProfileById(this.profile)
            }
        },
        computed: {
            selectedProfileName() {
                return _.get(this.selectedProfile, 'name', '');
            },
            selectedProfileImageUrl() {
                let deviceModelId = _.get(this.selectedProfile, 'device_id', null);
                return _.get(this.modelImageMap, deviceModelId + '.url', null);
            }
        },
        methods: {
            selectProfile(profile) {
                this.selectedProfile = profile;
                this.$refs.popover.close();
                this.$emit('selected', profile.id);
            },
            resetProfile(event) {
                event.preventDefault();
                event.stopPropagation();
                this.selectedProfile = null;
                this.$emit('reset');
            },
            getProfileById(id) {
                return _.get(this.profileMap, id, null);
            }
        },
        watch: {
            profile(id) {
                this.selectedProfile = this.getProfileById(id);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
    .csc-pbx-model-select
        .q-input
            margin 0
        .q-btn
            padding-left $flex-gutter-xs
            padding-right $flex-gutter-xs
            .q-btn-inner
                i
                    margin 0
    .csc-pbx-device-model-image
        position relative
        width 32px
        height 32px
        overflow hidden
        img
            position absolute
            width 32px
            left 0
            top 0
</style>
