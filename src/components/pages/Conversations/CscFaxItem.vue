<template>
    <q-item>
        <q-item-section
            side
            top
        >
            <q-icon
                name="description"
                :color="color"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label
                class="text-subtitle1"
            >
                {{ $t('Fax') }}
                {{ direction }}
                {{ number | numberFormat }}
            </q-item-label>
            <q-item-label
                caption
            >
                {{ fax.start_time | smartTime }}
            </q-item-label>
            <q-item-label
                v-if="fax.pages === 0"
                caption
            >
                No pages
            </q-item-label>
            <q-item-label
                v-else-if="fax.pages === 1"
                caption
            >
                {{ fax.pages }} {{ $t('page') }}
            </q-item-label>
            <q-item-label
                v-else
                caption
            >
                {{ fax.pages }} {{ $t('pages') }}
            </q-item-label>
        </q-item-section>
        <q-item-section
            side
        >
            <csc-more-menu>
                <csc-popup-menu-item
                    icon="file_download"
                    color="primary"
                    :label="$t('Download fax')"
                    @click="downloadFax"
                />
                <csc-popup-menu-item-start-call
                    v-if="callAvailable"
                    @click="startCall"
                />
                <csc-popup-menu-item-delete
                    @click="deleteFax(fax)"
                />
            </csc-more-menu>
        </q-item-section>
    </q-item>
</template>

<script>
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenuItemStartCall from 'components/CscPopupMenuItemStartCall'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
export default {
    name: 'CscFaxItem',
    components: { CscPopupMenuItemStartCall, CscPopupMenuItem, CscMoreMenu, CscPopupMenuItemDelete },
    props: {
        fax: {
            type: Object,
            default: null
        },
        callAvailable: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {}
    },
    computed: {
        color () {
            return this.fax.status === 'FAILED' ? 'negative' : 'primary'
        },
        direction () {
            if (this.fax.direction === 'out') {
                return 'to'
            } else {
                return 'from'
            }
        },
        number () {
            if (this.fax.direction === 'out') {
                return this.fax.callee
            } else {
                return this.fax.caller
            }
        }
    },
    methods: {
        downloadFax () {
            this.$emit('download-fax', this.fax)
        },
        startCall () {
            this.$emit('start-call', this.fax.caller)
        },
        deleteFax (fax) {
            this.$emit('delete-fax', fax)
        },
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
