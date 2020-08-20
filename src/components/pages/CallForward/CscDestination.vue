<template>
	<q-item
		class="q-pt-sm q-pb-sm q-pl-md q-pr-md csc-item-odd"
	>
		<q-item-section>
			<q-item-label
				overline
				class="text-uppercase"
			>
				<template
					v-if="index === 0 && !ownPhoneEnabled"
				>
					{{ $t('pages.callForward.firstRing') }}
				</template>
				<template
					v-else
				>
					{{ $t('pages.callForward.thenRing') }}
				</template>
			</q-item-label>
			<q-item-label
				class="text-subtitle2"
			>
				{{ destinationObject.destination | destinationFormat }}
				<template
					v-if="isNonTerminating(destinationObject.destination)"
				>
					{{ $t('pages.callForward.for') }} {{ destinationObject.timeout }} {{ $t('pages.callForward.secs') }}
				</template>
			</q-item-label>
		</q-item-section>
		<!--		<q-item-section-->
		<!--			v-if="$q.platform.is.desktop"-->
		<!--			:class="{ terminated: destinationObject.terminated }"-->
		<!--			no-wrap-->
		<!--		>-->
		<!--			<span v-if="index === 0 && !ownPhoneEnabled">-->
		<!--				{{ $t('pages.callForward.firstRing') }}-->
		<!--			</span>-->
		<!--			<span v-else>-->
		<!--				{{ $t('pages.callForward.thenRing') }}-->
		<!--			</span>-->
		<!--			-->
		<!--			<span>-->
		<!--				{{ destinationObject.destination | destinationFormat }}-->
		<!--			</span>-->
		<!--			<span v-if="isNonTerminating(destinationObject.destination)">-->
		<!--				<span>-->
		<!--					{{ $t('pages.callForward.for') }}-->
		<!--				</span>-->
		<!--				<span>-->
		<!--					{{ destinationObject.timeout }}-->
		<!--				</span>-->
		<!--				<span>-->
		<!--					{{ $t('pages.callForward.secs') }}-->
		<!--				</span>-->
		<!--			</span>-->
		<!--			-->
		<!--			<q-tooltip v-if="destinationObject.terminated">-->
		<!--				{{ $t('pages.callForward.terminatedTooltip') }}-->
		<!--			</q-tooltip>-->
		<!--			-->
		<!--		</q-item-section>-->
		<!--		<q-item-section-->
		<!--			v-if="$q.platform.is.mobile"-->
		<!--			class="dest-row mobile"-->
		<!--			:class="{ terminated: destinationObject.terminated }"-->
		<!--		>-->
		<!--			<div>-->
		<!--				<span v-if="!isNonTerminating(destinationObject.destination)">-->
		<!--					<span v-if="index === 0 && !ownPhoneEnabled">-->
		<!--						{{ $t('pages.callForward.firstRing') }}-->
		<!--					</span>-->
		<!--					<span v-else>-->
		<!--						{{ $t('pages.callForward.thenRing') }}-->
		<!--					</span>-->
		<!--				</span>-->
		<!--				{{ destination.destination | destinationFormat }}-->
		<!--			</div>-->
		<!--			<div>-->
		<!--				<span v-if="index === 0 && isNonTerminating(destinationObject.destination) && !ownPhoneEnabled">-->
		<!--					{{ $t('pages.callForward.firstRing') }}-->
		<!--				</span>-->
		<!--				<span v-else>-->
		<!--					{{ $t('pages.callForward.thenRing') }}-->
		<!--				</span>-->
		<!--				<span v-if="isNonTerminating(destinationObject.destination)">-->
		<!--					<span>-->
		<!--						{{ $t('pages.callForward.for') }}-->
		<!--					</span>-->
		<!--					<span class="dest-values">-->
		<!--						{{ destination.timeout }}-->
		<!--					</span>-->
		<!--					<span>-->
		<!--						{{ $t('pages.callForward.secs') }}-->
		<!--					</span>-->
		<!--				</span>-->
		<!--			</div>-->
		<!--			<q-tooltip v-if="destinationObject.terminated">-->
		<!--				{{ $t('pages.callForward.terminatedTooltip') }}-->
		<!--			</q-tooltip>-->
		<!--		</q-item-section>-->
		<q-item-section
			side
		>
			<csc-more-menu>
				<csc-popup-menu-item
					v-if="destinations.length > 1 && !hasNoUpOption(index)"
					icon="keyboard_arrow_up"
					color="primary"
					:label="$t('buttons.moveUp')"
					@click="moveDestination('up', index)"
				/>
				<csc-popup-menu-item
					v-if="destinations.length > 1 && !hasNoDownOption(index)"
					icon="keyboard_arrow_down"
					color="primary"
					:label="$t('buttons.moveDown')"
					@click="moveDestination('down', index)"
				/>
				<csc-popup-menu-item
					icon="delete"
					color="negative"
					:label="$t('buttons.remove')"
					@click="deleteDestination(index)"
				/>
			</csc-more-menu>
			<!--				<q-popover ref="popover">-->
			<!--					<q-list-->
			<!--						link-->
			<!--						no-border-->
			<!--					>-->
			<!--						<q-item-->
			<!--							v-if="destinations.length > 1 && !hasNoUpOption(index)"-->
			<!--							@click="moveDestination('up', index), $refs.popover[index].close()"-->
			<!--						>-->
			<!--							<q-item-main :label="$t('buttons.moveUp')" />-->
			<!--							<q-item-side-->
			<!--								icon="keyboard_arrow_up"-->
			<!--								color="white"-->
			<!--							/>-->
			<!--						</q-item>-->
			<!--						<q-item-->
			<!--							v-if="destinations.length > 1 && !hasNoDownOption(index)"-->
			<!--							@click="moveDestination('down', index), $refs.popover[index].close()"-->
			<!--						>-->
			<!--							<q-item-main :label="$t('buttons.moveDown')" />-->
			<!--							<q-item-side-->
			<!--								icon="keyboard_arrow_down"-->
			<!--								color="white"-->
			<!--							/>-->
			<!--						</q-item>-->
			<!--						<q-item @click="deleteDestination(index), $refs.popover[index].close()">-->
			<!--							<q-item-main :label="$t('buttons.remove')" />-->
			<!--							<q-item-side-->
			<!--								icon="delete"-->
			<!--								color="negative"-->
			<!--							/>-->
			<!--						</q-item>-->
			<!--					</q-list>-->
			<!--				</q-popover>-->
		</q-item-section>
	</q-item>
</template>

<script>
import { mapState } from 'vuex'
import {
	normalizeDestination
} from 'src/filters/number-format'
import _ from 'lodash'
import {
	stopLoading,
	showGlobalError
} from 'src/helpers/ui'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscMoreMenu from 'components/CscMoreMenu'

export default {
	name: 'CscDestination',
	components: {
		CscMoreMenu,
		CscPopupMenuItem
	},
	props: {
		destinations: {
			type: Array,
			default: undefined
		},
		destinationObject: {
			type: Object,
			default: undefined
		},
		index: {
			type: Number,
			default: undefined
		},
		destinationSetId: {
			type: Number,
			default: null
		},
		prevDestId: {
			type: Number,
			default: null
		},
		nextDestId: {
			type: Number,
			default: null
		},
		ownPhone: {
			type: Boolean,
			default: false
		},
		showOwnPhone: {
			type: Boolean,
			default: false
		},
		timesetName: {
			type: String,
			default: null
		}
	},
	computed: {
		...mapState('callForward', [
			'changeDestinationState',
			'changeDestinationError'
		]),
		ownPhoneEnabled () {
			return this.ownPhone && this.showOwnPhone
		}
	},
	watch: {
		changeDestinationState (state) {
			if (state === 'failed') {
				stopLoading()
				showGlobalError(this.changeDestinationError)
			} else if (state === 'succeeded') {
				stopLoading()
			}
		}
	},
	methods: {
		hasNoDownOption (index) {
			return index === this.destinations.length - 1 && !this.nextDestId
		},
		hasNoUpOption (index) {
			return index === 0 && !this.prevDestId
		},
		moveDestination (direction, index) {
			this.$store.dispatch('callForward/changePositionOfDestination', {
				destinations: this.destinations,
				id: this.destinationSetId,
				index: index,
				direction: direction,
				nextId: this.nextDestId,
				prevId: this.prevDestId,
				timeset: this.timesetName
			})
		},
		isNonTerminating (destination) {
			const dest = destination.split(/:|@/)
			const host = dest[2]
			const type = host.split('.')[0]
			const isLocal = host.split('.')[1] === 'local'
			return type !== 'fax2mail' && type !== 'voicebox' && !isLocal
		},
		deleteDestination (index) {
			const clonedDestinations = _.cloneDeep(this.destinations)
			const clonedDestination = clonedDestinations[index].destination
			const indexInt = parseInt(index)
			const removeDestination = normalizeDestination(clonedDestination)
			const isLastDestination = this.destinations.length === 1
			clonedDestinations.splice(indexInt, 1)
			this.$q.dialog({
				title: this.$t('pages.callForward.removeDialogTitle'),
				message: this.$t('pages.callForward.removeDialogText', {
					destination: removeDestination
				}),
				color: 'primary',
				cancel: true,
				persistent: true
			}).onOk(data => {
				this.$store.dispatch('callForward/deleteDestinationFromDestinationset', {
					id: this.destinationSetId,
					data: clonedDestinations,
					deleteDestinationset: isLastDestination,
					removeDestination: removeDestination,
					timeset: this.timesetName
				})
			})
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-own-phone,
    .csc-destination
        .q-item-side-right
            .q-icon
                color $primary

    .dest-row.mobile
        padding 16px
        padding-left 0px
        .dest-values > span
            font-weight 300

    .dest-row.mobile .dest-sublabel span
        font-weight 300

    .dest-row.terminated.mobile
        color $grey

    .q-item-highlight.csc-destination:hover
        background-color $item-highlight-color

    .dest-row
        color $white
        white-space nowrap
        overflow hidden
        font-size 16px

        .dest-values
            font-weight bold

    .dest-row.terminated
        color $grey

    .dest-btns
        display inline-block
        position absolute
        right 0

    .btnhidden
        opacity 0

    .btnvisible
        opacity 1
</style>
