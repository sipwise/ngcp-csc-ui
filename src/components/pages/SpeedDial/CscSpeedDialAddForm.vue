<template>
    <div>
        <div
            v-if="formEnabled"
        >
            <q-select
                v-model="slot"
                emit-value
                map-options
                data-cy="csc-speeddial-slot"
                :disable="loading"
                :readonly="loading"
                :label="$t('Slot')"
                :options="slotOptions"
            />
            <csc-call-input
                v-model="destination"
                data-cy="csc-speeddial-destination"
                :label="$t('Destination')"
                @submit="save"
                @error="error"
            />
            <div
                class="row justify-center form-actions"
            >
                <q-btn
                    v-if="!loading"
                    flat
                    color="default"
                    icon="clear"
                    data-cy="csc-speeddial-cancel"
                    @mousedown.native="cancel()"
                >
                    {{ $t('Cancel') }}
                </q-btn>
                <q-btn
                    v-if="!loading"
                    flat
                    color="primary"
                    icon="done"
                    data-cy="csc-speeddial-save"
                    :disable="destinationError"
                    @click="save()"
                >
                    {{ $t('Save') }}
                </q-btn>
            </div>
        </div>
        <div
            v-else
            class="row justify-center"
        >
            <q-btn
                color="primary"
                icon="add"
                flat
                data-cy="csc-speeddial-add"
                @click="enableForm()"
            >
                {{ $t('Add Speed Dial') }}
            </q-btn>
        </div>
        <q-inner-loading
            v-show="loading"
            :visible="loading"
        >
            <q-spinner-dots
                size="60px"
                color="primary"
            />
        </q-inner-loading>
    </div>
</template>

<script>
import CscCallInput from '../../form/CscCallInput'
import {
    showGlobalError
} from 'src/helpers/ui'
import {
    Alert
} from 'src/quasar-legacy'

export default {
    name: 'CscSpeedDialAddForm',
    components: {
        CscCallInput
    },
    props: {
        slotOptions: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            formEnabled: false,
            destination: '',
            slot: '',
            destinationError: false
        }
    },
    methods: {
        enableForm () {
            if (this.slotOptions.length > 0) {
                this.reset()
                this.formEnabled = true
            } else {
                Alert.create({
                    enter: 'bounceInRight',
                    leave: 'bounceOutRight',
                    position: 'top-center',
                    html: this.$t('All available speed dial slots have already been assigned. Please delete one first.'),
                    icon: 'warning',
                    dismissible: true
                })
            }
        },
        cancel () {
            this.formEnabled = false
        },
        save () {
            if (this.destinationError) {
                showGlobalError(this.$t('You have invalid form input. Please check and try again.'))
            } else {
                this.$emit('save', {
                    destination: this.destination,
                    slot: this.slot
                })
            }
        },
        reset () {
            this.destination = ''
            this.slot = this.slotOptions[0].value ? this.slotOptions[0].value : ''
        },
        error (state) {
            this.destinationError = state
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .form-actions
        margin-top 16px
        margin-bottom 8px
</style>
