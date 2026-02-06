<template>
    <q-list
        v-if="appUrlAndroid || appUrlApple"
        class="absolute-bottom"
        dense
    >
        <q-item-label
            v-if="appUrlAndroid && appUrlApple && appNameAndroid !== appNameApple"
            header
        >
            {{ $t('Apps') }}
        </q-item-label>
        <q-item-label
            v-else
            header
        >
            {{ appName }}
        </q-item-label>
        <q-item
            v-if="appUrlApple"
        >
            <q-item-section>
                <q-item-label
                    v-if="appUrlAndroid && appUrlApple && appNameAndroid !== appNameApple"
                    class="q-pa-sm"
                >
                    {{ appNameApple }}
                </q-item-label>
                <app-badge-apple
                    class="app-badge"
                    :href="appUrlApple"
                />
            </q-item-section>
        </q-item>
        <q-item
            v-if="appUrlAndroid"
        >
            <q-item-section>
                <q-item-label
                    v-if="appUrlAndroid && appUrlApple && appNameAndroid !== appNameApple"
                    class="q-pa-sm"
                >
                    {{ appNameAndroid }}
                </q-item-label>
                <app-badge-google
                    class="app-badge"
                    :href="appUrlAndroid"
                />
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script setup>
import AppBadgeApple from 'components/AppBadgeApple'
import AppBadgeGoogle from 'components/AppBadgeGoogle'
import { useUser } from 'src/composables/useUser'
import { computed } from 'vue'

defineOptions({ name: 'AuiMobileAppBadges' })

const { platformInfo } = useUser()

const appNameAndroid = computed(() => platformInfo.value?.app?.android?.name)
const appNameApple = computed(() => platformInfo.value?.app?.apple?.name)
const appUrlAndroid = computed(() => platformInfo.value?.app?.android?.url)
const appUrlApple = computed(() => platformInfo.value?.app?.apple?.url)
const appName = computed(() => appNameAndroid.value || appNameApple.value)
</script>
