<template>
    <q-item
        class="cursor-pointer"
        @click.native="showGroupDetails"
    >
        <q-item-section
                side
                center
                no-wrap
        >
            <q-icon
                name="group"
                color="white"
            /> 
        </q-item-section>
        <q-item-section>
            <csc-list-item-title>
                {{ group | groupName }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle
                >
                    {{ $t('Extension') }}: {{ group.pbx_extension }}
                </csc-list-item-subtitle>
            </q-slide-transition>
            <q-slide-transition>
                <csc-list-item-subtitle
                >
                    <span
                        v-if="group.pbx_groupmember_ids.length > 0"
                    >
                        {{ $t('Seats') }}:
                        <span
                            v-for="seatId in group.pbx_groupmember_ids"
                            :key="seatId"
                            class="csc-list-item-title-keyword"
                        >
                            <q-icon
                                name="person"
                                size="16px"
                            />
                            {{ seats[seatId] | seatName }}
                        </span>
                    </span>
                    <span
                        v-else
                    >
                        <q-icon
                            name="info"
                            color="info"
                            size="24px"
                        />
                        {{ $t('No seats') }}
                    </span>
                </csc-list-item-subtitle>
            </q-slide-transition>
        </q-item-section>
        <q-item-section
            side
            top
        >
            <csc-more-menu>
                <csc-popup-menu-item
                    icon="delete"
                    color="negative"
                    :label="$t('Remove')"
                    @click="deleteGroup"
                />
            </csc-more-menu>
        </q-item-section>
    </q-item>
</template>

<script>
import _ from 'lodash'
import CscListItem from '../../CscListItem'
import CscListItemTitle from '../../CscListItemTitle'
import CscListItemSubtitle from '../../CscListItemSubtitle'
import CscListMenuItem from '../../CscListMenuItem'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
export default {
    name: 'CscPbxGroup',
    components: {
        CscListMenuItem,
        CscListItem,
        CscListItemTitle,
        CscListItemSubtitle,
        CscPopupMenuItem,
        CscMoreMenu,
    },
    props: {
        group: {
            type: Object,
            default: null
        },
        seats: {
            type: Object,
            default: null
        },
        loading: {
            type: Boolean,
            default: false
        },
        odd: {
            type: Boolean,
            default: false
        },
        labelWidth: {
            type: Number,
            default: null
        }
    },
    methods: {
        deleteGroup () {
            if (this.$refs.listItem) {
                this.$refs.listItem.closePopoverMenu()
            }
            this.$emit('remove')
        },
        showGroupDetails () {
            this.$router.push('/user/pbx-configuration/group/'+this.group.id)
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
