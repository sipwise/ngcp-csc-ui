<template>
	<div>
		<div class="q-item">
			<div
				class="csc-list-item-head row items-center"
				@click="toggle"
			>
				<div
					class="q-item__section column q-item__section--side justify-center"
				>
					<q-icon
						name="fas fa-shield-alt"
						size="24px"
						:color="expanded ? 'primary' : ''"
					/>
				</div>
				<div
					class="q-item__section column q-item__section--main justify-center"
					:class="expanded ? 'text-primary' : ''"
				>
					<div class="q-item__label text-caption">
						<u>{{ acl.from_email }}</u> and
						<u>{{ acl.received_from }} </u> <sup v-if="acl.use_regex">(.*) </sup> =>
						<u>{{ acl.destination }} </u> <sup v-if="acl.use_regex">(.*) </sup>
					</div>
				</div>
				<div
					class="q-item__section column q-item__section--side justify-center"
				>
					<q-btn
						flat
						dense
						icon="delete"
						text-color="negative"
						:title="$t('Remove')"
						:disable="isChanged"
						@click.stop="remove"
					/>
				</div>
			</div>
			<q-slide-transition>
				<div
					v-if="expanded"
					class="csc-list-item-body"
				>
					<csc-mail-to-fax-a-c-l-form
						:is-add-new-mode="false"
						:initial-data="acl"
						:loading="loading"
						@update-property="updateProperty"
					/>
				</div>
			</q-slide-transition>
		</div>
	</div>
</template>

<script>
import CscMailToFaxACLForm from 'components/pages/FaxSettings/CscMailToFaxACLForm'

export default {
	name: 'CscMailToFaxACL',
	components: {
		CscMailToFaxACLForm
	},
	props: {
		acl: {
			type: Object,
			required: true
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
	computed: {
		isChanged () {
			return false
		}
	},
	methods: {
		toggle () {
			if (this.expanded) {
				this.$emit('collapse')
			} else {
				this.$emit('expand')
			}
		},
		updateProperty () {
			this.$emit('update-property', ...arguments)
		},
		remove () {
			this.$q.dialog({
				title: this.$t('Remove ACL'),
				message: this.$t('You are about to remove ACL: From email <{from_email}>', { from_email: this.acl.from_email }),
				color: 'primary',
				cancel: true,
				persistent: true
			}).onOk(() => {
				this.$emit('remove', this.key)
			})
		}
	}
}
</script>
