<template>
	<div
		class="csc-search-input row items-end"
	>
		<div
			class="column inline"
		>
			<q-input
				v-model="phraseInput"
				dark
				:float-label="label"
				:disable="searching"
				@keyup.enter="search"
			/>
		</div>
		<div
			class="column inline"
		>
			<q-btn
				v-if="!phrase"
				icon="search"
				color="primary"
				flat
				small
				:disable="searching"
				@click="search"
			/>
			<q-btn
				v-else
				icon="clear"
				color="white"
				flat
				small
				:disable="searching"
				@click="reset"
			/>
		</div>
	</div>
</template>

<script>
import _ from 'lodash'
export default {
	name: 'CscSearchInput',
	props: {
		label: {
			type: String,
			default: ''
		},
		phrase: {
			type: String,
			default: ''
		},
		searching: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			phraseInput: this.phrase
		}
	},
	watch: {
		phrase (value) {
			this.phraseInput = value
		}
	},
	methods: {
		search () {
			const sanitizedInput = _.trim(this.phraseInput)
			this.$emit('search', sanitizedInput)
		},
		reset () {
			this.phraseInput = ''
			this.$emit('reset')
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-search-input
        .q-input
            margin-bottom 0
            margin-top 0
        .q-btn
            padding-left $flex-gutter-xs
            padding-right $flex-gutter-xs
            .q-btn-inner
                i
                    margin 0
</style>
