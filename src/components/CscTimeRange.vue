<template>
    <q-item
        class="justify-center q-pl-none q-pr-none q-pb-none csc-cf-timerange-input-container"
    >
        <q-input
            v-model="timeFrom"
            filled
            mask="time"
            :rules="['time']"
            dark
            dense
            no-error-icon
            :placeholder="$t('Start time')"
            class="q-pa-sm"
            @click="$refs.timeFromPopup.show()"
        >
            <template
                v-slot:append
            >
                <q-icon
                    name="access_time"
                    class="cursor-pointer"
                >
                    <q-popup-proxy
                        ref="timeFromPopup"
                        transition-show="scale"
                        transition-hide="scale"
                        @hide="addTimeRange"
                    >
                        <q-time
                            v-model="timeFrom"
                            format24h
                        >
                            <div
                                class="row items-center justify-end"
                            >
                                <q-btn
                                    v-close-popup
                                    :label="$t('Close')"
                                    color="primary"
                                    flat
                                />
                            </div>
                        </q-time>
                    </q-popup-proxy>
                </q-icon>
            </template>
        </q-input>
        <q-input
            v-model="timeTo"
            filled
            mask="time"
            :rules="['time']"
            dark
            dense
            no-error-icon
            :placeholder="$t('End time')"
            class="q-pa-sm"
            @click="$refs.timeToPopup.show()"
        >
            <template
                v-slot:append
            >
                <q-icon
                    name="access_time"
                    class="cursor-pointer"
                >
                    <q-popup-proxy
                        ref="timeToPopup"
                        transition-show="scale"
                        transition-hide="scale"
                        @hide="addTimeRange"
                    >
                        <q-time
                            v-model="timeTo"
                            format24h
                        >
                            <div
                                class="row items-center justify-end"
                            >
                                <q-btn
                                    v-close-popup
                                    :label="$t('Close')"
                                    color="primary"
                                    flat
                                />
                            </div>
                        </q-time>
                    </q-popup-proxy>
                </q-icon>
            </template>
        </q-input>
        <q-btn
            v-if="mode === 'edit'"
            flat
            color="red"
            icon="delete"
            padding="xs"
            @click="removeTimeRange"
        />
    </q-item>
</template>

<script>
import { showGlobalError } from 'src/helpers/ui'
export default {
    name: 'CscTimeRange',
    props: {
        items: {
            type: Array,
            default: () => []
        },
        index: {
            type: Number,
            default: null
        },
        time: {
            type: Object,
            default: null
        },
        mode: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            timeFrom: null,
            timeTo: null
        }
    },
    mounted () {
        if (this.time && this.time.hour && this.time.minute) {
            this.timeFrom = this.time.hour.split('-')[0] + ':' + this.time.minute.split('-')[0]
            this.timeTo = this.time.hour.split('-')[1] + ':' + this.time.minute.split('-')[1]
        }
    },
    methods: {
        addTimeRange () {
            if (this.timeFrom && this.timeTo) {
                if (this.isTimerangeValid()) {
                    this.$emit('add-time-range', { from: this.timeFrom, to: this.timeTo, index: this.index })
                    if (this.mode === 'add') {
                        this.timeFrom = this.timeTo = null
                    }
                } else {
                    this.timeTo = null
                    showGlobalError(this.$t('Please select a valid timerange'))
                }
            }
        },
        removeTimeRange () {
            this.$emit('delete-time-range', { from: this.timeFrom, to: this.timeTo, index: this.index })
        },
        isTimerangeValid () {
            const hourFrom = parseInt(this.timeFrom.split(':')[0])
            const minuteFrom = parseInt(this.timeFrom.split(':')[1])
            const hourTo = parseInt(this.timeTo.split(':')[0])
            const minuteTo = parseInt(this.timeTo.split(':')[1])
            return hourTo > hourFrom || (hourFrom === hourTo && minuteTo > minuteFrom)
        }
    }
}
</script>
<style lang="stylus" rel="stylesheet/stylus">
    .csc-cf-timerange-input-container
        max-width 360px
</style>
