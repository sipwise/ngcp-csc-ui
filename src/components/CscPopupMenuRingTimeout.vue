<template>
    <q-list class="q-mb-md">
        <q-item>
            <q-item-section side>
                <q-icon
                    :name="icon"
                    :color="color"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label clickable>
                    <span>{{ $t('After Ring Timeout') }} : </span>
                    <span
                        class="q-pl-xs q-pr-xs text-primary text-weight-bold cursor-pointer"
                    >
                        {{ ringTimeout }} {{ $t('seconds') }}
                        <q-popup-edit
                            v-slot="scope"
                            v-model="timeout"
                            buttons
                            @before-show="$store.commit('callForwarding/popupShow','after-ring-timeout')"
                            @save="updateRingTimeoutEvent($event)"
                        >
                            <csc-input
                                v-model="scope.value"
                                type="number"
                                dense
                                autofocus
                            >
                                <template #prepend>
                                    <q-icon name="access_time" />
                                </template>
                            </csc-input>
                        </q-popup-edit>
                    </span>
                </q-item-label>
                <q-item-label caption>
                    {{ $t('Forward call after this timeout (applies only when user is available).') }}
                </q-item-label>
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script>
import CscInput from 'components/form/CscInput'
import { mapActions } from 'vuex'
export default {
    name: 'CscPopupMenuRingTimeout',
    components: { CscInput },
    props: {
        ringTimeout: {
            type: Number,
            required: true
        }
    },
    data () {
        return {
            timeout: this.ringTimeout,
            icon: 'access_time',
            color: 'primary'
        }
    },
    methods: {
        ...mapActions('callForwarding', [
            'updateRingTimeout'
        ]),
        async updateRingTimeoutEvent (event) {
            this.$wait.start('csc-cf-mappings-full')
            await this.updateRingTimeout({ ringTimeout: event, subscriberId: this.subscriberId })
            this.$wait.end('csc-cf-mappings-full')
        }
    }
}
</script>
