<template>
    <csc-list-item
        ref="listItem"
        icon="dialpad"
        :expanded="expanded"
        @toggle="toggle"
    >
        <template
            slot="title"
        >
            <csc-list-item-title>
                {{ $t('Slot') }}: {{ personalSlot.slot }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    {{ $t('Destination') }}: {{ personalSlot.destination }}
                </csc-list-item-subtitle>
            </q-slide-transition>
        </template>
        <template slot="menu">
            <csc-list-menu-item
                icon="delete"
                icon-color="negative"
                @click="confirmRowDeletion"
            >
                {{ $t('Remove') }}
            </csc-list-menu-item>
        </template>
        <template
            slot="body"
        >
            <q-input
                v-model="newDestination"
                :label="$t('Destination')"
                :error="$v.newDestination.$error"
                :error-message="errorMessage"
                @keyup.enter="save"
                @input="valueChanged"
            >
                <template
                    v-if="hasDestinationChanged"
                    v-slot:append
                >
                    <csc-input-button-save
                        v-if="newDestination !== '' && newDestination !== null"
                        @click.stop="save"
                    />
                    <csc-input-button-reset
                        v-if="!addNewSlot"
                        @click.stop="resetSlotDestination"
                    />
                </template>
            </q-input>
        </template>
    </csc-list-item>
</template>

<script>
import CscListItem from '../../CscListItem'
import CscListItemTitle from '../../CscListItemTitle'
import CscListItemSubtitle from '../../CscListItemSubtitle'
import CscListMenuItem from '../../CscListMenuItem'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscRemoveDialog from 'components/CscRemoveDialog'
import {
    required
} from 'vuelidate/lib/validators'
export default {
    name: 'CscPbxSettingsAutoAttendant',
    components: {
        CscInputButtonSave,
        CscInputButtonReset,
        CscListItem,
        CscListItemTitle,
        CscListItemSubtitle,
        CscListMenuItem
    },
    props: {
        personalSlot: {
            type: Object,
            default: null
        },
        addNewSlot: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            expanded: this.addNewSlot,
            hasDestinationChanged: false,
            newDestination: this.personalSlot.destination,
            currentDestination: this.personalSlot.destination
        }
    },
    validations: {
        newDestination: {
            required
        }
    },
    computed: {
        errorMessage () {
            if (!this.$v.newDestination.required) {
                return this.$t('Destination must not be empty')
            } else {
                return ''
            }
        }
    },
    mounted () {
        this.$root.$on('all-slots-saved', () => {
            if (this.expanded) {
                this.toggle()
            } 
            this.newDestination = this.personalSlot.destination
            this.currentDestination = this.personalSlot.destination
            this.hasDestinationChanged = this.newDestination !== this.currentDestination
        })
    },
    methods: {
        confirmRowDeletion () {
            if (!this.addNewSlot) {
                this.$q.dialog({
                    component: CscRemoveDialog,
                    parent: this,
                    title: this.$t('Delete slot?'),
                    message: this.$t('You are about to delete slot {slot}', { slot: this.personalSlot.slot })
                }).onOk(() => {
                    this.remove()
                })
            } else {
                this.remove()
            }
        },
        remove () {
            this.$emit('remove', this.personalSlot.slot)
        },
        save () {
            if (this.personalSlot.destination !== '') {
                this.$emit('save')
            }
        },
        toggle () {
            this.expanded = !this.expanded
            this.newDestination = this.personalSlot.destination
        },
        valueChanged () {
            this.$v.newDestination.$touch()
            this.hasDestinationChanged = this.newDestination !== this.currentDestination
            this.$emit('edit', this.newDestination, this.personalSlot.slot)
        },
        resetSlotDestination () {
            this.$emit('reset', this.personalSlot.slot)
            this.newDestination = this.personalSlot.destination
            this.hasDestinationChanged = false
        }
    }
}
</script>
