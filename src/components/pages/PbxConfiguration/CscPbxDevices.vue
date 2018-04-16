<template>
    <csc-page :title="$t('pbxConfig.devicesTitle')">
        <div v-if="isListLoadingVisible" class="row justify-center">
            <q-spinner-dots color="primary" :size="40" />
        </div>
        <csc-pbx-device v-for="device in devices" :key="device.id"
                        :device="device" :modelOptions="modelOptions" />
        <div v-if="devices.length === 0 && !isListRequesting" class="row justify-center csc-no-entities">
            {{ $t('pbxConfig.noDevices') }}
        </div>
    </csc-page>
</template>

<script>
    import { mapGetters } from 'vuex'
    import CscPage  from '../../CscPage'
    import CscPbxDevice from './CscPbxDevice'
    import { QSpinnerDots } from 'quasar-framework'
    export default {
        data () {
            return {
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listDevices');
        },
        components: {
            CscPage,
            CscPbxDevice,
            QSpinnerDots
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'devices',
                'modelOptions',
                'isListRequesting',
                'isListLoadingVisible'
            ])
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
