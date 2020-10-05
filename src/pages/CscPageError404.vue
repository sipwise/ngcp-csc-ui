<template>
	<csc-page
		class="flex flex-center"
	>
		<q-card
			flat
			class="bg-transparent"
		>
			<q-card-section
				class="text-center"
			>
				<q-icon
					class="q-mb-md"
					size="48px"
					name="sentiment_dissatisfied"
				/>
				<div
					class="text-h4"
				>
					{{ $t('notFound') }}
				</div>
			</q-card-section>
			<q-card-actions
				align="center"
			>
				<q-btn
					color="primary"
					icon="home"
					text-color="dark"
					unelevated
					to="/user/home"
				/>
			</q-card-actions>
		</q-card>
	</csc-page>
</template>

<script>
import CscPage from 'components/CscPage'
export default {
	name: 'CscPageError404',
	components: {
		CscPage
	}
}
</script>
