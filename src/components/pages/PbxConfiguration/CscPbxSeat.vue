<template>
    <q-item
        class="cursor-pointer"
        clickable
        @click="showSeatDetails"
    >
        <q-item-section
            side
            top
            no-wrap
        >
            <q-icon
                name="person"
                color="white"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label
                class="text-subtitle1"
            >
                {{ $filters.seatName(seat) }}
            </q-item-label>
            <q-item-label
                caption
            >
                {{ $t('Login') }}: <strong>{{ seat.webusername }}</strong>
            </q-item-label>
            <q-item-label
                caption
            >
                {{ $t('Extension') }}: <strong>{{ seat.pbx_extension }}</strong>
            </q-item-label>
            <q-item-label
                caption
            >
                <span
                    v-if="seat.pbx_group_ids.length > 0"
                >
                    {{ $t('Groups') }}:
                    <span
                        v-for="groupId in seat.pbx_group_ids"
                        :key="groupId"
                        class="csc-list-item-title-keyword"
                    >
                        <q-icon
                            name="group"
                            size="16px"
                        />
                        {{ $filters.groupName(groups[groupId]) }}
                    </span>
                </span>
                <span
                    v-else
                >
                    <q-icon
                        class="self-center"
                        name="group"
                        size="16px"
                    />
                    {{ $t('No groups') }}
                </span>
            </q-item-label>
        </q-item-section>
        <q-item-section
            side
            top
        >
            <csc-more-menu>
                <csc-popup-menu-item
                    icon="vpn_key"
                    color="primary"
                    :label="$t('Change Password')"
                    @click="showPasswordDialog"
                />
                <csc-popup-menu-item
                    icon="vpn_key"
                    color="primary"
                    :label="$t('Change SIP Password')"
                    @click="showSIPPasswordDialog"
                />
                <csc-popup-menu-item-delete
                    @click="deleteSeat"
                />
                <q-separator />
                <q-item
                    class="no-padding"
                >
                    <q-item-section>
                        <q-toggle
                            v-model="changes.clirIntrapbx"
                            class="q-pa-sm"
                            :label="$t('Hide number within own PBX')"
                            :disable="loading"
                            @update:model-value="changeIntraPbx"
                        />
                    </q-item-section>
                </q-item>
                <q-item
                    class="no-padding"
                >
                    <q-item-section>
                        <q-toggle
                            v-model="changes.musicOnHold"
                            class="q-pa-sm"
                            :label="$t('Music on Hold')"
                            :disable="loading"
                            @update:model-value="changeMusicOnHold"
                        />
                    </q-item-section>
                </q-item>
            </csc-more-menu>
        </q-item-section>
    </q-item>
</template>

<script>
import _ from 'lodash'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscDialogChangePassword from 'components/CscDialogChangePassword'
export default {
    name: 'CscPbxSeat',
    components: {
        CscPopupMenuItem,
        CscPopupMenuItemDelete,
        CscMoreMenu
    },
    props: {
        seat: {
            type: Object,
            default: undefined
        },
        intraPbx: {
            type: Boolean,
            default: undefined
        },
        groups: {
            type: Object,
            default: undefined
        },
        loading: {
            type: Boolean,
            default: undefined
        },
        musicOnHold: {
            type: Boolean,
            default: undefined
        }
    },
    emits: ['save-intra-pbx', 'save-music-on-hold', 'remove'],
    data () {
        return {
            changes: this.getSeatData()
        }
    },
    watch: {
        seat () {
            this.changes = this.getSeatData()
        }
    },
    methods: {
        getGroupIds () {
            return _.clone(this.seat.pbx_group_ids)
        },
        getSeatData () {
            return {
                name: this.seat.display_name,
                extension: this.seat.pbx_extension,
                webPassword: this.seat.webpassword,
                clirIntrapbx: this.intraPbx,
                musicOnHold: this.musicOnHold,
                groups: this.getGroupIds()
            }
        },
        deleteSeat () {
            if (this.$refs.listItem) {
                this.$refs.listItem.closePopoverMenu()
            }
            this.$emit('remove')
        },
        showPasswordDialog () {
            this.$q.dialog({
                component: CscDialogChangePassword,
                componentProps: {
                    title: this.$t('Change login password'),
                    passwordLabel: this.$t('Password'),
                    passwordConfirmLabel: this.$t('Password confirm')
                }
            }).onOk((password) => {
                this.changeWebPassword(password)
            })
        },
        showSIPPasswordDialog () {
            this.$q.dialog({
                component: CscDialogChangePassword,
                componentProps: {
                    title: this.$t('Change SIP Password'),
                    passwordLabel: this.$t('SIP Password'),
                    passwordConfirmLabel: this.$t('SIP Password confirm')
                }
            }).onOk((password) => {
                this.changeSIPPassword(password)
            })
        },
        async changeWebPassword (password) {
            await this.$store.dispatch('pbxSeats/setSeatWebPassword', {
                seatId: this.seat.id,
                seatWebPassword: password
            })
        },
        async changeSIPPassword (password) {
            await this.$store.dispatch('pbxSeats/setSeatSIPPassword', {
                seatId: this.seat.id,
                seatSIPPassword: password
            })
        },
        changeIntraPbx () {
            this.$emit('save-intra-pbx', {
                seatId: this.seat.id,
                intraPbx: this.changes.clirIntrapbx
            })
        },
        changeMusicOnHold () {
            this.$emit('save-music-on-hold', {
                seatId: this.seat.id,
                musicOnHold: this.changes.musicOnHold
            })
        },
        showSeatDetails () {
            this.$router.push('/user/pbx-configuration/seat/' + this.seat.id)
        }
    }
}
</script>
