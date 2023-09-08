<template>
    <csc-list-item
        ref="listItem"
        icon="queue_music"
        :odd="odd"
        :loading="loading"
        :show-more-menu="showMoreMenu"
        @click="showSoundSetDetails"
    >
        <template
            #title
        >
            <csc-list-item-title>
                {{ soundSet.name }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="soundSet.description"
                >
                    {{ soundSet.description }}
                </csc-list-item-subtitle>
            </q-slide-transition>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="soundSet.parent_id && parent"
                >
                    {{ $t('Parent') + ': ' + parent.name }}
                </csc-list-item-subtitle>
                <csc-list-item-subtitle
                    v-else
                >
                    {{ $t('No parents assigned') }}
                </csc-list-item-subtitle>
            </q-slide-transition>
            <q-slide-transition>
                <csc-list-item-subtitle>
                    <q-checkbox
                        :model-value="soundSet.contract_default"
                        :label="$t('Default')"
                        :disable="!soundSet.customer_id"
                        :left-label="true"
                        @update:model-value="saveAsDefault"
                    />
                </csc-list-item-subtitle>
            </q-slide-transition>
        </template>
        <template
            v-if="soundSet.customer_id"
            #menu
        >
            <csc-list-menu-item
                icon="delete"
                icon-color="negative"
                @click="remove"
            >
                {{ $t('Remove') }}
            </csc-list-menu-item>
        </template>
    </csc-list-item>
</template>

<script>
import {
    mapState
} from 'vuex'
import CscListItem from '../../CscListItem'
import CscListItemTitle from '../../CscListItemTitle'
import CscListItemSubtitle from '../../CscListItemSubtitle'
import CscListMenuItem from '../../CscListMenuItem'

export default {
    name: 'CscPbxSoundSet',
    components: {
        CscListMenuItem,
        CscListItemSubtitle,
        CscListItemTitle,
        CscListItem
    },
    props: {
        odd: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        soundSet: {
            type: Object,
            default: null
        }
    },
    emits: ['save-as-default', 'remove'],
    computed: {
        ...mapState('pbxSoundSets', [
            'soundSetList'
        ]),
        parent () {
            return this.soundSet.parent_id ? this.soundSetList.find((soundSet) => this.soundSet.parent_id === soundSet.id) : null
        },
        showMoreMenu () {
            if (this.soundSet.customer_id) {
                return true
            }
            return false
        }
    },
    methods: {
        saveAsDefault () {
            this.$emit('save-as-default', {
                soundSetId: this.soundSet.id,
                contractDefault: !this.soundSet.contract_default
            })
        },
        remove () {
            if (this.$refs.listItem) {
                this.$refs.listItem.closePopoverMenu()
            }
            this.$emit('remove', this.soundSet.id)
        },
        showSoundSetDetails () {
            this.$router.push('/user/pbx-configuration/sound-sets/' + this.soundSet.id)
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">

.csc-pbx-sound-set-sound-list
    margin-top: $flex-gutter-sm
</style>
