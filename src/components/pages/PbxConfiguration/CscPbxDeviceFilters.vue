<template>
    <div
        class="csc-pbx-device-filters"
    >
        <div
            class="csc-pbx-device-filter-inputs row justify-center sm-gutter items-end"
        >
            <csc-search-input
                :label="$t('pbxConfig.deviceStationName')"
                :phrase="stationNameFilter"
                :searching="loading"
                @search="filterStationName"
                @reset="resetStationName"
            />
            <csc-search-input
                :label="$t('pbxConfig.deviceIdentifier')"
                :phrase="identifierFilter"
                :searching="loading"
                @search="filterIdentifier"
                @reset="resetIdentifier"
            />
            <csc-pbx-model-select
                :profile="profileFilter"
                :profiles="profiles"
                :profile-map="profileMap"
                :model-image-map="modelImageMap"
                :has-reset-button="true"
                @opened="$emit('model-select-opened')"
                @selected="filterProfile"
                @reset="resetProfile"
            />
        </div>
        <div
            class="row justify-center"
        >
            <q-btn
                flat
                icon="clear"
                color="default"
                :disable="loading"
                @click="$emit('close-filters')"
            >
                {{ $t('pbxConfig.closeFilters') }}
            </q-btn>
            <q-btn
                flat
                icon="fa-filter"
                color="negative"
                :disable="loading"
                @click="$emit('reset-filters')"
            >
                {{ $t('pbxConfig.resetFilters') }}
            </q-btn>
        </div>
    </div>
</template>

<script>
    import CscPbxModelSelect from '../PbxConfiguration/CscPbxModelSelect'
    import {
        QSlideTransition,
        QField,
        QIcon,
        QBtn,
        QChip,
        QInput
    } from 'quasar-framework'
    import CscSearchInput from "../../CscSearchInput";

    export default {
        name: 'csc-pbx-device-filters',
        data () {
            return {
            }
        },
        components: {
            CscSearchInput,
            QSlideTransition,
            QField,
            QIcon,
            QBtn,
            QChip,
            QInput,
            CscPbxModelSelect
        },
        props: [
            'stationNameFilter',
            'identifierFilter',
            'profileFilter',
            'profiles',
            'profileMap',
            'modelImageMap',
            'loading'
        ],
        methods: {
            filterStationName(input) {
                if(input !== '') {
                    this.$emit('filter-station-name', input);
                }
            },
            resetStationName() {
                this.$emit('reset-station-name');
            },
            filterIdentifier(input) {
                if(input !== '') {
                    this.$emit('filter-identifier', input);
                }
            },
            resetIdentifier() {
                this.$emit('reset-identifier');
            },
            filterProfile(profile) {
                this.$emit('filter-profile', profile);
            },
            resetProfile() {
                this.$emit('reset-profile');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'
    .csc-pbx-device-filters
        margin-bottom $flex-gutter-sm
    .csc-pbx-device-filter-inputs
        margin-bottom $flex-gutter-sm
</style>
