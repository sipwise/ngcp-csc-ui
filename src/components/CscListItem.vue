<template>
	<div
		:class="itemClasses"
	>
		<div
			class="csc-list-item-head row items-center"
			@click="toggle"
		>
			<div
				v-if="!image"
				class="csc-list-item-head-icon"
			>
				<q-icon
					:name="icon"
					size="24px"
				/>
			</div>
			<div
				v-if="image"
				class="csc-list-item-head-image"
			>
				<img
					:src="image"
				>
			</div>
			<div
				class="csc-list-item-head-title col"
			>
				<slot
					name="title"
				/>
			</div>
			<div
				class="csc-list-item-head-menu"
			>
				<q-btn
					icon="more_vert"
					color="primary"
					flat
					dense
					@click.stop="moreMenu=true"
				/>
				<q-menu
					ref="moreMenu"
					v-model="moreMenu"
				>
					<q-list>
						<slot
							name="menu"
						/>
					</q-list>
				</q-menu>
			</div>
		</div>
		<q-slide-transition>
			<div
				v-if="expanded"
				class="csc-list-item-body"
			>
				<div
					class="csc-list-item-body-content"
				>
					<slot
						name="body"
					/>
				</div>
			</div>
		</q-slide-transition>
		<csc-object-spinner
			v-if="loading"
			:loading="loading"
		/>
	</div>
</template>

<script>
import CscObjectSpinner from './CscObjectSpinner'
export default {
	name: 'CscListItem',
	components: {
		CscObjectSpinner
	},
	props: {
		icon: {
			type: String,
			default: ''
		},
		image: {
			type: String,
			default: ''
		},
		expanded: {
			type: Boolean,
			default: false
		},
		loading: {
			type: Boolean,
			default: false
		},
		odd: {
			type: Boolean,
			default: false
		}
	},
	data () {
		return {
			moreMenu: false
		}
	},
	computed: {
		itemClasses () {
			const classes = ['csc-list-item', 'transition-generic']
			if (this.expanded) {
				classes.push('csc-list-item-expanded')
			}
			if (this.odd) {
				classes.push('csc-list-item-background')
			}
			return classes
		}
	},
	methods: {
		toggle () {
			this.$emit('toggle', !this.expanded)
		},
		closePopoverMenu () {
			this.moreMenu = false
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-list-item-title-value,
    .csc-list-item-title-keyword
        margin-right $flex-gutter-xs
        font-weight bold
        vertical-align middle
    .csc-list-item.csc-list-item-background
        .csc-list-item-head
            background-color $item-stripe-color
    .csc-list-item
        position relative
        .csc-list-item-head
            cursor pointer
            padding $flex-gutter-sm
            .csc-list-item-head-icon
                padding 0
                padding-right $flex-gutter-xs
                padding-left $flex-gutter-xs
            .csc-list-item-head-image
                width 32px
                height 32px
                position relative
                overflow hidden
                img
                    position absolute
                    width 100%
            .csc-list-item-head-title
                padding-left $flex-gutter-sm
                .csc-list-item-title
                    font-size 1rem
                    vertical-align middle
                .csc-list-item-subtitle
                    margin-top 0.2 rem
                    font-size 90%
                    vertical-align middle
            .csc-list-item-head-menu
                .q-btn
                    padding 0
                    padding-left $flex-gutter-xs
                    padding-right $flex-gutter-xs
                    .q-btn-inner
                        i
                            margin 0
        .csc-list-item-body
            background-color $item-highlight-color
            .csc-list-item-body-content
                padding $flex-gutter-md
    .csc-list-item.csc-list-item-expanded
        .csc-list-item-head
            background-color $item-highlight-color
            .csc-list-item-head-icon
                color $primary
            .csc-list-item-head-title
                .csc-list-item-title
                    color $primary
        .csc-list-item-body
            background-color $item-highlight-color
            .csc-list-item-body-content
                padding $flex-gutter-md
                padding-top $flex-gutter-sm
</style>
