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
                    :class="{ cscLabelMobile: isSmallLabelBreakpoint }"
                >
                    {{ $t('pbxConfig.addDevice') }}
                </q-btn>
            </div>
            <q-btn
                v-if="isMobile"
                :disabled="checkDevicesCreated"
                color="primary"
                icon="fa-filter"
                flat
                @click="toggleFilterOptions()"
                :class="{ cscIconMobile: isSmallIconBreakpoint }"
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
                    :class="{ cscIconMobile: isSmallIconBreakpoint }"
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
                    {{ chipMacAddressFilter | removeTrailingWildcard }}
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
                    :class="{ cscIconMobile: isSmallIconBreakpoint }"
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
        Platform,
        dom
    } from 'quasar-framework'
    import { mapGetters } from 'vuex'
    const { viewport } = dom
    let { width } = viewport()

    export default {
        name: 'csc-pbx-devices-toolbar',
        data () {
            return {
                formEnabled: false
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
            isSmallLabelBreakpoint() {
                return (width <= 390 && width > 352);
            },
            isSmallIconBreakpoint() {
                return (width <= 500);
            },
            isMobile() {
                return (Platform.is.mobile || width < 1270);
            },
            filtersApplied() {
                return (this.chipModelFilter || this.chipMacAddressFilter);
            },
            showFilterLabel() {
                return this.filtersApplied ? this.$t('pbxConfig.showFilters')  : this.$t('pbxConfig.filterDevices');
            },
            checkFiltersApplied() {
                return !(this.chipModelFilter || this.chipMacAddressFilter);
            },
            checkDevicesCreated() {
                return (this.devices.length === 0 && !this.chipModelFilter && !this.chipMacAddressFilter);
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
            removeTrailingWildcard: function(value) {
                return value.slice(0, -1);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .cscIconMobile
        .on-left
            margin-right 0

    .cscLabelMobile
        padding-bottom 20px
</style>
