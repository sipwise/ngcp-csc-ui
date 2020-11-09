<template>
	<div
		ref="config"
		class="csc-pbx-device-config justify-center row"
	>
		<div
			class="csc-pbx-device-canvas"
			:style="canvasStyles"
		>
			<div
				ref="imageWrapper"
				class="csc-pbx-device-image"
				:style="imageWrapperStyles"
			>
				<img
					ref="image"
					:src="imageUrl"
					:style="imageStyles"
					@load="imageLoaded"
				>
			</div>
			<div
				v-for="(key, index) in keys"
				:key="index"
				:class="spotClasses(key)"
				:style="spotPosition(key)"
				@click="openKeyOverlay(key)"
			>
				{{ key.index + 1 }}
			</div>
		</div>
		<div
			v-show="keyOverlayActive"
			class="csc-pbx-device-config-key-overlay animate-fade"
		>
			<div
				class="csc-device-key-title row justify-center items-center"
			>
				<q-icon
					class="csc-device-key-title-icon"
					name="touch_app"
					size="24px"
				/>
				<div
					class="column"
				>
					<div
						class="csc-device-key-title-main"
					>
						{{ selectedKeySetName }}: {{ $t('pbxConfig.deviceKeyType') }} {{ selectedKeyNumber }}
					</div>
				</div>
			</div>
			<csc-pbx-attendant-selection
				:value="selectedKeySubscriber"
				:options="subscriberOptions"
				@input="keySubscriberChanged"
			/>
			<q-select
				v-show="selectedKeySubscriber !== null && selectedKeySubscriber.value !== null"
				ref="selectType"
				v-model="selectedKeyType"
				emit-value
				map-options
				:label="$t('pbxConfig.deviceKeyType')"
				:options="typeOptions"
				@input="keyTypeChanged"
			>
				<template
					v-slot:prepend
				>
					<q-icon
						name="radio_button_checked"
					/>
				</template>
			</q-select>
			<div
				class="row justify-center actions"
			>
				<div
					class="column"
				>
					<q-btn
						flat
						icon="clear"
						color="white"
						:big="isMobile"
						@click="closeKeyOverlay()"
					>
						{{ $t('buttons.close') }}
					</q-btn>
				</div>
			</div>
		</div>
		<q-resize-observer
			@resize="windowResize"
		/>
	</div>
</template>

<script>
import _ from 'lodash'
import {
	Platform
} from 'quasar'
import {
	BoundingBox2D
} from 'src/helpers/graphics'
import CscPbxAttendantSelection from './CscPbxAttendantSelection'

export default {
	name: 'CscPbxDeviceConfig',
	components: {
		CscPbxAttendantSelection
	},
	props: {
		device: {
			type: Object,
			default: null
		},
		profile: {
			type: Object,
			default: null
		},
		model: {
			type: Object,
			default: null
		},
		modelImage: {
			type: Object,
			default: null
		},
		subscriberOptions: {
			type: Array,
			default () {
				return []
			}
		},
		subscriberMap: {
			type: Object,
			default: null
		}
	},
	data () {
		return {
			configWidth: 0,
			imageDeltaX: 0,
			imageScaleFactor: 1,
			imageWidth: 0,
			boundingBox: null,
			scaledBoundingBox: null,
			selectedKey: null,
			selectedLine: null,
			keyOverlayActive: false,
			selectedKeyTypeData: null,
			selectedLineIndex: null
		}
	},
	computed: {
		selectedKeyIcon () {
			if (this.selectedLine !== null) {
				const subscriber = this.subscriberMap[this.selectedLine.subscriber_id]
				if (subscriber !== null && subscriber.is_pbx_pilot === true) {
					return 'person_outline'
				} else if (subscriber !== null && subscriber.is_pbx_group === true) {
					return 'group'
				} else if (subscriber !== null) {
					return 'person'
				} else {
					return ''
				}
			}
			return ''
		},
		selectedKeySubscriber () {
			const unassignedItem = this.subscriberOptions[0]
			if (this.selectedLine !== null) {
				const selectedOption = this.subscriberOptions.find(opt => opt.value === this.selectedLine.subscriber_id)
				return selectedOption || unassignedItem
			}
			return unassignedItem
		},
		selectedKeyType: {
			get () {
				if (this.selectedLine !== null) {
					return this.selectedLine.type
				}
				return _.get(this.typeOptions, '0.value', '')
			},
			set (type) {
				this.selectedKeyTypeData = type
			}
		},
		selectedKeySetName () {
			if (this.selectedKey !== null) {
				return this.selectedKey.keySet.name
			}
			return ''
		},
		selectedKeyNumber () {
			if (this.selectedKey !== null) {
				return (this.selectedKey.index + 1)
			}
			return ''
		},
		typeOptions () {
			const options = []
			if (this.selectedKey !== null && this.selectedKey.keySet.can_blf) {
				options.push({
					label: this.$t('pbxConfig.keyTypeBLF'),
					value: 'blf'
				})
			}
			if (this.selectedKey !== null && this.selectedKey.keySet.can_private) {
				options.push({
					label: this.$t('pbxConfig.keyTypePrivate'),
					value: 'private'
				})
			}
			if (this.selectedKey !== null && this.selectedKey.keySet.can_shared) {
				options.push({
					label: this.$t('pbxConfig.keyTypeShared'),
					value: 'shared'
				})
			}
			return options
		},
		isMobile () {
			return Platform.is.mobile
		},
		imageUrl () {
			return _.get(this.modelImage, 'url', null)
		},
		keySets () {
			return _.get(this.model, 'linerange', [])
		},
		keys () {
			const keys = []
			this.keySets.forEach(($keySet) => {
				const $keys = _.get($keySet, 'keys', [])
				$keys.forEach(($key, $index) => {
					const key = _.clone($key)
					key.keySet = $keySet
					key.index = $index
					keys.push(key)
				})
			})
			return keys
		},
		lines () {
			return _.get(this.device, 'lines', [])
		},
		canvasStyles () {
			return {
				width: this.configWidth + 'px'
			}
		},
		imageWrapperStyles () {
			return {
				width: this.configWidth + 'px'
			}
		},
		imageStyles () {
			return {
				left: this.imageDeltaX + 'px',
				width: (this.imageWidth * this.imageScaleFactor) + 'px'
			}
		}
	},
	watch: {
		device () {
			if (this.keyOverlayActive) {
				this.selectedLine = this.getLineByKey(this.selectedKey)
			}
		}
	},
	mounted () {
		this.boundingBox = BoundingBox2D.createFromPoints(this.keys)
		this.boundingBox.addMargin(40)
		this.loadGroupsAndSeats()
	},
	methods: {
		getLineByKey (key) {
			let line = null
			this.lines.forEach(($line, $lineIndex) => {
				if ($line.key_num === key.index && $line.linerange === key.keySet.name) {
					line = _.clone($line)
					line.index = $lineIndex
				}
			})
			return line
		},
		windowResize () {
			this.resize()
			this.placeImage()
		},
		imageLoaded () {
			this.resize()
			this.placeImage()
		},
		resize () {
			this.imageWidth = this.$refs.image.naturalWidth
			this.configWidth = this.$refs.config.clientWidth
			if (this.boundingBox !== null) {
				if (this.boundingBox.getWidth() > this.configWidth) {
					this.imageScaleFactor = this.configWidth / this.boundingBox.getWidth()
				} else {
					this.imageScaleFactor = 1
				}
				this.scaledBoundingBox = this.boundingBox.clone()
				this.scaledBoundingBox.scale(this.imageScaleFactor)
			}
		},
		placeImage () {
			const configCenterX = this.configWidth / 2
			if (this.scaledBoundingBox !== null) {
				this.imageDeltaX = -1 * this.scaledBoundingBox.getCenterX() + configCenterX
			}
		},
		getScaleFactorX () {
			if (_.isObject(this.$refs.image)) {
				return this.$refs.image.width / this.$refs.image.naturalWidth
			}
			return 1
		},
		getScaleFactorY () {
			if (_.isObject(this.$refs.image)) {
				return this.$refs.image.height / this.$refs.image.naturalHeight
			}
			return 1
		},
		keyPointing (key) {
			const pointing = {
				left: 'right',
				right: 'left',
				top: 'down',
				bottom: 'up'
			}
			return pointing[key.labelpos]
		},
		spotPosition (key) {
			let deltaX = 0
			if (this.scaledBoundingBox !== null) {
				deltaX = -1 * this.scaledBoundingBox.getCenterX() + this.configWidth / 2
			}
			const width = 25 * this.imageScaleFactor
			const height = 25 * this.imageScaleFactor
			let x = (key.x * this.imageScaleFactor) + deltaX
			let y = (key.y * this.imageScaleFactor)
			switch (key.labelpos) {
			case 'left':
				y = y - height / 2
				x = x - width
				break
			case 'right':
				y = y - height / 2
				break
			case 'top':
				x = x - width / 2
				y = y - height
				break
			case 'bottom':
				x = x - width / 2
				break
			}
			return {
				top: y + 'px',
				left: x + 'px',
				width: width + 'px',
				height: height + 'px',
				position: 'absolute',
				lineHeight: width + 'px',
				zIndex: 10
			}
		},
		spotClasses (key) {
			const classes = ['csc-pbx-device-button-spot', 'shadow-3']
			if (this.getLineByKey(key) !== null) {
				classes.push('csc-pbx-device-button-active')
			}
			return classes
		},
		openKeyOverlay (key) {
			this.selectedKey = key
			this.selectedLine = this.getLineByKey(key)
			this.keyOverlayActive = true
			this.$scrollTo(this.$parent.$el)
		},
		closeKeyOverlay () {
			this.keyOverlayActive = false
		},
		loadGroupsAndSeats () {
			this.$emit('loadGroupsAndSeats')
		},
		keySubscriberChanged ({ value: subscriberId }) {
			const newLines = []
			const lines = _.clone(this.lines)
			const line = this.getLineByKey(this.selectedKey)
			let changed = false
			if (line !== null && subscriberId === null) {
				delete lines[line.index]
				changed = true
			} else if (line !== null) {
				_.set(lines, line.index + '.subscriber_id', subscriberId)
				changed = true
			} else if (subscriberId !== null) {
				newLines.push({
					extension_unit: 0,
					key_num: this.selectedKey.index,
					subscriber_id: subscriberId,
					linerange: this.selectedKey.keySet.name,
					type: this.$refs.selectType.value
				})
				changed = true
			}
			lines.forEach((line) => {
				newLines.push({
					extension_unit: line.extension_unit,
					key_num: line.key_num,
					subscriber_id: line.subscriber_id,
					linerange: line.linerange,
					type: line.type
				})
			})
			if (changed === true) {
				this.$emit('keysChanged', newLines)
			}
		},
		keyTypeChanged (type) {
			const newLines = []
			const lines = _.clone(this.lines)
			const line = this.getLineByKey(this.selectedKey)
			if (line != null) {
				_.set(lines, line.index + '.type', type)
				lines.forEach((line) => {
					newLines.push({
						extension_unit: line.extension_unit,
						key_num: line.key_num,
						subscriber_id: line.subscriber_id,
						linerange: line.linerange,
						type: line.type
					})
				})
				this.$emit('keysChanged', newLines)
			}
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    $spotSize = 25px

    .csc-device-key-title
        margin-bottom $flex-gutter-md

    .csc-device-key-title-icon
        margin-right $flex-gutter-xs

    .csc-device-key-title-main
        font-size 1rem
    .csc-device-key-title-sub
        font-size 90%
        margin-top 0.2rem

    .csc-pbx-device-config-key-overlay
        .title
            .q-icon
                margin-right 8px
            font-size 18px
            font-weight 400
            letter-spacing normal
            line-height 1.8rem
            margin-bottom 32px
            text-align center

        position absolute
        top 0
        left 0
        right 0
        bottom 0
        background-color alpha($secondary, 0.85)
        z-index 10
        padding 48px

    .csc-pbx-device-key-details
        padding 50px
        position relative

    .csc-pbx-device-config
        margin-top $flex-gutter-lg
        position relative
        .spot-modal-content
            position relative
        .actions
            padding 32px

    .csc-pbx-device-image
        position relative
        overflow hidden
        img
            display block
            position relative

    .csc-pbx-device-canvas
        position: relative

    .csc-pbx-key-popover-title
        font-size 18px
        font-weight 400
        letter-spacing normal
        line-height 1.8rem

    .csc-pbx-device-loader
        z-index 20

    .csc-pbx-device-button-spot
        border-radius: 50%;
        width $spotSize
        height $spotSize
        background-color white
        line-height $spotSize
        color $primary
        text-align center
        cursor pointer
        font-weight bold

    .csc-pbx-device-button
        background-color $primary

    .csc-pbx-device-button-active
        background-color $primary
        color white

    .csc-pbx-key-popover
        min-height 40px
        padding 16px
        padding-right 40px

    .csc-close-button.q-btn
        padding $flex-gutter-xs
        .q-btn-inner
            i
                margin 0
</style>
