<template>
    <q-card class="csc-entity csc-pbx-device shadow-1">
        <q-card-title>
            <q-icon name="fa-fax" color="secondary" size="24px"/>
            <span class="csc-entity-title-text">{{ device.station_name }}</span>
            <q-btn :icon="titleIcon" :small="isMobile" color="primary" slot="right" flat @click="toggleMain()" />
        </q-card-title>
        <q-card-main v-if="expanded">
            <q-field :label="$t('pbxConfig.deviceStationName')">
                <q-input v-model="device.station_name" readonly />
            </q-field>
            <q-field :label="$t('pbxConfig.deviceIdentifier')">
                <q-input v-model="device.identifier" readonly />
            </q-field>
            <q-field :label="$t('pbxConfig.deviceModel')">
                <q-select v-model="device.model.id" :options="modelOptions" clearable disable />
            </q-field>
        </q-card-main>
    </q-card>
</template>

<script>

    import { QCard, QCardTitle, QCardMain, QCollapsible,
        QIcon, QField, QInput, QSelect, QBtn } from 'quasar-framework'
    export default {
        name: 'csc-pbx-device',
        props: {
            device: {
                type: Object,
                required: true
            },
            modelOptions: {
                type: Object,
                required: true
            },
            loading: {
                type: Boolean,
                default: false
            }
        },
        components: {
            QCard, QCardTitle, QCardMain, QCollapsible,
            QIcon, QField, QInput, QSelect, QBtn
        },
        data () {
            return {
                expanded: false
            }
        },
        computed: {
            titleIcon() {
                if(!this.expanded) {
                    return 'keyboard arrow down';
                }
                else {
                    return 'keyboard arrow up';
                }
            }
        },
        methods: {
            toggleMain() {
                this.expanded = !this.expanded;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common'
</style>
