<template>
	<csc-page
		id="csc-page-error-404"
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
					{{ $t('404 Not Found') }}
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
