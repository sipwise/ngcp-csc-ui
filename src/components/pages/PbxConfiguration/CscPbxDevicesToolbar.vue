<template>
    <div>
        <q-toolbar
            color="primary"
            inverted
            class="row justify-center"
        >
            <div>
                <q-btn
                    color="primary"
                    icon="add"
                    flat
                    @click="enableForm()"
                >
                    {{ $t('pbxConfig.addDevice') }}
                </q-btn>
            </div>
            <q-btn
                v-if="isMobile"
                color="primary"
                icon="fa-filter"
                flat
                @click="toggleFilterOptions()"
            > 
                {{ showFilterLabel }}
            </q-btn>
            <div
                v-if="!isMobile"
                @click="toggleFilterOptions()"
            >
                <q-btn
                    :disabled="checkDevicesCreated"
                    icon="fa-filter"
                    flat
                >
                    {{ $t('pbxConfig.filterDevices') }}
                </q-btn>
                <q-chip
                    small
                    tag
                    square
                    color="primary"
                    v-if="chipMacAddressFilter"
                >
                    {{ chipMacAddressFilter | sliceChipValue }}
                </q-chip>
                <q-chip
                    small
                    tag
                    square
                    color="primary"
                    v-if="chipModelFilter"
                >
                    {{ chipModelFilter }}
                </q-chip>
            </div>
            <div class="resetAllBtn">
                <q-btn
                    color="primary"
                    icon="highlight_off"
                    flat
                    :disabled="checkFiltersApplied"
                    @click="resetAllFilters"
                >
                    {{ $t('pbxConfig.resetFilters') }}
                </q-btn>
            </div>
        </q-toolbar>
    </div>
</template>

<script>
    import {
            QChip,
            QIcon,
            QBtn,
            QToolbar,
            Platform
        } from 'quasar-framework'
    import { mapGetters } from 'vuex'

    export default {
        name: 'csc-pbx-devices-toolbar',
        data () {
            return {
                formEnabled: false,
                filtersApplied: false
            }
        },
        components: {
            QChip,
            QIcon,
            QBtn,
            QToolbar,
            Platform
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'devices',
                'chipModelFilter',
                'chipMacAddressFilter'
            ]),
            isMobile() {
                return Platform.is.mobile;
            },
            showFilterLabel() {
                return this.filtersApplied ? this.$t('pbxConfig.showFilters')  : this.$t('pbxConfig.filterDevices');
            },
            checkFiltersApplied() {
                return (this.chipModelFilter || this.chipMacAddressFilter) ? false : true;
            },
            checkDevicesCreated() {
                return (this.devices.length === 0 && !this.chipModelFilter && !this.chipMacAddressFilter) ? true : false;
            }
        },
        methods: {
            enableForm() {
                if(this.chipModelFilter || this.chipMacAddressFilter) {
                    this.resetAllFilters();
                }
                this.$emit('showForm');
            },
            toggleFilterOptions() {
                if(this.devices.length !== 0 || this.chipModelFilter || this.chipMacAddressFilter) {
                    this.$emit('toggleFilterOptions');
                }
            },
            resetAllFilters() {
                this.$emit('resetAll');
            }
        },
        filters: {
            sliceChipValue: function(value) {
                return value.slice(0, -1);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>

