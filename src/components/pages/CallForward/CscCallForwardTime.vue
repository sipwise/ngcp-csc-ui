<template>
	<q-item>
		<q-item-section>
			{{ weekday }}, {{ from | time }} - {{ to | time }}
		</q-item-section>
		<q-item-section
			side
			top
		>
			<csc-more-menu>
				<csc-popup-menu-item
					color="negative"
					icon="delete"
					:label="$t('buttons.remove')"
					@click="deleteTime(index)"
				/>
			</csc-more-menu>
		</q-item-section>
	</q-item>
</template>

<script>
import {
	mapGetters
} from 'vuex'
import {
	date
} from 'quasar'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'

export default {
	name: 'CscCallForwardTime',
	components: { CscPopupMenuItem, CscMoreMenu },
	props: {
		time: {
			type: Object,
			default: null
		},
		index: {
			type: Number,
			default: null
		}
	},
	data () {
		return {
		}
	},
	computed: {
		...mapGetters('callForward', {
			timesLength: 'getTimesetTimesLength'
		}),
		weekday () {
			return this.time.weekday
		},
		from () {
			return date.buildDate({
				hours: this.time.from.split(':')[0],
				minutes: this.time.from.split(':')[1]
			})
		},
		to () {
			return date.buildDate({
				hours: this.time.to.split(':')[0],
				minutes: this.time.to.split(':')[1]
			})
		}
	},
	methods: {
		deleteTime (index) {
			if (this.timesLength <= 1) {
				this.$emit('delete-last-time', index)
			} else {
				this.$emit('delete-time', {
					index: index,
					removedDay: this.weekday
				})
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .q-item-side.csc-call-forward-time-btn-container
        margin-left 0
        .q-btn.csc-call-forward-time-btn
            .q-icon
                margin-right 0

    .csc-time
        .q-if-disabled::before
            background-image none
            background-color currentColor

</style>
