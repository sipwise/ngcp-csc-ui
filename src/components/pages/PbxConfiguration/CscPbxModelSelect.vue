<template>
    <div class="csc-pbx-model-select">
        <div>
            <q-input
                :value="selectedProfile.name"
                readonly
                class="cursor-pointer"
                :float-label="label"
                :after="clearButton"
            />
            <q-popover ref="popover" fit @open="opened()">
                <q-list no-borders class="csc-pbx-model-list" highlight inset-separator>
                    <q-item v-for="(profile, index) in profiles" :key="profile.id"
                            @click="selectProfile(profile)" class="cursor-pointer">
                        <q-item-side>
                            <q-item-tile avatar>
                                <img :src="frontImageUrl(profile.device_id)" />
                            </q-item-tile>
                        </q-item-side>
                        <q-item-main>
                            <q-item-tile>{{ profile.name }}</q-item-tile>
                        </q-item-main>
                    </q-item>
                </q-list>
            </q-popover>
        </div>
        <div v-if="selectedProfile.device_id != null" class="csc-pbx-model-image">
            <img :src="frontImageUrl(selectedProfile.device_id)" class="csc-pbx-model-select-preview" />
        </div>
    </div>
</template>

<script>

    import { QInput, QPopover, QList, QItem, QItemMain, QItemTile, QItemSide } from 'quasar-framework'
    import _ from 'lodash';

    export default {
        name: 'csc-pbx-model-select',
        props: [
            'profiles',
            'modelImages',
            'loading',
            'label',
            'erasable'
        ],
        components: {
            QInput, QPopover, QList, QItem, QItemMain, QItemTile, QItemSide
        },
        data () {
            return {
                selectedProfile: this.getDefaults()
            }
        },
        computed: {
            clearButton() {
                let self = this;
                let buttons = [];
                if (this.selectedProfile.device_id !== null && this.erasable === true) {
                    buttons = [{
                        icon: 'clear',
                        error: false,
                        handler (event) {
                            event.stopPropagation();
                            self.reset();
                        }
                    }];
                }
                return buttons;
            }
        },
        methods: {
            opened() {
                this.$emit('opened');
            },
            selectProfile(profile) {
                this.selectedProfile = profile;
                this.$refs.popover.close();
                this.$emit("select", profile);
            },
            frontImageUrl(id) {
                return _.get(this.modelImages, id + '.url', null);
            },
            reset() {
                this.selectedProfile = this.getDefaults();
                this.$emit('reseted');
            },
            getDefaults() {
                return {
                    name: '',
                    device_id: null
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
    .csc-pbx-model-list
        .q-item-avatar
            img
                border-radius 0

    .csc-pbx-model-image
        margin-top 16px
        text-align center

        img
            width: 25%

        @media (max-width: $breakpoint-sm)
            img
                width 40%

</style>
