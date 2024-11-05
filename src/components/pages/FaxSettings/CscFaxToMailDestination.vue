<template>
    <csc-list-item
        icon="email"
        :odd="odd"
        :expanded="expanded"
        @toggle="toggle"
    >
        <template
            #title
        >
            <csc-list-item-title>
                {{ $t('&lt;{destination}&gt; as {filetype}', {destination: destination.destination, filetype: destination.filetype}) }}
            </csc-list-item-title>
            <q-slide-transition>
                <csc-list-item-subtitle
                    v-if="!expanded"
                >
                    <q-icon
                        size="16px"
                        :name="destination.incoming ? 'call_received' : ' '"
                        data-cy="destination-icon-deliver-incoming"
                    />
                    <q-icon
                        size="16px"
                        :name="destination.outgoing ? 'call_made' : ' '"
                        data-cy="destination-icon-deliver-outgoing"
                    />
                    <q-icon
                        size="16px"
                        :name="destination.status ? 'fas fa-file-alt' : ' '"
                        data-cy="destination-icon-receive-reports"
                    />
                </csc-list-item-subtitle>
            </q-slide-transition>
        </template>
        <template
            #menu
        >
            <csc-list-menu-item
                :disable="loading"
                icon="delete"
                data-cy="destination-delete"
                icon-color="negative"
                @click="deleteDestination"
            >
                {{ $t('Remove') }}
            </csc-list-menu-item>
        </template>
        <template #body>
            <csc-fax-to-mail-destination-form
                :is-add-new-mode="false"
                :initial-data="destination"
                :loading="loading"
                @update-property="updateProperty($event)"
            />
        </template>
    </csc-list-item>
</template>

<script>
import CscListItem from 'components/CscListItem'
import CscListItemSubtitle from 'components/CscListItemSubtitle'
import CscListItemTitle from 'components/CscListItemTitle'
import CscListMenuItem from 'components/CscListMenuItem'
import CscFaxToMailDestinationForm from 'components/pages/FaxSettings/CscFaxToMailDestinationForm'

export default {
    name: 'CscFaxToMailDestination',
    components: {
        CscFaxToMailDestinationForm,
        CscListItemSubtitle,
        CscListMenuItem,
        CscListItemTitle,
        CscListItem
    },
    props: {
        destination: {
            type: Object,
            required: true
        },
        odd: {
            type: Boolean,
            default: false
        },
        expanded: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update-property', 'expand', 'collapse', 'remove'],
    methods: {
        deleteDestination () {
            if (this.$refs.listItem) {
                this.$refs.listItem.closePopoverMenu()
            }
            this.$emit('remove')
        },
        toggle () {
            if (this.expanded) {
                this.$emit('collapse')
            } else {
                this.$emit('expand')
            }
        },
        updateProperty (data) {
            this.$emit('update-property', data)
        }

    }
}
</script>
