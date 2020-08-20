<template>
	<csc-page
		class="q-pa-lg"
	>
		<q-list
			v-if="pageName === 'incoming'"
			class="q-mb-lg"
		>
			<q-item>
				<q-toggle
					:label="$t('callBlocking.anonymousBlocked')"
					:value="isAnonymousBlocked"
					:disable="isAnonymousBlockRequesting"
					checked-icon="block"
					unchecked-icon="block"
					@input="toggleBlockAnonymous()"
				/>
				<csc-spinner
					v-if="isAnonymousBlockRequesting"
					class="self-center"
				/>
			</q-item>
		</q-list>
		<div
			class="row q-mb-lg"
		>
			<q-list
				dense
				class="col col-xs-12 col-md-6"
			>
				<q-item>
					<q-item-section>
						<q-radio
							:value="listMode"
							:label="$t('pages.callBlocking' + suffix + '.toggleDisableLabel')"
							val="blacklist"
							color="primary"
							@input="updateListMode"
						/>
					</q-item-section>
					<q-item-section
						side
					>
						<csc-spinner
							v-if="isNumberListLoading || (isToggleLoading && listMode === 'whitelist')"
						/>
					</q-item-section>
				</q-item>
				<q-item>
					<q-item-section>
						<q-radio
							:value="listMode"
							:label="$t('pages.callBlocking' + suffix + '.toggleEnableLabel')"
							val="whitelist"
							color="primary"
							@input="updateListMode"
						/>
					</q-item-section>
					<q-item-section
						side
					>
						<csc-spinner
							v-if="isNumberListLoading || (isToggleLoading && listMode === 'blacklist')"
						/>
					</q-item-section>
				</q-item>
			</q-list>
		</div>
		<div
			class="row justify-center q-mb-lg"
		>
			<csc-call-blocking-add-form
				ref="addForm"
				class="col-xs-12 col-md-4 col-lg-8"
				:loading="isAddNumberLoading"
				@save="addNumber"
			/>
		</div>
		<div
			v-if="isNumberListLoading"
			class="row justify-center"
		>
			<csc-spinner />
		</div>
		<div
			v-if="numbers && numbers.length > 0"
			class="row justify-center"
		>
			<q-list
				class="col-xs-12 col-md-4 col-lg-8"
			>
				<csc-blocked-number
					v-for="(number, index) in numbers"
					:key="index"
					:class="'q-pa-sm csc-item-' + ((index % 2 === 0)?'odd':'even')"
					:icon="(listMode === 'whitelist')? 'check' : 'block'"
					:number="number"
					:index="index"
					:loading="isEditNumberLoading && currentNumberIndex === index"
					:removing="isRemoveNumberLoading && currentNumberIndex === index"
					@save="saveNumber"
					@remove="numberDeletionConfirm"
				>
					{{ number }}
				</csc-blocked-number>
			</q-list>
		</div>
		<div
			v-else
			class="row justify-center"
		>
			{{ $t('callBlocking.listEmptyMessage') }}
		</div>
	</csc-page>
</template>

<script>
import _ from 'lodash'
import CscSpinner from '../../CscSpinner'
import {
	mapGetters
} from 'vuex'
import CscPage from '../../CscPage'
import CscCallBlockingAddForm from '../../pages/CallBlocking/CscCallBlockingAddForm'
import CscBlockedNumber from '../../pages/CallBlocking/CscBlockedNumber'
export default {
	name: 'CscCallBlocking',
	components: {
		CscPage,
		CscCallBlockingAddForm,
		CscBlockedNumber,
		CscSpinner
	},
	props: {
		pageName: {
			type: String,
			default: 'incoming'
		}
	},
	data () {
		return {
			currentRemovingIndex: null
		}
	},
	computed: {
		...mapGetters('callBlocking', [
			'toggleState',
			'isToggleLoading',
			'addNumberState',
			'isAddNumberLoading',
			'editNumberState',
			'isEditNumberLoading',
			'removeNumberState',
			'isRemoveNumberLoading',
			'numberListState',
			'isNumberListLoading',
			'numbers',
			'currentNumberIndex',
			'listMode',
			'isAnonymousBlocked',
			'isAnonymousBlockRequesting'
		]),
		toggleButtonLabel () {
			if (!this.enabled) {
				return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleEnableLabel')
			} else {
				return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleDisableLabel')
			}
		},
		toggleToastMessage () {
			if (this.mode) {
				return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleEnabledToast')
			} else {
				return this.$i18n.t('pages.callBlocking' + this.suffix + '.toggleDisabledToast')
			}
		},
		suffix () {
			return _.upperFirst(this.pageName)
		},
		removeDialogMessage () {
			if (this.currentRemovingIndex !== null) {
				return this.$t('pages.callBlocking' + this.suffix + '.removeDialogText', {
					number: this.numbers[this.currentRemovingIndex]
				})
			} else {
				return ''
			}
		},
		blockAnonymousClasses () {
			const classes = ['csc-block-anonymous']
			if (!this.isAnonymousBlocked) {
				classes.push('csc-toggle-disabled')
			}
			return classes
		}
	},
	watch: {
		mode (value) {
			this.toggle(value)
		},
		addNumberState (state) {
			if (state === 'succeeded') {
				this.$refs.addForm.reset()
			}
		}
	},
	mounted () {
		this.$store.dispatch('callBlocking/load' + this.suffix)
	},
	methods: {
		addNumber (number) {
			this.$store.dispatch('callBlocking/addNumber' + this.suffix, number)
		},
		saveNumber (data) {
			this.$store.dispatch('callBlocking/editNumber' + this.suffix, data)
		},
		removeNumber () {
			if (this.currentRemovingIndex !== null) {
				this.$store.dispatch('callBlocking/removeNumber' + this.suffix, this.currentRemovingIndex)
				this.currentRemovingIndex = null
			}
		},
		updateListMode (listMode) {
			this.$store.dispatch('callBlocking/toggle' + this.suffix, listMode === 'whitelist')
		},
		toggleBlockAnonymous () {
			this.$store.dispatch('callBlocking/toggleBlockAnonymous', !this.isAnonymousBlocked)
		},
		numberDeletionConfirm (index) {
			this.currentRemovingIndex = index
			this.$q.dialog({
				title: this.$t('pages.callBlocking' + this.suffix + '.removeDialogTitle'),
				message: this.removeDialogMessage,
				color: 'primary',
				cancel: true,
				persistent: true
			}).onOk(data => {
				this.removeNumber()
			})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    #toggle-call-blocking
        margin-bottom 60px

    #add-number-form
        margin-bottom 15px

    .blocked-number .q-input
        margin 0

    .blocked-number-title
        padding-left 8px

    .mode-list
        margin-bottom 30px

    .csc-list-item.q-item.csc-blocked-number
        padding-top $flex-gutter-xs
        padding-bottom $flex-gutter-xs
    .csc-block-anonymous
        margin-bottom $flex-gutter-md

</style>
