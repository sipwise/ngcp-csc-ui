<template>
    <q-list
        no-border
    >
        <q-item
            v-if="hasNumbers"
        >
            <q-item-section
                side
            >
                <q-icon
                    name="contact_phone"
                    color="white"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label>
                    {{ $t('Numbers') }}
                </q-item-label>
                <q-item-label
                    caption
                >
                    {{ primaryNumberFormatted }}
                </q-item-label>
                <template
                    v-if="aliasNumbersFormatted.length > 0"
                >
                    <q-item-label
                        v-for="(aliasNumber, index) in aliasNumbersFormatted"
                        :key="index"
                        caption
                    >
                        {{ aliasNumber }}
                    </q-item-label>
                </template>
            </q-item-section>
        </q-item>
        <q-separator />
        <q-item
            v-ripple
            clickable
            to="/user/settings"
            data-cy="user-settings"
        >
            <q-item-section
                side
            >
                <q-icon
                    name="settings_applications"
                    color="primary"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label>{{ $t('Settings') }}</q-item-label>
            </q-item-section>
        </q-item>
        <q-item
            v-ripple
            clickable
            data-cy="user-logout"
            @click="logout"
        >
            <q-item-section
                side
            >
                <q-icon
                    name="exit_to_app"
                    color="primary"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label>{{ $t('Logout') }}</q-item-label>
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script>
import numberFilter from 'src/filters/number'
import { mapActions, mapState } from 'vuex'
export default {
    name: 'CscUserMenu',
    props: {
        username: {
            type: String,
            default: ''
        }
    },
    data () {
        return {}
    },
    computed: {
        hasNumbers () {
            return this.subscriber && (this.subscriber.primary_number || this.subscriber.alias_numbers)
        },
        primaryNumberFormatted () {
            if (this.subscriber && this.subscriber.primary_number) {
                return numberFilter(this.subscriber.primary_number)
            }
            return ''
        },
        aliasNumbersFormatted () {
            const numbers = []
            if (this.subscriber && this.subscriber.alias_numbers) {
                this.subscriber.alias_numbers.forEach((number) => {
                    numbers.push(numberFilter(number))
                })
            }
            return numbers
        },
        ...mapState('user', [
            'subscriber'
        ])
    },
    methods: {
        ...mapActions('user', [
            'logout'
        ])
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
</style>
