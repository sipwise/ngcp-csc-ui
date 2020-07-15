<template>
    <div>
        <q-list
            v-if="hasNumbers"
            no-border
            dense
        >
            <q-item
                class="items-start"
                dense
            >
                <q-item-side
                    style="min-width: auto"
                    icon="contact_phone"
                    color="white"
                />
                <q-item-main
                    :label="$t('numbers')"
                >
                    <q-item-tile
                        sublabel
                    >
                        <div>
                            {{ primaryNumberFormatted }}
                        </div>
                        <template
                            v-if="aliasNumbersFormatted.length > 0"
                        >
                            <div
                                v-for="(aliasNumber, index) in aliasNumbersFormatted"
                                :key="index"
                            >
                                {{ aliasNumber }}
                            </div>
                        </template>
                    </q-item-tile>
                </q-item-main>
            </q-item>
        </q-list>
        <q-list
            class="no-margin"
            no-border
            link
        >
            <q-item @click="logout">
                <q-item-side
                    icon="exit_to_app"
                    color="primary"
                    style="min-width: auto"
                />
                <q-item-main
                    :label="$t('userMenu.logout')"
                    :sublabel="username"
                >
                </q-item-main>
            </q-item>
            <q-item
                @click="settings"
            >
                <q-item-side
                    style="min-width: auto"
                    icon="settings_applications"
                    color="primary"
                />
                <q-item-main
                    :label="$t('userMenu.settings')"
                >
                </q-item-main>
            </q-item>
        </q-list>
    </div>
</template>

<script>
    import numberFilter from '../../filters/number'
    import {
        mapState
    } from 'vuex'
    import {
        QList,
        QItem,
        QItemMain,
        QCollapsible,
        QItemSide,
        QSideLink,
        QListHeader,
        QItemSeparator,
        QItemTile,
        QIcon
    } from 'quasar-framework'
    export default {
        name: 'csc-user-menu',
        props: [
            'username'
        ],
        data () {
            return {}
        },
        components: {
            QList,
            QItem,
            QItemMain,
            QCollapsible,
            QItemSide,
            QSideLink,
            QListHeader,
            QItemSeparator,
            QItemTile,
            QIcon
        },
        computed: {
            hasNumbers() {
                return this.subscriber ?  this.subscriber.primary_number || this.subscriber.alias_numbers : false;
            },
            primaryNumberFormatted() {
                if(this.subscriber && this.subscriber.primary_number) {
                    return numberFilter(this.subscriber.primary_number)
                }
                else {
                    return ''
                }
            },
            aliasNumbersFormatted() {
                const numbers = []
                if(this.subscriber && this.subscriber.alias_numbers) {
                    this.subscriber.alias_numbers.forEach((number)=>{
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
            logout() {
                this.$emit('logout');
            },
            settings() {
                this.$emit('settings');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
