<template>
    <q-list
        v-if="appUrlAndroid || appUrlApple"
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

<script>
import AppBadgeGoogle from 'components/AppBadgeGoogle'
import AppBadgeApple from 'components/AppBadgeApple'
import { mapState } from 'vuex'
export default {
    name: 'AuiMobileAppBadges',
    components: { AppBadgeApple, AppBadgeGoogle },
    computed: {
        ...mapState('user', [
            'platformInfo'
        ]),
        appNameAndroid () {
            return this.platformInfo?.app?.android?.name
        },
        appNameApple () {
            return this.platformInfo?.app?.apple?.name
        },
        appUrlAndroid () {
            return this.platformInfo?.app?.android?.url
        },
        appUrlApple () {
            return this.platformInfo?.app?.apple?.url
        },
        appName () {
            return this.appNameAndroid || this.appNameApple
        }
    }
}
</script>
