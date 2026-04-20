<template>
    <q-item
        clickable
        :disable="disable"
        v-bind="attrs"
    >
        <q-item-section
            side
        >
            <q-icon
                :name="icon"
                color="primary"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label>
                {{ label }}
            </q-item-label>
        </q-item-section>
        <q-item-section
            side
        >
            <q-icon
                name="chevron_right"
                color="primary"
            />
        </q-item-section>
        <q-menu
            v-model="showSeatMenu"
            anchor="top end"
            self="top start"
            @before-show="store.commit('callForwarding/popupShow', null)"
            @hide="reset"
        >
            <div class="q-pa-md csc-cf-seat-menu">
                <csc-cf-seat-select
                    v-model="seatOption"
                />
                <div class="row justify-end q-gutter-sm q-pt-md">
                    <q-btn
                        flat
                        :label="$t('Cancel')"
                        v-close-popup
                    />
                    <q-btn
                        flat
                        color="primary"
                        :disable="!seatOption"
                        :label="$t('Save')"
                        v-close-popup="2"
                        @click="selectSeat"
                    />
                </div>
            </div>
        </q-menu>
    </q-item>
</template>

<script setup>
import CscCfSeatSelect from 'components/call-forwarding/CscCfSeatSelect'
import { ref, useAttrs } from 'vue'
import { useStore } from 'vuex'

defineOptions({
    name: 'CscCfPopupMenuItemSeatSelect',
    inheritAttrs: false
})

defineProps({
    icon: {
        type: String,
        default: 'person'
    },
    label: {
        type: [String, Number],
        default: ''
    },
    disable: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['select'])

const attrs = useAttrs()
const store = useStore()

const showSeatMenu = ref(false)
const seatOption = ref(null)

function reset () {
    showSeatMenu.value = false
    seatOption.value = null
}

function selectSeat () {
    if (!seatOption.value) {
        return
    }

    emit('select', seatOption.value)
}
</script>

<style lang="sass" scoped>
.csc-cf-seat-menu
    min-width: 280px
</style>
