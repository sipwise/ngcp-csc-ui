<template>
    <div class="col">
        <div class="filterOptionsPanel">
            <csc-pbx-mac-input
                @filter="filterByMacAddress"
                @reset="resetMacAddressFilter"
            />
            <csc-pbx-model-select
                :erasable="true"
                :profiles="profiles"
                :modelImages="modelImages"
                :label="$t('pbxConfig.filterPhoneModel')"
                @opened="modelSelectOpened()"
                @select="filterByProfile"
                @reseted="resetProfileFilter"
            />
        </div>
    </div>
</template>


<script>
    import { mapGetters } from 'vuex'
    import CscPbxModelSelect from './CscPbxModelSelect'
    import CscPbxMacInput from './CscPbxMacInput'

    export default {
        name: 'csc-pbx-device-filter',
        data () {
            return {
                filterOptionsPanelOpened: true,
                macAddress: this.getMacAddress()
            }
        },
        components: {
            CscPbxModelSelect,
            CscPbxMacInput
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'profiles',
                'modelImages'
            ])
        },
        methods: {
            getMacAddress() {
                return {
                    identifier: ''
                }
            },
            filterByProfile(profile) {
                this.$store.dispatch('pbxConfig/filterByProfile', profile);
            },
            filterByMacAddress(macAddress) {
                this.$store.dispatch('pbxConfig/filterByMacAddress', macAddress.identifier);
            },
            resetProfileFilter() {
                this.$store.dispatch('pbxConfig/resetProfileFilter');
            },
            resetMacAddressFilter() {
                this.$store.dispatch('pbxConfig/resetMacAddressFilter');
            },
            loadDevice(id) {
                this.$store.dispatch('pbxConfig/loadDevice', id);
            },
            modelSelectOpened() {
                this.$store.dispatch('pbxConfig/loadProfiles');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .filter-model-select
        margin 16px 16px 8px 16px

    .filter-icon
        padding 10px
</style>

