<template>
	<q-select
		:value="value"
		:options="options"
		:label="$t('Phone model')"
		emit-value
		map-options
		v-bind="$attrs"
		v-on="$listeners"
		@input="$emit('input', $event)"
		@popup-show="$emit('opened', $event)"
	>
		<template
			v-slot:prepend
		>
			<q-icon
				v-if="!selectedProfileImageUrl"
				name="fas fa-fax"
				size="24px"
			/>
			<q-avatar
				v-else
				square
			>
				<q-img
					:src="selectedProfileImageUrl"
					style="overflow: hidden"
				/>
			</q-avatar>
		</template>
		<template
			v-slot:option="scope"
		>
			<q-item
				v-bind="scope.itemProps"
				v-on="scope.itemEvents"
			>
				<q-item-section
					v-if="!deviceModelImageSmallMap[scope.opt.model]"
					side
				>
					<q-icon
						name="fas fa-fax"
						size="24px"
					/>
				</q-item-section>
				<q-item-section
					v-else
					avatar
				>
					<q-avatar
						square
					>
						<img
							:src="deviceModelImageSmallMap[scope.opt.model].url"
						>
					</q-avatar>
				</q-item-section>
				<q-item-section>
					<q-item-label>{{ scope.opt.label }}</q-item-label>
				</q-item-section>
			</q-item>
		</template>
		<template
			v-for="(_, slot) of $scopedSlots"
			v-slot:[slot]="scope"
		>
			<slot
				v-if="slot !== 'prepend' && slot !== 'option'"
				:name="slot"
				v-bind="scope"
			/>
		</template>
	</q-select>
	<!--	<div class="csc-pbx-model-select row items-end xs-gutter">-->
	<!--		<div-->
	<!--			v-if="selectedProfile !== null"-->
	<!--			class="col-auto"-->
	<!--		>-->
	<!--			<q-icon-->
	<!--				v-if="selectedProfileImageUrl === null"-->
	<!--				class="csc-pbx-device-model-icon"-->
	<!--				size="24px"-->
	<!--				name="fa-fax"-->
	<!--				color="white"-->
	<!--			/>-->
	<!--			<div-->
	<!--				v-else-->
	<!--				class="csc-pbx-device-model-image"-->
	<!--			>-->
	<!--				<img-->
	<!--					:src="selectedProfileImageUrl"-->
	<!--				>-->
	<!--			</div>-->
	<!--		</div>-->
	<!--		<div-->
	<!--			class="col-grow"-->
	<!--		>-->
	<!--			<q-input-->
	<!--				readonly-->
	<!--				class="cursor-pointer"-->
	<!--				label="Device Model"-->
	<!--				:value="selectedProfileName"-->
	<!--				:disable="disable"-->
	<!--			/>-->
	<!--		</div>-->
	<!--		<q-menu-->
	<!--			ref="popover"-->
	<!--			fit-->
	<!--			@open="$emit('opened')"-->
	<!--		>-->
	<!--			<q-list>-->
	<!--				<q-item-->
	<!--					v-for="profileItem in profiles"-->
	<!--					:key="profileItem.id"-->
	<!--					class="cursor-pointer"-->
	<!--					@click="selectProfile(profileItem)"-->
	<!--				>-->
	<!--					<q-item-section-->
	<!--						v-if="!modelImageMap[profileItem.device_id]"-->
	<!--						side-->
	<!--					>-->
	<!--						<q-icon-->
	<!--							size="24px"-->
	<!--							name="fax"-->
	<!--							color="white"-->
	<!--						/>-->
	<!--					</q-item-section>-->
	<!--					<q-item-section-->
	<!--						v-else-->
	<!--						side-->
	<!--						avatar-->
	<!--					>-->
	<!--						<img-->
	<!--							:src="modelImageMap[profileItem.device_id].url"-->
	<!--						>-->
	<!--					</q-item-section>-->
	<!--					<q-item-section>-->
	<!--						<q-item-label>-->
	<!--							{{ profileItem.name }}-->
	<!--						</q-item-label>-->
	<!--					</q-item-section>-->
	<!--				</q-item>-->
	<!--			</q-list>-->
	<!--		</q-menu>-->
	<!--		<div-->
	<!--			class="col-auto"-->
	<!--		>-->
	<!--			<q-btn-->
	<!--				v-if="selectedProfile !== null && hasResetButton"-->
	<!--				icon="clear"-->
	<!--				color="white"-->
	<!--				flat-->
	<!--				small-->
	<!--				@click="resetProfile"-->
	<!--			/>-->
	<!--		</div>-->
	<!--	</div>-->
</template>

<script>
import _ from 'lodash'
import {
	mapState
} from 'vuex'
export default {
	name: 'CscPbxModelSelect',
	props: {
		value: {
			type: Number,
			default: undefined
		},
		profiles: {
			type: Array,
			default: () => []
		},
		profileMap: {
			type: Object,
			default: null
		},
		disable: {
			type: Boolean,
			default: false
		},
		hasResetButton: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			selectedProfile: this.getProfileById(this.value)
		}
	},
	computed: {
		...mapState('pbx', [
			'deviceModelImageSmallMap'
		]),
		selectedProfileName () {
			return _.get(this.selectedProfile, 'name', '')
		},
		selectedProfileImageUrl () {
			const deviceModelId = _.get(this.selectedProfile, 'device_id', null)
			return _.get(this.deviceModelImageSmallMap, deviceModelId + '.url', null)
		},
		options () {
			const options = []
			this.profiles.forEach((profile) => {
				options.push({
					label: profile.name,
					value: profile.id,
					model: profile.device_id
				})
			})
			return options
		}
	},
	watch: {
		value () {
			this.selectedProfile = this.getProfileById(this.value)
		}
	},
	methods: {
		selectProfile (profile) {
			this.selectedProfile = profile
			this.$refs.popover.hide()
			this.$emit('selected', profile.id)
		},
		resetProfile (event) {
			event.preventDefault()
			event.stopPropagation()
			this.selectedProfile = null
			this.$emit('reset')
		},
		getProfileById (id) {
			return _.get(this.profileMap, id, null)
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-pbx-model-select
        .q-input
            margin 0
        .q-btn
            padding-left $flex-gutter-xs
            padding-right $flex-gutter-xs
            .q-btn-inner
                i
                    margin 0
    .csc-pbx-device-model-image
        position relative
        width 32px
        height 32px
        overflow hidden
        img
            position absolute
            width 32px
            left 0
            top 0
</style>
