<template>
    <q-item
        class="cursor-pointer"
        clickable
        @click="goDeviceDetails"
    >
        <q-item-section
            side
            center
            no-wrap
        >
            <q-icon
                v-if="!imageUrl"
                name="fas fa-fax"
                size="24px"
            />

            <q-avatar
                v-else
                square
            >
                <q-img
                    class="csc-list-item-head-image"
                    :src="imageUrl"
                />
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <csc-list-item-title>
                {{ device.station_name }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle>
                    {{ $t('MAC address') }}: {{ device.identifier }}
                </csc-list-item-subtitle>
            </q-slide-transition>
            <q-slide-transition>
                <csc-list-item-subtitle>
                    {{ $t('Phone model') }}: {{ profile.name }}
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
                    @click="deleteDevice"
                />
            </csc-more-menu>
        </q-item-section>
    </q-item>
</template>

<script>
import CscListItemTitle from '../../CscListItemTitle'
import CscListItemSubtitle from '../../CscListItemSubtitle'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
export default {
    name: 'CscPbxDevice',
    components: {
        CscListItemTitle,
        CscListItemSubtitle,
        CscMoreMenu,
        CscPopupMenuItem
    },
    props: {
        device: {
            type: Object,
            default: null
        },
        profile: {
            type: Object,
            default: null
        },
        model: {
            type: Object,
            default: null
        },
        modelImage: {
            type: Object,
            default: null
        }
    },
    emits: ['remove', 'load-model'],
    computed: {
        imageUrl () {
            if (this.modelImage && this.modelImage.url) {
                return this.modelImage.url
            }
            return null
        }
    },
    watch: {
        profile () {
            this.$emit('load-model')
        }
    },
    mounted () {
        this.$emit('load-model')
    },
    methods: {
        deleteDevice () {
            if (this.$refs.listItem) {
                this.$refs.listItem.closePopoverMenu()
            }
            this.$emit('remove')
        },
        goDeviceDetails () {
            this.$router.push('/user/pbx-configuration/device/' + this.device.id)
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
.csc-list-item-head-image
    width: 32px
    height: 32px
    position: relative
    overflow: hidden
</style>
