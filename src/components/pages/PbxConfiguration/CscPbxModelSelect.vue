<template>
    <div class="csc-pbx-model-select">
        <div>
            <q-input
                :value="selectedProfile.name"
                readonly
                class="cursor-pointer"
                :float-label="label"
                :after="clearButton"
                dark
            />
            <q-popover
                ref="popover"
                fit
                @open="opened()"
            >
                <q-list
                    no-border
                    class="csc-pbx-model-list"
                    highlight
                    inset-separator
                >
                    <q-item
                        v-for="(profile, index) in profiles"
                        :key="profile.id"
                        @click="selectProfile(profile)"
                        class="cursor-pointer"
                    >
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
        <div
            v-if="selectedProfile.device_id != null && preview"
            class="csc-pbx-model-image"
        >
            <img
                :src="frontImageUrl(selectedProfile.device_id)"
                class="csc-pbx-model-select-preview"
            />
        </div>
    </div>
</template>

<script>

    import _ from 'lodash';
    import {
        QInput,
        QPopover,
        QList,
        QItem,
        QItemMain,
        QItemTile,
        QItemSide } from 'quasar-framework'
    import { mapGetters } from 'vuex';


    export default {
        name: 'csc-pbx-model-select',
        props: {
            profiles: {
                type: Array,
                default(){
                    return [];
                }
            },
            modelImages: {
                type: Object,
                default(){
                    return {};
                }
            },
            loading: {
                type: Boolean,
                default: false
            },
            label: String,
            erasable: {
                type: Boolean,
                default: true
            },
            readonly: {
                type: Boolean,
                default: false
            },
            selectedId: {
                type: Number,
                default: null
            },
            preview: {
                type: Boolean,
                default: true
            }
        },
        components: {
            QInput,
            QPopover,
            QList,
            QItem,
            QItemMain,
            QItemTile,
            QItemSide
        },
        data () {
            return {
                selectedProfile: this.getDefaults()
            }
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'listProfileFilter'
            ]),
            clearButton() {
                let self = this;
                let buttons = [];
                if (this.selectedProfile.device_id !== null && this.erasable === true) {
                    buttons = [{
                        icon: 'cancel',
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
                if(this.readonly === false) {
                    this.selectedProfile = profile;
                }
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
            },
            selectById(id) {
                this.profiles.forEach(($profile)=>{
                    if(id === $profile.id) {
                        this.selectedProfile = $profile;
                    }
                });
            }
        },
        mounted() {
            if (this.listProfileFilter) {
                this.selectById(this.listProfileFilter);
            }
            else {
                this.selectById(this.selectedId);
            }
        },
        watch: {
            selectedId(id) {
                this.selectById(id);
            },
            listProfileFilter() {
                if(this.listProfileFilter === null) {
                    this.selectedProfile = this.getDefaults();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
    .csc-pbx-model-list
        .q-item-avatar
            overflow hidden
            border-radius 0
            img
                border-radius 0
                height auto

    .csc-pbx-model-image
        margin-top 16px
        text-align center

        img
            width: 25%

        @media (max-width: $breakpoint-sm)
            img
                width 40%

</style>
