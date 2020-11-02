<template>
	<q-layout
		id="csc-layout-login"
		view="lHh lpR lFf"
		class="bg-page"
	>
		<q-header
			id="csc-header-login"
			class="bg-transparent"
		>
			<q-toolbar
				id="csc-header-toolbar-login"
			>
				<q-btn
					icon="language"
					color="primary"
					round
					small
					flat
				>
					<q-menu>
						<csc-language-menu
							id="csc-language-menu-login"
							class="csc-language-menu"
							:language-label="languageLabel"
							:language-labels="languageLabels"
							@change-language="changeLanguage"
						/>
					</q-menu>
				</q-btn>
			</q-toolbar>
		</q-header>
		<q-page-container>
			<q-page
				id="csc-page-login"
				class="flex flex-center row"
			>
				<q-card
					id="csc-login-card"
					class="bg-main-menu no-shadow no-border-radius col-xs-12 col-sm-6 col-md-4 q-pa-sm"
				>
					<q-card-section
						class="text-h5"
					>
						{{ $t('pages.login.title') }}
					</q-card-section>
					<q-card-section>
						<form>
							<csc-input
								v-model="username"
								class="q-mb-sm"
								type="text"
								max-length="128"
								:label="$t('pages.login.username')"
								:disable="loginRequesting"
								autofocus
								clearable
								@keyup.enter="login()"
							>
								<template
									slot="prepend"
								>
									<q-icon
										name="person"
									/>
								</template>
							</csc-input>
							<csc-input-password
								v-model="password"
								max-length="32"
								:label="$t('pages.login.password')"
								:disable="loginRequesting"
								clearable
								@keypress.enter="login()"
							/>
						</form>
					</q-card-section>
					<q-card-actions
						class="justify-end"
					>
						<q-btn
							icon="arrow_forward"
							color="primary"
							:label="$t('pages.login.button')"
							:loading="loginRequesting"
							flat
							@click="login()"
						>
							<template
								v-slot:loading
							>
								<csc-spinner />
							</template>
						</q-btn>
					</q-card-actions>
				</q-card>
			</q-page>
		</q-page-container>
	</q-layout>
</template>

<script>

import {
	mapGetters
} from 'vuex'
import {
	showGlobalError
} from '../helpers/ui'
import {
	Platform
} from 'quasar'
import {
	getLanguageLabel
} from '../i18n'
import CscLanguageMenu from 'components/CscLanguageMenu'
import CscSpinner from 'components/CscSpinner'
import CscInputPassword from 'components/form/CscInputPassword'
import CscInput from 'components/form/CscInput'
export default {
	name: 'Login',
	components: {
		CscInput,
		CscInputPassword,
		CscSpinner,
		CscLanguageMenu
	},
	data () {
		return {
			username: '',
			password: ''
		}
	},
	computed: {
		isFlat () {
			return Platform.is.mobile
		},
		loginClasses () {
			const classes = ['row', 'items-center', 'justify-center', 'full-height']
			if (Platform.is.mobile) {
				classes.push('mobile')
			}
			return classes
		},
		...mapGetters('user', [
			'loginRequesting',
			'loginSucceeded',
			'loginError',
			'locale',
			'languageLabels'
		]),
		languageLabel () {
			return this.$t('language', {
				language: getLanguageLabel(this.locale)
			})
		}
	},
	watch: {
		loginSucceeded (loggedIn) {
			if (loggedIn) {
				this.$router.push({ path: '/' })
			}
		},
		loginError (error) {
			if (error) {
				showGlobalError(this.$i18n.t('pages.login.error'))
			}
		}
	},
	methods: {
		login () {
			this.$store.dispatch('user/login', {
				username: this.username,
				password: this.password
			})
		},
		changeLanguage (language) {
			this.$store.dispatch('user/changeSessionLanguage', language)
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
#csc-login-card
	margin 0
	margin-top $header-height * -2
</style>
