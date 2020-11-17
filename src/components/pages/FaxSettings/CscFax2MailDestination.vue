<template>
	<csc-list-item
		icon="email"
		:odd="odd"
		:expanded="expanded"
		@toggle="toggle"
	>
		<template
			slot="title"
		>
			<csc-list-item-title>
				{{ $t('faxSettings.destinationItemTitle', {destination: destination.destination, filetype: destination.filetype}) }}
			</csc-list-item-title>
			<q-slide-transition>
				<csc-list-item-subtitle
					v-if="!expanded"
				>
					<q-icon
						size="16px"
						:name="destination.incoming ? 'call_received' : ' '"
					/>
					<q-icon
						size="16px"
						:name="destination.outgoing ? 'call_made' : ' '"
					/>
					<q-icon
						size="16px"
						:name="destination.status ? 'fas fa-file-alt' : ' '"
					/>
				</csc-list-item-subtitle>
			</q-slide-transition>
		</template>
		<template
			slot="menu"
		>
			<csc-list-menu-item
				:disable="loading"
				icon="delete"
				icon-color="negative"
				@click="deleteDestination"
			>
				{{ $t('buttons.remove') }}
			</csc-list-menu-item>
		</template>
		<template slot="body">
			<csc-fax2-mail-destination-form
				:is-add-new-mode="false"
				:initial-data="destination"
				:loading="loading"
				@update-property="updateProperty"
			/>
		</template>
	</csc-list-item>
</template>

<script>
import CscListItem from 'components/CscListItem'
import CscListItemTitle from 'components/CscListItemTitle'
import CscListMenuItem from 'components/CscListMenuItem'
import CscListItemSubtitle from 'components/CscListItemSubtitle'
import CscFax2MailDestinationForm from 'components/pages/FaxSettings/CscFax2MailDestinationForm'

export default {
	name: 'CscFax2MailDestination',
	components: {
		CscFax2MailDestinationForm,
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
		updateProperty () {
			this.$emit('update-property', ...arguments)
		}

	}
}
</script>
