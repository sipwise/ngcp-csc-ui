<template>
    <csc-page :title="$t('pbxConfig.devicesTitle')">
        <div v-if="isListLoadingVisible" class="row justify-center">
            <q-spinner-dots color="primary" :size="40" />
        </div>
        <div v-if="devices.length > 0 && !isListRequesting && listLastPage > 1" class="row justify-center">
            <q-pagination :value="listCurrentPage" :max="listLastPage" @change="changePage" />
        </div>
        <q-list no-border separator sparse multiline>
            <csc-pbx-device v-for="device in devices" :key="device.id" :device="device"
                            :modelOptions="modelOptions" :loading="isDeviceLoading(device.id)" />
        </q-list>
        <div v-if="devices.length === 0 && !isListRequesting" class="row justify-center csc-no-entities">
            {{ $t('pbxConfig.noDevices') }}
        </div>
    </csc-page>
</template>

<script>
    import { mapGetters } from 'vuex'
    import CscPage  from '../../CscPage'
    import CscPbxDevice from './CscPbxDevice'
    import { QSpinnerDots, QPagination, QList } from 'quasar-framework'
    export default {
        data () {
            return {
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listDevices', {
                page: 1
            });
        },
        components: {
            CscPage,
            CscPbxDevice,
            QSpinnerDots,
            QPagination,
            QList
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'devices',
                'modelOptions',
                'isListRequesting',
                'isListLoadingVisible',
                'listCurrentPage',
                'listLastPage',
                'isDeviceLoading'
            ])
        },
        methods: {
            changePage(page) {
                this.$store.dispatch('pbxConfig/listDevices', {
                    page: page
                });
            },
            loadDevice(id) {
                this.$store.dispatch('pbxConfig/loadDevice', id);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common'
</style>
