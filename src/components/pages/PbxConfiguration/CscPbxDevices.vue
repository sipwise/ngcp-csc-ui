<template>
    <csc-page :title="$t('pbxConfig.devicesTitle')">
        <div v-if="isListLoadingVisible" class="row justify-center">
            <q-spinner-dots color="primary" :size="40" />
        </div>
        <div v-if="devices.length > 0 && !isListRequesting && listLastPage > 1" class="row justify-center">
            <q-pagination :value="listCurrentPage" :max="listLastPage" @change="changePage" />
        </div>
        <q-list no-border separator sparse multiline>
            <csc-pbx-device v-for="device in devices" :key="device.id" :device="device" @remove="removeDevice"
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
    import { QSpinnerDots, QPagination, QList, Dialog } from 'quasar-framework'
    import { showToast } from '../../../helpers/ui'

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
            QList,
            Dialog
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'devices',
                'modelOptions',
                'isListRequesting',
                'isListLoadingVisible',
                'listCurrentPage',
                'listLastPage',
                'isDeviceLoading',
                'deviceRemoved'
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
            },
            removeDevice(device) {
                var store = this.$store;
                var i18n = this.$i18n;
                Dialog.create({
                    title: i18n.t('pbxConfig.removeDeviceTitle'),
                    message: i18n.t('pbxConfig.removeDeviceText', { device: device.station_name }),
                    buttons: [
                        'Cancel',
                        {
                            label: i18n.t('pbxConfig.removeDevice'),
                            color: 'negative',
                            handler () {
                                store.dispatch('pbxConfig/removeDevice', device);
                            }
                        }
                    ]
                });
            }
        },
        watch: {
            deviceRemoved(device) {
                if(device !== null) {
                    showToast(this.$t('pbxConfig.toasts.removedDeviceToast', {
                        name: device.station_name
                    }));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common'
</style>
